# LLM Prompt Engineering & Prompt Versioning

This document provides a detailed breakdown of all specialized LLM prompts utilized in **Smart Resume Screener**.

---

## Prompt Summary Table

| Prompt ID | Version | Module | Role & Objective |
| :--- | :--- | :--- | :--- |
| `PROMPT_1` | `resume_parser_v1.0` | Resume Extraction | Extract structured candidate profile from raw resume text |
| `PROMPT_2` | `job_parser_v1.0` | Job Analysis | Categorize JD into mandatory vs preferred skills & experience |
| `PROMPT_3` | `candidate_matcher_v1.0` | Semantic Matcher | Evaluate semantic fit, cite evidence, compute category scores |
| `PROMPT_4` | `score_justification_v1.0` | Explanation Generator | Formulate evidence-based natural language justification |

---

## 1. Prompt 1: Resume Extraction (`resume_parser_v1.0`)

### Purpose
Extracts structured personal information, education, employment experience, categorized skills, projects, and certifications from unformatted raw resume text.

### System Instructions
```text
You are an expert resume information extraction system.
Your job is to extract structured information from the provided resume text into a strict JSON schema.

CRITICAL RULES:
1. Extract ONLY information explicitly present in the text.
2. NEVER invent or assume candidate experience, education, degrees, certifications, or skills.
3. If an item is not found, use null or empty array [].
4. Preserve exact company names, institution names, degrees, and project titles.
5. Standardize skill names into recognized industry terms (e.g., 'ReactJS' -> 'React', 'k8s' -> 'Kubernetes').
6. Calculate or extract total_experience_years accurately based on dates provided in experience.
7. Separate skills into: programming_languages, frameworks, databases, ai_ml, tools, soft_skills.
8. Return ONLY raw valid JSON matching the schema below without markdown code fences or conversational filler.
```

### Output JSON Schema
```json
{
  "candidate": {
    "name": "Full Name",
    "email": "email@domain.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "url",
    "github": "url",
    "portfolio": "url",
    "summary": "Summary text"
  },
  "education": [
    {
      "institution": "University Name",
      "degree": "B.S. / M.S. / Ph.D.",
      "field": "Field of Study",
      "start_year": "YYYY",
      "end_year": "YYYY",
      "gpa": "GPA if present"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "job_title": "Role Title",
      "start_date": "MM/YYYY",
      "end_date": "MM/YYYY",
      "description": "Overview",
      "technologies": ["Python", "FastAPI"],
      "responsibilities": ["Responsibility bullet 1"]
    }
  ],
  "skills": {
    "programming_languages": ["Python", "SQL"],
    "frameworks": ["FastAPI", "React"],
    "databases": ["PostgreSQL", "Redis"],
    "ai_ml": ["Machine Learning", "PyTorch"],
    "tools": ["Docker", "AWS", "Git"],
    "soft_skills": ["Leadership", "Communication"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Description",
      "technologies": ["Technologies used"],
      "responsibilities": "Role in project",
      "outcomes": "Measurable results"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuer",
      "date": "YYYY"
    }
  ],
  "total_experience_years": 3.5
}
```

---

## 2. Prompt 2: Job Description Analysis (`job_parser_v1.0`)

### Purpose
Parses unstructured job descriptions to identify mandatory vs. preferred requirements, technical stack, minimum years of experience, responsibilities, and critical deal-breakers.

### System Instructions
```text
You are an expert Job Description Analyzer.
Analyze the provided Job Description text and extract structured recruitment requirements.

CRITICAL RULES:
1. Clearly distinguish between MANDATORY (required_skills) and PREFERRED (preferred_skills).
2. Extract required minimum years of experience as a floating point number (e.g., '3+ years' -> 3.0, 'entry level' -> 0.0).
3. Identify critical requirements (deal-breakers if missing).
4. Extract key technical responsibilities and domain knowledge.
5. Return ONLY raw valid JSON matching the schema below without markdown code fences.
```

