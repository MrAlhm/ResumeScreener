from app.core.config import settings
from app.llm.base import BaseLLMService
from app.llm.gemini_service import GeminiLLMService
from app.llm.demo_service import DemoLLMService

def get_llm_service() -> BaseLLMService:
    """
    Factory function to provide the configured LLM service.
    Returns GeminiLLMService if API key is present and configured,
    otherwise falls back gracefully to DemoLLMService.
    """
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5 and not settings.DEMO_MODE:
        try:
            return GeminiLLMService(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
        except Exception:
            return DemoLLMService()
    return DemoLLMService()
