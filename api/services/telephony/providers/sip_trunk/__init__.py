"""Multi-tenant SIP-trunk telephony provider.

Each tenant pastes their SIP server, username, password, and caller-ID into
the Dograh UI. Trunks terminate on the shared Asterisk box at a single ARI
endpoint shared by all tenants. The per-tenant PJSIP endpoint name is
generated as ``tenant_{org_id}_{config_id}`` and provisioned into Asterisk's
PJSIP realtime tables by ``services.telephony.pjsip_sync.PjsipSyncWorker``.
"""

from typing import Any, Dict

from api.services.telephony.registry import (
    ProviderSpec,
    ProviderUIField,
    ProviderUIMetadata,
    register,
)

from .config import SipTrunkConfigurationRequest, SipTrunkConfigurationResponse
from .provider import SipTrunkProvider
from .transport import create_transport


def _config_loader(value: Dict[str, Any]) -> Dict[str, Any]:
    """Reshape JSONB credentials → constructor kwargs.

    The shared Asterisk's ARI credentials are environment-level config
    (resolved inside the transport via ``SHARED_ARI_*`` env vars), not part
    of the tenant's row. The tenant's row carries only SIP-side identity.
    """
    return {
        "provider": "sip_trunk",
        "sip_server": value.get("sip_server"),
        "auth_mode": value.get("auth_mode", "userpass"),
        "sip_username": value.get("sip_username"),
        "sip_password": value.get("sip_password"),
        "caller_id": value.get("caller_id"),
        "transport": value.get("transport", "udp"),
        "endpoint_name": value.get("endpoint_name"),
        "max_concurrent_calls": value.get("max_concurrent_calls", 10),
    }


_UI_METADATA = ProviderUIMetadata(
    display_name="SIP Trunk",
    docs_url="https://docs.azetax.com/integrations/sip-trunk",
    fields=[
        ProviderUIField(
            name="sip_server",
            label="SIP Server",
            type="text",
            description="Hostname or IP:port of your SIP provider (e.g. sip.example.com:5060)",
        ),
        ProviderUIField(
            name="auth_mode",
            label="Authentication Mode",
            type="select",
            options=[
                ["userpass", "User & password (SIP REGISTER)"],
                ["ip_whitelist", "IP whitelist (no credentials)"],
            ],
            description=(
                "Pick IP whitelist if your provider authorizes our outbound IP "
                "instead of issuing credentials. Leave Username and Password "
                "blank in that case."
            ),
        ),
        ProviderUIField(
            name="sip_username",
            label="SIP Username",
            type="text",
            description="Auth username (leave blank for ip_whitelist mode)",
        ),
        ProviderUIField(
            name="sip_password",
            label="SIP Password",
            type="password",
            sensitive=True,
            description="Auth password (leave blank for ip_whitelist mode)",
        ),
        ProviderUIField(
            name="caller_id",
            label="Caller ID (E.164)",
            type="text",
            description="Number to present on outbound calls, e.g. +41715209599",
        ),
        ProviderUIField(
            name="transport",
            label="Transport",
            type="text",
            description="Transport protocol — typically 'udp' (also 'tcp' or 'tls')",
        ),
    ],
)


SPEC = ProviderSpec(
    name="sip_trunk",
    provider_cls=SipTrunkProvider,
    config_loader=_config_loader,
    transport_factory=create_transport,
    transport_sample_rate=8000,
    config_request_cls=SipTrunkConfigurationRequest,
    ui_metadata=_UI_METADATA,
    config_response_cls=SipTrunkConfigurationResponse,
    # SIP trunks don't have an "account ID" the provider stamps on payloads —
    # inbound matching uses the source IP of the SIP server, handled by the
    # Asterisk-side ``ps_identifies`` row, not by webhook routing.
    account_id_credential_field="sip_server",
)


register(SPEC)


__all__ = [
    "SPEC",
    "SipTrunkConfigurationRequest",
    "SipTrunkConfigurationResponse",
    "SipTrunkProvider",
    "create_transport",
]
