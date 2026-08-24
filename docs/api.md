# REST API Reference: Smart Resume Screener

The Smart Resume Screener API is built with **FastAPI** and provides predictable JSON envelopes for all requests and responses.

Base URL: `http://localhost:8000/api`

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully."
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Detailed error description."
  }
}
```

---

## 1. Analytics Endpoints

### `GET /analytics/dashboard`
Retrieve aggregate recruitment KPIs, active session summary, top candidate, and target job.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "total_candidates": 5,
    "processed_candidates": 5,
    "shortlisted_candidates": 2,
    "rejected_candidates": 0,
    "under_review_candidates": 1,
    "average_match_score": 76.2,
    "strongest_candidate": {
      "id": 1,
      "name": "Aarav Sharma",
      "current_title": "Lead Machine Learning Engineer",
      "score": 91.5,
      "recommendation": "EXCELLENT MATCH",
      "experience_years": 5.0
    },
    "current_job": {
      "id": 1,
      "title": "Machine Learning Engineer",
      "company": "NexusAI Technologies",
      "experience_required": 2.0,
      "location": "San Francisco, CA (Hybrid)"
    },
    "recent_sessions": [
      {
        "id": 1,
        "title": "Screening: Machine Learning Engineer at NexusAI Technologies",
        "total_candidates": 5,
        "average_score": 76.2,
        "top_candidate_name": "Aarav Sharma",
        "created_at": "2026-08-23T11:45:00"
      }
    ],
    "demo_mode": true
  }
}
```

---

## 2. Resume Endpoints

### `POST /resumes/upload`
Upload single or multiple PDF/TXT resumes for text extraction and LLM profile structuring.

**Request:** `multipart/form-data` with `files` field containing uploaded documents.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "resume_id": 1,
      "candidate_id": 1,
      "candidate_name": "Aarav Sharma",
      "filename": "1_aarav_sharma_ml_lead.pdf",
      "file_size": 46080,
      "extractor_used": "pymupdf",
      "pages": 1,
      "status": "SUCCESS",
      "structured_profile": { ... }
    }
  ],
  "message": "Processed 1 file(s). Successfully parsed: 1"
}
```

### `GET /resumes`
List all uploaded resumes with extraction and candidate status.

### `GET /resumes/{id}`
Retrieve raw extracted text and structured JSON for a specific resume.

---

## 3. Job Description Endpoints

### `POST /jobs`
Create and automatically analyze a new Job Description.

**Request Body:**
```json
{
  "title": "Machine Learning Engineer",
  "company": "NexusAI Technologies",
  "experience_required": 2.0,
  "location": "San Francisco, CA (Hybrid)",
  "salary_range": "$135,000 - $165,000",
  "raw_text": "Full job description text..."
}
```

### `GET /jobs`
List all registered job descriptions.

### `GET /jobs/{id}`
Get details and structured requirements for a single job description.

### `POST /jobs/{id}/analyze`
Re-run LLM requirement extraction and structuring for a job description.

---

## 4. Screening Endpoints

### `POST /screening/run`
Execute AI semantic matching, transparent multi-factor scoring, penalty calculations, and ranking.

**Request Body:**
```json
{
  "job_id": 1,
  "candidate_ids": [1, 2, 3, 4, 5]
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "job_id": 1,
    "job_title": "Machine Learning Engineer",
    "company": "NexusAI Technologies",
    "title": "Screening: Machine Learning Engineer at NexusAI Technologies",
    "status": "COMPLETED",
    "total_candidates": 5,
    "average_score": 76.2,
    "top_candidate_name": "Aarav Sharma",
    "results": [
      {
        "id": 1,
        "candidate_id": 1,
        "candidate_name": "Aarav Sharma",
        "candidate_title": "Lead Machine Learning Engineer",
        "candidate_experience_years": 5.0,
        "overall_score": 91.5,
        "recommendation": "EXCELLENT MATCH",
        "confidence": 0.92,
        "category_scores": {
          "technical_skills": 32.0,
          "experience": 19.5,
          "responsibilities": 14.0,
          "projects": 9.0,
          "education": 5.0,
          "preferred_skills": 8.0,
          "soft_skills": 4.0,
          "penalty_deduction": 0.0
        },
        "matched_skills": ["Python", "SQL", "PyTorch", "TensorFlow", "Scikit-learn", "Docker", "AWS"],
        "missing_skills": [],
        "strengths": [
          "5 years of verified production ML experience",
          "Dual PyTorch and TensorFlow mastery"
        ],
        "gaps": [],
        "critical_gaps": [],
        "justification": "Aarav Sharma is an outstanding match (91.5/100). He possesses 5 years of verified ML experience, mastery in Python, PyTorch, SQL, and FastAPI.",
        "prompt_version": "candidate_matcher_v1.0",
        "recruiter_decision": "SHORTLISTED"
      }
    ]
  }
}
```

### `GET /screening/sessions`
List all previous screening evaluation sessions.

### `GET /screening/sessions/{id}`
Retrieve a specific screening session with complete ranked candidate results.

---

## 5. Candidate & Decision Endpoints

### `GET /candidates`
List all candidates in the system.

### `GET /candidates/{id}`
Retrieve full candidate profile, structured resume, work history, and contact details.

### `POST /candidates/{id}/decision`
Record or update a recruiter's manual hiring decision.

**Request Body:**
```json
{
  "decision": "SHORTLISTED",
  "notes": "Verified PyTorch and cloud deployment background."
}
```
*Valid `decision` values: `SHORTLISTED`, `REJECTED`, `REVIEW`, `UNDECIDED`*

---

## 6. Seed & Demo Endpoints

### `POST /seed/reset`
Reset database tables and reload the 5 realistic candidate personas and sample job descriptions.
