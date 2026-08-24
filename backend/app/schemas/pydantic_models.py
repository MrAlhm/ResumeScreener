from typing import List, Optional, Dict, Any, Generic, TypeVar
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

T = TypeVar("T")

# Standard API response wrapper
class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[Dict[str, Any]] = None

# Personal Information
class PersonalInfo(BaseModel):
    name: str = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""
    summary: Optional[str] = ""

# Education
class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    field: Optional[str] = ""
    start_year: Optional[str] = ""
    end_year: Optional[str] = ""
    gpa: Optional[str] = ""

# Experience
class ExperienceItem(BaseModel):
    company: str = ""
    job_title: str = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    description: Optional[str] = ""
    technologies: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)

# Categorized Skills
class SkillsCategorized(BaseModel):
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    ai_ml: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)

# Project
class ProjectItem(BaseModel):
    name: str = ""
    description: Optional[str] = ""
    technologies: List[str] = Field(default_factory=list)
    responsibilities: Optional[str] = ""
    outcomes: Optional[str] = ""

# Certification
class CertificationItem(BaseModel):
    name: str = ""
    issuer: Optional[str] = ""
    date: Optional[str] = ""

# Full Structured Resume Model
class StructuredResume(BaseModel):
    candidate: PersonalInfo = Field(default_factory=PersonalInfo)
    education: List[EducationItem] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    skills: SkillsCategorized = Field(default_factory=SkillsCategorized)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
    total_experience_years: float = 0.0

# Job Description Schemas
class JobDescriptionCreate(BaseModel):
    title: str
    company: str
    experience_required: float = 0.0
    location: Optional[str] = ""
    salary_range: Optional[str] = ""
    raw_text: str

class StructuredJobDescription(BaseModel):
    job_title: str = ""
    company: Optional[str] = ""
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    experience_required: float = 0.0
    education: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    domain_knowledge: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    critical_requirements: List[str] = Field(default_factory=list)

class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    company: str
    experience_required: float
    location: Optional[str]
    salary_range: Optional[str]
    raw_text: str
    structured_json: Optional[StructuredJobDescription]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Skill Match Detail
class SkillMatchDetail(BaseModel):
    skill: str
    status: str  # MATCH, PARTIAL, MISSING, PREFERRED_GAP
    evidence: Optional[str] = ""
    candidate_skill: Optional[str] = ""
    category: Optional[str] = ""

# Category Score Breakdown
class CategoryScoreBreakdown(BaseModel):
    technical_skills: float
    technical_skills_max: float = 35.0
    experience: float
    experience_max: float = 20.0
    responsibilities: float
    responsibilities_max: float = 15.0
    projects: float
    projects_max: float = 10.0
    education: float
    education_max: float = 5.0
    preferred_skills: float
    preferred_skills_max: float = 10.0
    soft_skills: float
    soft_skills_max: float = 5.0
    penalty_deduction: float = 0.0

# Match Result Schema
class MatchResultResponse(BaseModel):
    id: Optional[int] = None
    candidate_id: int
    candidate_name: str
    candidate_title: Optional[str] = ""
    candidate_email: Optional[str] = ""
    candidate_experience_years: float = 0.0
    overall_score: float
    recommendation: str
    confidence: float = 0.85
    category_scores: CategoryScoreBreakdown
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    partial_matches: List[str] = Field(default_factory=list)
    skill_details: List[SkillMatchDetail] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    critical_gaps: List[str] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    justification: str = ""
    prompt_version: str = "candidate_matcher_v1.0"
    recruiter_decision: Optional[str] = "UNDECIDED"
    recruiter_notes: Optional[str] = ""

# Candidate Detail Response
class CandidateDetailResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    location: Optional[str]
    linkedin: Optional[str]
    github: Optional[str]
    portfolio: Optional[str]
    current_title: Optional[str]
    total_experience_years: float
    summary: Optional[str]
    structured_resume: Optional[StructuredResume]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Screening Trigger Request
class ScreeningRunRequest(BaseModel):
    job_id: int
    candidate_ids: Optional[List[int]] = None

# Screening Session Response
class ScreeningSessionResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    company: str
    title: str
    status: str
    total_candidates: int
    average_score: float
    top_candidate_name: Optional[str]
    created_at: datetime
    results: List[MatchResultResponse] = Field(default_factory=list)

# Recruiter Decision Update
class RecruiterDecisionUpdate(BaseModel):
    decision: str  # SHORTLISTED, REJECTED, REVIEW, UNDECIDED
    notes: Optional[str] = None

# Dashboard Stats Response
class DashboardStatsResponse(BaseModel):
    total_candidates: int
    processed_candidates: int
    shortlisted_candidates: int
    rejected_candidates: int
    under_review_candidates: int
    average_match_score: float
    strongest_candidate: Optional[Dict[str, Any]] = None
    current_job: Optional[Dict[str, Any]] = None
    recent_sessions: List[Dict[str, Any]] = Field(default_factory=list)
    demo_mode: bool = True
