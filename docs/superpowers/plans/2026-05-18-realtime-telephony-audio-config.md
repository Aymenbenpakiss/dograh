# Realtime Telephony Audio Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every (telephony provider × LLM mode) combination work. The pipeline must auto-bump to 16 kHz when a realtime LLM is in use, while keeping the telephony wire format at 8 kHz ulaw.

**Architecture:** `AudioConfig` becomes realtime-aware via a new `is_realtime` field. A small resolver reads `workflow_run.initial_context.is_realtime` first, falls back to the user's stored config, defaults False. The flag is computed BEFORE `create_audio_config()` so the audio rates are correct from frame one. No telephony provider package changes. No Asterisk-side changes.

**Tech Stack:** Python 3.12, FastAPI, asyncpg, pipecat, pytest, Railway, GitHub Actions, GHCR.

**Spec:** `docs/superpowers/specs/2026-05-18-realtime-telephony-audio-config-design.md` (commit `ef3c01b`).

**Branch:** `whitelabel-mortgage` (`origin/aymenbenpakiss/dograh`).

**Working directory:** `C:\Users\User\Desktop\Dograh\dograh-fork`. All commands assume this cwd.

---

## File map

| File | Action |
|---|---|
| `api/services/pipecat/audio_config.py` | Modify: add `is_realtime` field on `AudioConfig`, new param on `create_audio_config()` |
| `api/services/pipecat/run_pipeline.py` | Modify: new helper `_resolve_is_realtime`, plumb it before `create_audio_config()`, dedupe existing `is_realtime` line at 296 |
| `api/tests/test_audio_config.py` | Create: matrix tests for `create_audio_config` × realtime |
| `api/tests/test_resolve_is_realtime.py` | Create: tests for the resolver helper |
| `api/tests/integrations/test_run_pipeline_realtime_telephony.py` | Create: integration test that pipeline receives 16 kHz frames for ARI + realtime |
| `api/tests/integrations/test_run_pipeline.py` | Modify: regression — non-realtime telephony path stays 8 kHz |
| `.github/workflows/whitelabel-image.yml` | Create: GHCR image build on push to `whitelabel-mortgage` |
| `BUILD_SUMMARY.md` | Modify: record new image tag + Railway rollback digest |
| `docs/superpowers/audits/2026-05-18-telephony-serializer-audit.md` | Create: read-only audit of every telephony serializer in the pipecat submodule |

---

## Task 1: Failing unit tests for `AudioConfig` realtime field

**Files:**
- Create: `api/tests/test_audio_config.py`

- [ ] **Step 1: Write the failing tests**

