export interface PersonalInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  start_year?: string;
  end_year?: string;
  gpa?: string;
}

export interface ExperienceItem {
  company: string;
  job_title: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  technologies: string[];
  responsibilities: string[];
}

export interface SkillsCategorized {
  programming_languages: string[];
  frameworks: string[];
  databases: string[];
  ai_ml: string[];
  tools: string[];
  soft_skills: string[];
}

export interface ProjectItem {
  name: string;
  description?: string;
  technologies: string[];
  responsibilities?: string;
  outcomes?: string;
}

export interface CertificationItem {
  name: string;
  issuer?: string;
  date?: string;
}

export interface StructuredResume {
  candidate: PersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillsCategorized;
  projects: ProjectItem[];
  certifications: CertificationItem[];
  total_experience_years: number;
}

export interface StructuredJobDescription {
  job_title: string;
  company?: string;
  required_skills: string[];
  preferred_skills: string[];
  programming_languages: string[];
  frameworks: string[];
  tools: string[];
  experience_required: number;
  education: string[];
  responsibilities: string[];
  domain_knowledge: string[];
  soft_skills: string[];
  keywords: string[];
  critical_requirements: string[];
}

export interface JobDescription {
  id: number;
  title: string;
  company: string;
  experience_required: number;
  location?: string;
  salary_range?: string;
  raw_text: string;
  structured_json?: StructuredJobDescription;
  created_at: string;
}

export interface SkillMatchDetail {
  skill: string;
  status: 'MATCH' | 'PARTIAL' | 'MISSING' | 'PREFERRED_GAP';
  evidence?: string;
  candidate_skill?: string;
  category?: string;
}

export interface CategoryScoreBreakdown {
  technical_skills: number;
  technical_skills_max: number;
  experience: number;
  experience_max: number;
  responsibilities: number;
  responsibilities_max: number;
  projects: number;
  projects_max: number;
  education: number;
  education_max: number;
  preferred_skills: number;
  preferred_skills_max: number;
  soft_skills: number;
  soft_skills_max: number;
  penalty_deduction: number;
}

export interface MatchResult {
  id?: number;
  candidate_id: number;
  candidate_name: string;
  candidate_title?: string;
  candidate_email?: string;
  candidate_experience_years: number;
  overall_score: number;
  recommendation: string;
  confidence: number;
  category_scores: CategoryScoreBreakdown;
  matched_skills: string[];
  missing_skills: string[];
  partial_matches: any[];
  skill_details: SkillMatchDetail[];
  strengths: string[];
  gaps: string[];
  critical_gaps: string[];
  evidence: Array<{ requirement: string; evidence: string; status: string }>;
  justification: string;
  prompt_version: string;
  recruiter_decision?: 'SHORTLISTED' | 'REJECTED' | 'REVIEW' | 'UNDECIDED';
  recruiter_notes?: string;
}

export interface ScreeningSession {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  title: string;
  status: string;
  total_candidates: number;
  average_score: number;
  top_candidate_name?: string;
  created_at: string;
  results: MatchResult[];
}

export interface CandidateDetail {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  current_title?: string;
  total_experience_years: number;
  summary?: string;
  structured_resume?: StructuredResume;
  created_at: string;
}

export interface DashboardStats {
  total_candidates: number;
  processed_candidates: number;
  shortlisted_candidates: number;
  rejected_candidates: number;
  under_review_candidates: number;
  average_match_score: number;
  strongest_candidate?: {
    id: number;
    name: string;
    current_title: string;
    score: number;
    recommendation: string;
    experience_years: number;
  };
  current_job?: {
    id: number;
    title: string;
    company: string;
    experience_required: number;
    location?: string;
  };
  recent_sessions: Array<{
    id: number;
    title: string;
    total_candidates: number;
    average_score: number;
    top_candidate_name?: string;
    created_at: string;
  }>;
  demo_mode: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
