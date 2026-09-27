import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from app.db import Base
from app.enums import CampaignStatus, CandidateStatus, MessageChannel, MessageStatus, MessageType


def uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid_pk()
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255))
    university: Mapped[str | None] = mapped_column(String(255))
    location: Mapped[str | None] = mapped_column(String(255))
    target_roles: Mapped[list[str] | None] = mapped_column(JSON)

    campaigns: Mapped[list["Campaign"]] = orm_relationship(back_populates="user")
    connections: Mapped[list["UserConnection"]] = orm_relationship(back_populates="user")


class UserConnection(Base, TimestampMixin):
    __tablename__ = "user_connections"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str | None] = mapped_column(String(255))
    relationship: Mapped[str | None] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(255))
    linkedin_url: Mapped[str | None] = mapped_column(String(500))
    source: Mapped[str] = mapped_column(String(100), default="linkedin", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    user: Mapped[User] = orm_relationship(back_populates="connections")


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    website_url: Mapped[str | None] = mapped_column(String(500))
    domain: Mapped[str | None] = mapped_column(String(255))

    campaigns: Mapped[list["Campaign"]] = orm_relationship(back_populates="company")


class Campaign(Base, TimestampMixin):
    __tablename__ = "campaigns"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    company_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("companies.id"))
    target_role: Mapped[str] = mapped_column(String(255), nullable=False)
    job_posting_url: Mapped[str | None] = mapped_column(String(500))
    location: Mapped[str | None] = mapped_column(String(255))
    seniority: Mapped[str | None] = mapped_column(String(100))
    contact_goal: Mapped[int] = mapped_column(Integer, nullable=False)
    preferred_background: Mapped[str | None] = mapped_column(Text)
    keywords: Mapped[list[str] | None] = mapped_column(JSON)
    notes: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default=CampaignStatus.ACTIVE, nullable=False)

    user: Mapped[User | None] = orm_relationship(back_populates="campaigns")
    company: Mapped[Company] = orm_relationship(back_populates="campaigns")
    candidates: Mapped[list["CampaignCandidate"]] = orm_relationship(back_populates="campaign")


class Candidate(Base, TimestampMixin):
    __tablename__ = "candidates"

    id: Mapped[uuid.UUID] = uuid_pk()
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    current_company: Mapped[str | None] = mapped_column(String(255))
    current_role: Mapped[str | None] = mapped_column(String(255))
    location: Mapped[str | None] = mapped_column(String(255))
    linkedin_url: Mapped[str | None] = mapped_column(String(500))
    github_url: Mapped[str | None] = mapped_column(String(500))
    personal_site_url: Mapped[str | None] = mapped_column(String(500))
    email: Mapped[str | None] = mapped_column(String(255))

    campaigns: Mapped[list["CampaignCandidate"]] = orm_relationship(back_populates="candidate")
    facts: Mapped[list["CandidateFact"]] = orm_relationship(back_populates="candidate")
    scores: Mapped[list["CandidateScore"]] = orm_relationship(back_populates="candidate")
    messages: Mapped[list["Message"]] = orm_relationship(back_populates="candidate")


class CampaignCandidate(Base, TimestampMixin):
    __tablename__ = "campaign_candidates"
    __table_args__ = (UniqueConstraint("campaign_id", "candidate_id"),)

    id: Mapped[uuid.UUID] = uuid_pk()
    campaign_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("campaigns.id"))
    candidate_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("candidates.id"))
    status: Mapped[str] = mapped_column(
        String(50), default=CandidateStatus.DISCOVERED, nullable=False
    )

    campaign: Mapped[Campaign] = orm_relationship(back_populates="candidates")
    candidate: Mapped[Candidate] = orm_relationship(back_populates="campaigns")


class CandidateSource(Base, TimestampMixin):
    __tablename__ = "candidate_sources"

    id: Mapped[uuid.UUID] = uuid_pk()
    candidate_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("candidates.id"))
    source_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(500))
    raw_data: Mapped[dict | None] = mapped_column(JSON)


class CandidateFact(Base):
    __tablename__ = "candidate_facts"

    id: Mapped[uuid.UUID] = uuid_pk()
    candidate_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("candidates.id"))
    fact_type: Mapped[str] = mapped_column(String(100), nullable=False)
    fact_value: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False)
    extracted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    candidate: Mapped[Candidate] = orm_relationship(back_populates="facts")


class CandidateScore(Base, TimestampMixin):
    __tablename__ = "candidate_scores"

    id: Mapped[uuid.UUID] = uuid_pk()
    campaign_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("campaigns.id"))
    candidate_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("candidates.id"))
    match_score: Mapped[int] = mapped_column(Integer, nullable=False)
    score_breakdown: Mapped[dict] = mapped_column(JSON, nullable=False)
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    outreach_angle: Mapped[str | None] = mapped_column(Text)

    candidate: Mapped[Candidate] = orm_relationship(back_populates="scores")


class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = uuid_pk()
    campaign_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("campaigns.id"))
    candidate_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("candidates.id"))
    message_type: Mapped[str] = mapped_column(String(50), default=MessageType.INITIAL, nullable=False)
    channel: Mapped[str] = mapped_column(String(50), default=MessageChannel.LINKEDIN, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=MessageStatus.DRAFT, nullable=False)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    candidate: Mapped[Candidate] = orm_relationship(back_populates="messages")


class OutreachEvent(Base, TimestampMixin):
    __tablename__ = "outreach_events"

    id: Mapped[uuid.UUID] = uuid_pk()
    campaign_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("campaigns.id"))
    candidate_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("candidates.id"))
    message_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("messages.id"))
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    platform: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Followup(Base, TimestampMixin):
    __tablename__ = "followups"

    id: Mapped[uuid.UUID] = uuid_pk()
    campaign_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("campaigns.id"))
    candidate_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("candidates.id"))
    previous_message_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("messages.id")
    )
    scheduled_for: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    generated_message_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("messages.id")
    )


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[uuid.UUID] = uuid_pk()
    campaign_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("campaigns.id"))
    candidate_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("candidates.id"))
    response_text: Mapped[str | None] = mapped_column(Text)
    sentiment: Mapped[str | None] = mapped_column(String(50))
    outcome: Mapped[str | None] = mapped_column(String(100))
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
