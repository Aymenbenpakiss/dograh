"""TrunkVerifierWorker — polls Asterisk-side ps_aors/ps_registrations to update
``telephony_configurations.registration_status``.

When a tenant saves a SIP-trunk config, the API handler:
  1. Writes the row in the Dograh DB (provider='sip_trunk').
  2. Calls ``PjsipSyncWorker.upsert_trunk`` to push it to Asterisk's ps_* tables.
  3. Returns immediately with ``registration_status='registering'``.

This worker watches the Asterisk-side ps_registrations and the contact
status table (Asterisk auto-populates ``ps_contacts`` on register) and
mirrors the result back to the Dograh row so the UI can render
✅ Registered / ❌ Auth failed / ❌ Unreachable / ❌ Forbidden.

A cleaner long-term mechanism is the ARI WebSocket event stream
(``EndpointStateChange``, ``ContactStatusChange``) — this worker does a
~1s poll while we ship MVP. Switching to event-driven is a drop-in
replacement of the ``_loop`` method.
"""

from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from typing import Optional

import asyncpg
from loguru import logger

POLL_INTERVAL = float(os.environ.get("TRUNK_VERIFIER_INTERVAL_S", "1.0"))


class TrunkVerifierWorker:
    """Polls Asterisk realtime and mirrors registration status into Dograh."""

    def __init__(
        self,
        asterisk_dsn: Optional[str] = None,
        dograh_dsn: Optional[str] = None,
    ):
        self.asterisk_dsn = asterisk_dsn or os.environ.get("ASTERISK_REALTIME_DSN")
        raw_dograh = dograh_dsn or os.environ.get("DATABASE_URL")
        # SQLAlchemy uses postgresql+asyncpg:// — asyncpg itself wants postgresql://
        if raw_dograh and raw_dograh.startswith("postgresql+asyncpg://"):
            raw_dograh = "postgresql://" + raw_dograh[len("postgresql+asyncpg://"):]
        self.dograh_dsn = raw_dograh
        if not (self.asterisk_dsn and self.dograh_dsn):
            raise RuntimeError(
                "TrunkVerifierWorker requires ASTERISK_REALTIME_DSN and DATABASE_URL."
            )
        self._stop = asyncio.Event()
        self._asterisk_pool: Optional[asyncpg.Pool] = None
        self._dograh_pool: Optional[asyncpg.Pool] = None
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        self._asterisk_pool = await asyncpg.create_pool(self.asterisk_dsn, min_size=1, max_size=2)
        self._dograh_pool = await asyncpg.create_pool(self.dograh_dsn, min_size=1, max_size=2)
        self._task = asyncio.create_task(self._loop())
        logger.info("TrunkVerifierWorker started")

    async def stop(self):
        self._stop.set()
        if self._task:
            await self._task
        if self._asterisk_pool:
            await self._asterisk_pool.close()
        if self._dograh_pool:
            await self._dograh_pool.close()

    async def _loop(self):
        while not self._stop.is_set():
            try:
                await self._poll_once()
            except Exception as exc:  # noqa: BLE001
                logger.exception(f"trunk verifier poll failed: {exc}")
            try:
                await asyncio.wait_for(self._stop.wait(), timeout=POLL_INTERVAL)
            except asyncio.TimeoutError:
                pass

    async def _poll_once(self):
        """Read every ps_registration's outcome and propagate to Dograh."""
        assert self._asterisk_pool and self._dograh_pool

        async with self._asterisk_pool.acquire() as a:
            # ps_contacts has a `status` column (Reachable/Unreachable/Unknown).
            # ps_registrations doesn't track outcome — we infer:
            #   * Contact present + Reachable → 'registered'
            #   * Contact present + Unreachable → 'unreachable'
            #   * No contact, recent attempt → 'auth_failed' or 'registering'
            rows = await a.fetch(
                """
                SELECT t.endpoint_name, t.organization_id, t.config_id,
                       c.status AS contact_status
                FROM tenant_trunks t
                LEFT JOIN ps_contacts c
                  ON c.aor = t.endpoint_name
                """
            )

        now = datetime.now(timezone.utc)
        async with self._dograh_pool.acquire() as d:
            for r in rows:
                status = self._map_status(r["contact_status"])
                await d.execute(
                    """
                    UPDATE telephony_configurations
                       SET registration_status = $1,
                           registration_status_updated_at = $2
                     WHERE id = $3
                       AND organization_id = $4
                       AND (registration_status IS DISTINCT FROM $1)
                    """,
                    status,
                    now,
                    r["config_id"],
                    r["organization_id"],
                )

    @staticmethod
    def _map_status(contact_status: Optional[str]) -> str:
        if contact_status is None:
            return "registering"
        s = contact_status.lower()
        if s == "reachable":
            return "registered"
        if s == "unreachable":
            return "unreachable"
        return "registering"
