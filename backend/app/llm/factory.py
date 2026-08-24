from app.core.config import settings
from app.llm.base import BaseLLMService
from app.llm.gemma_service import Gemma4Service
from app.llm.gemini_service import GeminiLLMService
from app.llm.demo_service import DemoLLMService

def get_llm_service() -> BaseLLMService:
    """
    Factory function to provide the configured LLM service.
    Defaults to Gemma 4 (Google DeepMind) for ultra-low latency & thinking mode.
    Falls back gracefully to self-contained DemoLLMService.
    """
    provider = (settings.LLM_PROVIDER or "gemma4").lower()

    if provider in ["gemma", "gemma4", "gemma-4", "gemma-4-e2b", "gemma-4-12b", "built_in"]:
        model_id = "google/gemma-4-E2B-it"
        if "12b" in provider:
            model_id = "google/gemma-4-12B-it"
        elif "26b" in provider:
            model_id = "google/gemma-4-26B-A4B-it"
        elif "31b" in provider:
            model_id = "google/gemma-4-31B-it"
        return Gemma4Service(model_id=model_id, enable_thinking=True)

    if provider == "gemini" and settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        try:
            return GeminiLLMService(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
        except Exception:
            return Gemma4Service()

    return Gemma4Service()
