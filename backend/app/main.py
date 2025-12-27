from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.sql_session import init_db, get_db
from app.db.vector_store import get_or_create_collection, get_vector_store
from app.schemas.document import DocumentUploadResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.task import TaskResponse, TaskUpdate
from app.services.document_service import process_document
from app.services.chat_service import process_chat
from app.services.task_service import get_all_tasks, update_task_status
from app.services.bulk_ingestion import ingest_folder, scan_folder_preview
from app.services.s3_service import s3_service
from app.utils.scheduler import start_scheduler
from app.db.sql_models import Document, Topic
import os
import shutil
import tempfile
from pathlib import Path
from datetime import datetime
import uuid

app = FastAPI(
    title="PersonalMind API",
    description="AI-powered Second Brain backend",
    version="0.1.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  
        "http://localhost:3000",  
        "https://ai-second-brain-eight.vercel.app",  
        "https://*.vercel.app",   
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Global scheduler reference
scheduler = None


@app.on_event("startup")
def startup_event():
    """Initialize databases and scheduler on startup"""
    global scheduler
    
    # Initialize SQL database
    init_db()
    # Initialize ChromaDB collection
    get_or_create_collection()
    # Start task reminder scheduler
    scheduler = start_scheduler()
    
    print("✓ Databases initialized")


@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown"""
    global scheduler
    if scheduler:
        scheduler.shutdown()
        print("✓ Scheduler stopped")


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to PersonalMind API",
        "docs": "/docs",
        "health": "/health"
    }


@app.post("/upload_doc", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    db: Session = Depends(get_db),
    vector_store = Depends(get_vector_store)
):
    """
    Upload and process a document
    
    - Uploads file to S3 (or local storage as fallback)
    - Extracts text from PDF or text files
    - Classifies into PARA category
    - Extracts top 3 topics
    - Chunks and embeds into ChromaDB
    - Saves metadata to SQL
    
    Returns document ID, title, PARA type, and topics
    """
    # Determine file type
    file_extension = file.filename.split(".")[-1].lower()
    
    if file_extension not in ["pdf", "txt", "md", "text"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file_extension}. Supported: pdf, txt, md"
        )
    
    # Use filename as title if not provided
    if not title:
        title = file.filename.rsplit(".", 1)[0]
    
    # Generate unique filename to avoid conflicts
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    
    # Try to upload to S3 first, fallback to local storage
    file_path = None
    s3_key = None
    temp_file_path = None
    
    try:
        # Create temporary file for processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            temp_file_path = temp_file.name
            shutil.copyfileobj(file.file, temp_file)
        
        # Try S3 upload
        if s3_service.is_available():
            s3_key = f"documents/{unique_filename}"
            
            # Reset file position and upload to S3
            with open(temp_file_path, "rb") as f:
                if s3_service.upload_file(f, s3_key, file.content_type):
                    file_path = s3_key  # Use S3 key as file path
                    print(f"File uploaded to S3: {s3_key}")
                else:
                    raise Exception("Failed to upload to S3")
        else:
            # Fallback to local storage
            local_file_path = UPLOAD_DIR / unique_filename
            shutil.move(temp_file_path, local_file_path)
            file_path = str(local_file_path)
            temp_file_path = None  # Don't delete since we moved it
            print(f"File saved locally: {file_path}")
        
        # Process document (the process_document function will handle both S3 and local paths)
        result = process_document(
            db=db,
            vector_store=vector_store,
            file_path=file_path,
            title=title,
            doc_type=file_extension,
            s3_key=s3_key  # Pass S3 key for future reference
        )
        
        return DocumentUploadResponse(**result)
    
    except Exception as e:
        # Clean up on error
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        if s3_key and s3_service.is_available():
            s3_service.delete_file(s3_key)
        elif file_path and file_path.startswith(str(UPLOAD_DIR)) and os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")
    
    finally:
        # Clean up temp file if it still exists
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@app.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    vector_store = Depends(get_vector_store)
):
    """
    Ask a question - uses RAG for search queries or general conversation
    
    - Routes intent (search vs general)
    - For search: retrieves relevant chunks and generates answer
    - Returns answer with source document IDs
    """
    try:
        result = process_chat(request.question, vector_store)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")


@app.get("/tasks", response_model=list[TaskResponse])
async def list_tasks(db: Session = Depends(get_db)):
    """
    Get all tasks
    
    Returns list of tasks with their status and due dates
    """
    tasks = get_all_tasks(db)
    return tasks


@app.patch("/task/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    update: TaskUpdate,
    db: Session = Depends(get_db)
):
    """
    Update task status
    
    Toggle between 'pending' and 'completed'
    """
    task = update_task_status(db, task_id, update.status)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task


@app.get("/documents")
async def list_documents(db: Session = Depends(get_db)):
    """
    Get all documents with their metadata
    
    Returns list of documents organized by PARA category
    """
    docs = db.query(Document).all()
    
    return [{
        "id": doc.id,
        "name": doc.title,
        "type": doc.type,
        "category": doc.para_type.lower() if doc.para_type else "resources",
        "uploadedAt": doc.created_at.strftime("%Y-%m-%d") if doc.created_at else "",
        "path": doc.path,
        "tags": doc.tags or []
    } for doc in docs]


@app.get("/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics
    
    Returns counts and recent activity
    """
    from app.db.sql_models import Task
    
    total_docs = db.query(Document).count()
    total_tasks = db.query(Task).count()
    
    # Upcoming deadlines (next 7 days)
    from datetime import timedelta
    upcoming_cutoff = datetime.now() + timedelta(days=7)
    upcoming_deadlines = db.query(Task).filter(
        Task.due_date.isnot(None),
        Task.due_date <= upcoming_cutoff,
        Task.due_date >= datetime.now(),
        Task.status == "pending"
    ).count()
    
    # Recent topics
    recent_topics = db.query(Topic).order_by(Topic.frequency_score.desc()).limit(4).all()
    
    # Recent activities
    recent_docs = db.query(Document).order_by(Document.created_at.desc()).limit(5).all()
    activities = [{
        "id": str(doc.id),
        "type": "upload",
        "title": doc.title,
        "timestamp": doc.created_at.strftime("%Y-%m-%d %H:%M") if doc.created_at else "",
        "description": f"Added to {doc.para_type or 'Resources'}"
    } for doc in recent_docs]
    
    return {
        "stats": {
            "totalDocs": total_docs,
            "totalTasks": total_tasks,
            "upcomingDeadlines": upcoming_deadlines,
            "recentTopics": [t.name for t in recent_topics]
        },
        "activities": activities
    }


@app.post("/ingest/folder")
async def ingest_knowledge_folder(
    folder_path: str = Form(None),
    db: Session = Depends(get_db),
    vector_store = Depends(get_vector_store)
):
    """
    Ingest all documents from a local folder
    
    Processes PDF, TXT, MD, DOC, DOCX files recursively
    """
    try:
        results = ingest_folder(db, vector_store, folder_path)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ingest/preview")
async def preview_folder_ingestion(folder_path: str = None):
    """
    Preview what files would be ingested from folder
    
    Returns file counts without processing
    """
    try:
        preview = scan_folder_preview(folder_path)
        return preview
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/insights")
async def get_insights(db: Session = Depends(get_db)):
    """
    Get AI-generated insights based on user activity
    
    Returns personalized reflections, suggestions, patterns, and achievements
    """
    try:
        from app.services.insights_service import generate_insights
        insights = generate_insights(db)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")
