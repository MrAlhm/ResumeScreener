from typing import Tuple

def get_recommendation(score: float) -> Tuple[str, str, str]:
    """
    Returns recommendation label, color class, and short badge description.
    Ranges:
        90 - 100: EXCELLENT MATCH (Green)
        75 - 89:  STRONG MATCH (Emerald)
        60 - 74:  MODERATE MATCH (Blue/Indigo)
        40 - 59:  WEAK MATCH (Amber/Orange)
        0  - 39:  POOR MATCH (Red)
    """
    clamped = max(0.0, min(100.0, score))
    
    if clamped >= 90.0:
        return "EXCELLENT MATCH", "bg-emerald-50 text-emerald-700 border-emerald-300", "Top tier candidate exceeding core criteria"
    elif clamped >= 75.0:
        return "STRONG MATCH", "bg-teal-50 text-teal-700 border-teal-300", "Well-qualified candidate meeting core requirements"
    elif clamped >= 60.0:
        return "MODERATE MATCH", "bg-blue-50 text-blue-700 border-blue-300", "Partial match with potential, minor skill or experience gaps"
    elif clamped >= 40.0:
        return "WEAK MATCH", "bg-amber-50 text-amber-700 border-amber-300", "Noticeable gaps in required skills or experience level"
    else:
        return "POOR MATCH", "bg-rose-50 text-rose-700 border-rose-300", "Substantial mismatch with core mandatory requirements"
