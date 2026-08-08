import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import schemas, services
from app.db import get_db

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/campaigns", response_model=schemas.CampaignOut, status_code=status.HTTP_201_CREATED)
def create_campaign(payload: schemas.CampaignCreate, db: Session = Depends(get_db)):
    return services.create_campaign(db, payload)


@router.get("/campaigns", response_model=list[schemas.CampaignOut])
def list_campaigns(db: Session = Depends(get_db)):
    return services.list_campaigns(db)


@router.get("/campaigns/{campaign_id}", response_model=schemas.CampaignOut)
def get_campaign(campaign_id: uuid.UUID, db: Session = Depends(get_db)):
    return services.get_campaign(db, campaign_id)


@router.post(
    "/campaigns/{campaign_id}/candidates",
    response_model=schemas.CandidateOut,
    status_code=status.HTTP_201_CREATED,
)
def add_candidate(
    campaign_id: uuid.UUID, payload: schemas.CandidateCreate, db: Session = Depends(get_db)
):
    return services.add_candidate_to_campaign(db, campaign_id, payload)


@router.get("/campaigns/{campaign_id}/candidates", response_model=list[schemas.CandidateOut])
def list_candidates(campaign_id: uuid.UUID, db: Session = Depends(get_db)):
    return services.list_campaign_candidates(db, campaign_id)


@router.post("/campaigns/{campaign_id}/discover", response_model=schemas.DiscoveryOut)
def discover_candidates(campaign_id: uuid.UUID, db: Session = Depends(get_db)):
    return services.discover_candidates(db, campaign_id)


@router.post(
    "/campaigns/{campaign_id}/candidates/{candidate_id}/score",
    response_model=schemas.CandidateScoreOut,
)
def score_candidate(
    campaign_id: uuid.UUID, candidate_id: uuid.UUID, db: Session = Depends(get_db)
):
    return services.score_candidate(db, campaign_id, candidate_id)


@router.post(
    "/campaigns/{campaign_id}/candidates/{candidate_id}/generate-message",
    response_model=schemas.MessageOut,
    status_code=status.HTTP_201_CREATED,
)
def generate_message(
    campaign_id: uuid.UUID,
    candidate_id: uuid.UUID,
    payload: schemas.MessageGenerateRequest,
    db: Session = Depends(get_db),
):
    return services.generate_message(db, campaign_id, candidate_id, payload)


@router.post("/outreach/{message_id}/mark-sent", response_model=schemas.MessageOut)
def mark_sent(
    message_id: uuid.UUID, payload: schemas.MarkSentRequest, db: Session = Depends(get_db)
):
    return services.mark_message_sent(db, message_id, payload.platform, payload.notes)


@router.get("/campaigns/{campaign_id}/analytics", response_model=schemas.AnalyticsOut)
def analytics(campaign_id: uuid.UUID, db: Session = Depends(get_db)):
    return services.campaign_analytics(db, campaign_id)
