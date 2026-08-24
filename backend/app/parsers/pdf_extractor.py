import io
import re
from typing import Dict, Any, Tuple
from app.core.security import sanitize_text

class PDFExtractionError(Exception):
    pass

def extract_text_from_pdf_fitz(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text from PDF using PyMuPDF (fitz)."""
    import fitz  # PyMuPDF
    
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    num_pages = len(doc)
    
    if num_pages == 0:
        raise PDFExtractionError("PDF file contains 0 pages.")
        
    full_text = []
    for page_idx in range(num_pages):
        page = doc[page_idx]
        page_text = page.get_text("text")
        if page_text:
            full_text.append(page_text.strip())
            
    doc.close()
    combined = "\n\n".join(full_text)
    return combined, num_pages

def extract_text_from_pdf_pypdf(file_bytes: bytes) -> Tuple[str, int]:
    """Fallback extractor using pypdf."""
    import pypdf
    
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    num_pages = len(reader.pages)
    
    if num_pages == 0:
        raise PDFExtractionError("PDF contains no pages.")
        
    full_text = []
    for page in reader.pages:
        txt = page.extract_text()
        if txt:
            full_text.append(txt.strip())
            
    combined = "\n\n".join(full_text)
    return combined, num_pages

def extract_text_from_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Extract text and metadata from PDF or TXT files with fallback mechanisms.
    Returns:
        {
            "raw_text": str,
            "page_count": int,
            "extractor_used": str,
            "has_readable_text": bool,
            "error": str or None
        }
    """
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    if ext == "txt":
        try:
            # Try utf-8 first, fallback to latin-1
            try:
                text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                text = file_bytes.decode("latin-1")
            
            cleaned = sanitize_text(text)
            return {
                "raw_text": cleaned,
                "page_count": 1,
                "extractor_used": "plain_text",
                "has_readable_text": len(cleaned.strip()) > 20,
                "error": None if len(cleaned.strip()) > 20 else "Text file is empty or too short."
            }
        except Exception as e:
            return {
                "raw_text": "",
                "page_count": 0,
                "extractor_used": "plain_text",
                "has_readable_text": False,
                "error": f"Failed to decode text file: {str(e)}"
            }
            
    elif ext == "pdf":
        raw_text = ""
        pages = 0
        extractor = "none"
        error_msg = None
        
        # Try PyMuPDF
        try:
            raw_text, pages = extract_text_from_pdf_fitz(file_bytes)
            extractor = "pymupdf"
        except Exception as e1:
            # Fallback to pypdf
            try:
                raw_text, pages = extract_text_from_pdf_pypdf(file_bytes)
                extractor = "pypdf"
            except Exception as e2:
                error_msg = f"Unable to extract text from PDF. (PyMuPDF: {str(e1)}, pypdf: {str(e2)})"
        
        cleaned = sanitize_text(raw_text)
        
        # Check if text is readable or if it's a scanned/blank PDF
        if len(cleaned.strip()) < 20 and not error_msg:
            error_msg = (
                "Unable to extract readable text from this PDF. "
                "The file may be a scanned image or empty. OCR is required for scanned PDFs."
            )
            
        return {
            "raw_text": cleaned,
            "page_count": pages,
            "extractor_used": extractor,
            "has_readable_text": len(cleaned.strip()) >= 20 and error_msg is None,
            "error": error_msg
        }
    else:
        return {
            "raw_text": "",
            "page_count": 0,
            "extractor_used": "none",
            "has_readable_text": False,
            "error": f"Unsupported file extension: .{ext}"
        }
