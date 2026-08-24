from abc import ABC, abstractmethod
from typing import Dict, Any
from app.schemas.pydantic_models import (
    StructuredResume, StructuredJobDescription, MatchResultResponse
)

class BaseLLMService(ABC):
    """Abstract interface for LLM operations in Smart Resume Screener."""

    @abstractmethod
    async def analyze_resume(self, raw_text: str) -> StructuredResume:
        """Extract structured candidate profile from raw resume text."""
        pass

    @abstractmethod
    async def analyze_job_description(self, raw_text: str, title: str = "", company: str = "") -> StructuredJobDescription:
        """Extract structured requirements, mandatory/preferred skills, and responsibilities from JD."""
        pass

    @abstractmethod
    async def match_candidate(
        self,
        candidate_data: StructuredResume,
        job_data: StructuredJobDescription
    ) -> Dict[str, Any]:
        """Perform semantic matching between candidate and job description."""
        pass

    @abstractmethod
    async def generate_explanation(
        self,
        candidate_data: StructuredResume,
        job_data: StructuredJobDescription,
        match_data: Dict[str, Any]
    ) -> str:
        """Generate a concise, evidence-based score justification."""
        pass
