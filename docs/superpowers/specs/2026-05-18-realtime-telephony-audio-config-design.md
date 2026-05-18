# Telephony × Realtime LLM audio-rate fix — Design

**Status:** Approved for implementation
**Date:** 2026-05-18
**Branch:** `whitelabel-mortgage`
**Driver:** Voice agents on the Asterisk/ARI provider never react to caller speech when the user has `is_realtime=true` (Gemini Live, OpenAI Realtime). Non-realtime path (Dograh STT → LLM → Dograh TTS) works.

---

## Problem

`ProviderSpec.transport_sample_rate = 8000` for every telephony provider. `create_audio_config()` propagates that 8 kHz into every `AudioConfig` field — `transport_in`, `transport_out`, `vad`, and `pipeline`. The realtime LLMs (`GeminiLiveLLMService`, OpenAI Realtime) send `audio/pcm;rate={frame.sample_rate}` to their upstream provider. Google Live and OpenAI Realtime both reject or silently drop 8 kHz input — both require ≥ 16 kHz PCM. Result: the model never sees the caller's voice, the bot's TTS still plays (output path is healthy), and the caller is heard talking to a deaf agent.

Verified during 2026-05-18 debug session: with `user_configuration.is_realtime = false`, the same call on the same Asterisk box / same trunk / same chan_websocket connection works two-way. The bug is purely the input sample rate handed to the realtime LLM.

## Goal

Make every (telephony provider × LLM mode) combination work, with one decision layer. Any caller-facing change of provider or LLM mode should JustWork™ without per-provider patches.

Specifically:
- **Realtime + telephony**: input audio resampled to 16 kHz before reaching the LLM service.
- **Non-realtime + telephony**: unchanged. Pipeline stays at 8 kHz.
- **Any mode + WebRTC**: unchanged. Already at 16 kHz.

## Non-goals

- Optimising bot-side TTS sample rate. The realtime LLM emits 24 kHz; pipecat's existing output_resampler downsamples to the transport rate. That path already works.
- Mid-call mode switching. The mode is resolved once at pipeline start.
- Changing how telephony providers register their wire-format rate. Providers continue to declare 8 kHz on `ProviderSpec.transport_sample_rate`.
- chan_websocket / Asterisk-side changes. The Asterisk install done earlier in the day stays as-is.

## Architecture

One change point: `AudioConfig`. It already knows the transport's wire rate; teach it to also know whether the consuming LLM is realtime, and pick the pipeline rate accordingly.

```
┌──────────────────────────┐
│ workflow_run             │
│   initial_context        │ ──── is_realtime override (per call)
│     .is_realtime?        │           │
└──────────────────────────┘           ▼
┌──────────────────────────┐    ┌─────────────────────┐
│ user_configuration       │ ──▶│ resolve_is_realtime │── bool
│   .is_realtime           │    └─────────────────────┘     │
└──────────────────────────┘                                ▼
                                  ┌────────────────────────────────┐
                                  │ create_audio_config(            │
                                  │   transport_type,               │
                                  │   is_realtime=...)              │
                                  └────────────────────────────────┘
                                                │
              ┌─────────────────────────────────┼─────────────────────────────┐
              ▼                                 ▼                             ▼
   transport_in/out=8000            pipeline_sample_rate            vad_sample_rate
   (wire format unchanged)          = 16000 if realtime+telephony   = 16000 if realtime
                                    = 8000 otherwise                = wire rate otherwise
```

## Components changed

