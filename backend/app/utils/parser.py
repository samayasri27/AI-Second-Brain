import PyPDF2
from pathlib import Path
import docx


def parse_document(file_path: str, doc_type: str) -> str:
    """
    Parse document and extract text content
    
    Args:
        file_path: Path to the document
        doc_type: Type of document (pdf, txt, etc.)
    
    Returns:
        Extracted text content
    """
    if doc_type == "pdf":
        return extract_pdf_text(file_path)
    elif doc_type in ["txt", "text", "md", "markdown"]:
        return extract_text_file(file_path)
    elif doc_type in ["doc", "docx"]:
        return extract_docx_text(file_path)
    else:
        raise ValueError(f"Unsupported document type: {doc_type}")


def extract_pdf_text(file_path: str) -> str:
    """Extract text from PDF file"""
    text = ""
    with open(file_path, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text.strip()


def extract_text_file(file_path: str) -> str:
    """Extract text from plain text file"""
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read().strip()


def extract_docx_text(file_path: str) -> str:
    """Extract text from Word document"""
    doc = docx.Document(file_path)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text.strip()


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into overlapping chunks
    
    Args:
        text: Input text to chunk
        chunk_size: Maximum characters per chunk
        overlap: Number of overlapping characters between chunks
    
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
    
    return chunks
