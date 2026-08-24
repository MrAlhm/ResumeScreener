from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.entities import Candidate, Resume, JobDescription, ScreeningSession, MatchResult, RecruiterDecision
from app.schemas.pydantic_models import ApiResponse, DashboardStatsResponse
from app.core.config import settings

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=ApiResponse[DashboardStatsResponse])
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Retrieve real-time aggregate recruitment KPIs, statistics, and top candidate highlights."""
    total_candidates = db.query(Candidate).count()
    processed_resumes = db.query(Resume).filter(Resume.parsing_status == "SUCCESS").count()
    
    # Decisions
    shortlisted_count = db.query(RecruiterDecision).filter(RecruiterDecision.decision == "SHORTLISTED").count()
    rejected_count = db.query(RecruiterDecision).filter(RecruiterDecision.decision == "REJECTED").count()
    review_count = db.query(RecruiterDecision).filter(RecruiterDecision.decision == "REVIEW").count()

    # Average match score across all match results
    avg_score_query = db.query(func.avg(MatchResult.overall_score)).scalar()
    avg_score = round(float(avg_score_query), 1) if avg_score_query is not None else 0.0

    # Strongest candidate across recent matches
    top_match = db.query(MatchResult).order_by(MatchResult.overall_score.desc()).first()
    strongest_candidate = None
    if top_match and top_match.candidate:
        strongest_candidate = {
            "id": top_match.candidate.id,
            "name": top_match.candidate.name,
            "current_title": top_match.candidate.current_title or "Candidate",
            "score": top_match.overall_score,
            "recommendation": top_match.recommendation,
            "experience_years": top_match.candidate.total_experience_years
        }

    # Current/Latest Job
    latest_job = db.query(JobDescription).order_by(JobDescription.created_at.desc()).first()
    current_job = None
    if latest_job:
        current_job = {
            "id": latest_job.id,
            "title": latest_job.title,
            "company": latest_job.company,
            "experience_required": latest_job.experience_required,
            "location": latest_job.location
        }

    # Recent screening sessions
    recent_sessions = []
    sessions = db.query(ScreeningSession).order_by(ScreeningSession.created_at.desc()).limit(5).all()
    for s in sessions:
        recent_sessions.append({
            "id": s.id,
            "title": s.title,
            "total_candidates": s.total_candidates,
            "average_score": s.average_score,
            "top_candidate_name": s.top_candidate_name,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })

    data = DashboardStatsResponse(
        total_candidates=total_candidates,
        processed_candidates=processed_resumes,
        shortlisted_candidates=shortlisted_count,
        rejected_candidates=rejected_count,
        under_review_candidates=review_count,
        average_match_score=avg_score,
        strongest_candidate=strongest_candidate,
        current_job=current_job,
        recent_sessions=recent_sessions,
        demo_mode=settings.DEMO_MODE or not bool(settings.GEMINI_API_KEY)
    )

    return ApiResponse(success=True, data=data)
