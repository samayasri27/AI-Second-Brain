from sqlalchemy.orm import Session
from app.db.sql_models import Task
from app.agents.task_agent import extract_tasks


def create_tasks_from_document(db: Session, text: str, document_id: int) -> list[Task]:
    """
    Extract and create tasks from document text
    """
    tasks_data = extract_tasks(text, document_id)
    
    tasks = []
    for task_data in tasks_data:
        task = Task(**task_data)
        db.add(task)
        tasks.append(task)
    
    db.commit()
    return tasks


def get_all_tasks(db: Session) -> list[Task]:
    """Get all tasks"""
    return db.query(Task).all()


def update_task_status(db: Session, task_id: int, status: str) -> Task:
    """Update task status"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        task.status = status
        db.commit()
        db.refresh(task)
    return task


def get_upcoming_tasks(db: Session, hours: int = 24) -> list[Task]:
    """Get tasks due within specified hours"""
    from datetime import datetime, timedelta
    
    cutoff = datetime.now() + timedelta(hours=hours)
    
    return db.query(Task).filter(
        Task.due_date.isnot(None),
        Task.due_date <= cutoff,
        Task.due_date >= datetime.now(),
        Task.status == "pending"
    ).all()
