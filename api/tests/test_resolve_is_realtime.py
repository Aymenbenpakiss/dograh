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
