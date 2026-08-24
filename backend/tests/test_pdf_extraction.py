import os
import pytest
from app.parsers.pdf_extractor import extract_text_from_file

def test_extract_valid_pdf():
    sample_pdf = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "resumes", "1_aarav_sharma_ml_lead.pdf"))
    assert os.path.exists(sample_pdf), "Sample PDF should exist"
    
    with open(sample_pdf, "rb") as f:
        content = f.read()
        
    result = extract_text_from_file(content, "1_aarav_sharma_ml_lead.pdf")
    assert result["has_readable_text"] is True
    assert result["page_count"] >= 1
    assert "Aarav Sharma" in result["raw_text"]
    assert "PyTorch" in result["raw_text"]
    assert result["error"] is None

def test_extract_valid_txt():
    sample_txt = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "resumes", "1_aarav_sharma_ml_lead.txt"))
    with open(sample_txt, "rb") as f:
        content = f.read()
        
    result = extract_text_from_file(content, "1_aarav_sharma_ml_lead.txt")
    assert result["has_readable_text"] is True
    assert "Aarav Sharma" in result["raw_text"]
    assert result["extractor_used"] == "plain_text"

def test_extract_empty_file():
    result = extract_text_from_file(b"", "empty.txt")
    assert result["has_readable_text"] is False
    assert result["error"] is not None

def test_extract_invalid_extension():
    result = extract_text_from_file(b"some content", "resume.exe")
    assert result["has_readable_text"] is False
    assert "Unsupported file extension" in result["error"]
