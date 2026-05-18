"""PjsipSyncWorker — pushes per-tenant SIP credentials into Asterisk's PJSIP realtime tables.

Dograh stores tenant SIP credentials in its own Postgres
(``telephony_configurations`` rows with ``provider='sip_trunk'``). The
shared Asterisk box on Hetzner reads PJSIP endpoints/auths/aors/registrations/
identifies from a SEPARATE Postgres (the ``ps_*`` tables we created on Azetax)
via res_config_odbc + res_sorcery_realtime.

This worker is the bridge: when a tenant saves or deletes a SIP-trunk
config in Dograh, it upserts (or deletes) the corresponding five rows in
the Asterisk-side Postgres.

Configuration (Railway env vars):

  ASTERISK_REALTIME_DSN   asyncpg DSN to the Asterisk-side Postgres
                          e.g. ``postgresql://asterisk:***@178.105.117.51:5432/asterisk``
  ASTERISK_TRUNK_CONTEXT  dialplan context name on the Asterisk box
                          (default: ``from-tenant``)
  ASTERISK_TRANSPORT_NAME PJSIP transport_id (default: ``transport-udp``)

The worker runs as a long-lived async task spawned at API startup. It
listens on Postgres LISTEN channel ``telephony_config_changed`` (the
config CRUD handlers fire NOTIFY on that channel after every commit).
"""

from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import asyncpg
from loguru import logger

DEFAULT_CONTEXT = os.environ.get("ASTERISK_TRUNK_CONTEXT", "from-tenant")
DEFAULT_TRANSPORT = os.environ.get("ASTERISK_TRANSPORT_NAME", "transport-udp")
NOTIFY_CHANNEL = "telephony_config_changed"


def endpoint_name_for(organization_id: int, config_id: int) -> str:
    """Canonical PJSIP endpoint name. Used everywhere a tenant trunk is referenced."""
    return f"tenant_{organization_id}_{config_id}"


@dataclass(frozen=True)
class SipTrunkCreds:
    """Tenant SIP credentials as needed by the realtime upsert.

    ``auth_mode``:
      - ``userpass``: write all 5 ps_* rows including ps_auths + ps_registrations
      - ``ip_whitelist``: skip ps_auths and ps_registrations; the trunk is
        identified by source IP only and INVITEs go out unauthenticated.
    """

    endpoint_name: str
    sip_server: str
    caller_id: str
    auth_mode: str = "userpass"
    sip_username: Optional[str] = None
    sip_password: Optional[str] = None
    transport: str = "udp"
    organization_id: int = 0
    config_id: int = 0
    max_concurrent_calls: int = 10


