from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import JobDescription
from app.schemas.pydantic_models import (
    JobDescriptionCreate, JobDescriptionResponse, ApiResponse, StructuredJobDescription
)
from app.llm.factory import get_llm_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("", response_model=ApiResponse[JobDescriptionResponse])
async def create_job(job_in: JobDescriptionCreate, db: Session = Depends(get_db)):
    """Create and automatically analyze a new Job Description."""
    llm_service = get_llm_service()
    
    # Structure JD requirements
    structured_jd = await llm_service.analyze_job_description(
        raw_text=job_in.raw_text,
        title=job_in.title,
        company=job_in.company
    )

    db_job = JobDescription(
        title=job_in.title or structured_jd.job_title,
        company=job_in.company or structured_jd.company or "Company",
        experience_required=job_in.experience_required or structured_jd.experience_required,
        location=job_in.location or "",
        salary_range=job_in.salary_range or "",
        raw_text=job_in.raw_text,
        structured_json=structured_jd.model_dump()
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    return ApiResponse(
        success=True,
        data=db_job,
        message="Job description created and analyzed successfully."
    )

@router.get("", response_model=ApiResponse[List[JobDescriptionResponse]])
def list_jobs(db: Session = Depends(get_db)):
    """List all available job descriptions."""
    jobs = db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()
    return ApiResponse(success=True, data=jobs)

@router.get("/{id}", response_model=ApiResponse[JobDescriptionResponse])
def get_job(id: int, db: Session = Depends(get_db)):
    """Get single job description details and structured criteria."""
    job = db.query(JobDescription).filter(JobDescription.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")
    return ApiResponse(success=True, data=job)

@router.post("/{id}/analyze", response_model=ApiResponse[JobDescriptionResponse])
async def reanalyze_job(id: int, db: Session = Depends(get_db)):
    """Re-run LLM extraction and requirement breakdown for a job description."""
    job = db.query(JobDescription).filter(JobDescription.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")
        
    llm_service = get_llm_service()
    structured_jd = await llm_service.analyze_job_description(
        raw_text=job.raw_text,
        title=job.title,
        company=job.company
    )
    job.structured_json = structured_jd.model_dump()
    if structured_jd.experience_required:
        job.experience_required = structured_jd.experience_required
    db.commit()
    db.refresh(job)

    return ApiResponse(
        success=True,
        data=job,
        message="Job description re-analyzed successfully."
    )
