from typing import Union
import fitz  
import docx

def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    return "\n".join([page.get_text() for page in doc])

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def extract_text(file_path: str, content_type: str) -> str:
    if content_type == "application/pdf":
        return extract_text_from_pdf(file_path)
    elif content_type in ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"):
        return extract_text_from_docx(file_path)
    elif content_type == "text/plain":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError("Unsupported file type")
