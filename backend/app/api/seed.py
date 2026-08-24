from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db, Base, engine
from app.seed_data import seed_database
from app.schemas.pydantic_models import ApiResponse

router = APIRouter(prefix="/data", tags=["Data Management"])

@router.post("/clear", response_model=ApiResponse[dict])
def clear_all_data(db: Session = Depends(get_db)):
    """Wipe all tables for a completely clean real-time workspace."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return ApiResponse(
        success=True,
        data={"message": "All database records cleared. Ready for real-time resumes."},
        message="Database cleared."
    )

@router.post("/load-samples", response_model=ApiResponse[dict])
def load_sample_dataset(db: Session = Depends(get_db)):
    """Optionally load sample test dataset for evaluation."""
    seed_database(db)
    return ApiResponse(
        success=True,
        data={"message": "Sample dataset loaded successfully."},
        message="Sample dataset loaded."
    )
