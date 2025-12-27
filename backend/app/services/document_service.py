from sqlalchemy.orm import Session
from app.db.sql_models import Document, Topic, DocTopicMap
from app.utils.parser import parse_document, chunk_text
from app.utils.groq_client import extract_topics, classify_para
from app.services.task_service import create_tasks_from_document
from app.services.s3_service import s3_service
from app.config import get_settings
import os
import tempfile

settings = get_settings()


def process_document(
    db: Session,
    vector_store,
    file_path: str,
    title: str,
    doc_type: str,
    s3_key: str = None
) -> dict:
    """
    Process uploaded document:
    1. Extract text (from S3 or local file)
    2. Classify PARA
    3. Extract topics
    4. Chunk and embed
    5. Save to SQL and ChromaDB
    
    Args:
        db: Database session
        vector_store: ChromaDB collection
        file_path: Path to file (local path or S3 key)
        title: Document title
        doc_type: Document type (pdf, txt, etc.)
        s3_key: S3 object key if file is stored in S3
    
    Returns:
        Dictionary with doc_id, title, para_type, topics
    """
    temp_file_path = None
    
    try:
        # 1. Get file content for text extraction
        if s3_key and s3_service.is_available():
            # Download from S3 to temporary file for processing
            file_content = s3_service.download_file(s3_key)
            if not file_content:
                raise ValueError("Failed to download file from S3")
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{doc_type}") as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
            
            # Use temp file for text extraction
            text = parse_document(temp_file_path, doc_type)
            storage_type = "s3"
        else:
            # Use local file
            text = parse_document(file_path, doc_type)
            storage_type = "local"
        
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
            s3_key=s3_key,
            storage_type=storage_type,
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
                    "para_type": para_type,
                    "storage_type": storage_type
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
    
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
