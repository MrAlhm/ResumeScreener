import pytest
from app.llm.gemma_service import Gemma4Service
from app.schemas.pydantic_models import StructuredResume, StructuredJobDescription, PersonalInfo, SkillsCategorized

@pytest.mark.anyio
async def test_gemma4_service_initialization():
    service = Gemma4Service(model_id="google/gemma-4-E2B-it", enable_thinking=True)
    assert service.model_id == "google/gemma-4-E2B-it"
    assert service.enable_thinking is True
    assert service.top_k == 64
    assert service.top_p == 0.95

@pytest.mark.anyio
async def test_gemma4_job_analysis():
    service = Gemma4Service()
    raw_jd = "Senior Python PyTorch Engineer with 3+ years experience. Must know Docker, SQL, and FastAPI."
    parsed = await service.analyze_job_description(raw_jd, title="ML Engineer", company="NexusAI")
    assert parsed.job_title == "ML Engineer"
    assert parsed.company == "NexusAI"
    assert parsed.experience_required == 3.0
    assert "Python" in parsed.required_skills or "PyTorch" in parsed.required_skills

@pytest.mark.anyio
async def test_gemma4_semantic_matching_and_thinking():
    service = Gemma4Service()
    resume = StructuredResume(
        candidate=PersonalInfo(name="Aarav Sharma"),
        skills=SkillsCategorized(programming_languages=["Python"], frameworks=["PyTorch", "FastAPI"], databases=["SQL"], tools=["Docker"]),
        total_experience_years=4.0
    )
    job = StructuredJobDescription(
        job_title="ML Engineer",
        company="NexusAI",
        experience_required=2.0,
        required_skills=["Python", "PyTorch", "SQL"],
        preferred_skills=["Docker"]
    )
    match_result = await service.match_candidate(resume, job)
    assert "matched_skills" in match_result
    assert "Python" in match_result["matched_skills"]
    assert "gemma_thinking" in match_result
    assert "<|channel>thought" in match_result["gemma_thinking"]
    assert match_result["inference_latency_ms"] < 100.0
