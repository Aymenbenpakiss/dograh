# Telephony serializer audit — pipecat submodule

**Date:** 2026-05-18
**Branch:** `whitelabel-mortgage`
**Scope:** Confirm each telephony serializer constructs `InputAudioRawFrame` with `sample_rate=self._sample_rate` (the pipeline rate) and resamples wire audio correctly. Hardcoded 8 kHz inside a serializer would break the 16 kHz realtime path even after the AudioConfig fix.

## Methodology

Grep each serializer for `InputAudioRawFrame`, `sample_rate`, `8000`, `ulaw_to_pcm`, `pcm_to_ulaw`. Compare the rate passed into the audio frame against the rate used in the resample call.

All serializers follow the same pattern:
- `self._sample_rate` is initialised to `0` at construction time.
- In `setup()`, it is resolved from `self._params.sample_rate or frame.audio_in_sample_rate` — meaning it picks up the pipeline rate injected by the `AudioConfig` before the pipeline starts.
- Wire-side rate (e.g., `self._asterisk_sample_rate`, `self._twilio_sample_rate`, …) defaults to 8000 and is kept separate.
- The resampler converts **wire → pipeline** on input and **pipeline → wire** on output.
- `InputAudioRawFrame` is constructed with `sample_rate=self._sample_rate` (the pipeline rate).

## Findings

### asterisk.py

- Line 86: `self._sample_rate = 0  # Pipeline input rate, set in setup()`
- Line 99: `self._sample_rate = self._params.sample_rate or frame.audio_in_sample_rate`
- Line 85: `self._asterisk_sample_rate = self._params.asterisk_sample_rate` (defaults 8000, line 49)
- Line 185–188: `ulaw_to_pcm(…, self._asterisk_sample_rate, self._sample_rate, …)` — resamples wire→pipeline
- Lines 194–198: `InputAudioRawFrame(audio=deserialized_data, num_channels=1, sample_rate=self._sample_rate)`

✅ Correctly uses `self._sample_rate`. The 8000 constant is only the wire-side default; the pipeline-side rate is dynamic.

---

### twilio.py

- Line 127: `self._sample_rate = 0  # Pipeline input rate`
- Line 140: `self._sample_rate = self._params.sample_rate or frame.audio_in_sample_rate`
- Line 126: `self._twilio_sample_rate = self._params.twilio_sample_rate` (defaults 8000, line 59)
- Line 239–240: `ulaw_to_pcm(payload, self._twilio_sample_rate, self._sample_rate, …)`
- Lines 246–247: `InputAudioRawFrame(audio=deserialized_data, num_channels=1, sample_rate=self._sample_rate)`

✅ Correctly uses `self._sample_rate`.

---

### plivo.py

- Line 100: `self._sample_rate = 0  # Pipeline input rate`
- Line 112: `self._sample_rate = self._params.sample_rate or frame.audio_in_sample_rate`
- Line 99: `self._plivo_sample_rate = self._params.plivo_sample_rate` (defaults 8000, line 54)
- Lines 230–231: `ulaw_to_pcm(payload, self._plivo_sample_rate, self._sample_rate, …)`
- Lines 237–238: `InputAudioRawFrame(audio=deserialized_data, num_channels=1, sample_rate=self._sample_rate)`

✅ Correctly uses `self._sample_rate`.

---

### vonage.py

- Line 79: `self._sample_rate = 0  # Pipeline input rate`
- Line 91: `self._sample_rate = self._params.sample_rate or frame.audio_in_sample_rate`
- Line 78: `self._vonage_sample_rate = self._params.vonage_sample_rate` (defaults **16000**, line 51 — Vonage native rate differs from other providers)
- Lines 158–159: resample from `self._vonage_sample_rate` to `self._sample_rate`
- Lines 165–168: `InputAudioRawFrame(…, sample_rate=self._sample_rate,  # Use the configured pipeline input rate)`

