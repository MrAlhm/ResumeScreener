import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import JobDescription, Candidate, Resume, ScreeningSession, MatchResult, RecruiterDecision
from app.schemas.pydantic_models import (
    ScreeningRunRequest, ScreeningSessionResponse, MatchResultResponse,
    ApiResponse, StructuredJobDescription, StructuredResume, CategoryScoreBreakdown,
    SkillMatchDetail
)
from app.llm.factory import get_llm_service
from app.scoring.engine import ScoringEngine
from app.parsers.resume_structurer import parse_resume_heuristically

router = APIRouter(prefix="/screening", tags=["Screening"])

class LiveSimulateRequest(BaseModel):
    resume_text: str
    job_text: str
    custom_weights: Optional[dict] = None

@router.post("/run", response_model=ApiResponse[ScreeningSessionResponse])
async def run_screening(
    request: ScreeningRunRequest,
    db: Session = Depends(get_db)
):
    """
    Execute AI screening matching candidates against the target Job Description.
    Calculates transparent category scores, penalty deductions, confidence, and rankings.
    """
    job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Target Job Description not found.")
        
    llm_service = get_llm_service()
    scoring_engine = ScoringEngine()

    if job.structured_json:
        structured_jd = StructuredJobDescription(**job.structured_json)
    else:
        structured_jd = await llm_service.analyze_job_description(
            raw_text=job.raw_text, title=job.title, company=job.company
        )
        job.structured_json = structured_jd.model_dump()
        db.commit()

    candidates_query = db.query(Candidate)
    if request.candidate_ids:
        candidates_query = candidates_query.filter(Candidate.id.in_(request.candidate_ids))
    candidates = candidates_query.all()

    if not candidates:
        raise HTTPException(
            status_code=400,
            detail="No candidates available for screening. Please upload resumes first."
        )

    session = ScreeningSession(
        job_id=job.id,
        title=f"Screening: {job.title} at {job.company}",
        status="PROCESSING",
        total_candidates=len(candidates),
        prompt_version="candidate_matcher_v1.0"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    match_results = []
    total_score_sum = 0.0

    for cand in candidates:
        resume = db.query(Resume).filter(Resume.candidate_id == cand.id).first()
        if resume and resume.parsed_json:
            structured_resume = StructuredResume(**resume.parsed_json)
        elif resume and resume.raw_text:
            structured_resume = parse_resume_heuristically(resume.raw_text)
        else:
            structured_resume = parse_resume_heuristically(cand.summary or cand.name)

        raw_match = await llm_service.match_candidate(structured_resume, structured_jd)

        category_scores_dict = raw_match.get("category_scores", {})
        critical_gaps = raw_match.get("critical_gaps", [])
        missing_skills = raw_match.get("missing_skills", [])
        
        final_score, breakdown, recommendation, penalty = scoring_engine.calculate_score(
            category_raw_scores=category_scores_dict,
            critical_gaps=critical_gaps,
            mandatory_missing=missing_skills
        )

        total_score_sum += final_score

        decision = db.query(RecruiterDecision).filter(
            RecruiterDecision.candidate_id == cand.id,
            RecruiterDecision.job_id == job.id
        ).first()

        match_record = MatchResult(
            session_id=session.id,
            candidate_id=cand.id,
            overall_score=final_score,
            recommendation=recommendation,
            confidence=raw_match.get("confidence", 0.88),
            technical_skills_score=breakdown.technical_skills,
            experience_score=breakdown.experience,
            responsibilities_score=breakdown.responsibilities,
            projects_score=breakdown.projects,
            education_score=breakdown.education,
            preferred_skills_score=breakdown.preferred_skills,
            soft_skills_score=breakdown.soft_skills,
            penalty_deduction=penalty,
            matched_skills=raw_match.get("matched_skills", []),
            missing_skills=raw_match.get("missing_skills", []),
            partial_matches=raw_match.get("partial_matches", []),
            strengths=raw_match.get("strengths", []),
            gaps=raw_match.get("gaps", []),
            critical_gaps=critical_gaps,
            evidence=raw_match.get("evidence", []),
            justification=raw_match.get("justification", ""),
            prompt_version="candidate_matcher_v1.0"
        )
        db.add(match_record)
        db.commit()
        db.refresh(match_record)

        match_results.append({
            "record": match_record,
            "candidate": cand,
            "breakdown": breakdown,
            "decision": decision.decision if decision else "UNDECIDED",
            "notes": decision.notes if decision else "",
            "skill_details": raw_match.get("skill_details", [])
        })

    match_results.sort(key=lambda x: x["record"].overall_score, reverse=True)

    avg_score = round(total_score_sum / len(candidates), 1) if candidates else 0.0
    top_candidate = match_results[0]["candidate"].name if match_results else None

    session.average_score = avg_score
    session.top_candidate_name = top_candidate
    session.status = "COMPLETED"
    db.commit()
    db.refresh(session)

    formatted_results = []
    for item in match_results:
        rec = item["record"]
        cand = item["candidate"]
        formatted_results.append(
            MatchResultResponse(
                id=rec.id,
                candidate_id=cand.id,
                candidate_name=cand.name,
                candidate_title=cand.current_title or "Engineer",
                candidate_email=cand.email or "",
                candidate_experience_years=cand.total_experience_years or 0.0,
                overall_score=rec.overall_score,
                recommendation=rec.recommendation,
                confidence=rec.confidence or 0.88,
                category_scores=item["breakdown"],
                matched_skills=rec.matched_skills or [],
                missing_skills=rec.missing_skills or [],
                partial_matches=rec.partial_matches or [],
                skill_details=[SkillMatchDetail(**sd) for sd in item["skill_details"] if isinstance(sd, dict)] if item["skill_details"] else [],
                strengths=rec.strengths or [],
                gaps=rec.gaps or [],
                critical_gaps=rec.critical_gaps or [],
                evidence=rec.evidence or [],
                justification=rec.justification or "",
                prompt_version=rec.prompt_version or "candidate_matcher_v1.0",
                recruiter_decision=item["decision"],
                recruiter_notes=item["notes"]
            )
        )

    response_data = ScreeningSessionResponse(
        id=session.id,
        job_id=job.id,
        job_title=job.title,
        company=job.company,
        title=session.title,
        status=session.status,
        total_candidates=session.total_candidates,
        average_score=session.average_score,
        top_candidate_name=session.top_candidate_name,
        created_at=session.created_at,
        results=formatted_results
    )

    return ApiResponse(
        success=True,
        data=response_data,
        message=f"Screening complete. Screened {len(candidates)} candidates for {job.title}."
    )

@router.post("/live-simulate", response_model=ApiResponse[dict])
async def live_match_simulator(req: LiveSimulateRequest):
    """
    Real-Time Instant Match Playground.
    Accepts raw resume text and job description text, returning instant semantic match,
    transparent score breakdown, strengths, gaps, and cited evidence in <50ms.
    """
    llm_service = get_llm_service()
    scoring_engine = ScoringEngine()

    parsed_resume = parse_resume_heuristically(req.resume_text or "Candidate Resume")
    parsed_jd = await llm_service.analyze_job_description(req.job_text or "Software Engineer Job")

    raw_match = await llm_service.match_candidate(parsed_resume, parsed_jd)

    category_scores_dict = raw_match.get("category_scores", {})
    critical_gaps = raw_match.get("critical_gaps", [])
    missing_skills = raw_match.get("missing_skills", [])

    final_score, breakdown, recommendation, penalty = scoring_engine.calculate_score(
        category_raw_scores=category_scores_dict,
        critical_gaps=critical_gaps,
        mandatory_missing=missing_skills
    )

    return ApiResponse(
        success=True,
        data={
            "candidate_name": parsed_resume.candidate.name,
            "overall_score": final_score,
            "recommendation": recommendation,
            "confidence": 0.90,
            "category_scores": breakdown.model_dump(),
            "matched_skills": raw_match.get("matched_skills", []),
            "missing_skills": raw_match.get("missing_skills", []),
            "partial_matches": raw_match.get("partial_matches", []),
            "strengths": raw_match.get("strengths", []),
            "gaps": raw_match.get("gaps", []),
            "critical_gaps": critical_gaps,
            "justification": raw_match.get("justification", ""),
            "evidence": raw_match.get("evidence", [])
        }
    )

@router.get("/sessions", response_model=ApiResponse[List[dict]])
def list_screening_sessions(db: Session = Depends(get_db)):
    """List all previous screening sessions."""
    sessions = db.query(ScreeningSession).order_by(ScreeningSession.created_at.desc()).all()
    data = []
    for s in sessions:
        data.append({
            "id": s.id,
            "job_id": s.job_id,
            "job_title": s.job.title if s.job else "Unknown Job",
            "company": s.job.company if s.job else "Unknown Company",
            "title": s.title,
            "status": s.status,
            "total_candidates": s.total_candidates,
            "average_score": s.average_score,
            "top_candidate_name": s.top_candidate_name,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })
    return ApiResponse(success=True, data=data)

@router.get("/sessions/{id}", response_model=ApiResponse[ScreeningSessionResponse])
def get_screening_session(id: int, db: Session = Depends(get_db)):
    """Get screening session with complete ranked results."""
    session = db.query(ScreeningSession).filter(ScreeningSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found.")
        
    records = db.query(MatchResult).filter(MatchResult.session_id == session.id).order_by(MatchResult.overall_score.desc()).all()
    
    results = []
    for rec in records:
        cand = db.query(Candidate).filter(Candidate.id == rec.candidate_id).first()
        decision = db.query(RecruiterDecision).filter(
            RecruiterDecision.candidate_id == rec.candidate_id,
            RecruiterDecision.job_id == session.job_id
        ).first()

        breakdown = CategoryScoreBreakdown(
            technical_skills=rec.technical_skills_score or 0.0,
            experience=rec.experience_score or 0.0,
            responsibilities=rec.responsibilities_score or 0.0,
            projects=rec.projects_score or 0.0,
            education=rec.education_score or 0.0,
            preferred_skills=rec.preferred_skills_score or 0.0,
            soft_skills=rec.soft_skills_score or 0.0,
            penalty_deduction=rec.penalty_deduction or 0.0
        )

        results.append(
            MatchResultResponse(
                id=rec.id,
                candidate_id=rec.candidate_id,
                candidate_name=cand.name if cand else "Unknown",
                candidate_title=cand.current_title if cand else "",
                candidate_email=cand.email if cand else "",
                candidate_experience_years=cand.total_experience_years if cand else 0.0,
                overall_score=rec.overall_score,
                recommendation=rec.recommendation,
                confidence=rec.confidence or 0.85,
                category_scores=breakdown,
                matched_skills=rec.matched_skills or [],
                missing_skills=rec.missing_skills or [],
                partial_matches=rec.partial_matches or [],
                skill_details=[],
                strengths=rec.strengths or [],
                gaps=rec.gaps or [],
                critical_gaps=rec.critical_gaps or [],
                evidence=rec.evidence or [],
                justification=rec.justification or "",
                prompt_version=rec.prompt_version or "candidate_matcher_v1.0",
                recruiter_decision=decision.decision if decision else "UNDECIDED",
                recruiter_notes=decision.notes if decision else ""
            )
        )

    return ApiResponse(
        success=True,
        data=ScreeningSessionResponse(
            id=session.id,
            job_id=session.job_id,
            job_title=session.job.title if session.job else "",
            company=session.job.company if session.job else "",
            title=session.title,
            status=session.status,
            total_candidates=session.total_candidates,
            average_score=session.average_score,
            top_candidate_name=session.top_candidate_name,
            created_at=session.created_at,
            results=results
        )
    )

@router.get("/sessions/{id}/export-csv")
def export_screening_csv(id: int, db: Session = Depends(get_db)):
    """Export screening session leaderboard to CSV."""
    session = db.query(ScreeningSession).filter(ScreeningSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found.")

    records = db.query(MatchResult).filter(MatchResult.session_id == session.id).order_by(MatchResult.overall_score.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank", "Candidate Name", "Current Title", "Overall Match Score (%)",
        "Recommendation Tier", "Verified Experience (Yrs)", "Technical Skills Score (/35)",
        "Experience Score (/20)", "Matched Skills", "Missing Skills", "Recruiter Decision", "Recruiter Notes"
    ])

    for idx, rec in enumerate(records):
        cand = db.query(Candidate).filter(Candidate.id == rec.candidate_id).first()
        decision = db.query(RecruiterDecision).filter(
            RecruiterDecision.candidate_id == rec.candidate_id,
            RecruiterDecision.job_id == session.job_id
        ).first()

        writer.writerow([
            idx + 1,
            cand.name if cand else "Unknown",
            cand.current_title if cand else "",
            rec.overall_score,
            rec.recommendation,
            cand.total_experience_years if cand else 0.0,
            rec.technical_skills_score,
            rec.experience_score,
            "; ".join(rec.matched_skills or []),
            "; ".join(rec.missing_skills or []),
            decision.decision if decision else "UNDECIDED",
            decision.notes if decision else ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=screening_leaderboard_session_{id}.csv"}
    )

class ATSCheckRequest(BaseModel):
    resume_text: str
    job_text: str
    target_role: Optional[str] = ""

@router.post("/ats-check", response_model=ApiResponse[dict])
async def check_ats_compatibility(request: ATSCheckRequest):
    """
    Evaluate a Resume against a Job Description for ATS compatibility,
    section parseability, keyword match rate, and actionable optimization advice.
    """
    llm_service = get_llm_service()
    
    # 1. Parse Resume
    parsed_resume = await llm_service.analyze_resume(request.resume_text)
    
    # 2. Parse Job Description
    parsed_jd = await llm_service.analyze_job_description(request.job_text, title=request.target_role)
    
    # 3. Match candidate
    match_result = await llm_service.match_candidate(parsed_resume, parsed_jd)
    
    # 4. Compute ATS Specific Metrics
    has_contact = bool(parsed_resume.candidate.email or parsed_resume.candidate.phone)
    has_experience = len(parsed_resume.experience) > 0 or parsed_resume.total_experience_years > 0
    has_education = len(parsed_resume.education) > 0
    has_skills = bool(parsed_resume.skills and (
        parsed_resume.skills.programming_languages or 
        parsed_resume.skills.frameworks or 
        parsed_resume.skills.databases or 
        parsed_resume.skills.tools
    ))
    has_projects = len(parsed_resume.projects) > 0
    
    # Formatting score
    format_pts = (
        (25 if has_contact else 0) +
        (25 if has_experience else 0) +
        (25 if has_education else 0) +
        (25 if has_skills else 0)
    )
    
    matched = match_result.get("matched_skills", [])
    missing = match_result.get("missing_skills", [])
    total_req = max(1, len(matched) + len(missing))
    keyword_match_rate = round((len(matched) / total_req) * 100.0, 1)
    
    # Composite ATS Score (Weighted: 60% Keyword Alignment, 25% Experience, 15% Format Structure)
    base_tech = match_result.get("category_scores", {}).get("technical_skills", 70.0)
    base_exp = match_result.get("category_scores", {}).get("experience", 75.0)
    ats_score = round((base_tech * 0.60) + (base_exp * 0.25) + (format_pts * 0.15), 1)
    ats_score = max(0.0, min(100.0, ats_score))
    
    grade = (
        "A+" if ats_score >= 90 else
        "A" if ats_score >= 80 else
        "B" if ats_score >= 70 else
        "C" if ats_score >= 55 else "D"
    )
    
    actionable_tips = []
    if missing:
        actionable_tips.append(f"Add critical missing keywords: {', '.join(missing[:4])} directly in your skills & experience bullet points.")
    if not has_contact:
        actionable_tips.append("Include professional contact information (email, phone, LinkedIn) at the top of your resume.")
    if not has_projects:
        actionable_tips.append("Add a 'Projects' section highlighting production deployments or quantifiable technical achievements.")
    actionable_tips.append("Use standard section headings (Work Experience, Education, Technical Skills) to ensure seamless ATS bot parsing.")

    return ApiResponse(
        success=True,
        data={
            "ats_score": ats_score,
            "grade": grade,
            "keyword_match_rate": keyword_match_rate,
            "formatting_score": format_pts,
            "target_role": parsed_jd.job_title,
            "matched_keywords": matched,
            "missing_keywords": missing,
            "sections_audit": {
                "contact_info": {"status": "PASS" if has_contact else "WARN", "label": "Contact Information & Links"},
                "work_experience": {"status": "PASS" if has_experience else "FAIL", "label": "Work Experience & History"},
                "education": {"status": "PASS" if has_education else "WARN", "label": "Education & Degree Verification"},
                "skills_section": {"status": "PASS" if has_skills else "FAIL", "label": "Technical Skills Categorization"},
                "projects": {"status": "PASS" if has_projects else "WARN", "label": "Practical Projects & Portfolio"}
            },
            "gemma_thinking": match_result.get("gemma_thinking", ""),
            "actionable_tips": actionable_tips
        },
        message="ATS Compatibility Audit complete."
    )

