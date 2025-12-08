from app.agents.router import route_intent
from app.agents.search_agent import search_documents
from groq import Groq
from app.config import get_settings

settings = get_settings()


def get_groq_client():
    """Get Groq client with lazy initialization"""
    return Groq(api_key=settings.groq_api_key)


def process_chat(question: str, vector_store) -> dict:
    """Process user question through router and appropriate agent"""
    intent = route_intent(question)
    
    if intent == "SEARCH":
        return search_documents(vector_store, question)
    else:
        answer = generate_general_response(question)
        return {"answer": answer, "sources": []}


def generate_general_response(question: str) -> str:
    """Generate response for general conversation"""
    prompt = f"""You are a helpful AI assistant for PersonalMind, a second brain system.
    Respond to the user's general conversation query.
    
    User: {question}
    """
    
    try:
        client = get_groq_client()
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )
        
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating response: {e}")
        return "I'm here to help! However, I encountered an error. Please try again."
