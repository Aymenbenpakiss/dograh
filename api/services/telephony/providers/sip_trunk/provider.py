"""SIP-trunk provider — thin specialization of ARIProvider.

Reuses ARI's call-origination plumbing but resolves the shared Asterisk's
ARI URL and credentials from environment variables, and injects a
per-tenant PJSIP endpoint name (``tenant_{org_id}_{config_id}``) into the
``from_numbers`` list so Asterisk dials through the right trunk.
"""

import os
from typing import Any, Dict, Optional

from api.services.telephony.base import CallInitiationResult
from api.services.telephony.providers.ari.provider import ARIProvider


SHARED_ARI_ENDPOINT_ENV = "SHARED_ASTERISK_ARI_ENDPOINT"
SHARED_ARI_APP_NAME_ENV = "SHARED_ASTERISK_ARI_APP_NAME"
SHARED_ARI_APP_PASSWORD_ENV = "SHARED_ASTERISK_ARI_APP_PASSWORD"


class SipTrunkProvider(ARIProvider):
    """Multi-tenant SIP trunk over the shared Asterisk box."""

    PROVIDER_NAME = "sip_trunk"

    def __init__(self, config: Dict[str, Any]):
        # Resolve the SHARED Asterisk credentials from env. These are
        # operator-level secrets — one Iluminators-wide Asterisk box, not
        # per-tenant — so they never live in the tenant's row.
        ari_endpoint = os.environ.get(SHARED_ARI_ENDPOINT_ENV)
        ari_app = os.environ.get(SHARED_ARI_APP_NAME_ENV, "dograh")
        ari_pw = os.environ.get(SHARED_ARI_APP_PASSWORD_ENV)

        if not ari_endpoint or not ari_pw:
            raise ValueError(
                f"sip_trunk requires {SHARED_ARI_ENDPOINT_ENV} and "
                f"{SHARED_ARI_APP_PASSWORD_ENV} env vars to be set."
            )

        endpoint_name = config.get("endpoint_name")
        if not endpoint_name:
            raise ValueError(
                "sip_trunk config is missing endpoint_name. "
                "This is normally provisioned by PjsipSyncWorker on save."
            )

        # Hand a plain ARI-shape config to the parent class. The
        # endpoint_name lives in from_numbers — ARIProvider.initiate_call
        # uses from_numbers[0] when no from_number is supplied per-call.
        super().__init__(
            {
                "ari_endpoint": ari_endpoint,
                "app_name": ari_app,
                "app_password": ari_pw,
                "from_numbers": [endpoint_name],
            }
        )

        # Keep tenant-side identity available for logging and the dispatcher's
        # concurrent-call check.
        self.endpoint_name = endpoint_name
        self.caller_id = config.get("caller_id")
        self.sip_server = config.get("sip_server")
        self.max_concurrent_calls = config.get("max_concurrent_calls", 10)

    async def initiate_call(
        self,
        to_number: str,
        webhook_url: str,
        workflow_run_id: Optional[int] = None,
        from_number: Optional[str] = None,
        **kwargs: Any,
    ) -> CallInitiationResult:
        # Callers may pass either a raw E.164 number ("+355…") or a fully-formed
        # ARI channel string ("PJSIP/355…@tenant_1_3"). Asterisk needs the
        # latter — endpoint without a tenant aor lookup fails as "endpoint
        # not found". Route bare numbers through this tenant's endpoint.
        if not to_number.startswith(("SIP/", "PJSIP/")):
            digits = to_number.lstrip("+")
            to_number = f"PJSIP/{digits}@{self.endpoint_name}"

        return await super().initiate_call(
            to_number=to_number,
            webhook_url=webhook_url,
            workflow_run_id=workflow_run_id,
            from_number=from_number,
            **kwargs,
        )