```python
"""Tests for AudioConfig realtime-aware sample-rate selection."""

import pytest

from api.services.pipecat.audio_config import AudioConfig, create_audio_config


class TestAudioConfigRealtimeField:
    def test_default_is_realtime_false(self):
        cfg = AudioConfig(transport_in_sample_rate=8000, transport_out_sample_rate=8000)
        assert cfg.is_realtime is False

    def test_explicit_is_realtime_true_preserved(self):
        cfg = AudioConfig(
            transport_in_sample_rate=8000,
            transport_out_sample_rate=8000,
            is_realtime=True,
        )
        assert cfg.is_realtime is True


class TestCreateAudioConfigMatrix:
    """Parametrised matrix of (transport_type, is_realtime) → expected rates."""

    @pytest.mark.parametrize(
        ("transport_type", "is_realtime", "exp_transport", "exp_pipeline", "exp_vad"),
        [
            # Non-realtime: every path keeps wire rate everywhere.
            ("ari", False, 8000, 8000, 8000),
            ("twilio", False, 8000, 8000, 8000),
            ("plivo", False, 8000, 8000, 8000),
            ("vonage", False, 16000, 16000, 16000),
            ("cloudonix", False, 16000, 16000, 16000),
            ("webrtc", False, 16000, 16000, 16000),
            ("smallwebrtc", False, 16000, 16000, 16000),
            # Realtime: 8 kHz telephony bumps pipeline + VAD to 16 kHz.
            #          Wire rate (transport_in/out) is unchanged.
            ("ari", True, 8000, 16000, 16000),
            ("twilio", True, 8000, 16000, 16000),
            ("plivo", True, 8000, 16000, 16000),
            # Already-16k transports: no-op.
            ("vonage", True, 16000, 16000, 16000),
            ("cloudonix", True, 16000, 16000, 16000),
            ("webrtc", True, 16000, 16000, 16000),
            ("smallwebrtc", True, 16000, 16000, 16000),
        ],
    )
    def test_rates(
        self,
        transport_type,
        is_realtime,
        exp_transport,
        exp_pipeline,
        exp_vad,
    ):
        cfg = create_audio_config(transport_type, is_realtime=is_realtime)
        assert cfg.transport_in_sample_rate == exp_transport
        assert cfg.transport_out_sample_rate == exp_transport
        assert cfg.pipeline_sample_rate == exp_pipeline
        assert cfg.vad_sample_rate == exp_vad
        assert cfg.is_realtime == is_realtime

    def test_backwards_compat_is_realtime_default_false(self):
        """Calling create_audio_config without is_realtime keeps existing behaviour."""
        cfg = create_audio_config("ari")
        assert cfg.is_realtime is False
        assert cfg.pipeline_sample_rate == 8000
        assert cfg.vad_sample_rate == 8000
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```
.venv/Scripts/python -m pytest api/tests/test_audio_config.py -v
```

Expected: FAIL. `AudioConfig.__init__()` doesn't accept `is_realtime`; `create_audio_config()` doesn't accept the kwarg.

- [ ] **Step 3: Commit the failing tests**

```bash
git add api/tests/test_audio_config.py
git commit -m "test: AudioConfig realtime-aware sample-rate matrix (failing)"
```

---

## Task 2: Make `AudioConfig` and `create_audio_config` realtime-aware

**Files:**
- Modify: `api/services/pipecat/audio_config.py`

- [ ] **Step 1: Add `is_realtime` field to `AudioConfig`**

In `api/services/pipecat/audio_config.py`, modify the dataclass. Replace the existing class definition with:

```python
@dataclass
class AudioConfig:
    """Centralized audio configuration for the pipeline.

    Note: Pipeline is limited to 16kHz maximum to support VAD.
    Transports handle resampling from/to higher rates (24kHz, 48kHz).

    Attributes:
        transport_in_sample_rate: Sample rate of incoming audio from transport (after resampling)
        transport_out_sample_rate: Sample rate of outgoing audio to transport (before resampling)
        vad_sample_rate: Sample rate for VAD processing (8000 or 16000)
        pipeline_sample_rate: Internal pipeline processing sample rate (max 16000)
        buffer_size_seconds: Audio buffer size in seconds
        is_realtime: Whether the consuming LLM is a realtime speech-to-speech
            service (e.g. Gemini Live, OpenAI Realtime). When True, downstream
            consumers know audio frames target a model that requires >=16kHz.
    """

    transport_in_sample_rate: int
    transport_out_sample_rate: int
    vad_sample_rate: int = 16000  # VAD typically resamples internally
    pipeline_sample_rate: Optional[int] = None  # If None, uses transport rates
    buffer_size_seconds: float = 5.0  # This is how frequenly we will call merge_auido
    max_recording_duration_seconds: float = 300.0  # 5 minutes max recording duration
    is_realtime: bool = False
```

The `__post_init__`, properties, and existing logic stay unchanged.

- [ ] **Step 2: Update `create_audio_config()` to accept and apply `is_realtime`**

Replace the existing `create_audio_config` function with:

```python
def create_audio_config(
    transport_type: str,
    is_realtime: bool = False,
) -> AudioConfig:
    """Create audio configuration for a given transport.

    Telephony providers contribute their wire-format sample rate through the
    provider registry (``ProviderSpec.transport_sample_rate``); WebRTC modes
    use 16 kHz (transports handle resampling from/to 24 kHz). The remaining
    AudioConfig fields are derived from the chosen rate.

    When ``is_realtime`` is True and the transport wire rate is below 16 kHz
    (i.e. an 8 kHz telephony transport), the pipeline and VAD rates are bumped
    to 16 kHz so realtime LLMs receive audio at the rate they require. Wire
    rate is left at the transport's native value; the serializer handles the
    8 kHz ↔ 16 kHz resample on each frame.
    """
    # Defer registry import to avoid an import cycle: the registry is imported
    # by every telephony provider package at startup.
    from api.enums import WorkflowRunMode
    from api.services.telephony import registry

    telephony_spec = registry.get_optional(transport_type)
    if telephony_spec is not None:
        rate = telephony_spec.transport_sample_rate
    elif transport_type in (
        WorkflowRunMode.WEBRTC.value,
        WorkflowRunMode.SMALLWEBRTC.value,
    ):
        rate = 16000
    else:
        logger.warning(
            f"Unknown transport type: {transport_type}, using default config"
        )
        rate = 16000

    pipeline_rate = 16000 if (is_realtime and rate < 16000) else rate
    vad_rate = 16000 if is_realtime else rate

    return AudioConfig(
        transport_in_sample_rate=rate,
        transport_out_sample_rate=rate,
        vad_sample_rate=vad_rate,
        pipeline_sample_rate=pipeline_rate,
        is_realtime=is_realtime,
    )
```

- [ ] **Step 3: Run tests to verify they now pass**

Run:
```
.venv/Scripts/python -m pytest api/tests/test_audio_config.py -v
```

Expected: PASS — all 16 parametrised cases plus the two field tests and the backwards-compat test.

- [ ] **Step 4: Commit**

```bash
git add api/services/pipecat/audio_config.py
git commit -m "feat(audio_config): realtime-aware sample-rate selection

