from typing import Dict, Any, Tuple
from app.scoring.weights import DEFAULT_WEIGHTS, CATEGORY_MAX_POINTS
from app.scoring.recommendation import get_recommendation
from app.schemas.pydantic_models import CategoryScoreBreakdown

class ScoringEngine:
    """
    Transparent Scoring Engine.
    Combines structured category percentages with deterministic penalty deduction
    for missing mandatory requirements.
    """

    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_WEIGHTS

    def calculate_score(
        self,
        category_raw_scores: Dict[str, float],
        critical_gaps: list = None,
        mandatory_missing: list = None
    ) -> Tuple[float, CategoryScoreBreakdown, str, float]:
        """
        Calculate weighted overall score and category breakdown.
        
        category_raw_scores: Dict mapping category name to 0-100 percentage.
        Returns: (overall_score, CategoryScoreBreakdown, recommendation, penalty_deduction)
        """
        raw_tech = max(0.0, min(100.0, category_raw_scores.get("technical_skills", 50.0)))
        raw_exp = max(0.0, min(100.0, category_raw_scores.get("experience", 50.0)))
        raw_resp = max(0.0, min(100.0, category_raw_scores.get("responsibilities", 50.0)))
        raw_proj = max(0.0, min(100.0, category_raw_scores.get("projects", 50.0)))
        raw_edu = max(0.0, min(100.0, category_raw_scores.get("education", 50.0)))
        raw_pref = max(0.0, min(100.0, category_raw_scores.get("preferred_skills", 50.0)))
        raw_soft = max(0.0, min(100.0, category_raw_scores.get("soft_skills", 50.0)))

        # Weighted score out of 100
        weighted_tech = (raw_tech / 100.0) * CATEGORY_MAX_POINTS["technical_skills"]
        weighted_exp = (raw_exp / 100.0) * CATEGORY_MAX_POINTS["experience"]
        weighted_resp = (raw_resp / 100.0) * CATEGORY_MAX_POINTS["responsibilities"]
        weighted_proj = (raw_proj / 100.0) * CATEGORY_MAX_POINTS["projects"]
        weighted_edu = (raw_edu / 100.0) * CATEGORY_MAX_POINTS["education"]
        weighted_pref = (raw_pref / 100.0) * CATEGORY_MAX_POINTS["preferred_skills"]
        weighted_soft = (raw_soft / 100.0) * CATEGORY_MAX_POINTS["soft_skills"]

        base_score = (
            weighted_tech + weighted_exp + weighted_resp +
            weighted_proj + weighted_edu + weighted_pref + weighted_soft
        )

        # Mandatory Requirement Penalty
        # If critical gaps exist (e.g. 0 yrs experience when 2+ required, or 0 mandatory skills matched)
        penalty_deduction = 0.0
        if critical_gaps and len(critical_gaps) > 0:
            penalty_deduction += min(25.0, len(critical_gaps) * 12.0)
            
        if mandatory_missing and len(mandatory_missing) > 0:
            # Missing core mandatory skills incur progressive penalty
            penalty_deduction += min(15.0, len(mandatory_missing) * 4.0)

        final_score = max(0.0, min(100.0, base_score - penalty_deduction))
        final_score = round(final_score, 1)

        breakdown = CategoryScoreBreakdown(
            technical_skills=round(weighted_tech, 1),
            technical_skills_max=CATEGORY_MAX_POINTS["technical_skills"],
            experience=round(weighted_exp, 1),
            experience_max=CATEGORY_MAX_POINTS["experience"],
            responsibilities=round(weighted_resp, 1),
            responsibilities_max=CATEGORY_MAX_POINTS["responsibilities"],
            projects=round(weighted_proj, 1),
            projects_max=CATEGORY_MAX_POINTS["projects"],
            education=round(weighted_edu, 1),
            education_max=CATEGORY_MAX_POINTS["education"],
            preferred_skills=round(weighted_pref, 1),
            preferred_skills_max=CATEGORY_MAX_POINTS["preferred_skills"],
            soft_skills=round(weighted_soft, 1),
            soft_skills_max=CATEGORY_MAX_POINTS["soft_skills"],
            penalty_deduction=round(penalty_deduction, 1)
        )

        rec_label, _, _ = get_recommendation(final_score)

        return final_score, breakdown, rec_label, penalty_deduction