| File | Change |
|---|---|
| `api/services/pipecat/audio_config.py` | `AudioConfig` gets a new field `is_realtime: bool = False`. `create_audio_config()` gains `is_realtime: bool = False` param. When `is_realtime=True` and the transport rate < 16000, set `pipeline_sample_rate = 16000` and `vad_sample_rate = 16000`. Transport in/out rates always stay at the wire format declared by the provider. |
| `api/services/pipecat/run_pipeline.py` | New helper `_resolve_is_realtime(workflow_run, user_id) -> bool` reads `workflow_run.initial_context.get("is_realtime")` first, falls back to `user_configuration["is_realtime"]`, defaults `False`. The resolved value is passed to `create_audio_config()` and logged once at pipeline start. |
| `api/schemas/workflow_run.py` (or equivalent) | Document `initial_context.is_realtime: bool \| None` as a recognised override key. Update any pydantic `InitialContext` schema if one exists. |
| `pipecat/src/pipecat/serializers/asterisk.py` | No code change. Add unit-test coverage that `ulaw_to_pcm(data, 8000, 16000)` produces a clean upsampled signal. |
| Other telephony serializers (`twilio.py`, `plivo.py`, `vonage.py`, `cloudonix.py`, `telnyx.py`, `exotel.py`, `genesys.py`, `vobiz.py`) | Audit only. Any that hardcode 8 kHz instead of using `self._sample_rate` are bugs and get fixed in the same diff. |
| `api/services/pipecat/pipeline_builder.py` | No structural change. The realtime pipeline already exists at line 97; only the audio rates flowing into it change. |

Telephony provider packages (`api/services/telephony/providers/*/transport.py`) — **no change**. They continue to read `audio_config.transport_in_sample_rate` (8000) for the wire format and `audio_config.pipeline_sample_rate` (16000 when realtime) for pipeline IO.

## Data flow

### Realtime + telephony (the path being fixed)

```
caller voice → SIP ulaw 8k RTP → Asterisk → chan_websocket
  → WS binary frame (ulaw 8k) → AsteriskFrameSerializer.deserialize
  → ulaw_to_pcm(data, 8000, 16000)            ← UPSAMPLE
  → InputAudioRawFrame(sample_rate=16000)
  → pipeline → GeminiLiveLLMService._send_user_audio
  → audio/pcm;rate=16000 → Google Live API ✓

Gemini emits PCM 24k → pipecat output_resampler 24k → 8k (transport_out_rate)
  → AsteriskFrameSerializer.serialize → ulaw 8k → WS → chan_websocket → RTP → caller ✓
```

### Non-realtime + telephony (unchanged, already works)

```
caller voice → ulaw 8k RTP → ... → ulaw_to_pcm(data, 8000, 8000)
  → InputAudioRawFrame(sample_rate=8000) → pipeline at 8k
  → Dograh STT (resamples internally as needed) → LLM → Dograh TTS → 8k PCM
  → AsteriskFrameSerializer.serialize → ulaw 8k → caller
```

### Realtime + WebRTC (unchanged)

```
WebRTC stream at 16k → SmallWebRTC transport at 16k
  → InputAudioRawFrame(sample_rate=16000) → realtime LLM ✓
```

## Decision resolution

`_resolve_is_realtime(workflow_run, user_id) -> bool`:

1. If `workflow_run.initial_context.get("is_realtime")` is a `bool` → return it. Allows campaign runs and the `/initiate-call` test path to override the user-level default.
2. Else read `user_configuration["is_realtime"]` for `user_id`. Backwards compatible with current behaviour.
3. Else `False`.

Logged once at pipeline start, e.g.:
```
audio config: transport=8000Hz pipeline=16000Hz vad=16000Hz realtime=true (source=workflow_override)
```

`source` is one of `workflow_override`, `user_config`, `default`.

## Edge cases

| Scenario | Behaviour |
|---|---|
| Realtime + WebRTC (16 kHz wire) | No-op. Pipeline already at 16 kHz; guard `if rate < 16000` skips the bump. |
| Realtime + cloudonix or vonage at 16 kHz wire | Same — no-op. |
| Non-realtime + telephony | Unchanged. Pipeline at 8 kHz. STT services that need 16 kHz resample internally as today. |
| Workflow run with `initial_context.is_realtime = false` for a user whose config has `is_realtime = true` | Override wins. Run executes non-realtime. |
| User toggles `is_realtime` while a call is in progress | Not supported. The flag is read once at pipeline start. |
| Mixed provider campaigns (Twilio + ARI in same campaign) | Each run resolves independently. |
| Realtime LLM transcription buffer mismatch | `GeminiLiveLLMService._user_audio_buffer.extend(audio)` at line 1249 stores raw `frame.audio` and uses `frame.sample_rate` for buffer-trimming math. Both consistent at 16 kHz — no extra fix needed. |