When is_realtime=True on a sub-16kHz telephony transport, bump
pipeline_sample_rate and vad_sample_rate to 16000 so realtime LLMs
(Gemini Live, OpenAI Realtime) receive audio at the rate they require.
Wire-format rate (transport_in/out_sample_rate) is unchanged; the
serializer handles the resample on each frame.

Backwards-compatible: is_realtime defaults to False; existing callers
that don't pass it keep their current behaviour."
```

---

## Task 3: Failing test for `_resolve_is_realtime` helper

**Files:**
- Create: `api/tests/test_resolve_is_realtime.py`

- [ ] **Step 1: Write the failing tests**

```python
"""Tests for the is_realtime resolver used by run_pipeline_telephony."""

from types import SimpleNamespace

import pytest

from api.services.pipecat.run_pipeline import _resolve_is_realtime


def _user_config(is_realtime: bool, has_realtime_settings: bool = True):
    """Build a minimal UserConfigurationModel stand-in."""
    realtime = SimpleNamespace(provider="google_realtime") if has_realtime_settings else None
    return SimpleNamespace(is_realtime=is_realtime, realtime=realtime)


def _workflow_run(initial_context: dict | None):
    return SimpleNamespace(initial_context=initial_context or {})


class TestResolveIsRealtime:
    def test_workflow_override_true_wins_over_user_false(self):
        result, source = _resolve_is_realtime(
            workflow_run=_workflow_run({"is_realtime": True}),
            user_config=_user_config(is_realtime=False),
        )
        assert result is True
        assert source == "workflow_override"

    def test_workflow_override_false_wins_over_user_true(self):
        result, source = _resolve_is_realtime(
            workflow_run=_workflow_run({"is_realtime": False}),
            user_config=_user_config(is_realtime=True),
        )
        assert result is False
        assert source == "workflow_override"

    def test_workflow_no_override_falls_back_to_user_config_true(self):
        result, source = _resolve_is_realtime(
            workflow_run=_workflow_run({}),
            user_config=_user_config(is_realtime=True),
        )
        assert result is True
        assert source == "user_config"

    def test_workflow_no_override_falls_back_to_user_config_false(self):
        result, source = _resolve_is_realtime(
            workflow_run=_workflow_run({}),
            user_config=_user_config(is_realtime=False),
        )
        assert result is False
        assert source == "user_config"

    def test_user_realtime_flag_true_but_no_realtime_settings_returns_false(self):
        """Matches the existing run_pipeline.py:296 guard."""
        result, source = _resolve_is_realtime(
            workflow_run=_workflow_run({}),
            user_config=_user_config(is_realtime=True, has_realtime_settings=False),
        )
        assert result is False
        assert source == "user_config"

    def test_no_workflow_no_user_defaults_false(self):
        result, source = _resolve_is_realtime(
            workflow_run=_workflow_run(None),
            user_config=_user_config(is_realtime=False),
        )
        assert result is False
        assert source == "user_config"

    def test_non_bool_workflow_override_ignored(self):
        """Truthy non-bool values must not flip the flag — guards against
        accidental string 'false' or int 1 leaking in from JSON."""
        result, source = _resolve_is_realtime(
            workflow_run=_workflow_run({"is_realtime": "true"}),
            user_config=_user_config(is_realtime=False),
        )
        assert result is False
        assert source == "user_config"
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```
.venv/Scripts/python -m pytest api/tests/test_resolve_is_realtime.py -v
```

Expected: FAIL with `ImportError: cannot import name '_resolve_is_realtime'`.

- [ ] **Step 3: Commit the failing tests**

```bash
git add api/tests/test_resolve_is_realtime.py
git commit -m "test: _resolve_is_realtime helper (failing)"
```

---

## Task 4: Implement `_resolve_is_realtime` helper

**Files:**
- Modify: `api/services/pipecat/run_pipeline.py`

- [ ] **Step 1: Read the file to confirm current top-level imports + layout**

Run:
```
.venv/Scripts/python -c "import ast; ast.parse(open('api/services/pipecat/run_pipeline.py').read()); print('ok')"
```

Confirms file parses. Look at lines 1–30 to see existing imports.

- [ ] **Step 2: Add the helper function**

In `api/services/pipecat/run_pipeline.py`, locate the existing helpers near the top of the file (above `run_pipeline_telephony`). Add this function:

