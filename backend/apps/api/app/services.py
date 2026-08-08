import uuid
from datetime import UTC, datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app import models
from app.config import get_settings
from app.enums import CandidateStatus, MessageStatus, OutreachEventType
from app.schemas import CampaignCreate, CandidateCreate, MessageGenerateRequest


EXECUTIVE_TERMS = ("vp", "vice president", "director", "head of", "cto", "chief", "founder")

GITHUB_ORGANIZATIONS = {
    "rbc": "rbc",
    "shopify": "shopify",
    "td bank": "td-bank",
    "nvidia": "nvidia",
}

def create_campaign(db: Session, payload: CampaignCreate) -> models.Campaign:
    company = db.scalar(select(models.Company).where(models.Company.name == payload.company_name))
    if company is None:
        company = models.Company(name=payload.company_name)
        db.add(company)
        db.flush()

    campaign = models.Campaign(
        company_id=company.id,
        target_role=payload.target_role,
        job_posting_url=str(payload.job_posting_url) if payload.job_posting_url else None,
        location=payload.location,
        seniority=payload.seniority,
        contact_goal=payload.contact_goal,
        preferred_background=payload.preferred_background,
        keywords=payload.keywords,
        notes=payload.notes,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


def list_campaigns(db: Session) -> list[models.Campaign]:
    return list(
        db.scalars(
            select(models.Campaign)
            .options(selectinload(models.Campaign.company))
            .order_by(models.Campaign.created_at.desc())
        ).all()
    )


def discover_candidates(db: Session, campaign_id: uuid.UUID) -> dict:
    campaign = get_campaign(db, campaign_id)
    settings = get_settings()
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "referral-os-local/0.1",
    }
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    query = f'company:"{campaign.company.name}"'
    if campaign.location:
        query += f' location:"{campaign.location}"'

    try:
        search_items = github_json(
            "https://api.github.com/search/users",
            {"q": query, "per_page": settings.github_search_limit},
            headers,
        ).get("items", [])
    except HTTPError as error:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"GitHub discovery failed with status {error.code}",
        ) from error
    except URLError as error:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "GitHub discovery is unavailable") from error

    source_type = "github_public_profile"
    if not search_items:
        organization = GITHUB_ORGANIZATIONS.get(campaign.company.name.strip().lower())
        if organization:
            try:
                search_items = github_json(
                    f"https://api.github.com/orgs/{organization}/members",
                    {"per_page": settings.github_search_limit},
                    headers,
                )
                source_type = "github_organization_member"
            except (HTTPError, URLError) as error:
                if isinstance(error, HTTPError):
                    raise HTTPException(
                        status.HTTP_502_BAD_GATEWAY,
                        f"GitHub organization lookup failed with status {error.code}",
                    ) from error
                raise HTTPException(
                    status.HTTP_502_BAD_GATEWAY, "GitHub discovery is unavailable"
                ) from error

    discovered = []

    for item in search_items:
        profile_url = item.get("url")
        if not profile_url:
            continue
        try:
            profile = github_json(profile_url, {}, headers)
        except (HTTPError, URLError):
            continue

        full_name = profile.get("name") or profile.get("login")
        if not full_name:
            continue

        existing = db.scalar(
            select(models.Candidate)
            .join(models.CampaignCandidate)
            .where(
                models.CampaignCandidate.campaign_id == campaign_id,
                models.Candidate.full_name == full_name,
            )
        )
        if existing is not None:
            discovered.append(existing)
            continue

        candidate = models.Candidate(
            full_name=full_name,
            current_company=profile.get("company"),
            location=profile.get("location"),
            github_url=profile.get("html_url"),
            personal_site_url=profile.get("blog") or None,
        )
        db.add(candidate)
        db.flush()
        db.add(
            models.CampaignCandidate(
                campaign_id=campaign_id,
                candidate_id=candidate.id,
                status=CandidateStatus.DISCOVERED,
            )
        )
        db.add(
            models.CandidateSource(
                candidate_id=candidate.id,
                source_type=source_type,
                source_url=profile.get("html_url"),
                raw_data={
                    "login": profile.get("login"),
                    "bio": profile.get("bio"),
                    "company": profile.get("company"),
                    "location": profile.get("location"),
                },
            )
        )
        if profile.get("bio") and profile.get("html_url"):
            db.add(
                models.CandidateFact(
                    candidate_id=candidate.id,
                    fact_type="github_bio",
                    fact_value=profile["bio"],
                    source_url=profile["html_url"],
                    confidence=0.7,
                )
            )
        discovered.append(candidate)

    db.commit()
    return {"campaign_id": campaign_id, "source": source_type, "candidates": discovered}


def github_json(url: str, params: dict[str, object], headers: dict[str, str]) -> dict:
    query_string = urlencode(params)
    request_url = f"{url}?{query_string}" if query_string else url
    request = Request(request_url, headers=headers)
    with urlopen(request, timeout=15) as response:
        import json

        return json.loads(response.read().decode("utf-8"))


