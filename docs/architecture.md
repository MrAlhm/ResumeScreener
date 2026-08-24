# Architecture Documentation: Smart Resume Screener

## 1. Architectural Overview

**Smart Resume Screener** is an enterprise-grade AI recruitment platform engineered with a strict separation of concerns between **Text Extraction**, **Document Structuring**, **Job Requirement Parsing**, **Semantic Evaluation**, **Multi-Factor Scoring**, and **Decision Management**.

```mermaid
flowchart TD
    subgraph Client ["Frontend Client (React + TypeScript + Tailwind)"]
        UI_Dashboard["Dashboard & Recruitment KPIs"]
        UI_Upload["Multi-File Resume Upload Hub"]
        UI_Job["Job Description & Requirement Studio"]
        UI_Results["Ranked Candidate Leaderboard"]
        UI_Details["Candidate Profile & Evidence Inspector"]
        UI_Compare["Side-by-Side Comparison Matrix"]
        UI_History["Screening Sessions History"]
    end

    subgraph API ["REST API Layer (FastAPI)"]
        Router_Resumes["/api/resumes (Upload & Inspection)"]
        Router_Jobs["/api/jobs (JD Structuring)"]
        Router_Screening["/api/screening (AI Matching & Ranking)"]
        Router_Candidates["/api/candidates (Decisions & Profiles)"]
        Router_Analytics["/api/analytics (Aggregate Metrics)"]
    end

    subgraph Processing ["Text Extraction & Normalization"]
        PyMuPDF["PyMuPDF (fitz) Primary Parser"]
        PyPDF["pypdf Fallback Parser"]
        Sanitizer["Text Sanitizer & Control Char Filter"]
    end

    subgraph LLM ["AI & Semantic Evaluation Layer"]
        LLM_Factory["LLM Provider Factory"]
        LLM_Gemini["Gemini 1.5/2.0 API (Live Mode)"]
        LLM_Demo["Deterministic Semantic Engine (Demo Mode)"]
        Prompt_Parser["resume_parser_v1.0"]
        Prompt_JD["job_parser_v1.0"]
        Prompt_Matcher["candidate_matcher_v1.0"]
    end

    subgraph ScoringEngine ["Transparent Scoring Engine"]
        WeightsCalc["Weighted Multi-Factor Aggregator"]
        PenaltyEngine["Critical Gap & Mandatory Penalty Deductor"]
        ConfidenceScore["Confidence & Evidence Validator"]
    end

    subgraph Storage ["Database Persistence (SQLAlchemy)"]
        DB[(SQLite / PostgreSQL)]
        Table_Jobs["job_descriptions"]
        Table_Resumes["resumes"]
        Table_Candidates["candidates"]
        Table_Sessions["screening_sessions"]
        Table_Matches["match_results"]
        Table_Decisions["recruiter_decisions"]
    end

    UI_Upload --> Router_Resumes
    UI_Job --> Router_Jobs
    UI_Results --> Router_Screening
    UI_Details --> Router_Candidates
    UI_Compare --> Router_Screening
    UI_Dashboard --> Router_Analytics

    Router_Resumes --> PyMuPDF
    PyMuPDF -.->|fallback| PyPDF
    PyMuPDF --> Sanitizer
    Sanitizer --> LLM_Factory

    Router_Jobs --> LLM_Factory
    Router_Screening --> LLM_Factory

    LLM_Factory --> LLM_Gemini
    LLM_Factory --> LLM_Demo

    LLM_Gemini & LLM_Demo --> ScoringEngine
    ScoringEngine --> WeightsCalc
    WeightsCalc --> PenaltyEngine
    PenaltyEngine --> ConfidenceScore

    ConfidenceScore --> DB
    Router_Resumes & Router_Jobs & Router_Candidates --> DB
    DB --> Router_Analytics
```

---

## 2. Core Processing Pipeline

