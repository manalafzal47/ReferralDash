import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.enums import CandidateStatus, MessageChannel, MessageStatus, MessageType


class CompanyOut(BaseModel):
    id: uuid.UUID
    name: str
    website_url: str | None = None
    domain: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CampaignCreate(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    target_role: str = Field(min_length=1, max_length=255)
    job_posting_url: HttpUrl | None = None
    location: str | None = None
    seniority: str | None = None
    contact_goal: int = Field(ge=1, le=500)
    preferred_background: str | None = None
    keywords: list[str] = Field(default_factory=list)
    notes: str | None = None


class CampaignOut(BaseModel):
    id: uuid.UUID
    company: CompanyOut
    target_role: str
    job_posting_url: str | None = None
    location: str | None = None
    seniority: str | None = None
    contact_goal: int
    preferred_background: str | None = None
    keywords: list[str] | None = None
    notes: str | None = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateFactCreate(BaseModel):
    fact_type: str = Field(min_length=1, max_length=100)
    fact_value: str = Field(min_length=1)
    source_url: HttpUrl
    confidence: float = Field(ge=0, le=1)


class CandidateCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    current_company: str | None = None
    current_role: str | None = None
    location: str | None = None
    linkedin_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    personal_site_url: HttpUrl | None = None
    email: str | None = None
    facts: list[CandidateFactCreate] = Field(default_factory=list)


class CandidateFactOut(BaseModel):
    id: uuid.UUID
    fact_type: str
    fact_value: str
    source_url: str
    confidence: float
    extracted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateOut(BaseModel):
    id: uuid.UUID
    full_name: str
    current_company: str | None = None
    current_role: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    personal_site_url: str | None = None
    email: str | None = None
    status: CandidateStatus | None = None
    facts: list[CandidateFactOut] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DiscoveryOut(BaseModel):
    campaign_id: uuid.UUID
    source: str
    candidates: list[CandidateOut]


class CandidateScoreOut(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    candidate_id: uuid.UUID
    match_score: int
    score_breakdown: dict
    reasoning: str
    outreach_angle: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageGenerateRequest(BaseModel):
    channel: MessageChannel = MessageChannel.LINKEDIN
    message_type: MessageType = MessageType.INITIAL


class MessageOut(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    candidate_id: uuid.UUID
    message_type: MessageType
    channel: MessageChannel
    body: str
    status: MessageStatus
    approved_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MarkSentRequest(BaseModel):
    platform: str = "linkedin"
    notes: str | None = None


class AnalyticsOut(BaseModel):
    campaign_id: uuid.UUID
    contacts: int
    contacted: int
    replies: int
    referral_conversations: int
    referrals: int
    interviews: int
    response_rate: float
    referral_rate: float
