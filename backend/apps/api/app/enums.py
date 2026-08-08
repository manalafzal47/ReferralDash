from enum import StrEnum


class CampaignStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"


class CandidateStatus(StrEnum):
    DISCOVERED = "discovered"
    RESEARCHED = "researched"
    MESSAGE_GENERATED = "message_generated"
    APPROVED = "approved"
    CONTACTED = "contacted"
    REPLIED = "replied"
    FOLLOW_UP_NEEDED = "follow_up_needed"
    REFERRAL_RECEIVED = "referral_received"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    CLOSED = "closed"


class MessageStatus(StrEnum):
    DRAFT = "draft"
    APPROVED = "approved"
    SENT = "sent"
    ARCHIVED = "archived"


class MessageChannel(StrEnum):
    LINKEDIN = "linkedin"
    EMAIL = "email"


class MessageType(StrEnum):
    INITIAL = "initial"
    FOLLOW_UP = "follow_up"
    FINAL_FOLLOW_UP = "final_follow_up"


class OutreachEventType(StrEnum):
    MESSAGE_COPIED = "message_copied"
    PROFILE_OPENED = "profile_opened"
    MESSAGE_SENT = "message_sent"
    RESPONSE_RECEIVED = "response_received"
    OUTCOME_UPDATED = "outcome_updated"
