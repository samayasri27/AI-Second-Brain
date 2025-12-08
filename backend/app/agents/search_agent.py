from groq import Groq
from app.config import get_settings

settings = get_settings()

def get_groq_client():
    """Get Groq client with lazy initialization"""
    return Groq(api_key=settings.groq_api_key)


def search_documents(vector_store, question: str, top_k: int = 5) -> dict:
    """
    Search documents using vector similarity and generate answer
    
    Args:
        vector_store: ChromaDB collection
        question: User question
        top_k: Number of chunks to retrieve
    
    Returns:
        Dictionary with answer and source document IDs
    """
    # Query vector store
    results = vector_store.query(
        query_texts=[question],
        n_results=top_k
    )
    
    if not results["documents"] or not results["documents"][0]:
        return {
            "answer": "I couldn't find any relevant information in your documents.",
            "sources": []
        }
    
    # Extract chunks and metadata
    chunks = results["documents"][0]
    metadatas = results["metadatas"][0]
    
    # Build context from retrieved chunks
    context = "\n\n".join([f"[Chunk {i+1}]: {chunk}" for i, chunk in enumerate(chunks)])
    
    # Extract unique document IDs
    doc_ids = list(set([meta["document_id"] for meta in metadatas]))
    
    # Generate answer using RAG
    answer = generate_rag_answer(question, context)
    
    return {
        "answer": answer,
        "sources": doc_ids
    }


def generate_rag_answer(question: str, context: str) -> str:
    """
    Generate answer using retrieved context
    
    Args:
        question: User question
        context: Retrieved document chunks
    
    Returns:
        Generated answer
    """
    prompt = f"""You are a helpful AI assistant for PersonalMind, a second brain system.
Use the following context from the user's documents to answer their question.
If the context doesn't contain relevant information, say so.

Context:
{context}

Question: {question}

Answer:"""
    
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=500
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"RAG generation error: {e}")
        return "I encountered an error generating the answer. Please try again."
