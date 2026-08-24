import pytest
from app.database.connection import Base, engine, SessionLocal
from app.seed_data import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all tables and seed sample data once for test session."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
