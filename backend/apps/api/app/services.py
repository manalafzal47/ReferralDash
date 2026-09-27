import hashlib
import hmac
import json
import secrets
import uuid
from datetime import UTC, datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import Depends, HTTPException, status
from fastapi.params import Header
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db

from app import models
from app.config import get_settings
from app.enums import CandidateStatus, MessageStatus, OutreachEventType
from app.schemas import CampaignCreate, CandidateCreate, MessageGenerateRequest
from app.linkedin_client import search_people

EXECUTIVE_TERMS = ("vp", "vice president", "director", "head of", "cto", "chief", "founder")

GITHUB_ORGANIZATIONS = {
    "rbc": "rbc",
    "shopify": "shopify",
    "td bank": "td-bank",
    "nvidia": "nvidia",
}

AUTH_TOKENS: dict[str, uuid.UUID] = {}


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000)
    return f"{salt}${digest.hex()}"


def _verify_password(password: str, password_hash: str) -> bool:
    salt, expected = password_hash.split("$", 1)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000)
    return hmac.compare_digest(digest.hex(), expected)


def _make_token(user_id: uuid.UUID) -> str:
    token = secrets.token_urlsafe(32)
    AUTH_TOKENS[token] = user_id
    return token


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> models.User:
    if authorization is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing authorization header")

    scheme, _, value = authorization.partition(" ")
    if scheme.lower() != "bearer" or not value:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid authorization header")

    user_id = AUTH_TOKENS.get(value)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    user = db.get(models.User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


def register_user(db: Session, payload: object) -> dict:
    email = payload.email.lower().strip()
    if db.scalar(select(models.User).where(models.User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "User already exists")

    user = models.User(
        email=email,
        password_hash=_hash_password(payload.password),
        name=payload.name.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = _make_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}


def login_user(db: Session, payload: object) -> dict:
    user = db.scalar(select(models.User).where(models.User.email == payload.email.lower().strip()))
    if user is None or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    token = _make_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}


def import_connections(db: Session, user: models.User, payload: object) -> dict:
    for connection in payload.connections:
        existing = db.scalar(
            select(models.UserConnection).where(
                models.UserConnection.user_id == user.id,
                models.UserConnection.name == connection.name,
                models.UserConnection.company == (connection.company or None),
            )
        )
        if existing:
            continue

        db.add(
            models.UserConnection(
                user_id=user.id,
                name=connection.name,
                company=connection.company,
                role=connection.role,
                relationship=connection.relationship,
                email=connection.email,
                linkedin_url=connection.linkedin_url,
                source="linkedin",
            )
        )
    db.commit()
    return {"saved": len(payload.connections), "user_id": str(user.id)}


def import_linkedin_connections(db: Session, user: models.User, payload: object) -> dict:
    """Import a real LinkedIn-derived list of people into the user network.

    This is intentionally thin and uses the existing Agent Reach / mcporter search path so
    we can replace the demo data without changing the rest of the app flow.
    """
    company_name = (payload.company or "").strip()
    keywords = (payload.keywords or payload.target_role or "").strip()

    if not company_name and not keywords:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Provide a company or a keyword search")

    search_terms = keywords or company_name
    profiles = search_people(
        keywords=search_terms,
        location=payload.location,
        target_company=company_name or "",
        limit=min(max(payload.limit or 10, 1), 25),
        timeout=get_settings().linkedin_command_timeout,
    )

    imported: list[dict] = []
    for profile in profiles:
        name = (profile.get("full_name") or "LinkedIn contact").strip()
        company = profile.get("current_company") or company_name
        role = profile.get("current_role") or payload.target_role

        imported.append(
            {
                "name": name,
                "company": company,
                "role": role,
                "relationship": "linkedin connection",
                "email": None,
                "linkedin_url": profile.get("linkedin_url"),
            }
        )

    if not imported:
        return {"saved": 0, "user_id": str(user.id), "source": "linkedin"}

    import_connections(db, user, type("ImportPayload", (), {"connections": imported})())
    return {"saved": len(imported), "user_id": str(user.id), "source": "linkedin"}


def get_warm_leads(db: Session, user: models.User, target_role: str | None, company: str | None) -> dict:
    target_role_text = (target_role or "").lower().strip()
    company_text = (company or "").lower().strip()

    leads = []
    for connection in db.scalars(select(models.UserConnection).where(models.UserConnection.user_id == user.id)).all():
        relationship = (connection.relationship or "contact").lower()
        role_text = (connection.role or "").lower()
        company_text_value = (connection.company or "").lower()

        score = 0
        reason_parts = []

        relationship_weights = {
            "close friend": 40,
            "friend": 35,
            "mentor": 35,
            "coworker": 30,
            "former coworker": 30,
            "classmate": 25,
            "mutual": 20,
            "alumni": 18,
            "recruiter": 15,
            "contact": 8,
        }

        score += relationship_weights.get(relationship, 8)
        reason_parts.append("relationship strength")

        if target_role_text and target_role_text in role_text:
            score += 25
            reason_parts.append("role fit")
        elif target_role_text:
            for token in target_role_text.split():
                if len(token) > 3 and token in role_text:
                    score += 12
                    reason_parts.append("keyword match")
                    break

        if company_text and company_text in company_text_value:
            score += 50
            reason_parts.append("same company")
            if relationship in {"close friend", "friend", "mentor", "coworker", "former coworker", "classmate", "mutual"}:
                score += 15
                reason_parts.append("warm intro path")
        elif company_text:
            score += 8
            reason_parts.append("company interest")

        if connection.email:
            score += 10
            reason_parts.append("email available")

        if connection.linkedin_url:
            score += 5
            reason_parts.append("LinkedIn available")

        if score < 0:
            score = 0

        leads.append({
            "name": connection.name,
            "company": connection.company,
            "role": connection.role,
            "relationship": connection.relationship,
            "email": connection.email,
            "linkedin_url": connection.linkedin_url,
            "match_score": min(score, 100),
            "reason": ", ".join(reason_parts),
        })

    leads.sort(key=lambda item: item["match_score"], reverse=True)
    return {"leads": leads[:10]}


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

    keywords = campaign.target_role

    if campaign.keywords:
        keywords = f"{keywords}, {', '.join(campaign.keywords)}"

    profiles = search_people(
        keywords=keywords,
        location=campaign.location,
        target_company=campaign.company.name,
        limit=settings.linkedin_search_limit,
        timeout=settings.linkedin_command_timeout,
    )

    discovered = []

    for profile in profiles:
        linkedin_url = profile["linkedin_url"]

        existing = db.scalar(
            select(models.Candidate).where(
                models.Candidate.linkedin_url == linkedin_url
            )
        )

        if existing is not None:
            existing.current_company = profile.get("current_company")
            existing.current_role = profile.get("current_role")
            existing.location = profile.get("location")

            campaign_link = db.scalar(
                select(models.CampaignCandidate).where(
                    models.CampaignCandidate.campaign_id == campaign_id,
                    models.CampaignCandidate.candidate_id == existing.id,
                )
            )

            if campaign_link is None:
                db.add(
                    models.CampaignCandidate(
                        campaign_id=campaign_id,
                        candidate_id=existing.id,
                        status=CandidateStatus.DISCOVERED,
                    )
                )

            discovered.append(existing)
            continue

        candidate = models.Candidate(
            full_name=profile["full_name"],
            current_company=profile.get("current_company"),
            current_role=profile.get("current_role"),
            location=profile.get("location"),
            linkedin_url=linkedin_url,
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
                source_type=profile["source_type"],
                source_url=linkedin_url,
                raw_data=profile["raw_data"],
            )
        )

        discovered.append(candidate)

    db.commit()

    return {
        "campaign_id": campaign_id,
        "source": "linkedin",
        "candidates": discovered,
    }

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

def linkedin_search_people(
    keywords: str,
    location: str | None,
    limit: int,
) -> list[dict]:
    arguments = [
        "mcporter",
        "call",
        "linkedin.search_people",
        f"keywords={keywords}",
    ]

    if location:
        arguments.append(f"location={location}")

    try:
        result = subprocess.run(
            arguments,
            capture_output=True,
            text=True,
            timeout=get_settings().linkedin_command_timeout,
            check=False,
        )
    except FileNotFoundError as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "mcporter is not installed or is not available on the API PATH",
        ) from error
    except subprocess.TimeoutExpired as error:
        raise HTTPException(
            status.HTTP_504_GATEWAY_TIMEOUT,
            "LinkedIn search timed out",
        ) from error

    if result.returncode != 0:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"LinkedIn search failed: {result.stderr[-500:]}",
        )

    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "LinkedIn returned an unreadable response",
        ) from error

    if isinstance(payload, dict):
        people = payload.get("people") or payload.get("results") or payload.get("data")
        if isinstance(people, list):
            return people[:limit]

    if isinstance(payload, list):
        return payload[:limit]

    raise HTTPException(
        status.HTTP_502_BAD_GATEWAY,
        "LinkedIn returned an unexpected response format",
    )

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