```python
def _resolve_is_realtime(workflow_run, user_config) -> tuple[bool, str]:
    """Resolve the realtime flag for this run.

    Precedence:
        1. ``workflow_run.initial_context["is_realtime"]`` if it's a bool — allows
           campaigns and ``/initiate-call`` to override per call.
        2. ``user_config.is_realtime and user_config.realtime is not None`` —
           matches the legacy resolution used elsewhere in this module.
        3. ``False``.

    Returns:
        ``(value, source)`` where ``source`` is one of ``"workflow_override"`` or
        ``"user_config"``. The source is logged once at pipeline start so a
        single grep tells you why a given run picked the mode it did.
    """
    initial_context = workflow_run.initial_context or {}
    override = initial_context.get("is_realtime")
    if isinstance(override, bool):
        return override, "workflow_override"
    user_value = bool(user_config.is_realtime and user_config.realtime is not None)
    return user_value, "user_config"
```

- [ ] **Step 3: Run tests to verify they pass**

Run:
```
.venv/Scripts/python -m pytest api/tests/test_resolve_is_realtime.py -v
```

Expected: PASS — all 7 tests.

- [ ] **Step 4: Commit**

```bash
git add api/services/pipecat/run_pipeline.py
git commit -m "feat(run_pipeline): _resolve_is_realtime helper

Single source of truth for whether a workflow run uses a realtime
LLM. Reads workflow_run.initial_context override first, falls back
to the user's stored config. Non-bool override values are ignored
(guards against str 'true' / int 1 sneaking in via JSON)."
```

---

## Task 5: Wire `_resolve_is_realtime` into `run_pipeline_telephony`

**Files:**
- Modify: `api/services/pipecat/run_pipeline.py` (around lines 130–155 and 250–300)

- [ ] **Step 1: Read the current call sites**

```bash
grep -n "create_audio_config\|user_config\|is_realtime\|get_user_configurations" api/services/pipecat/run_pipeline.py
```

Confirm:
- Line ~142: `audio_config = create_audio_config(provider_name)` — the call we need to feed
- Line ~250: `user_config = await db_client.get_user_configurations(user_id)`
- Line ~296: `is_realtime = user_config.is_realtime and user_config.realtime is not None`

The user_config fetch at 250 is INSIDE `_run_pipeline`, and `create_audio_config` at 142 is INSIDE `run_pipeline_telephony`. They're in different functions. The cleanest fix is to fetch user_config in `run_pipeline_telephony` too, resolve `is_realtime`, then pass `audio_config` (now correct) into `_run_pipeline` which already accepts it.

- [ ] **Step 2: Modify `run_pipeline_telephony` to fetch user_config and resolve is_realtime BEFORE building audio_config**

Locate the section in `run_pipeline_telephony` that currently reads:

```python
    workflow_run = await db_client.get_workflow_run(workflow_run_id)
    telephony_configuration_id = None
    if workflow_run and workflow_run.initial_context:
        telephony_configuration_id = workflow_run.initial_context.get(
            "telephony_configuration_id"
        )

    spec = telephony_registry.get(provider_name)
    audio_config = create_audio_config(provider_name)
```

Replace with:

```python
    workflow_run = await db_client.get_workflow_run(workflow_run_id)
    telephony_configuration_id = None
    if workflow_run and workflow_run.initial_context:
        telephony_configuration_id = workflow_run.initial_context.get(
            "telephony_configuration_id"
        )

    user_config = await db_client.get_user_configurations(user_id)
    is_realtime, is_realtime_source = _resolve_is_realtime(workflow_run, user_config)

    spec = telephony_registry.get(provider_name)
    audio_config = create_audio_config(provider_name, is_realtime=is_realtime)
    logger.info(
        f"audio config for run {workflow_run_id}: "
        f"transport={audio_config.transport_in_sample_rate}Hz "
        f"pipeline={audio_config.pipeline_sample_rate}Hz "
        f"vad={audio_config.vad_sample_rate}Hz "
        f"realtime={is_realtime} (source={is_realtime_source})"
    )
```

- [ ] **Step 3: Dedupe — `_run_pipeline` already re-derives `is_realtime` at line 296**

Inside `_run_pipeline`, find this line (around 296):

```python
    is_realtime = user_config.is_realtime and user_config.realtime is not None
```

Replace it with:

```python
    # is_realtime is authoritative on audio_config because run_pipeline_telephony
    # passed it through _resolve_is_realtime. Re-deriving from user_config here
    # would silently ignore any workflow-level override.
    is_realtime = audio_config.is_realtime
```

This makes `AudioConfig.is_realtime` the single source of truth downstream.

- [ ] **Step 4: Run all touched tests**

```
.venv/Scripts/python -m pytest api/tests/test_audio_config.py api/tests/test_resolve_is_realtime.py -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/services/pipecat/run_pipeline.py
git commit -m "feat(run_pipeline): resolve is_realtime before building AudioConfig

Move is_realtime resolution to the top of run_pipeline_telephony so
the audio rates passed into create_audio_config are correct from
frame one. Make AudioConfig.is_realtime the single source of truth
downstream (avoids the previous double-resolution that ignored
workflow-level overrides)."
```

---

## Task 6: Update other `create_audio_config` callers

