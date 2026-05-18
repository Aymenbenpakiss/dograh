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
