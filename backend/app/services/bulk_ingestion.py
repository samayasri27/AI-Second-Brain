import os
from pathlib import Path
from sqlalchemy.orm import Session
from app.services.document_service import process_document
from app.config import get_settings

settings = get_settings()


def ingest_folder(db: Session, vector_store, folder_path: str = None) -> dict:
    """
    Ingest all documents from a folder
    
    Args:
        db: Database session
        vector_store: ChromaDB collection
        folder_path: Path to folder (uses config if not provided)
    
    Returns:
        Dictionary with ingestion statistics
    """
    if not folder_path:
        folder_path = settings.knowledge_base_folder
    
    if not folder_path or not os.path.exists(folder_path):
        raise ValueError(f"Invalid folder path: {folder_path}")
    
    folder = Path(folder_path)
    supported_extensions = ['.pdf', '.txt', '.md', '.doc', '.docx']
    
    results = {
        "total_files": 0,
        "processed": 0,
        "failed": 0,
        "skipped": 0,
        "errors": []
    }
    
    # Walk through folder and subfolders
    for file_path in folder.rglob('*'):
        if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
            results["total_files"] += 1
            
            try:
                # Check if already processed
                from app.db.sql_models import Document
                existing = db.query(Document).filter(
                    Document.path == str(file_path)
                ).first()
                
                if existing:
                    results["skipped"] += 1
                    continue
                
                # Determine document type
                doc_type = file_path.suffix.lstrip('.').lower()
                if doc_type in ['doc', 'docx']:
                    doc_type = 'docx'
                
                # Process document
                title = file_path.stem
                process_document(
                    db=db,
                    vector_store=vector_store,
                    file_path=str(file_path),
                    title=title,
                    doc_type=doc_type
                )
                
                results["processed"] += 1
                print(f"✓ Processed: {file_path.name}")
                
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "file": str(file_path),
                    "error": str(e)
                })
                print(f"✗ Failed: {file_path.name} - {str(e)}")
    
    return results


def scan_folder_preview(folder_path: str = None) -> dict:
    """
    Preview what files would be ingested without processing
    
    Args:
        folder_path: Path to folder (uses config if not provided)
    
    Returns:
        Dictionary with file counts by type
    """
    if not folder_path:
        folder_path = settings.knowledge_base_folder
    
    if not folder_path or not os.path.exists(folder_path):
        raise ValueError(f"Invalid folder path: {folder_path}")
    
    folder = Path(folder_path)
    supported_extensions = ['.pdf', '.txt', '.md', '.doc', '.docx']
    
    files_by_type = {}
    total = 0
    
    for file_path in folder.rglob('*'):
        if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
            ext = file_path.suffix.lower()
            files_by_type[ext] = files_by_type.get(ext, 0) + 1
            total += 1
    
    return {
        "total_files": total,
        "by_type": files_by_type,
        "folder_path": folder_path
    }
