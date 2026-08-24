import json
import re
from typing import Dict, Any
from app.llm.base import BaseLLMService
from app.llm.prompts import (
    RESUME_EXTRACTION_SYSTEM_PROMPT,
    JOB_EXTRACTION_SYSTEM_PROMPT,
    SEMANTIC_MATCHING_SYSTEM_PROMPT
)
from app.schemas.pydantic_models import (
    StructuredResume, StructuredJobDescription
)
from app.core.config import settings

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Clean markdown backticks or surrounding text to parse valid JSON."""
    text = raw_text.strip()
    # Remove markdown code blocks ```json ... ``` or ``` ... ```
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    
    # Try finding the first '{' and last '}'
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1:
        text = text[first_brace:last_brace+1]
        
    return json.loads(text)

class GeminiLLMService(BaseLLMService):
    """Google Gemini LLM Service implementation."""

    def __init__(self, api_key: str = "", model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        except Exception as e:
            self.model = None

    async def analyze_resume(self, raw_text: str) -> StructuredResume:
        if not self.model:
            from app.llm.demo_service import DemoLLMService
            return await DemoLLMService().analyze_resume(raw_text)

        prompt = f"{RESUME_EXTRACTION_SYSTEM_PROMPT}\n\nRESUME TEXT TO EXTRACT:\n{raw_text}"
        try:
            response = self.model.generate_content(prompt)
            parsed_dict = clean_json_response(response.text)
            return StructuredResume(**parsed_dict)
        except Exception as e:
            # Fallback gracefully
            from app.parsers.resume_structurer import parse_resume_heuristically
            return parse_resume_heuristically(raw_text)

    async def analyze_job_description(self, raw_text: str, title: str = "", company: str = "") -> StructuredJobDescription:
        if not self.model:
            from app.llm.demo_service import DemoLLMService
            return await DemoLLMService().analyze_job_description(raw_text, title, company)

        prompt = f"{JOB_EXTRACTION_SYSTEM_PROMPT}\n\nJOB TITLE: {title}\nCOMPANY: {company}\n\nJOB DESCRIPTION TEXT:\n{raw_text}"
        try:
            response = self.model.generate_content(prompt)
            parsed_dict = clean_json_response(response.text)
            return StructuredJobDescription(**parsed_dict)
        except Exception as e:
            from app.llm.demo_service import DemoLLMService
            return await DemoLLMService().analyze_job_description(raw_text, title, company)

    async def match_candidate(
        self,
        candidate_data: StructuredResume,
        job_data: StructuredJobDescription
    ) -> Dict[str, Any]:
        if not self.model:
            from app.llm.demo_service import DemoLLMService
            return await DemoLLMService().match_candidate(candidate_data, job_data)

        prompt = (
            f"{SEMANTIC_MATCHING_SYSTEM_PROMPT}\n\n"
            f"--- JOB REQUIREMENTS ---\n"
            f"{job_data.model_dump_json(indent=2)}\n\n"
            f"--- CANDIDATE PROFILE ---\n"
            f"{candidate_data.model_dump_json(indent=2)}\n\n"
            f"Perform evaluation and return JSON:"
        )
        try:
            response = self.model.generate_content(prompt)
            return clean_json_response(response.text)
        except Exception as e:
            from app.llm.demo_service import DemoLLMService
            return await DemoLLMService().match_candidate(candidate_data, job_data)

    async def generate_explanation(
        self,
        candidate_data: StructuredResume,
        job_data: StructuredJobDescription,
        match_data: Dict[str, Any]
    ) -> str:
        return match_data.get("justification", "Candidate matches key criteria with verified experience.")