def get_campaign(db: Session, campaign_id: uuid.UUID) -> models.Campaign:
    campaign = db.scalar(
        select(models.Campaign)
        .options(selectinload(models.Campaign.company))
        .where(models.Campaign.id == campaign_id)
    )
    if campaign is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Campaign not found")
    return campaign


def add_candidate_to_campaign(
    db: Session, campaign_id: uuid.UUID, payload: CandidateCreate
) -> models.Candidate:
    get_campaign(db, campaign_id)
    candidate = models.Candidate(
        full_name=payload.full_name,
        current_company=payload.current_company,
        current_role=payload.current_role,
        location=payload.location,
        linkedin_url=str(payload.linkedin_url) if payload.linkedin_url else None,
        github_url=str(payload.github_url) if payload.github_url else None,
        personal_site_url=str(payload.personal_site_url) if payload.personal_site_url else None,
        email=payload.email,
    )
    db.add(candidate)
    db.flush()

    for fact in payload.facts:
        db.add(
            models.CandidateFact(
                candidate_id=candidate.id,
                fact_type=fact.fact_type,
                fact_value=fact.fact_value,
                source_url=str(fact.source_url),
                confidence=fact.confidence,
            )
        )

    db.add(
        models.CampaignCandidate(
            campaign_id=campaign_id,
            candidate_id=candidate.id,
            status=CandidateStatus.DISCOVERED,
        )
    )
    db.commit()
    return get_candidate(db, candidate.id)


def get_candidate(db: Session, candidate_id: uuid.UUID) -> models.Candidate:
    candidate = db.scalar(
        select(models.Candidate)
        .options(selectinload(models.Candidate.facts))
        .where(models.Candidate.id == candidate_id)
    )
    if candidate is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidate not found")
    return candidate


def list_campaign_candidates(db: Session, campaign_id: uuid.UUID) -> list[models.Candidate]:
    get_campaign(db, campaign_id)
    rows = db.execute(
        select(models.Candidate, models.CampaignCandidate.status)
        .join(models.CampaignCandidate)
        .options(selectinload(models.Candidate.facts))
        .where(models.CampaignCandidate.campaign_id == campaign_id)
        .order_by(models.Candidate.created_at.desc())
    ).all()
    candidates = []
    for candidate, candidate_status in rows:
        candidate.status = candidate_status
        candidates.append(candidate)
    return candidates


def score_candidate(db: Session, campaign_id: uuid.UUID, candidate_id: uuid.UUID) -> models.CandidateScore:
    campaign = get_campaign(db, campaign_id)
    candidate = get_candidate(db, candidate_id)
    facts = {fact.fact_type.lower(): fact.fact_value.lower() for fact in candidate.facts}

    role_text = f"{candidate.current_role or ''} {' '.join(facts.values())}".lower()
    location_text = f"{candidate.location or ''} {' '.join(facts.values())}".lower()
    company_text = (candidate.current_company or "").lower()

    role = 20 if "software" in role_text or "developer" in role_text else 8
    company = 15 if campaign.company.name.lower() in company_text else 5
    location = 10 if campaign.location and campaign.location.lower() in location_text else 4
    seniority = 15
    if any(term in role_text for term in EXECUTIVE_TERMS):
        seniority = 2
    elif any(term in role_text for term in ("intern", "new grad", "junior", "associate")):
        seniority = 14

    school = 10 if "education" in facts or "university" in facts else 0
    career_path = 10 if "intern" in role_text or "new grad" in role_text else 4
    technical = min(10, sum(2 for kw in campaign.keywords or [] if kw.lower() in role_text))
    student_friendly = 5 if school or career_path >= 10 else 2
    referral = 5 if company >= 15 and seniority >= 10 else 2

    breakdown = {
        "role_similarity": role,
        "company_relevance": company,
        "location": location,
        "seniority": seniority,
        "school_similarity": school,
        "career_path_similarity": career_path,
        "technical_overlap": technical,
        "student_friendliness": student_friendly,
        "referral_usefulness": referral,
    }
    total = min(100, sum(breakdown.values()))
    reasons = []
    if role >= 15:
        reasons.append("works in a software-related role")
    if company >= 15:
        reasons.append(f"is currently associated with {campaign.company.name}")
    if location >= 10:
        reasons.append(f"matches the target location, {campaign.location}")
    if school:
        reasons.append("has education evidence that may support a student connection")
    if seniority <= 5:
        reasons.append("appears too senior for a student referral-first outreach strategy")

    reasoning = "Candidate " + "; ".join(reasons) + "." if reasons else "Candidate has a limited match."
    outreach_angle = build_outreach_angle(candidate, campaign, facts)

    existing = db.scalar(
        select(models.CandidateScore).where(
            models.CandidateScore.campaign_id == campaign_id,
            models.CandidateScore.candidate_id == candidate_id,
        )
    )
    if existing:
        existing.match_score = total
        existing.score_breakdown = breakdown
        existing.reasoning = reasoning
        existing.outreach_angle = outreach_angle
        score = existing
    else:
        score = models.CandidateScore(
            campaign_id=campaign_id,
            candidate_id=candidate_id,
            match_score=total,
            score_breakdown=breakdown,
            reasoning=reasoning,
            outreach_angle=outreach_angle,
        )
        db.add(score)

    db.commit()
    db.refresh(score)
    return score


