from groq import Groq
from app.config import get_settings
import json

settings = get_settings()

def get_groq_client():
    """Get Groq client with lazy initialization"""
    return Groq(api_key=settings.groq_api_key)


def extract_topics(text: str, top_n: int = 3) -> list[str]:
    """
    Extract top N topics from text using Groq
    
    Args:
        text: Document text
        top_n: Number of topics to extract
    
    Returns:
        List of topic names
    """
    prompt = f"""Analyze the following text and extract the top {top_n} main topics or themes.
Return ONLY a JSON array of topic names, nothing else.

Text: {text[:2000]}

Example output: ["Machine Learning", "Data Science", "Python"]
"""
    
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=100
        )
        
        result = response.choices[0].message.content.strip()
        topics = json.loads(result)
        return topics[:top_n]
    except Exception as e:
        print(f"Error extracting topics: {e}")
        return ["General"]


def classify_para(text: str, title: str) -> str:
    """
    Classify document into PARA category using Groq
    
    PARA categories:
    - Projects: Assignments, Personal Projects
    - Areas: Academics, Career, Health, Finance
    - Resources: Learning materials, references
    - Archives: Completed documents
    
    Args:
        text: Document text
        title: Document title
    
    Returns:
        PARA category (Projects, Areas, Resources, or Archives)
    """
    prompt = f"""Classify this document into ONE of these PARA categories:
- Projects: Active assignments, personal projects, things with deadlines
- Areas: Ongoing responsibilities (academics, career, health, finance)
- Resources: Learning materials, references, guides, documentation
- Archives: Completed or old documents

Title: {title}
Text: {text[:1500]}

Return ONLY the category name (Projects, Areas, Resources, or Archives), nothing else."""
    
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=20
        )
        
        result = response.choices[0].message.content.strip()
        
        # Validate result
        valid_categories = ["Projects", "Areas", "Resources", "Archives"]
        for category in valid_categories:
            if category.lower() in result.lower():
                return category
        
        return "Resources"  # Default fallback
    except Exception as e:
        print(f"Error classifying PARA: {e}")
        return "Resources"


def extract_tasks_stub(text: str) -> list[str]:
    """
    Stub for task extraction - will be fully implemented later
    
    Args:
        text: Document text
    
    Returns:
        List of extracted task titles
    """
    # TODO: Implement full task extraction with due dates
    return []
