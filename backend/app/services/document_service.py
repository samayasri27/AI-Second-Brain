from sqlalchemy.orm import Session
from app.db.sql_models import Document, Topic, DocTopicMap
from app.utils.parser import parse_document, chunk_text
from app.utils.groq_client import extract_topics, classify_para
from app.services.task_service import create_tasks_from_document
from app.config import get_settings
import os

settings = get_settings()


def process_document(
    db: Session,
    vector_store,
    file_path: str,
    title: str,
    doc_type: str
) -> dict:
    """
    Process uploaded document:
    1. Extract text
    2. Classify PARA
    3. Extract topics
    4. Chunk and embed
    5. Save to SQL and ChromaDB
    
    Args:
        db: Database session
        vector_store: ChromaDB collection
        file_path: Path to uploaded file
        title: Document title
        doc_type: Document type (pdf, txt, etc.)
    
    Returns:
        Dictionary with doc_id, title, para_type, topics
    """
    # 1. Extract text
    text = parse_document(file_path, doc_type)
    
    if not text:
        raise ValueError("No text extracted from document")
    
    # 2. Classify PARA
    para_type = classify_para(text, title)
    
    # 3. Extract topics
    topic_names = extract_topics(text, top_n=3)
    
    # 4. Create document in SQL
    doc = Document(
        title=title,
        type=doc_type,
        path=file_path,
        para_type=para_type,
        tags=[]
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # 5. Create/link topics
    for topic_name in topic_names:
        topic = db.query(Topic).filter(Topic.name == topic_name).first()
        if not topic:
            topic = Topic(name=topic_name, frequency_score=1.0)
            db.add(topic)
            db.commit()
            db.refresh(topic)
        else:
            topic.frequency_score += 1.0
            db.commit()
        
        # Link document to topic
        doc_topic = DocTopicMap(doc_id=doc.id, topic_id=topic.id)
        db.add(doc_topic)
    
    db.commit()
    
    # 6. Chunk text and store in ChromaDB
    chunks = chunk_text(text, settings.chunk_size, settings.chunk_overlap)
    
    if chunks:
        chunk_ids = [f"doc_{doc.id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "document_id": doc.id,
                "chunk_index": i,
                "title": title,
                "para_type": para_type
            }
            for i in range(len(chunks))
        ]
        
        vector_store.add(
            documents=chunks,
            ids=chunk_ids,
            metadatas=metadatas
        )
    
    # 7. Extract and create tasks
    create_tasks_from_document(db, text, doc.id)
    
    return {
        "doc_id": doc.id,
        "title": doc.title,
        "para_type": doc.para_type,
        "topics": topic_names
    }