def build_outreach_angle(
    candidate: models.Candidate, campaign: models.Campaign, facts: dict[str, str]
) -> str:
    education = facts.get("education") or facts.get("university")
    if education:
        return f"Ask about their path from {education.title()} into {campaign.company.name}."
    if candidate.location and campaign.location and candidate.location.lower() == campaign.location.lower():
        return f"Ask about software engineering opportunities in {campaign.location}."
    return f"Ask about their experience working in software roles related to {campaign.company.name}."


def generate_message(
    db: Session, campaign_id: uuid.UUID, candidate_id: uuid.UUID, payload: MessageGenerateRequest
) -> models.Message:
    campaign = get_campaign(db, campaign_id)
    candidate = get_candidate(db, candidate_id)
    score = score_candidate(db, campaign_id, candidate_id)

    first_name = candidate.full_name.split()[0]
    company = campaign.company.name
    role = campaign.target_role
    location_phrase = f" in {campaign.location}" if campaign.location else ""

    evidence_phrase = score.outreach_angle or f"learn more about software engineering at {company}"
    body = (
        f"Hi {first_name},\n\n"
        f"I'm exploring {role} opportunities at {company}{location_phrase}. "
        f"I came across your background and wanted to ask if you would be open to sharing "
        f"your experience or any advice for students applying there.\n\n"
        f"{evidence_phrase}\n\n"
        "Thanks!"
    )

    message = models.Message(
        campaign_id=campaign_id,
        candidate_id=candidate_id,
        message_type=payload.message_type,
        channel=payload.channel,
        body=body,
    )
    db.add(message)
    link = db.scalar(
        select(models.CampaignCandidate).where(
            models.CampaignCandidate.campaign_id == campaign_id,
            models.CampaignCandidate.candidate_id == candidate_id,
        )
    )
    if link:
        link.status = CandidateStatus.MESSAGE_GENERATED
    db.commit()
    db.refresh(message)
    return message


def mark_message_sent(db: Session, message_id: uuid.UUID, platform: str, notes: str | None) -> models.Message:
    message = db.get(models.Message, message_id)
    if message is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Message not found")

    message.status = MessageStatus.SENT
    db.add(
        models.OutreachEvent(
            campaign_id=message.campaign_id,
            candidate_id=message.candidate_id,
            message_id=message.id,
            event_type=OutreachEventType.MESSAGE_SENT,
            platform=platform,
            notes=notes,
            occurred_at=datetime.now(UTC),
        )
    )
    link = db.scalar(
        select(models.CampaignCandidate).where(
            models.CampaignCandidate.campaign_id == message.campaign_id,
            models.CampaignCandidate.candidate_id == message.candidate_id,
        )
    )
    if link:
        link.status = CandidateStatus.CONTACTED
    db.commit()
    db.refresh(message)
    return message


def campaign_analytics(db: Session, campaign_id: uuid.UUID) -> dict:
    get_campaign(db, campaign_id)
    contacts = db.scalar(
        select(func.count()).select_from(models.CampaignCandidate).where(
            models.CampaignCandidate.campaign_id == campaign_id
        )
    )
    contacted = db.scalar(
        select(func.count()).select_from(models.CampaignCandidate).where(
            models.CampaignCandidate.campaign_id == campaign_id,
            models.CampaignCandidate.status.in_(
                [
                    CandidateStatus.CONTACTED,
                    CandidateStatus.REPLIED,
                    CandidateStatus.REFERRAL_RECEIVED,
                    CandidateStatus.INTERVIEW,
                ]
            ),
        )
    )
    replies = db.scalar(
        select(func.count()).select_from(models.CampaignCandidate).where(
            models.CampaignCandidate.campaign_id == campaign_id,
            models.CampaignCandidate.status.in_(
                [
                    CandidateStatus.REPLIED,
                    CandidateStatus.REFERRAL_RECEIVED,
                    CandidateStatus.INTERVIEW,
                ]
            ),
        )
    )
    referrals = db.scalar(
        select(func.count()).select_from(models.CampaignCandidate).where(
            models.CampaignCandidate.campaign_id == campaign_id,
            models.CampaignCandidate.status == CandidateStatus.REFERRAL_RECEIVED,
        )
    )
    interviews = db.scalar(
        select(func.count()).select_from(models.CampaignCandidate).where(
            models.CampaignCandidate.campaign_id == campaign_id,
            models.CampaignCandidate.status == CandidateStatus.INTERVIEW,
        )
    )
    contacted_count = contacted or 0
    replies_count = replies or 0
    return {
        "campaign_id": campaign_id,
        "contacts": contacts or 0,
        "contacted": contacted_count,
        "replies": replies_count,
        "referral_conversations": (referrals or 0) + (interviews or 0),
        "referrals": referrals or 0,
        "interviews": interviews or 0,
        "response_rate": replies_count / contacted_count if contacted_count else 0,
        "referral_rate": (referrals or 0) / contacted_count if contacted_count else 0,
    }
