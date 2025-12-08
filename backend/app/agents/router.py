from groq import Groq
from app.config import get_settings

settings = get_settings()

def get_groq_client():
    """Get Groq client with lazy initialization"""
    return Groq(api_key=settings.groq_api_key)


def route_intent(question: str) -> str:
    """
    Route user question to appropriate agent
    
    Returns:
        "SEARCH" - Query requires document search
        "GENERAL" - General conversation
    """
    # Quick keyword check first
    search_keywords = ["find", "search", "show me", "what", "where", "which", "list", "tell me about"]
    question_lower = question.lower()
    
    for keyword in search_keywords:
        if keyword in question_lower:
            return "SEARCH"
    
    # Use LLM for ambiguous cases
    client = get_groq_client()
    prompt = f"""Classify this user question into one category:
- SEARCH: User wants to find information from their documents
- GENERAL: General conversation or greeting

Question: {question}

Return ONLY "SEARCH" or "GENERAL", nothing else."""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=10
        )
        
        result = response.choices[0].message.content.strip().upper()
        return "SEARCH" if "SEARCH" in result else "GENERAL"
    
    except Exception as e:
        print(f"Router error: {e}")
        return "SEARCH"  # Default to search
