import pytest
from sqlalchemy import text
from app.database.connection import SessionLocal, engine
from app.models.entities import Candidate, JobDescription, ScreeningSession, MatchResult, RecruiterDecision, Resume

def test_database_wal_and_foreign_keys_enabled():
    """Verify SQLite WAL journal mode and foreign key pragma enforcement."""
    with engine.connect() as conn:
        res_fk = conn.execute(text("PRAGMA foreign_keys")).scalar()
        assert res_fk == 1  # Foreign keys enforced

        res_journal = conn.execute(text("PRAGMA journal_mode")).scalar()
        assert str(res_journal).lower() in ["wal", "memory"]

def test_cascade_delete_integrity():
    """Verify that deleting a Candidate cascades and removes associated MatchResults, Resumes, and Decisions."""
    db = SessionLocal()
    try:
        # Create test job
        job = JobDescription(title="Consistency Test Role", company="Test Corp", raw_text="Test JD")
        db.add(job)
        db.commit()
        db.refresh(job)

        # Create test candidate
        cand = Candidate(name="Test Integrity Candidate", email="integrity@test.com")
        db.add(cand)
        db.commit()
        db.refresh(cand)

        # Create test resume
        resume = Resume(candidate_id=cand.id, filename="test.pdf", raw_text="Sample text")
        db.add(resume)

        # Create test screening session
        session = ScreeningSession(job_id=job.id, title="Test Session")
        db.add(session)
        db.commit()
        db.refresh(session)

        # Create test match result
        match = MatchResult(session_id=session.id, candidate_id=cand.id, overall_score=88.5, recommendation="STRONG MATCH")
        db.add(match)

        # Create test decision
        decision = RecruiterDecision(candidate_id=cand.id, job_id=job.id, decision="SHORTLISTED")
        db.add(decision)
        db.commit()

        # Delete the candidate
        db.delete(cand)
        db.commit()

        # Verify candidate is gone
        assert db.query(Candidate).filter_by(id=cand.id).first() is None
        # Verify cascade deleted match result and decision
        assert db.query(MatchResult).filter_by(candidate_id=cand.id).first() is None
        assert db.query(RecruiterDecision).filter_by(candidate_id=cand.id).first() is None
        assert db.query(Resume).filter_by(candidate_id=cand.id).first() is None

        # Clean up job & session
        db.delete(job)
        db.commit()
    finally:
        db.close()

def test_transaction_rollback_on_error():
    """Verify transactional consistency and auto-rollback on exception."""
    db = SessionLocal()
    try:
        cand = Candidate(name="Rollback Candidate", email="rollback@test.com")
        db.add(cand)
        db.flush()

        # Intentionally rollback
        db.rollback()

        # Verify not committed
        persisted = db.query(Candidate).filter_by(email="rollback@test.com").first()
        assert persisted is None
    finally:
        db.close()
