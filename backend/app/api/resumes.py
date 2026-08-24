import os
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import Resume, Candidate
from app.parsers.pdf_extractor import extract_text_from_file
from app.llm.factory import get_llm_service
from app.core.config import settings
from app.schemas.pydantic_models import ApiResponse

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ApiResponse[List[dict]])
async def upload_resumes(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload one or multiple PDF/TXT resumes.
    Extract text via PyMuPDF, parse structured candidate info, and persist to database.
    """
    results = []
    llm_service = get_llm_service()
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    for file in files:
        filename = file.filename or "unknown_resume.pdf"
        try:
            content = await file.read()
            file_size = len(content)
            
            # Check file size limit
            if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                results.append({
                    "filename": filename,
                    "status": "FAILED",
                    "error": f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE_MB}MB."
                })
                continue
                
            # Extract text from file
            extraction_result = extract_text_from_file(content, filename)
            
            if not extraction_result["has_readable_text"]:
                # Record failed resume
                failed_resume = Resume(
                    filename=filename,
                    file_size_bytes=file_size,
                    file_type=filename.split(".")[-1].lower(),
                    raw_text="",
                    parsing_status="FAILED",
                    error_message=extraction_result["error"] or "No extractable text found."
                )
                db.add(failed_resume)
                db.commit()
                
                results.append({
                    "filename": filename,
                    "status": "FAILED",
                    "error": extraction_result["error"] or "Unable to extract readable text."
                })
                continue

            raw_text = extraction_result["raw_text"]
            
            # Parse structured candidate profile using LLM / Structurer
            structured_profile = await llm_service.analyze_resume(raw_text)
            
            # Create Candidate record
            cand_info = structured_profile.candidate
            candidate = Candidate(
                name=cand_info.name or "Candidate",
                email=cand_info.email or "",
                phone=cand_info.phone or "",
                location=cand_info.location or "",
                linkedin=cand_info.linkedin or "",
                github=cand_info.github or "",
                portfolio=cand_info.portfolio or "",
                current_title=structured_profile.experience[0].job_title if structured_profile.experience else "",
                total_experience_years=structured_profile.total_experience_years or 0.0,
                summary=cand_info.summary or ""
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            # Create Resume record linked to Candidate
            resume_record = Resume(
                candidate_id=candidate.id,
                filename=filename,
                file_size_bytes=file_size,
                file_type=filename.split(".")[-1].lower(),
                raw_text=raw_text,
                parsed_json=structured_profile.model_dump(),
                parsing_status="SUCCESS"
            )
            db.add(resume_record)
            db.commit()
            db.refresh(resume_record)

            results.append({
                "resume_id": resume_record.id,
                "candidate_id": candidate.id,
                "candidate_name": candidate.name,
                "filename": filename,
                "file_size": file_size,
                "extractor_used": extraction_result["extractor_used"],
                "pages": extraction_result["page_count"],
                "status": "SUCCESS",
                "structured_profile": structured_profile.model_dump()
            })

        except Exception as e:
            results.append({
                "filename": filename,
                "status": "FAILED",
                "error": str(e)
            })

    return ApiResponse(
        success=True,
        data=results,
        message=f"Processed {len(files)} file(s). Successfully parsed: {len([r for r in results if r['status'] == 'SUCCESS'])}"
    )

@router.get("", response_model=ApiResponse[List[dict]])
def list_resumes(db: Session = Depends(get_db)):
    """List all uploaded resumes with extraction and candidate status."""
    resumes = db.query(Resume).order_by(Resume.created_at.desc()).all()
    data = []
    for r in resumes:
        cand_name = r.candidate.name if r.candidate else "Unassigned"
        data.append({
            "id": r.id,
            "filename": r.filename,
            "file_size_bytes": r.file_size_bytes,
            "file_type": r.file_type,
            "parsing_status": r.parsing_status,
            "candidate_id": r.candidate_id,
            "candidate_name": cand_name,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "error_message": r.error_message
        })
    return ApiResponse(success=True, data=data)

@router.get("/{id}", response_model=ApiResponse[dict])
def get_resume(id: int, db: Session = Depends(get_db)):
    """Get single resume details, raw text, and parsed profile."""
    resume = db.query(Resume).filter(Resume.id == id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    return ApiResponse(
        success=True,
        data={
            "id": resume.id,
            "filename": resume.filename,
            "file_size_bytes": resume.file_size_bytes,
            "parsing_status": resume.parsing_status,
            "candidate_id": resume.candidate_id,
            "raw_text": resume.raw_text,
            "parsed_json": resume.parsed_json,
            "created_at": resume.created_at.isoformat() if resume.created_at else None
        }
    )
