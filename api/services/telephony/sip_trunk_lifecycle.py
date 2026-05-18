"""sip_trunk lifecycle hooks — call from the telephony-config CRUD handlers.

Three integration points in ``api/routes/organization.py`` (or wherever
``TelephonyConfigurationModel`` rows are written):

1. After ``create_telephony_configuration`` succeeds, call
   ``provision_sip_trunk(row)`` if ``row.provider == 'sip_trunk'``.
2. After ``update_telephony_configuration`` succeeds, call the same.
3. Before ``delete_telephony_configuration``, call
   ``decommission_sip_trunk(row)``.

Each call is fire-and-forget at the API layer — the worker pool returns
immediately and the UI polls for the registration status. Keep the API
handler latency-budget tight.
"""

from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING, Optional

from loguru import logger

from api.services.telephony.pjsip_sync import (
    PjsipSyncWorker,
    SipTrunkCreds,
    endpoint_name_for,
)

if TYPE_CHECKING:
    from api.db.models import TelephonyConfigurationModel


# Singleton — initialized on API startup. Bind via ``set_worker``.
_worker: Optional[PjsipSyncWorker] = None


def set_worker(worker: PjsipSyncWorker) -> None:
    global _worker
    _worker = worker


def get_worker() -> Optional[PjsipSyncWorker]:
    return _worker


def _creds_from_row(row: "TelephonyConfigurationModel") -> SipTrunkCreds:
    c = row.credentials or {}
    return SipTrunkCreds(
        endpoint_name=endpoint_name_for(row.organization_id, row.id),
        sip_server=c["sip_server"],
        auth_mode=c.get("auth_mode", "userpass"),
        sip_username=c.get("sip_username"),
        sip_password=c.get("sip_password"),
        caller_id=c["caller_id"],
        transport=c.get("transport", "udp"),
        organization_id=row.organization_id,
        config_id=row.id,
        max_concurrent_calls=getattr(row, "max_concurrent_calls", 10) or 10,
    )


async def provision_sip_trunk(row: "TelephonyConfigurationModel") -> None:
    """Push a tenant's SIP trunk into Asterisk realtime."""
    if row.provider != "sip_trunk":
        return
    w = _worker
    if w is None:
        logger.warning(
            "PjsipSyncWorker not initialised — sip_trunk row %s skipped. "
            "Did app startup call set_worker()?",
            row.id,
        )
        return
    try:
        await w.upsert_trunk(_creds_from_row(row))
    except Exception:
        logger.exception(f"failed to provision sip_trunk {row.id}")


async def decommission_sip_trunk(row: "TelephonyConfigurationModel") -> None:
    if row.provider != "sip_trunk":
        return
    w = _worker
    if w is None:
        logger.warning(
            "PjsipSyncWorker not initialised — sip_trunk row %s delete skipped.",
            row.id,
        )
        return
    try:
        await w.delete_trunk(row.organization_id, row.id)
    except Exception:
        logger.exception(f"failed to decommission sip_trunk {row.id}")
