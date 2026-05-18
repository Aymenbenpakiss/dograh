"""SIP-trunk transport — reuses ARI's WebSocket transport.

Identical wire format to ARI (Asterisk on the other side), so we delegate
entirely to the ARI transport factory. The only difference is that the
config we hand the serializer comes from environment-level shared ARI
credentials rather than per-tenant credentials.
"""

import os
from typing import TYPE_CHECKING

from api.services.pipecat.audio_config import AudioConfig
from api.services.pipecat.audio_mixer import build_audio_out_mixer
from api.services.telephony.factory import load_credentials_for_transport

from .serializers import AsteriskFrameSerializer
from .strategies import ARIBridgeSwapStrategy, ARIHangupStrategy

if TYPE_CHECKING:
    from fastapi import WebSocket

from pipecat.transports.websocket.fastapi import (
    FastAPIWebsocketParams,
    FastAPIWebsocketTransport,
)


SHARED_ARI_ENDPOINT_ENV = "SHARED_ASTERISK_ARI_ENDPOINT"
SHARED_ARI_APP_NAME_ENV = "SHARED_ASTERISK_ARI_APP_NAME"
SHARED_ARI_APP_PASSWORD_ENV = "SHARED_ASTERISK_ARI_APP_PASSWORD"


async def create_transport(
    websocket: "WebSocket",
    workflow_run_id: int,
    audio_config: AudioConfig,
    organization_id: int,
    *,
    ambient_noise_config: dict | None = None,
    telephony_configuration_id: int | None = None,
    channel_id: str,
):
    """Create a transport bound to the shared Asterisk via ARI."""
    # Resolve tenant config (we only need it to validate the provider — the
    # actual ARI creds come from env, and the channel_id Asterisk already
    # assigned identifies the call).
    await load_credentials_for_transport(
        organization_id, telephony_configuration_id, expected_provider="sip_trunk"
    )

    ari_endpoint = os.environ.get(SHARED_ARI_ENDPOINT_ENV)
    ari_app = os.environ.get(SHARED_ARI_APP_NAME_ENV, "dograh")
    ari_pw = os.environ.get(SHARED_ARI_APP_PASSWORD_ENV)

    if not ari_endpoint or not ari_pw:
        raise ValueError(
            "sip_trunk transport requires SHARED_ASTERISK_ARI_ENDPOINT and "
            "SHARED_ASTERISK_ARI_APP_PASSWORD env vars."
        )

    serializer = AsteriskFrameSerializer(
        channel_id=channel_id,
        ari_endpoint=ari_endpoint,
        app_name=ari_app,
        app_password=ari_pw,
        transfer_strategy=ARIBridgeSwapStrategy(),
        hangup_strategy=ARIHangupStrategy(),
        params=AsteriskFrameSerializer.InputParams(
            asterisk_sample_rate=audio_config.transport_in_sample_rate,
            sample_rate=audio_config.pipeline_sample_rate,
        ),
    )

    mixer = await build_audio_out_mixer(
        audio_config.transport_out_sample_rate, ambient_noise_config
    )

    return FastAPIWebsocketTransport(
        websocket=websocket,
        params=FastAPIWebsocketParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            audio_in_sample_rate=audio_config.transport_in_sample_rate,
            audio_out_sample_rate=audio_config.transport_out_sample_rate,
            audio_out_mixer=mixer,
            serializer=serializer,
        ),
    )
