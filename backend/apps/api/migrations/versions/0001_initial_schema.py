"""Create the initial outreach schema.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-08-08
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy import JSON, Uuid

revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    uuid = Uuid(as_uuid=True)
    jsonb = JSON()
    string_array = JSON()

    op.create_table(
        "users",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255)),
        sa.Column("university", sa.String(255)),
        sa.Column("location", sa.String(255)),
        sa.Column("target_roles", string_array),
    )
    op.create_table(
        "companies",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False, unique=True),
        sa.Column("website_url", sa.String(500)),
        sa.Column("domain", sa.String(255)),
    )
    op.create_table(
        "candidates",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("current_company", sa.String(255)),
        sa.Column("current_role", sa.String(255)),
        sa.Column("location", sa.String(255)),
        sa.Column("linkedin_url", sa.String(500)),
        sa.Column("github_url", sa.String(500)),
        sa.Column("personal_site_url", sa.String(500)),
        sa.Column("email", sa.String(255)),
    )
    op.create_table(
        "campaigns",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("user_id", uuid, sa.ForeignKey("users.id")),
        sa.Column("company_id", uuid, sa.ForeignKey("companies.id"), nullable=False),
        sa.Column("target_role", sa.String(255), nullable=False),
        sa.Column("job_posting_url", sa.String(500)),
        sa.Column("location", sa.String(255)),
        sa.Column("seniority", sa.String(100)),
        sa.Column("contact_goal", sa.Integer, nullable=False),
        sa.Column("preferred_background", sa.Text),
        sa.Column("keywords", string_array),
        sa.Column("notes", sa.Text),
        sa.Column("status", sa.String(50), nullable=False, server_default="active"),
    )
    op.create_table(
        "campaign_candidates",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("campaign_id", uuid, sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("candidate_id", uuid, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="discovered"),
        sa.UniqueConstraint("campaign_id", "candidate_id"),
    )
    op.create_table(
        "candidate_sources",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("candidate_id", uuid, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("source_type", sa.String(100), nullable=False),
        sa.Column("source_url", sa.String(500)),
        sa.Column("raw_data", jsonb),
    )
    op.create_table(
        "candidate_facts",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("candidate_id", uuid, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("fact_type", sa.String(100), nullable=False),
        sa.Column("fact_value", sa.Text, nullable=False),
        sa.Column("source_url", sa.String(500), nullable=False),
        sa.Column("confidence", sa.Numeric(3, 2), nullable=False),
        sa.Column("extracted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "candidate_scores",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("campaign_id", uuid, sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("candidate_id", uuid, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("match_score", sa.Integer, nullable=False),
        sa.Column("score_breakdown", jsonb, nullable=False),
        sa.Column("reasoning", sa.Text, nullable=False),
        sa.Column("outreach_angle", sa.Text),
    )
    op.create_table(
        "messages",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("campaign_id", uuid, sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("candidate_id", uuid, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("message_type", sa.String(50), nullable=False, server_default="initial"),
        sa.Column("channel", sa.String(50), nullable=False, server_default="linkedin"),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="draft"),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
    )
    op.create_table(
        "outreach_events",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("campaign_id", uuid, sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("candidate_id", uuid, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("message_id", uuid, sa.ForeignKey("messages.id")),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("platform", sa.String(100)),
        sa.Column("notes", sa.Text),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "followups",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("campaign_id", uuid, sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("candidate_id", uuid, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("previous_message_id", uuid, sa.ForeignKey("messages.id")),
        sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("generated_message_id", uuid, sa.ForeignKey("messages.id")),
    )
    op.create_table(
        "responses",
        sa.Column("id", uuid, primary_key=True),
        sa.Column("campaign_id", uuid, sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("candidate_id", uuid, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("response_text", sa.Text),
        sa.Column("sentiment", sa.String(50)),
        sa.Column("outcome", sa.String(100)),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("responses")
    op.drop_table("followups")
    op.drop_table("outreach_events")
    op.drop_table("messages")
    op.drop_table("candidate_scores")
    op.drop_table("candidate_facts")
    op.drop_table("candidate_sources")
    op.drop_table("campaign_candidates")
    op.drop_table("campaigns")
    op.drop_table("candidates")
    op.drop_table("companies")
    op.drop_table("users")