**Files:**
- Modify: `api/services/pipecat/run_pipeline.py` (the SmallWebRTC path)
- Modify: `api/tests/integrations/test_run_pipeline.py` (and sibling)
- Modify: `api/tests/integrations/test_run_pipeline_text_greeting.py`

- [ ] **Step 1: Find all call sites**

```bash
grep -rn "create_audio_config(" api/ 2>/dev/null
```

Expected sites (verify with the grep above): `api/services/pipecat/run_pipeline.py:142`, `api/services/pipecat/run_pipeline.py:199`, `api/tests/integrations/test_run_pipeline.py:96`, `api/tests/integrations/test_run_pipeline_text_greeting.py:165`.

- [ ] **Step 2: Leave them as-is**

The new `is_realtime` parameter defaults to `False`. All existing callers retain their current behaviour. No change needed. Confirm by re-running the existing integration tests in Task 10.

- [ ] **Step 3: Commit-skip — record the audit in the plan log (no code change)**

No commit needed. Record findings inline in the next task's commit message.

---

## Task 7: Integration test — realtime pipeline gets 16 kHz frames over ARI

**Files:**
- Create: `api/tests/integrations/test_run_pipeline_realtime_telephony.py`

- [ ] **Step 1: Inspect the existing integration test helper**

```bash
sed -n '1,60p' api/tests/integrations/_run_pipeline_helpers.py
```

Confirm `create_workflow_run_rows` and `patch_run_pipeline_externals` exist and what they accept.

- [ ] **Step 2: Write the failing test**

Create `api/tests/integrations/test_run_pipeline_realtime_telephony.py`:

```python
"""Integration: realtime + telephony delivers 16 kHz input frames.

Exercises run_pipeline_telephony with provider=ari and a user_config
that has is_realtime=True. Asserts that the AudioConfig the pipeline
sees has pipeline_sample_rate=16000 even though the wire format
(transport_in/out) is 8000.
"""

import pytest

from api.enums import WorkflowRunMode
from api.services.pipecat.audio_config import create_audio_config


@pytest.mark.parametrize(
    "transport_type,is_realtime,expected_pipeline_rate",
    [
        ("ari", True, 16000),
        ("ari", False, 8000),
        ("twilio", True, 16000),
        ("twilio", False, 8000),
    ],
)
def test_audio_config_for_realtime_telephony(
    transport_type, is_realtime, expected_pipeline_rate
):
    cfg = create_audio_config(transport_type, is_realtime=is_realtime)
    assert cfg.pipeline_sample_rate == expected_pipeline_rate
    # Wire format never changes — telephony stays 8 kHz on the wire.
    assert cfg.transport_in_sample_rate == 8000
    assert cfg.transport_out_sample_rate == 8000


def test_resolve_is_realtime_used_in_run_pipeline_telephony():
    """Quick smoke that the helper is importable from the path the
    run_pipeline module expects."""
    from api.services.pipecat.run_pipeline import _resolve_is_realtime  # noqa: F401
```

(A full DB-backed end-to-end test would require patching the realtime
LLM service network calls. The matrix above + unit tests cover the
contract; the manual smoke in Task 14 covers true E2E.)

- [ ] **Step 3: Run the test — expect PASS already (it exercises code from Tasks 2 and 4)**

Run:
```
.venv/Scripts/python -m pytest api/tests/integrations/test_run_pipeline_realtime_telephony.py -v
```

Expected: PASS — these tests exercise the shipped code from Tasks 2 + 4.

- [ ] **Step 4: Commit**

```bash
git add api/tests/integrations/test_run_pipeline_realtime_telephony.py
git commit -m "test: realtime telephony audio-config integration

Locks in the contract: ARI + Twilio with is_realtime=True bump
pipeline rate to 16 kHz while keeping the wire format at 8 kHz."
```

---

## Task 8: Regression — confirm non-realtime telephony still works

**Files:**
- (read-only) `api/tests/integrations/test_run_pipeline.py`

- [ ] **Step 1: Run the entire pipeline integration suite**

```
.venv/Scripts/python -m pytest api/tests/integrations/ -v
```

Expected: all existing tests PASS. They do not pass `is_realtime` to `create_audio_config`, so their behaviour is unchanged.

- [ ] **Step 2: If anything fails — STOP**

Do not proceed. The default-False behaviour must keep the non-realtime path unchanged. Investigate, fix, re-run before continuing.

- [ ] **Step 3: Run the full api test suite for broader coverage**

```
.venv/Scripts/python -m pytest api/tests/ -x --ignore=api/tests/integrations -q
```

Expected: all green.

- [ ] **Step 4: If broader suite reveals breakage in a test that imports `create_audio_config` or `_resolve_is_realtime`, update that test minimally to match the new signature. Commit per fix.**

```bash
git add <fixed_test_file>
git commit -m "test: adapt <fixed_test_file> to new create_audio_config signature"
```

