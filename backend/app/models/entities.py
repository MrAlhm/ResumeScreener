import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    experience_required = Column(Float, default=0.0)
    location = Column(String(255), nullable=True)
    salary_range = Column(String(100), nullable=True)
    raw_text = Column(Text, nullable=False)
    structured_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    screening_sessions = relationship("ScreeningSession", back_populates="job", cascade="all, delete-orphan")
    decisions = relationship("RecruiterDecision", back_populates="job", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    github = Column(String(255), nullable=True)
    portfolio = Column(String(255), nullable=True)
    current_title = Column(String(255), nullable=True)
    total_experience_years = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    match_results = relationship("MatchResult", back_populates="candidate", cascade="all, delete-orphan")
    decisions = relationship("RecruiterDecision", back_populates="candidate", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    file_type = Column(String(50), default="pdf")
    file_path = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False)
    parsed_json = Column(JSON, nullable=True)
    parsing_status = Column(String(50), default="PENDING")  # PENDING, SUCCESS, FAILED
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")


class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="COMPLETED")  # PROCESSING, COMPLETED, FAILED
    total_candidates = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    top_candidate_name = Column(String(255), nullable=True)
    prompt_version = Column(String(50), default="candidate_matcher_v1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("JobDescription", back_populates="screening_sessions")
    match_results = relationship("MatchResult", back_populates="session", cascade="all, delete-orphan")


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("screening_sessions.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    
    overall_score = Column(Float, nullable=False)
    recommendation = Column(String(50), nullable=False)  # EXCELLENT MATCH, STRONG MATCH, etc.
    confidence = Column(Float, default=0.85)
    
    # Detailed category scores
    technical_skills_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    responsibilities_score = Column(Float, default=0.0)
    projects_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    preferred_skills_score = Column(Float, default=0.0)
    soft_skills_score = Column(Float, default=0.0)
    penalty_deduction = Column(Float, default=0.0)
    
    # Detailed JSON structures
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    partial_matches = Column(JSON, default=list)
    experience_match = Column(JSON, default=dict)
    education_match = Column(JSON, default=dict)
    project_relevance = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    gaps = Column(JSON, default=list)
    critical_gaps = Column(JSON, default=list)
    evidence = Column(JSON, default=list)
    justification = Column(Text, nullable=True)
    
    prompt_version = Column(String(50), default="candidate_matcher_v1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ScreeningSession", back_populates="match_results")
    candidate = relationship("Candidate", back_populates="match_results")


class RecruiterDecision(Base):
    __tablename__ = "recruiter_decisions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    decision = Column(String(50), default="UNDECIDED")  # SHORTLISTED, REJECTED, REVIEW, UNDECIDED
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="decisions")
    job = relationship("JobDescription", back_populates="decisions")