```
[Resume PDF/TXT]
      ↓
(1) PyMuPDF Extraction & Section Normalization
      ↓
(2) LLM Resume Structuring (resume_parser_v1.0)
      ↓
[Structured Candidate Profile JSON]
      ↓
[Job Description Text] → (3) LLM JD Analysis (job_parser_v1.0) → [Structured Job JSON]
      ↓                                                                 ↓
      └─────────────────────────┬───────────────────────────────────────┘
                                ↓
                 (4) Semantic Candidate ↔ Job Matching
                                ↓
                 (5) Multi-Factor Score Calculation
                     - Technical Skills: 35%
                     - Experience: 20%
                     - Responsibilities: 15%
                     - Projects: 10%
                     - Education: 5%
                     - Preferred Skills: 10%
                     - Soft Skills: 5%
                                ↓
                 (6) Mandatory Requirement Penalty Deductions
                                ↓
                 (7) Recommendation Classification
                     (90-100: Excellent, 75-89: Strong, 60-74: Moderate, 40-59: Weak, 0-39: Poor)
                                ↓
                 (8) Persistent Ranked Session & Recruiter Decisions
```

---

## 3. Component Responsibilities

### 3.1. Frontend (`frontend/`)
- **React 18 + TypeScript + Vite + Tailwind CSS**: Single Page Application designed as an enterprise recruitment portal.
- **`DashboardPage`**: Displays active screening overview, KPI cards (Total Candidates, Processed, Shortlisted, Average Match Score), top candidate spotlight, and recent sessions.
- **`UploadPage`**: Drag & drop zone supporting multi-file PDF/TXT batch uploads with progress tracking and modal inspect.
- **`JobDescriptionPage`**: Job studio with prebuilt role templates (ML Engineer, Full Stack, Data Engineer) and real-time structured requirements preview.
- **`ScreeningResultsPage`**: Interactive leaderboard with circular score gauges, matched/missing skill chips, min-score sliders, recommendation tier filters, and recruiter decision toggles.
- **`CandidateDetailPage`**: Deep-dive profile inspector with multi-factor breakdown cards, strengths, critical gaps, evidence quotes, and hiring notes.
- **`CompareCandidatesPage`**: Side-by-side comparison table with category winner badges and competency radar chart.
- **`ScreeningHistoryPage`**: Chronological audit trail of past screening runs.

### 3.2. Backend (`backend/app/`)
- **FastAPI Core**: Async REST API endpoints with Pydantic v2 schemas and centralized exception handling.
- **PDF Extraction Engine (`app/parsers/pdf_extractor.py`)**: Multi-page text extraction using `PyMuPDF` with fallback to `pypdf`, text sanitization, and scanned PDF detection.
- **LLM Abstraction (`app/llm/`)**: Factory pattern delivering `GeminiLLMService` (live Google Gemini API) or `DemoLLMService` (offline high-fidelity rule-based engine) based on environment configuration.
- **Scoring Engine (`app/scoring/`)**: Transparent deterministic mathematical scoring with configurable category weights and penalty logic for missing mandatory criteria.
- **Database Layer (`app/database/`, `app/models/`)**: SQLAlchemy ORM persisting candidates, resumes, structured JSON payloads, sessions, match results, and recruiter decisions.

---

## 4. LLM Cost & Performance Optimization

1. **One-Time Resume Parsing**: Resumes are parsed once upon upload and structured into schema-validated JSON. Subsequent screenings reuse the stored structured profile rather than re-tokenizing raw resume text.
2. **One-Time Job Analysis**: Job descriptions are analyzed once and structured into mandatory vs. preferred requirements.
3. **Optimized Match Payload**: The semantic matcher receives only structured JSON candidate profiles and structured job requirements, keeping token consumption minimal and deterministic.

---

## 5. Security & Responsible AI

- **File Validation**: Strict file type validation (`.pdf`, `.txt`), maximum file size limits (10MB default), and sanitization of null bytes and control characters.
- **Fairness & Bias Prevention**: Evaluation prompts and scoring logic operate exclusively on job-relevant technical skills, experience depth, verified projects, and education. Demographics, gender, age, and personal attributes are excluded from scoring.
- **Decision Independence**: AI recommendation labels (`EXCELLENT`, `STRONG`, `MODERATE`, `WEAK`, `POOR`) and Recruiter decisions (`SHORTLISTED`, `REJECTED`, `REVIEW`) are stored separately, ensuring AI serves as an advisory co-pilot.
