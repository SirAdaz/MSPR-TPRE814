"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-04-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "exploitations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("country", sa.String(length=2), nullable=False),
    )
    op.create_table(
        "warehouses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("exploitation_id", sa.Integer(), sa.ForeignKey("exploitations.id"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("ideal_temp", sa.Float(), nullable=False),
        sa.Column("ideal_humidity", sa.Float(), nullable=False),
        sa.Column("temp_tolerance", sa.Float(), nullable=False, server_default="3"),
        sa.Column("humidity_tolerance", sa.Float(), nullable=False, server_default="2"),
    )
    op.create_table(
        "lots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("lot_uid", sa.String(length=255), nullable=False, unique=True),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False),
        sa.Column("storage_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="conforme"),
    )
    op.create_table(
        "sensor_readings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("humidity", sa.Float(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False),
        sa.Column("lot_id", sa.Integer(), sa.ForeignKey("lots.id"), nullable=True),
        sa.Column("alert_type", sa.String(length=64), nullable=False),
        sa.Column("message", sa.String(length=1024), nullable=False),
        sa.Column("email_sent", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("alerts")
    op.drop_table("sensor_readings")
    op.drop_table("lots")
    op.drop_table("warehouses")
    op.drop_table("exploitations")