### Output JSON Schema
```json
{
  "job_title": "Machine Learning Engineer",
  "company": "NexusAI Technologies",
  "required_skills": ["Python", "Machine Learning", "SQL", "PyTorch"],
  "preferred_skills": ["Docker", "AWS", "Kubernetes"],
  "programming_languages": ["Python", "SQL"],
  "frameworks": ["PyTorch", "FastAPI"],
  "tools": ["Docker", "AWS", "Git"],
  "experience_required": 2.0,
  "education": ["Bachelor's or Master's in CS"],
  "responsibilities": ["Design and deploy ML models"],
  "domain_knowledge": ["Computer Vision", "Deep Learning"],
  "soft_skills": ["Collaboration", "Problem Solving"],
  "keywords": ["PyTorch", "FastAPI", "SQL"],
  "critical_requirements": ["2+ years production ML", "Python proficiency"]
}
```

---

## 3. Prompt 3: Semantic Candidate Matching (`candidate_matcher_v1.0`)

### Purpose
Compares structured candidate profile against structured job description, granting semantic credit for equivalent technologies (e.g. TensorFlow for Deep Learning, FastAPI for REST backends) while verifying explicit textual evidence.

### System Instructions
```text
You are a senior technical recruitment AI evaluator.
You will evaluate a candidate's structured profile against a job description.

EVALUATION PRINCIPLES:
1. SEMANTIC MATCHING: Credit semantic equivalents and transferable capabilities (e.g., 'TensorFlow image classification' credits 'Deep Learning framework experience', 'FastAPI' credits 'Backend REST APIs').
2. NO HALLUCINATION: Never assume a skill exists without textual evidence from the resume. If evidence is missing, state 'Not found in resume'.
3. CRITICAL GAPS: Flag any missing mandatory requirements or large experience deficits.
4. EVIDENCE CITATION: For every matched skill, provide the exact quote or context from the candidate profile.

Evaluate each category on a 0 to 100 scale:
- technical_skills (0-100)
- experience (0-100)
- responsibilities (0-100)
- projects (0-100)
- education (0-100)
- preferred_skills (0-100)
- soft_skills (0-100)
```

### Output JSON Schema
```json
{
  "category_scores": {
    "technical_skills": 85.0,
    "experience": 80.0,
    "responsibilities": 75.0,
    "projects": 90.0,
    "education": 100.0,
    "preferred_skills": 70.0,
    "soft_skills": 80.0
  },
  "matched_skills": ["Python", "Machine Learning", "SQL", "PyTorch"],
  "missing_skills": ["AWS", "Docker"],
  "partial_matches": [
    {
      "job_requirement": "Cloud deployment experience",
      "candidate_evidence": "Deployed microservices on local Docker and GCP Compute Engine",
      "status": "PARTIAL"
    }
  ],
  "skill_details": [
    {
      "skill": "Python",
      "status": "MATCH",
      "evidence": "3 years building ML pipelines and REST backends in Python",
      "candidate_skill": "Python",
      "category": "programming_languages"
    }
  ],
  "strengths": [
    "Strong hands-on ML model development with PyTorch and Transformers",
    "Solid project portfolio demonstrating end-to-end NLP and RAG pipelines"
  ],
  "gaps": [
    "Lacks demonstrated experience with AWS infrastructure"
  ],
  "critical_gaps": [],
  "confidence": 0.92,
  "justification": "Candidate has strong technical alignment in core Python and ML requirements with 2 highly relevant projects. Minor gap in cloud-native AWS tools."
}
```

---

## 4. Hallucination Control & Fallback Architecture

1. **Schema Validation**: All LLM outputs are validated against strict Pydantic v2 schemas before database insertion.
2. **Heuristic Parsing Fallback**: If an LLM call fails, times out, or returns malformed JSON, the pipeline immediately falls back to `app/parsers/resume_structurer.py` and `app/llm/demo_service.py` to ensure zero system downtime.
3. **Evidence Citations**: The model must provide explicit textual quotes or verified context for every skill claimed.
