import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_dashboard_analytics():
    response = client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert "total_candidates" in data
    assert data["total_candidates"] >= 5
    assert data["average_match_score"] > 0

def test_list_jobs():
    response = client.get("/api/jobs")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert len(res_json["data"]) >= 1
    job = res_json["data"][0]
    assert "title" in job
    assert "company" in job

def test_list_candidates():
    response = client.get("/api/candidates")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert len(res_json["data"]) >= 5
    names = [c["name"] for c in res_json["data"]]
    assert "Aarav Sharma" in names
    assert "Priya Reddy" in names

def test_candidate_detail():
    response = client.get("/api/candidates/1")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    cand = res_json["data"]
    assert cand["name"] == "Aarav Sharma"
    assert cand["total_experience_years"] >= 4.0

def test_recruiter_decision_workflow():
    # Set to SHORTLISTED
    resp = client.post(
        "/api/candidates/1/decision?job_id=1",
        json={"decision": "SHORTLISTED", "notes": "Impressive candidate background"}
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["decision"] == "SHORTLISTED"
    assert data["notes"] == "Impressive candidate background"

    # Set to REVIEW
    resp2 = client.post(
        "/api/candidates/2/decision?job_id=1",
        json={"decision": "REVIEW", "notes": "Need to verify cloud experience"}
    )
    assert resp2.status_code == 200
    assert resp2.json()["data"]["decision"] == "REVIEW"

def test_screening_run():
    # Screen candidates on job 1
    resp = client.post(
        "/api/screening/run",
        json={"job_id": 1, "candidate_ids": [1, 2, 3, 4, 5]}
    )
    assert resp.status_code == 200
    res_json = resp.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert data["status"] == "COMPLETED"
    assert len(data["results"]) == 5
    # Verify ranked order: first candidate score >= last candidate score
    first_score = data["results"][0]["overall_score"]
    last_score = data["results"][-1]["overall_score"]
    assert first_score >= last_score
    assert first_score >= 85.0

def test_ats_compatibility_endpoint():
    resp = client.post(
        "/api/screening/ats-check",
        json={
            "resume_text": "Experienced Python Backend Engineer with 4 years building FastAPI and PostgreSQL APIs.",
            "job_text": "Looking for Python Engineer with 3+ years experience in FastAPI and PostgreSQL.",
            "target_role": "Backend Engineer"
        }
    )
    assert resp.status_code == 200
    res_json = resp.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert "ats_score" in data
    assert data["ats_score"] > 60.0
    assert "grade" in data
    assert "sections_audit" in data
    assert "actionable_tips" in data
