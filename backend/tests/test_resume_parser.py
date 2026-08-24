import pytest
from app.parsers.resume_structurer import parse_resume_heuristically, extract_personal_info, extract_heuristic_skills

SAMPLE_TEXT = """John Doe
San Francisco, CA | john.doe@example.com | (555) 123-4567 | linkedin.com/in/johndoe | github.com/johndoe

Senior Python Developer with 4 years experience in FastAPI, PostgreSQL, PyTorch, Docker, and AWS.

Experience:
Senior Developer | TechCorp | 2020 - Present
- Built REST APIs in FastAPI and managed PostgreSQL database.

Education:
B.S. in Computer Science | UC Berkeley | 2016 - 2020
"""

def test_extract_personal_info():
    info = extract_personal_info(SAMPLE_TEXT)
    assert info.name == "John Doe"
    assert info.email == "john.doe@example.com"
    assert "555" in info.phone
    assert "johndoe" in info.linkedin
    assert "johndoe" in info.github

def test_extract_skills():
    skills = extract_heuristic_skills(SAMPLE_TEXT)
    assert "Python" in skills.programming_languages
    assert "FastAPI" in skills.frameworks
    assert "PostgreSQL" in skills.databases
    assert "PyTorch" in skills.frameworks or "PyTorch" in skills.ai_ml
    assert "Docker" in skills.tools
    assert "AWS" in skills.tools

def test_full_heuristic_parser():
    parsed = parse_resume_heuristically(SAMPLE_TEXT)
    assert parsed.candidate.name == "John Doe"
    assert parsed.candidate.email == "john.doe@example.com"
    assert parsed.total_experience_years >= 2.0