- [ ] **Step 5: No-op commit if suite was already green**

Skip. Move to next task.

---

## Task 9: Audit pipecat telephony serializers (read-only, scope check)

**Files:**
- Create: `docs/superpowers/audits/2026-05-18-telephony-serializer-audit.md`

The spec says: "Audit only. Any that hardcode 8 kHz instead of using `self._sample_rate` are bugs and get fixed in the same diff." Pipecat is a git submodule; fixes there are separate upstream PRs. Document findings here so they can be acted on later.

- [ ] **Step 1: Inspect each serializer**

```bash
for f in pipecat/src/pipecat/serializers/{asterisk,twilio,plivo,vonage,cloudonix,telnyx,exotel,genesys,vobiz}.py; do
  echo "=== $f ==="
  grep -nE "8000|sample_rate|InputAudioRawFrame|ulaw_to_pcm|pcm_to_ulaw" "$f" 2>/dev/null | head -15
done
```

- [ ] **Step 2: Write the audit doc**

Create `docs/superpowers/audits/2026-05-18-telephony-serializer-audit.md` with this structure (fill in actual findings from Step 1; do not leave placeholders):

```markdown
# Telephony serializer audit — pipecat submodule

**Date:** 2026-05-18
**Scope:** Confirm each telephony serializer uses `self._sample_rate` (the
pipeline rate) when constructing `InputAudioRawFrame`, not a hardcoded 8000.

## Findings

### asterisk.py
- `InputAudioRawFrame(sample_rate=self._sample_rate)` at line <N>. ✅
- Resample: `ulaw_to_pcm(data, self._asterisk_sample_rate, self._sample_rate, ...)`. ✅

### twilio.py
- (record actual line refs + ✅ / ❌)

### plivo.py
...

### vonage.py
...

### cloudonix.py
...

### telnyx.py
...

### exotel.py
...

### genesys.py
...

### vobiz.py
...

## Action items

(One bullet per ❌, if any. Each becomes an upstream PR against
`dograh-hq/pipecat`. None blocks this plan — they're follow-ups.)
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/audits/2026-05-18-telephony-serializer-audit.md
git commit -m "docs: telephony serializer rate-usage audit

Confirms which pipecat serializers correctly pass self._sample_rate
to InputAudioRawFrame. Any hardcoded-8kHz finding here becomes a
separate upstream PR against dograh-hq/pipecat."
```

---

## Task 10: Update `BUILD_SUMMARY.md` with the new image deployment plan

**Files:**
- Modify: `BUILD_SUMMARY.md` (already present at repo root from the earlier session)

- [ ] **Step 1: Append a new section**

Open `BUILD_SUMMARY.md`. After the existing "Wrap" section (or at the very end), append:

```markdown

---

## Realtime LLM telephony fix (2026-05-18 follow-up)

Spec: `docs/superpowers/specs/2026-05-18-realtime-telephony-audio-config-design.md`
Plan: `docs/superpowers/plans/2026-05-18-realtime-telephony-audio-config.md`

**What changes when this ships:**
- `is_realtime=True` users (Gemini Live, OpenAI Realtime) finally get
  two-way audio on telephony calls. The pipeline auto-bumps to 16 kHz.
- `workflow_run.initial_context.is_realtime` becomes a per-call override.
- Non-realtime path: unchanged.

**Deployment path:**
- Fork image built by `.github/workflows/whitelabel-image.yml` →
  `ghcr.io/aymenbenpakiss/dograh-api:whitelabel-<sha>`
- Pin Railway api service to that SHA — NEVER `:whitelabel-latest`.
- Previous Railway image digest (for rollback):
  `ghcr.io/dograh-hq/dograh-api@sha256:3f7f41c5656dba59cf5706a0e45e71b00b32e8148ef34687611d3e915cdc6f2e`
- Rollback: in Railway dashboard, change image source back to the digest
  above. Verified working on 2026-05-18 16:31 UTC.
```

- [ ] **Step 2: Commit**

```bash
git add BUILD_SUMMARY.md
git commit -m "docs(build_summary): record realtime telephony fix deployment notes"
```

---

## Task 11: GitHub Actions workflow — build fork image on push

**Files:**
- Create: `.github/workflows/whitelabel-image.yml`

- [ ] **Step 1: Inspect the existing release workflow**

```bash
cat .github/workflows/docker-image.yml
```

Note: it triggers only on release. It logs into DockerHub. We want a *separate* workflow that triggers on push to `whitelabel-mortgage` and publishes to GHCR. Don't modify the existing one — different lifecycle.

- [ ] **Step 2: Create the new workflow**

Write `.github/workflows/whitelabel-image.yml`:

```yaml
name: Build whitelabel api image

on:
  push:
    branches:
      - whitelabel-mortgage
    paths:
      - "api/**"
      - "pipecat/**"
      - ".github/workflows/whitelabel-image.yml"
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      REGISTRY: ghcr.io
      IMAGE_NAME: ${{ github.repository_owner }}/dograh-api

    steps:
      - name: Free Disk Space
        uses: jlumbroso/free-disk-space@main
        with:
          tool-cache: false
          android: false
          dotnet: false
          haskell: true
          large-packages: true
          docker-images: true
          swap-storage: true

      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          submodules: true

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push api image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./api/Dockerfile
          push: true
          platforms: linux/amd64
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:whitelabel-${{ github.sha }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:whitelabel-latest
          cache-from: type=gha,scope=whitelabel-api
          cache-to: type=gha,mode=max,scope=whitelabel-api

      - name: Print pinnable digest
        run: |
          echo "Pin Railway to: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:whitelabel-${{ github.sha }}"
```

`GITHUB_TOKEN` is built-in and has `packages: write` from the `permissions` block — no manual secret setup needed for GHCR pushes from the same repo. (The plan deliberately avoids requiring a PAT.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/whitelabel-image.yml
git commit -m "ci: build whitelabel api image to GHCR on push to whitelabel-mortgage

Triggers on api/** or pipecat/** changes. Tags every build with the
commit SHA plus :whitelabel-latest. Railway should pin to the SHA
tag for reproducibility."
```

---

## Task 12: Push, watch CI, verify image is published

**Files:**
- None (manual verification)

- [ ] **Step 1: Push the branch**

```bash
git push origin whitelabel-mortgage
```

- [ ] **Step 2: Watch CI**

Run:
```bash
gh run watch
```

Or open `https://github.com/Aymenbenpakiss/dograh/actions`. Wait for the "Build whitelabel api image" run to finish green.

- [ ] **Step 3: Verify the image is pullable**

```bash
docker pull ghcr.io/aymenbenpakiss/dograh-api:whitelabel-latest
docker image inspect ghcr.io/aymenbenpakiss/dograh-api:whitelabel-latest --format '{{.Id}}'
```

Expected: the image pulls; the digest matches the SHA tag.

- [ ] **Step 4: If CI fails — STOP**

Investigate. Common failures:
- Submodule fetch failure (pipecat private?) → make sure the submodule URL in `.gitmodules` is public or add a deploy key.
- Dockerfile path wrong → confirm `api/Dockerfile` is the actual path.
- Out of disk → keep the `Free Disk Space` step in.

Fix, push, re-watch. Do not skip ahead to deploy.

---

## Task 13: Switch Railway api service to the fork image

**Files:**
- None (Railway dashboard)

- [ ] **Step 1: Note the current digest for rollback**

```bash
railway status --json | python -c "import sys, json; d = json.load(sys.stdin); api = [s['node'] for s in d['environments']['edges'][0]['node']['serviceInstances']['edges'] if s['node']['serviceName']=='api'][0]; print('current digest:', api['latestDeployment']['meta']['imageDigest'])"
```

Record the digest in your local notes (and in `BUILD_SUMMARY.md` — already done in Task 10).

- [ ] **Step 2: Switch the api service source in the Railway dashboard**

In the Railway dashboard for project `dograh` → service `api` → Settings → Source:
1. Change image from `ghcr.io/dograh-hq/dograh-api:latest` to `ghcr.io/aymenbenpakiss/dograh-api:whitelabel-<full-sha>` (use the SHA from Task 12 — NOT `:whitelabel-latest`, that floats).
2. If the GHCR image is private (default for new GHCR packages), add a Docker credential in Railway: username = your GitHub username, password = a PAT with `read:packages`.
3. Save. Trigger a redeploy.

- [ ] **Step 3: Watch the deploy logs**

```bash
railway logs -s api --deployment
```

Expected: app boots, `[ARI Manager] Active connections: 1 (configs: [4])` heartbeat reappears within ~60 seconds.

- [ ] **Step 4: If deploy fails — rollback**

In the Railway dashboard, switch the image back to the digest you saved in Step 1. Confirm app recovers. Investigate the failure (image incompatibility, missing env var, schema mismatch) before retrying.

---

## Task 14: End-to-end smoke test on real call

**Files:**
- None (you + a phone)

- [ ] **Step 1: Confirm `is_realtime=true` for user 1**

```bash
railway ssh -s api 'cd /app && python -c "
import os, asyncio, asyncpg, json
async def main():
    url = os.environ[\"DATABASE_URL\"].replace(\"+asyncpg\",\"\")
    conn = await asyncpg.connect(url)
    row = await conn.fetchrow(\"SELECT configuration::text AS c FROM user_configurations WHERE user_id=1\")
    cfg = json.loads(row[\"c\"])
    print(\"is_realtime:\", cfg.get(\"is_realtime\"))
    await conn.close()
asyncio.run(main())
"'
```

If False, flip it back to True using the inverse of the change made during the debug session.

- [ ] **Step 2: Place a real call to your test number**

```bash
curl -sS -X POST https://api-production-971d.up.railway.app/api/v1/telephony/initiate-call \
  -H "X-API-Key: dgr_2WD9QPqO-oUyZYvooHMNa8aXWYO6CnOXiOLaAFmTufI" \
  -H "Content-Type: application/json" \
  -d '{"workflow_id":3,"phone_number":"PJSIP/355686009292@tenant_1_3","telephony_configuration_id":3}'
```

Answer + speak: "hello hello hello can you hear me". Listen for the bot to actually respond to what you said (not just play the greeting).

- [ ] **Step 3: Verify the api logs match the expected shape**

```bash
railway logs -s api --deployment | grep -E "audio config for run|sample_rate|VADController" | tail -20
```

Expected one new line near the top of the run:
```
audio config for run <N>: transport=8000Hz pipeline=16000Hz vad=16000Hz realtime=True (source=user_config)
```

And **no** `VADController#N: no audio received while speaking, forcing speech stop` warnings during the call.

- [ ] **Step 4: If audio still doesn't reach the LLM — STOP and rollback**

The fix didn't take. Capture:
- `railway logs -s api --deployment | grep -E "audio config\|VAD\|GeminiLive\|Gemini" | tail -40`
- Asterisk-side: `ssh -i ~/.ssh/hetzner_sip01 root@178.105.117.51 'asterisk -rx "core show channels concise"; grep "Got RTP" /var/log/asterisk/full | tail -20'`

Roll back the Railway image to the digest from Task 13 Step 1. Open a debug session against the pcap to understand why the 16 kHz upsample didn't reach Gemini.

---

## Task 15: Prepare upstream PR

**Files:**
- None (separate worktree / branch off upstream)

- [ ] **Step 1: Create a clean branch off upstream/main**

```bash
git fetch upstream
git checkout -b feat/realtime-telephony-audio-config upstream/main
```

- [ ] **Step 2: Cherry-pick the four core commits**

Identify their hashes:
```bash
git log whitelabel-mortgage --oneline | grep -E "audio_config|run_pipeline|_resolve_is_realtime|realtime telephony" | head -10
```

Cherry-pick in the order they were committed (Task 1 → Task 5). Resolve any conflicts (unlikely — these files don't churn upstream).

```bash
git cherry-pick <hash1> <hash2> <hash3> <hash4>
```

- [ ] **Step 3: Push and open the PR**

```bash
git push origin feat/realtime-telephony-audio-config
gh pr create --repo dograh-hq/dograh \
  --title "feat: realtime LLMs over telephony — auto-bump pipeline sample rate" \
  --body "$(cat <<'EOF'
## Summary
- Realtime LLMs (Gemini Live, OpenAI Realtime) require >=16 kHz PCM input but every telephony provider's `transport_sample_rate` is 8000.
- Currently `create_audio_config` propagates 8 kHz into `pipeline_sample_rate` and `vad_sample_rate`, so realtime LLMs receive 8 kHz audio and silently drop it.
- This PR teaches `AudioConfig` to bump pipeline + VAD to 16 kHz when `is_realtime=True`, while keeping the wire-format rate at the provider's native value.
- A new helper `_resolve_is_realtime(workflow_run, user_config)` lets a per-call `initial_context.is_realtime` override the user's stored config.

## Verified
- Unit tests: full transport × is_realtime matrix
- Integration: `_resolve_is_realtime` precedence rules
- Manual: live call against Asterisk 22 / chan_websocket, Gemini Live now receives audio and responds.

## Backwards compatibility
`is_realtime` defaults to False; every existing caller of `create_audio_config(transport_type)` keeps current behaviour.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Switch back**

```bash
git checkout whitelabel-mortgage
```

PR URL goes in `BUILD_SUMMARY.md` under the deployment notes section (add another line).

---

## Task 16: Cleanup + final wrap

**Files:**
- Modify: `BUILD_SUMMARY.md`

- [ ] **Step 1: Add the PR URL + the new pinned image digest**

Append to `BUILD_SUMMARY.md`:

```markdown

**Status as of completion:**
- Upstream PR: `<url from Task 15>`
- Pinned image: `ghcr.io/aymenbenpakiss/dograh-api:whitelabel-<sha>`
- Image digest: `<sha256 from Task 12>`
- Manual smoke: passed YYYY-MM-DD HH:MM (Task 14)
```

- [ ] **Step 2: Commit + push**

```bash
git add BUILD_SUMMARY.md
git commit -m "docs(build_summary): finalise realtime telephony fix — PR + digest"
git push origin whitelabel-mortgage
```

- [ ] **Step 3: Done. Watch the upstream PR.**

When it merges and `dograh-hq` cuts a release, swap Railway back to upstream `ghcr.io/dograh-hq/dograh-api:<new-tag>`. Until then, the fork image stays in place.
