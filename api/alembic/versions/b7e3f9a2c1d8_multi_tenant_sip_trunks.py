"""multi tenant sip trunks

Adds the column extensions to telephony_configurations needed by the
multi-tenant SIP trunk provider, plus the bookkeeping ``tenant_trunks``
table on the Dograh side.

Revision ID: b7e3f9a2c1d8
Revises: 6499c608d0f6
Create Date: 2026-05-17 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b7e3f9a2c1d8"
down_revision: Union[str, None] = "6499c608d0f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ---- telephony_configurations extensions ----
    op.add_column(
        "telephony_configurations",
        sa.Column(
            "tier",
            sa.String(16),
            nullable=False,
            server_default=sa.text("'shared'"),
        ),
    )
    op.add_column(
        "telephony_configurations",
        sa.Column("endpoint_name", sa.String(40), nullable=True),
    )
    op.add_column(
        "telephony_configurations",
        sa.Column(
            "registration_status",
            sa.String(20),
            nullable=False,
            server_default=sa.text("'unknown'"),
        ),
    )
    op.add_column(
        "telephony_configurations",
        sa.Column(
            "registration_status_updated_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.add_column(
        "telephony_configurations",
        sa.Column("registration_last_error", sa.Text(), nullable=True),
    )
    op.add_column(
        "telephony_configurations",
        sa.Column(
            "max_concurrent_calls",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("10"),
        ),
    )

    # Unique per-org endpoint name.
    op.create_index(
        "uq_telephony_configurations_endpoint",
        "telephony_configurations",
        ["endpoint_name"],
        unique=True,
        postgresql_where=sa.text("endpoint_name IS NOT NULL"),
    )

    # ---- tenant_trunks bookkeeping ----
    # Mirrors what PjsipSyncWorker has pushed into the Asterisk-side
    # Postgres (ps_* tables). Used by the dispatcher to enforce
    # max_concurrent_calls and by the UI for status surface.
    op.create_table(
        "tenant_trunks",
        sa.Column("endpoint_name", sa.String(40), primary_key=True),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("config_id", sa.Integer(), nullable=False),
        sa.Column(
            "tier",
            sa.String(16),
            nullable=False,
            server_default=sa.text("'shared'"),
        ),
        sa.Column(
            "registration_status",
            sa.String(20),
            nullable=False,
            server_default=sa.text("'unknown'"),
        ),
        sa.Column("registration_updated_at", sa.DateTime(timezone=True)),
        sa.Column("registration_last_error", sa.Text()),
        sa.Column(
            "max_concurrent_calls",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("10"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["config_id"],
            ["telephony_configurations.id"],
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "ix_tenant_trunks_org", "tenant_trunks", ["organization_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_tenant_trunks_org", table_name="tenant_trunks")
    op.drop_table("tenant_trunks")
    op.drop_index(
        "uq_telephony_configurations_endpoint",
        table_name="telephony_configurations",
    )
    op.drop_column("telephony_configurations", "max_concurrent_calls")
    op.drop_column("telephony_configurations", "registration_last_error")
    op.drop_column("telephony_configurations", "registration_status_updated_at")
    op.drop_column("telephony_configurations", "registration_status")
    op.drop_column("telephony_configurations", "endpoint_name")
    op.drop_column("telephony_configurations", "tier")