✅ Correctly uses `self._sample_rate`. Note: Vonage wire default is 16 kHz (not 8 kHz), so for a non-realtime pipeline the resampler would be a no-op; for a realtime 16 kHz pipeline it would also be a no-op. This is correct behaviour.

---

### cloudonix.py

`CloudonixFrameSerializer` is a thin subclass of `TwilioFrameSerializer` (61 lines total). It adds only Cloudonix-specific hangup/call-teardown logic; all audio handling, including `InputAudioRawFrame` construction, is inherited unchanged from `twilio.py`.

✅ Inherits Twilio's correct `self._sample_rate` usage. No audio-frame code to audit independently.

---

### telnyx.py

- Line 120: `self._sample_rate = 0  # Pipeline input rate`
- Line 133: `self._sample_rate = self._params.sample_rate or frame.audio_in_sample_rate`
- Line 119: `self._telnyx_sample_rate = self._params.telnyx_sample_rate` (defaults 8000, line 63)
- Lines 238–241 and 247–248: two `ulaw_to_pcm` branches, both resample `self._telnyx_sample_rate → self._sample_rate`
- Lines 258–259: `InputAudioRawFrame(audio=deserialized_data, num_channels=1, sample_rate=self._sample_rate)`

✅ Correctly uses `self._sample_rate`. Telnyx has two decode branches (likely G.711 µ-law and a-law variants) but both feed the same pipeline-rate frame.

---

### exotel.py

- Line 70: `self._sample_rate = 0  # Pipeline input rate`
- Line 81: `self._sample_rate = self._params.sample_rate or frame.audio_in_sample_rate`
- Line 69: `self._exotel_sample_rate = self._params.exotel_sample_rate` (defaults 8000, line 49)
- Lines 143–144: resample `self._exotel_sample_rate → self._sample_rate`
- Lines 151–154: `InputAudioRawFrame(…, sample_rate=self._sample_rate,  # Use the configured pipeline input rate)`

✅ Correctly uses `self._sample_rate`. Note: Exotel uses PCM (not µ-law) on the wire, so `ulaw_to_pcm` is absent — just a PCM resample. The pipeline-rate semantics are identical.

---

### genesys.py

- Line 174: `self._sample_rate = 0  # Pipeline input rate, set in setup()`
- Line 269: `self._sample_rate = self._params.sample_rate or frame.audio_in_sample_rate`
- Line 173: `self._genesys_sample_rate = self._params.genesys_sample_rate` (defaults 8000, line 148)
- Lines 680–683: `ulaw_to_pcm(…, self._genesys_sample_rate, self._sample_rate)`
- Lines 697–700: `InputAudioRawFrame(audio=deserialized_data, num_channels=num_channels, sample_rate=self._sample_rate)`

✅ Correctly uses `self._sample_rate`. Genesys is the most complex serializer (700+ lines, JSON control-message protocol), but the audio frame path is clean.

---

### vobiz.py

- Line 99: `self._sample_rate = 0  # Pipeline input rate`
- Line 111: `self._sample_rate = self._params.sample_rate or frame.audio_in_sample_rate`
- Line 98: `self._vobiz_sample_rate = self._params.vobiz_sample_rate` (defaults 8000, line 54)
- Lines 243–244: `ulaw_to_pcm(payload, self._vobiz_sample_rate, self._sample_rate, …)`
- Lines 250–251: `InputAudioRawFrame(audio=deserialized_data, num_channels=1, sample_rate=self._sample_rate)`

✅ Correctly uses `self._sample_rate`. (File exists in the submodule despite the plan noting it might be absent.)

---

## Action items

None — all telephony serializers correctly use `self._sample_rate` when constructing `InputAudioRawFrame`. The 8000 constant visible in each file is exclusively the wire-side default rate and is never passed directly to the audio frame. The resample call always converts from the wire rate to the pipeline rate before the frame is emitted upstream.

## Cross-reference

Spec: `docs/superpowers/specs/2026-05-18-realtime-telephony-audio-config-design.md`
Plan: `docs/superpowers/plans/2026-05-18-realtime-telephony-audio-config.md`