## Testing

### Unit tests (`api/tests/`)

1. `test_audio_config_realtime_telephony` — parametrised matrix:

   | transport_type | is_realtime | expected transport_in | expected pipeline | expected vad |
   |---|---|---|---|---|
   | `ari` | False | 8000 | 8000 | 8000 |
   | `ari` | True | 8000 | 16000 | 16000 |
   | `twilio` | False | 8000 | 8000 | 8000 |
   | `twilio` | True | 8000 | 16000 | 16000 |
   | `plivo` | True | 8000 | 16000 | 16000 |
   | `cloudonix` | True | 16000 | 16000 | 16000 |
   | `webrtc` | True | 16000 | 16000 | 16000 |
   | `smallwebrtc` | True | 16000 | 16000 | 16000 |

2. `test_resolve_is_realtime` — three cases: workflow override, user config fallback, default.

3. `test_asterisk_serializer_upsample_8k_to_16k` — feed a known sine, assert the output is at 16 kHz and frequency content is preserved (or at least monotonic energy in the audible band).

### Integration tests

4. `test_run_pipeline_realtime_ari` — mock the FastAPI WebSocket, push a binary ulaw payload, assert `GeminiLiveLLMService.process_frame` receives an `InputAudioRawFrame` with `sample_rate == 16000`.

5. Existing `test_run_pipeline_text_greeting` and `test_run_pipeline` must still pass unchanged (regression guard for the non-realtime path).

### Manual smoke

6. Full end-to-end call against the gesti trunk after Railway deploy: place call, speak, confirm bot responds. The non-realtime baseline established in this session's 20:10 UTC call (`WR-TEL-OUT-01103309`) is the comparator.

## Deployment

Per the answered question — fork image now, upstream PR in parallel.

1. **Branch**: commits land on `whitelabel-mortgage`.
2. **Image build**: GitHub Actions workflow `build-api-image.yml` on push of any file under `api/` or `pipecat/`. Pushes to `ghcr.io/aymenbenpakiss/dograh-api:whitelabel-<sha>` and `:whitelabel-latest`. One-time setup of a `GHCR_PAT` secret in the repo with `write:packages` scope.
3. **Railway**: switch the `api` service source from `ghcr.io/dograh-hq/dograh-api:latest` to `ghcr.io/aymenbenpakiss/dograh-api:whitelabel-<sha>`. Pin to SHA, not `:whitelabel-latest`.
4. **Upstream PR**: cherry-pick the four touched files into a clean branch off `dograh-hq/dograh:main`. PR title: `feat: realtime LLMs over telephony — auto-bump pipeline sample rate`. Linked to a one-paragraph repro in the PR body.
5. **Rollback path**: keep the previous Railway image digest in `BUILD_SUMMARY.md`. One click in Railway dashboard reverts.

## Risk assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Existing non-realtime telephony users see regression | Low. `is_realtime` defaults False; their pipeline stays 8 kHz. | Regression tests above must pass. |
| 8k → 16k upsampling adds noticeable latency | Negligible. `ulaw_to_pcm` resampling is sub-ms per 20 ms frame on the existing CPU budget. | Manual smoke test verifies. |
| VAD at 16 kHz behaves differently than at 8 kHz for telephony users who switch to realtime | VAD usually performs *better* at 16 kHz. Was already the WebRTC default. | Accept as part of moving to realtime. |
| Some serializer hardcodes 8 kHz and breaks at 16 kHz pipeline | Medium. Twilio/Plivo serializers historical | Audit step in the plan covers this. Tests catch it. |
| GHCR build pipeline misconfigured, prod ships broken image | Low | Pin Railway to a specific SHA, not `:whitelabel-latest`. Manual promote step. |
| Upstream PR rejected / drifts from our fork | Low/Medium | Fork is maintained until merge; rebase weekly. |

## Out of scope

- Replacing the upstream image with a fully maintained fork. The fork image is a stopgap until the upstream PR merges.
- WebRTC voice quality work.
- Asterisk-side changes (already complete).
- Multi-tenancy / per-org realtime defaults.
