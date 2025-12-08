import chromadb
from app.config import get_settings

settings = get_settings()

# Initialize ChromaDB persistent client
chroma_client = chromadb.PersistentClient(
    path=settings.chroma_persist_dir
)


def get_or_create_collection():
    """Get or create the pm_chunks collection"""
    collection = chroma_client.get_or_create_collection(
        name=settings.collection_name,
        metadata={"description": "PersonalMind document chunks"}
    )
    return collection


def get_vector_store():
    """Dependency for getting vector store collection"""
    return get_or_create_collection()
