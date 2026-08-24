import pytest
from app.scoring.engine import ScoringEngine
from app.scoring.recommendation import get_recommendation
from app.scoring.weights import DEFAULT_WEIGHTS

def test_weights_sum_to_one():
    total_weight = sum(DEFAULT_WEIGHTS.values())
    assert abs(total_weight - 1.0) < 1e-6, "Weights must sum to exactly 1.0 (100%)"

def test_perfect_match_candidate():
    engine = ScoringEngine()
    category_scores = {
        "technical_skills": 100.0,
        "experience": 100.0,
        "responsibilities": 100.0,
        "projects": 100.0,
        "education": 100.0,
        "preferred_skills": 100.0,
        "soft_skills": 100.0
    }
    score, breakdown, recommendation, penalty = engine.calculate_score(category_scores)
    assert score == 100.0
    assert recommendation == "EXCELLENT MATCH"
    assert penalty == 0.0
    assert breakdown.technical_skills == 35.0
    assert breakdown.experience == 20.0

def test_deterministic_scoring_test_case():
    """
    Test Case from Section 46 of specification:
    Job: Python, SQL, Machine Learning, TensorFlow, 2 years experience
    Candidate 1: Python, SQL, Machine Learning, TensorFlow, 3 years experience -> High score (>=85)
    Candidate 2: Python, SQL, 0 years, No ML -> Low score (<=45)
    """
    engine = ScoringEngine()
    
    # Candidate 1: High match
    cand1_scores = {
        "technical_skills": 100.0,
        "experience": 95.0,
        "responsibilities": 85.0,
        "projects": 90.0,
        "education": 100.0,
        "preferred_skills": 80.0,
        "soft_skills": 85.0
    }
    score1, _, rec1, penalty1 = engine.calculate_score(cand1_scores)
    assert score1 >= 85.0, f"Expected high score for strong candidate, got {score1}"
    assert rec1 in ["EXCELLENT MATCH", "STRONG MATCH"]
    assert penalty1 == 0.0

    # Candidate 2: Missing ML & 0 years experience
    cand2_scores = {
        "technical_skills": 30.0,
        "experience": 10.0,
        "responsibilities": 25.0,
        "projects": 20.0,
        "education": 80.0,
        "preferred_skills": 10.0,
        "soft_skills": 60.0
    }
    critical_gaps = [
        "Critical Experience Gap: Required 2+ years; candidate has 0 years.",
        "Missing mandatory ML and TensorFlow skills."
    ]
    mandatory_missing = ["Machine Learning", "TensorFlow"]
    score2, breakdown2, rec2, penalty2 = engine.calculate_score(
        cand2_scores,
        critical_gaps=critical_gaps,
        mandatory_missing=mandatory_missing
    )
    assert score2 <= 45.0, f"Expected low score for unqualified candidate with penalties, got {score2}"
    assert rec2 in ["POOR MATCH", "WEAK MATCH"]
    assert penalty2 > 10.0, "Penalty must be applied for critical gaps"

def test_recommendation_tiers():
    assert get_recommendation(95)[0] == "EXCELLENT MATCH"
    assert get_recommendation(82)[0] == "STRONG MATCH"
    assert get_recommendation(68)[0] == "MODERATE MATCH"
    assert get_recommendation(48)[0] == "WEAK MATCH"
    assert get_recommendation(25)[0] == "POOR MATCH"
