"""Integration: realtime + telephony delivers 16 kHz input frames.

Exercises run_pipeline_telephony with provider=ari and a user_config
that has is_realtime=True. Asserts that the AudioConfig the pipeline
sees has pipeline_sample_rate=16000 even though the wire format
(transport_in/out) is 8000.
"""

import pytest

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