class PjsipSyncWorker:
    """Long-lived async worker that mirrors tenant SIP rows into Asterisk realtime."""

    def __init__(self, asterisk_dsn: Optional[str] = None):
        self.dsn = asterisk_dsn or os.environ.get("ASTERISK_REALTIME_DSN")
        if not self.dsn:
            raise RuntimeError(
                "PjsipSyncWorker requires ASTERISK_REALTIME_DSN env var "
                "(asyncpg URL of the Asterisk-side Postgres)."
            )
        self._stop = asyncio.Event()
        self._pool: Optional[asyncpg.Pool] = None

    # ---- lifecycle -------------------------------------------------

    async def start(self):
        self._pool = await asyncpg.create_pool(self.dsn, min_size=1, max_size=4)
        logger.info("PjsipSyncWorker started — connected to Asterisk DB")

    async def stop(self):
        self._stop.set()
        if self._pool:
            await self._pool.close()

    # ---- public API ------------------------------------------------

    async def upsert_trunk(self, creds: SipTrunkCreds) -> None:
        """Idempotent — safe to call on every save, including unchanged saves."""
        assert self._pool is not None, "call .start() first"
        async with self._pool.acquire() as c:
            await self._do_upsert(c, creds)

    async def delete_trunk(self, organization_id: int, config_id: int) -> None:
        endpoint = endpoint_name_for(organization_id, config_id)
        assert self._pool is not None, "call .start() first"
        async with self._pool.acquire() as c:
            await self._do_delete(c, endpoint)

    # ---- writes ----------------------------------------------------

    async def _do_upsert(self, c: asyncpg.Connection, creds: SipTrunkCreds) -> None:
        ep = creds.endpoint_name
        auth = f"{ep}-auth"
        reg = f"{ep}-reg"
        ident = f"{ep}-id"
        sip_host = creds.sip_server
        if ":" not in sip_host:
            sip_host = f"{sip_host}:5060"
        sip_host_no_port = sip_host.split(":", 1)[0]

        # IP-whitelist mode: no auth, no REGISTER, identify by source IP only.
        # Endpoint columns auth/outbound_auth must be empty string (PJSIP treats
        # NULL the same in realtime, but empty string is what Asterisk writes).
        is_ip_whitelist = creds.auth_mode == "ip_whitelist"
        endpoint_auth = "" if is_ip_whitelist else auth
        identify_by = "ip" if is_ip_whitelist else "ip,username"

        async with c.transaction():
            await c.execute(
                """
                INSERT INTO ps_aors (id, contact, qualify_frequency, max_contacts)
                VALUES ($1, $2, 60, 1)
                ON CONFLICT (id) DO UPDATE
                SET contact = EXCLUDED.contact, qualify_frequency = 60, max_contacts = 1
                """,
                ep,
                f"sip:{sip_host}",
            )
            if is_ip_whitelist:
                # Make sure any stale auth/registration rows from a prior
                # userpass save get cleared when the trunk is reconfigured.
                await c.execute("DELETE FROM ps_auths WHERE id = $1", auth)
                await c.execute("DELETE FROM ps_registrations WHERE id = $1", reg)
            else:
                await c.execute(
                    """
                    INSERT INTO ps_auths (id, auth_type, username, password)
                    VALUES ($1, 'userpass', $2, $3)
                    ON CONFLICT (id) DO UPDATE
                    SET username = EXCLUDED.username, password = EXCLUDED.password
                    """,
                    auth,
                    creds.sip_username,
                    creds.sip_password,
                )
            await c.execute(
                """
                INSERT INTO ps_endpoints (
                    id, transport, aors, auth, outbound_auth, context,
                    disallow, allow, direct_media, rtp_symmetric, force_rport, rewrite_contact,
                    trust_id_inbound, send_pai, send_rpid, dtmf_mode, language,
                    from_user, from_domain, identify_by
                ) VALUES (
                    $1, $2, $1, $3, $3, $4,
                    'all', 'alaw,ulaw', 'no', 'yes', 'yes', 'yes',
                    'yes', 'yes', 'yes', 'rfc4733', 'en',
                    $5, $6, $7
                )
                ON CONFLICT (id) DO UPDATE SET
                    transport = EXCLUDED.transport,
                    aors = EXCLUDED.aors,
                    auth = EXCLUDED.auth,
                    outbound_auth = EXCLUDED.outbound_auth,
                    context = EXCLUDED.context,
                    from_user = EXCLUDED.from_user,
                    from_domain = EXCLUDED.from_domain,
                    identify_by = EXCLUDED.identify_by
                """,
                ep,
                DEFAULT_TRANSPORT,
                endpoint_auth,
                DEFAULT_CONTEXT,
                creds.caller_id,
                sip_host_no_port,
                identify_by,
            )
            if not is_ip_whitelist:
                await c.execute(
                    """
                    INSERT INTO ps_registrations (
                        id, transport, outbound_auth, server_uri, client_uri,
                        retry_interval, forbidden_retry_interval, expiration
                    ) VALUES ($1, $2, $3, $4, $5, 60, 600, 3600)
                    ON CONFLICT (id) DO UPDATE SET
                        server_uri = EXCLUDED.server_uri,
                        client_uri = EXCLUDED.client_uri,
                        outbound_auth = EXCLUDED.outbound_auth
                    """,
                    reg,
                    DEFAULT_TRANSPORT,
                    auth,
                    f"sip:{sip_host}",
                    f"sip:{creds.sip_username}@{sip_host_no_port}",
                )
            await c.execute(
                """
                INSERT INTO ps_identifies (id, endpoint, match_)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO UPDATE SET match_ = EXCLUDED.match_
                """,
                ident,
                ep,
                sip_host_no_port,
            )
            await c.execute(
                """
                INSERT INTO tenant_trunks (
                    endpoint_name, organization_id, config_id, max_concurrent_calls
                ) VALUES ($1, $2, $3, $4)
                ON CONFLICT (endpoint_name) DO UPDATE SET
                    max_concurrent_calls = EXCLUDED.max_concurrent_calls,
                    updated_at = now()
                """,
                ep,
                creds.organization_id,
                creds.config_id,
                creds.max_concurrent_calls,
            )
        logger.info(f"PjsipSync: upserted trunk {ep} → Asterisk realtime")

    async def _do_delete(self, c: asyncpg.Connection, ep: str) -> None:
        async with c.transaction():
            await c.execute("DELETE FROM ps_registrations WHERE id = $1", f"{ep}-reg")
            await c.execute("DELETE FROM ps_identifies    WHERE id = $1", f"{ep}-id")
            await c.execute("DELETE FROM ps_endpoints     WHERE id = $1", ep)
            await c.execute("DELETE FROM ps_auths         WHERE id = $1", f"{ep}-auth")
            await c.execute("DELETE FROM ps_aors          WHERE id = $1", ep)
            await c.execute("DELETE FROM tenant_trunks    WHERE endpoint_name = $1", ep)
        logger.info(f"PjsipSync: deleted trunk {ep} from Asterisk realtime")
