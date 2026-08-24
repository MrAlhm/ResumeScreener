import re
from typing import Dict, Any, List
from app.llm.base import BaseLLMService
from app.schemas.pydantic_models import (
    StructuredResume, StructuredJobDescription
)
from app.parsers.resume_structurer import parse_resume_heuristically

# Semantic knowledge graph for technology equivalences
SEMANTIC_SYNONYMS = {
    "deep learning": ["tensorflow", "pytorch", "keras", "neural networks", "deep learning"],
    "machine learning": ["scikit-learn", "sklearn", "ml", "data science", "xgboost", "random forest", "model training"],
    "nlp": ["transformers", "huggingface", "bert", "spacy", "nltk", "llms", "rag", "langchain"],
    "backend": ["fastapi", "django", "flask", "express", "node.js", "spring boot", "rest apis", "restful apis"],
    "cloud": ["aws", "gcp", "azure", "cloud computing", "ec2", "s3", "lambda"],
    "containers": ["docker", "kubernetes", "k8s", "containerization", "helm"],
    "database": ["postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "sql"],
    "python": ["python", "python3", "asyncio", "pandas", "numpy"]
}

class DemoLLMService(BaseLLMService):
    """
    High-Fidelity Deterministic & Dynamic LLM Simulator for Demo Mode.
    Provides realistic semantic scoring, evidence extraction, and explanations.
    """

    async def analyze_resume(self, raw_text: str) -> StructuredResume:
        """Parse raw resume text into structured schema heuristically."""
        return parse_resume_heuristically(raw_text)

    async def analyze_job_description(self, raw_text: str, title: str = "", company: str = "") -> StructuredJobDescription:
        """Analyze job description text into required vs preferred skills and requirements."""
        text_lower = raw_text.lower()
        
        # Heuristic title detection if not passed
        inferred_title = title
        if not inferred_title:
            first_line = raw_text.split('\n')[0].strip() if raw_text else "Software Engineer"
            inferred_title = first_line[:50]
            
        inferred_company = company or "Technology Company"
        
        # Detect experience requirement
        exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience', text_lower)
        exp_years = float(exp_match.group(1)) if exp_match else 2.0
        
        # Skill extraction
        required_skills = []
        preferred_skills = []
        
        # Skill dictionary check
        from app.parsers.resume_structurer import KNOWN_SKILLS
        all_skills = []
        for cat, skills in KNOWN_SKILLS.items():
            for s in skills:
                if re.search(r'\b' + re.escape(s) + r'\b', text_lower):
                    all_skills.append(s.title())
                    
        # Divide into required vs preferred based on surrounding text keywords
        for s in all_skills:
            pos = text_lower.find(s.lower())
            surrounding = text_lower[max(0, pos-100):min(len(text_lower), pos+100)]
            if any(pref_word in surrounding for pref_word in ["preferred", "nice to have", "plus", "bonus", "optional"]):
                preferred_skills.append(s)
            else:
                required_skills.append(s)
                
        if not required_skills and all_skills:
            required_skills = all_skills[:4]
            preferred_skills = all_skills[4:7]
            
        return StructuredJobDescription(
            job_title=inferred_title,
            company=inferred_company,
            required_skills=required_skills[:8],
            preferred_skills=preferred_skills[:5],
            programming_languages=[s for s in required_skills if s.lower() in ["python", "sql", "java", "javascript", "typescript", "c++"]],
            frameworks=[s for s in required_skills if s.lower() in ["fastapi", "react", "pytorch", "tensorflow", "django"]],
            tools=[s for s in required_skills + preferred_skills if s.lower() in ["docker", "aws", "git", "kubernetes", "linux"]],
            experience_required=exp_years,
            education=["Bachelor's or Master's degree in Computer Science, AI, or related quantitative field"],
            responsibilities=[
                "Design, develop, evaluate, and deploy scalable algorithms and software components",
                "Collaborate cross-functionally with product and engineering teams to deliver robust features",
                "Write clean, maintainable, tested, and documented code adhering to engineering best practices"
            ],
            critical_requirements=[
                f"Minimum {int(exp_years)}+ years of practical experience",
                "Strong proficiency in core technical requirements"
            ]
        )

    async def match_candidate(
        self,
        candidate_data: StructuredResume,
        job_data: StructuredJobDescription
    ) -> Dict[str, Any]:
        """
        Perform intelligent semantic matching, evidence collection, and category scoring.
        """
        # Collect all candidate skills in lowercase
        cand_skills = set()
        for cat_skills in [
            candidate_data.skills.programming_languages,
            candidate_data.skills.frameworks,
            candidate_data.skills.databases,
            candidate_data.skills.ai_ml,
            candidate_data.skills.tools,
            candidate_data.skills.soft_skills
        ]:
            for s in cat_skills:
                cand_skills.add(s.lower())
                
        # Also collect project & experience texts
        cand_text_blob = " ".join([
            candidate_data.candidate.summary or "",
            " ".join([exp.description or "" + " ".join(exp.technologies) + " ".join(exp.responsibilities) for exp in candidate_data.experience]),
            " ".join([p.description or "" + " ".join(p.technologies) for p in candidate_data.projects])
        ]).lower()

        matched_skills = []
        missing_skills = []
        partial_matches = []
        skill_details = []
        
        req_skills = job_data.required_skills or ["Python", "Machine Learning", "SQL"]
        pref_skills = job_data.preferred_skills or ["Docker", "AWS"]

        # Evaluate required skills
        matched_req_count = 0
        for skill in req_skills:
            skill_lower = skill.lower()
            # 1. Exact match in candidate skills
            if skill_lower in cand_skills:
                matched_skills.append(skill)
                matched_req_count += 1
                skill_details.append({
                    "skill": skill,
                    "status": "MATCH",
                    "candidate_skill": skill,
                    "evidence": f"Explicitly listed under candidate technical skills.",
                    "category": "required"
                })
            # 2. Semantic synonym match
            elif any(syn in cand_skills or syn in cand_text_blob for syn in SEMANTIC_SYNONYMS.get(skill_lower, [])):
                matched_skills.append(skill)
                matched_req_count += 0.9
                matching_syn = next((syn for syn in SEMANTIC_SYNONYMS.get(skill_lower, []) if syn in cand_skills or syn in cand_text_blob), skill)
                skill_details.append({
                    "skill": skill,
                    "status": "MATCH",
                    "candidate_skill": matching_syn.title(),
                    "evidence": f"Demonstrated semantic expertise via {matching_syn.title()} in projects and background.",
                    "category": "required"
                })
            # 3. Partial mention in project text
            elif skill_lower in cand_text_blob:
                partial_matches.append({
                    "job_requirement": skill,
                    "candidate_evidence": f"Mentioned in project descriptions and experience text.",
                    "status": "PARTIAL"
                })
                matched_req_count += 0.5
                skill_details.append({
                    "skill": skill,
                    "status": "PARTIAL",
                    "candidate_skill": skill,
                    "evidence": f"Found in project narrative; less formal exposure.",
                    "category": "required"
                })
            else:
                missing_skills.append(skill)
                skill_details.append({
                    "skill": skill,
                    "status": "MISSING",
                    "candidate_skill": "—",
                    "evidence": "Not found in resume profile.",
                    "category": "required"
                })

        # Evaluate preferred skills
        matched_pref_count = 0
        for skill in pref_skills:
            skill_lower = skill.lower()
            if skill_lower in cand_skills or skill_lower in cand_text_blob:
                matched_pref_count += 1
                skill_details.append({
                    "skill": skill,
                    "status": "MATCH",
                    "candidate_skill": skill,
                    "evidence": "Candidate possesses preferred qualification.",
                    "category": "preferred"
                })
            else:
                skill_details.append({
                    "skill": skill,
                    "status": "PREFERRED_GAP",
                    "candidate_skill": "—",
                    "evidence": "Preferred skill not explicitly evidenced.",
                    "category": "preferred"
                })

        # Calculate category scores (0-100)
        total_req = max(1, len(req_skills))
        tech_score = min(100.0, (matched_req_count / total_req) * 100.0)
        
        # Experience alignment
        req_exp = job_data.experience_required or 2.0
        cand_exp = candidate_data.total_experience_years or 0.0
        
        critical_gaps = []
        if cand_exp >= req_exp:
            exp_score = min(100.0, 80.0 + (cand_exp - req_exp) * 5.0)
        elif cand_exp >= (req_exp * 0.6):
            exp_score = 65.0
        else:
            exp_score = max(20.0, (cand_exp / req_exp) * 50.0)
            critical_gaps.append(f"Critical Experience Gap: Required {req_exp} years; candidate has {cand_exp:.1f} years.")

        # Project relevance
        proj_count = len(candidate_data.projects)
        if proj_count >= 2:
            proj_score = 90.0 if tech_score > 70 else 75.0
        elif proj_count == 1:
            proj_score = 70.0
        else:
            proj_score = 50.0 if cand_exp > 2 else 35.0

        # Responsibilities score
        resp_score = min(100.0, (tech_score * 0.5 + exp_score * 0.5))

        # Education score
        edu_score = 95.0 if len(candidate_data.education) > 0 else 75.0

        # Preferred skills score
        total_pref = max(1, len(pref_skills))
        pref_score = min(100.0, (matched_pref_count / total_pref) * 100.0)

        # Soft skills score
        soft_count = len(candidate_data.skills.soft_skills)
        soft_score = 90.0 if soft_count >= 2 else (75.0 if soft_count == 1 else 60.0)

        # Strengths & Gaps
        strengths = []
        if matched_skills:
            strengths.append(f"Strong alignment with mandatory technical requirements: {', '.join(matched_skills[:4])}.")
        if cand_exp >= req_exp:
            strengths.append(f"Meets and exceeds practical experience criteria with {cand_exp:.1f} years.")
        if candidate_data.projects:
            strengths.append(f"Demonstrated project portfolio featuring {len(candidate_data.projects)} relevant project deployments.")

        gaps = []
        if missing_skills:
            gaps.append(f"Missing core job skills: {', '.join(missing_skills[:3])}.")
        if cand_exp < req_exp:
            gaps.append(f"Experience deficit: {cand_exp:.1f} years vs {req_exp:.1f} years required.")
        if not strengths:
            strengths.append("Foundational technical awareness in software development.")

        # Evidence records
        evidence_records = [
            {"requirement": s["skill"], "evidence": s["evidence"], "status": s["status"]}
            for s in skill_details if s["status"] in ["MATCH", "PARTIAL"]
        ]

        # Generate evidence-based justification
        justification = (
            f"Candidate displays {'excellent' if tech_score >= 85 else ('solid' if tech_score >= 65 else 'limited')} "
            f"alignment with {len(matched_skills)}/{len(req_skills)} required technical skills "
            f"({', '.join(matched_skills[:3]) if matched_skills else 'none'}). "
            f"Experience level is {cand_exp:.1f} years (required {req_exp:.1f} years). "
        )
        if missing_skills:
            justification += f"Key missing areas include {', '.join(missing_skills[:2])}. "
        if critical_gaps:
            justification += f"{critical_gaps[0]} "

        return {
            "category_scores": {
                "technical_skills": round(tech_score, 1),
                "experience": round(exp_score, 1),
                "responsibilities": round(resp_score, 1),
                "projects": round(proj_score, 1),
                "education": round(edu_score, 1),
                "preferred_skills": round(pref_score, 1),
                "soft_skills": round(soft_score, 1)
            },
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "partial_matches": partial_matches,
            "skill_details": skill_details,
            "strengths": strengths,
            "gaps": gaps,
            "critical_gaps": critical_gaps,
            "confidence": 0.90 if tech_score > 70 else 0.82,
            "justification": justification.strip(),
            "evidence": evidence_records
        }

    async def generate_explanation(
        self,
        candidate_data: StructuredResume,
        job_data: StructuredJobDescription,
        match_data: Dict[str, Any]
    ) -> str:
        return match_data.get("justification", "Evaluated based on explicit resume text.")
