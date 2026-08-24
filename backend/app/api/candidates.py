from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import Candidate, Resume, RecruiterDecision, JobDescription, MatchResult
from app.schemas.pydantic_models import (
    CandidateDetailResponse, RecruiterDecisionUpdate, ApiResponse, StructuredResume
)

router = APIRouter(prefix="/candidates", tags=["Candidates"])

class OutreachRequest(BaseModel):
    template_type: str = "interview_invite"  # interview_invite, in_review, gentle_rejection
    job_title: Optional[str] = "Machine Learning Engineer"
    company: Optional[str] = "NexusAI Technologies"

@router.get("", response_model=ApiResponse[List[dict]])
def list_candidates(db: Session = Depends(get_db)):
    """List all candidate profiles with summary information."""
    candidates = db.query(Candidate).order_by(Candidate.created_at.desc()).all()
    data = []
    for c in candidates:
        resume = db.query(Resume).filter(Resume.candidate_id == c.id).first()
        data.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "location": c.location,
            "current_title": c.current_title,
            "total_experience_years": c.total_experience_years,
            "resume_id": resume.id if resume else None,
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    return ApiResponse(success=True, data=data)

@router.get("/{id}", response_model=ApiResponse[CandidateDetailResponse])
def get_candidate(id: int, db: Session = Depends(get_db)):
    """Get full candidate details including structured resume profile."""
    candidate = db.query(Candidate).filter(Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    resume = db.query(Resume).filter(Resume.candidate_id == candidate.id).first()
    structured_resume = None
    if resume and resume.parsed_json:
        try:
            structured_resume = StructuredResume(**resume.parsed_json)
        except Exception:
            structured_resume = None

    return ApiResponse(
        success=True,
        data=CandidateDetailResponse(
            id=candidate.id,
            name=candidate.name,
            email=candidate.email,
            phone=candidate.phone,
            location=candidate.location,
            linkedin=candidate.linkedin,
            github=candidate.github,
            portfolio=candidate.portfolio,
            current_title=candidate.current_title,
            total_experience_years=candidate.total_experience_years or 0.0,
            summary=candidate.summary,
            structured_resume=structured_resume,
            created_at=candidate.created_at
        )
    )

@router.post("/{id}/decision", response_model=ApiResponse[dict])
def set_recruiter_decision(
    id: int,
    decision_in: RecruiterDecisionUpdate,
    job_id: Optional[int] = 1,
    db: Session = Depends(get_db)
):
    """
    Record or update a recruiter's manual hiring decision for a candidate on a specific job.
    Accepts: SHORTLISTED, REJECTED, REVIEW, UNDECIDED
    """
    candidate = db.query(Candidate).filter(Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    decision_record = db.query(RecruiterDecision).filter(
        RecruiterDecision.candidate_id == id,
        RecruiterDecision.job_id == job_id
    ).first()

    valid_decisions = ["SHORTLISTED", "REJECTED", "REVIEW", "UNDECIDED"]
    normalized_decision = decision_in.decision.upper()
    if normalized_decision not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision '{decision_in.decision}'. Allowed: {', '.join(valid_decisions)}"
        )

    if not decision_record:
        decision_record = RecruiterDecision(
            candidate_id=id,
            job_id=job_id,
            decision=normalized_decision,
            notes=decision_in.notes
        )
        db.add(decision_record)
    else:
        decision_record.decision = normalized_decision
        if decision_in.notes is not None:
            decision_record.notes = decision_in.notes

    db.commit()
    db.refresh(decision_record)

    return ApiResponse(
        success=True,
        data={
            "candidate_id": id,
            "job_id": job_id,
            "decision": decision_record.decision,
            "notes": decision_record.notes,
            "updated_at": decision_record.updated_at.isoformat() if decision_record.updated_at else None
        },
        message=f"Recruiter decision set to {normalized_decision} for {candidate.name}."
    )

@router.post("/{id}/interview-kit", response_model=ApiResponse[dict])
def generate_interview_kit(id: int, db: Session = Depends(get_db)):
    """Generate tailored technical, architectural, and gap-focused interview questions with scoring rubrics."""
    candidate = db.query(Candidate).filter(Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    match_record = db.query(MatchResult).filter(MatchResult.candidate_id == id).order_by(MatchResult.created_at.desc()).first()
    matched_skills = match_record.matched_skills if match_record else ["Python", "SQL"]
    missing_skills = match_record.missing_skills if match_record else []
    
    questions = [
        {
            "category": "Technical Architecture & Depth",
            "question": f"Walk us through how you designed and deployed production systems utilizing {', '.join(matched_skills[:2]) if matched_skills else 'core frameworks'}. What architectural bottlenecks did you encounter?",
            "look_for": "Clear explanation of latency tradeoffs, concurrency handling, database index optimization, and asynchronous processing.",
            "red_flags": "Superficial knowledge, inability to explain system failure modes or memory overhead."
        },
        {
            "category": "Data & Feature Engineering",
            "question": "How do you ensure data integrity and schema validation when processing streaming or batch inputs under high throughput?",
            "look_for": "Concrete mention of schema enforcement (Pydantic / Protobuf), idempotency, query profiling, and automated integration tests.",
            "red_flags": "Lack of unit testing awareness, relying solely on manual sanity checks."
        },
        {
            "category": "Gap & Growth Verification",
            "question": f"Our team works heavily with {missing_skills[0] if missing_skills else 'cloud infrastructure and distributed deployment'}. Describe your experience ramping up on unfamiliar infrastructure or tooling.",
            "look_for": "Proactive learning strategy, containerization mental model, and quick translation of adjacent engineering skills.",
            "red_flags": "Resistance to cross-stack tooling or inability to explain basic deployment concepts."
        },
        {
            "category": "System Reliability & Incident Response",
            "question": "Describe a production bug or outage you diagnosed in a live system. How did you isolate the root cause and ensure long-term regression prevention?",
            "look_for": "Structured troubleshooting methodology, metrics/logging inspection, post-mortem discipline.",
            "red_flags": "Blaming external teams, lack of root-cause analysis."
        }
    ]

    return ApiResponse(
        success=True,
        data={
            "candidate_name": candidate.name,
            "candidate_title": candidate.current_title,
            "questions": questions,
            "rubric": {
                "senior": "Demonstrates deep system ownership, end-to-end design, and mentorship capability.",
                "mid": "Strong implementation proficiency with solid adherence to clean code and testing.",
                "junior": "Solid conceptual grasp, eager learner requiring architectural guidance."
            }
        }
    )

@router.post("/{id}/outreach", response_model=ApiResponse[dict])
def generate_outreach_email(id: int, req: OutreachRequest, db: Session = Depends(get_db)):
    """Generate personalized recruiter outreach email based on candidate strengths."""
    candidate = db.query(Candidate).filter(Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    first_name = candidate.name.split()[0] if candidate.name else "Candidate"
    job_title = req.job_title or "Machine Learning Engineer"
    company = req.company or "NexusAI Technologies"

    if req.template_type == "interview_invite":
        subject = f"Interview Invitation: {job_title} role at {company}"
        body = f"""Hi {first_name},

I came across your profile and was particularly impressed by your hands-on experience in modern software engineering and technical architecture.

We are currently expanding our core engineering team at {company} for the {job_title} role, and your background aligns remarkably well with what we're building.

Would you be open to a 25-minute introductory conversation this week to discuss the role and engineering challenges we are solving?

Looking forward to connecting!

Best regards,
Talent Acquisition Team
{company}"""

    elif req.template_type == "in_review":
        subject = f"Application Update: {job_title} at {company}"
        body = f"""Hi {first_name},

Thank you for your interest in the {job_title} position at {company}.

Our hiring committee has reviewed your profile and credentials with great enthusiasm. We are currently finalizing our technical evaluation schedule and will follow up with next steps within the next 48 hours.

Thank you for your patience!

Best regards,
{company} Recruiting Team"""

    else:
        subject = f"Update regarding your application at {company}"
        body = f"""Hi {first_name},

Thank you for taking the time to share your background with {company} for the {job_title} role.

While your profile demonstrates commendable experience, we have decided to proceed with candidates whose current skill depth more closely matches our immediate infrastructure requirements.

We will keep your resume in our talent network for upcoming opportunities that match your expertise. We wish you continued success in your career journey.

Warm regards,
{company} Talent Team"""

    return ApiResponse(
        success=True,
        data={
            "subject": subject,
            "body": body,
            "recipient_email": candidate.email or "candidate@example.com",
            "candidate_name": candidate.name
        }
    )
