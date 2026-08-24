from typing import Dict

# Default Scoring Weights (Sum = 100%)
DEFAULT_WEIGHTS: Dict[str, float] = {
    "technical_skills": 0.35,     # 35%
    "experience": 0.20,           # 20%
    "responsibilities": 0.15,     # 15%
    "projects": 0.10,             # 10%
    "education": 0.05,            # 5%
    "preferred_skills": 0.10,     # 10%
    "soft_skills": 0.05           # 5%
}

CATEGORY_MAX_POINTS: Dict[str, float] = {
    "technical_skills": 35.0,
    "experience": 20.0,
    "responsibilities": 15.0,
    "projects": 10.0,
    "education": 5.0,
    "preferred_skills": 10.0,
    "soft_skills": 5.0
}
