import os
import re
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings

def validate_uploaded_file(file: UploadFile) -> None:
    """Validate file extension and basic mime type security."""
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

def sanitize_text(text: str) -> str:
    """Sanitize and clean extracted text, removing null bytes and non-printable control characters."""
    if not text:
        return ""
    # Remove null bytes
    cleaned = text.replace('\x00', ' ')
    # Normalize excessive carriage returns and tabs
    cleaned = re.sub(r'[\r\f\v]', '\n', cleaned)
    # Remove excessive blank lines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()
