from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.db.sql_session import SessionLocal
from app.services.task_service import get_upcoming_tasks


def check_task_reminders():
    """Check for upcoming tasks and print reminders"""
    db = SessionLocal()
    try:
        tasks = get_upcoming_tasks(db, hours=24)
        
        if tasks:
            print("\n" + "="*50)
            print("📋 TASK REMINDERS")
            print("="*50)
            for task in tasks:
                print(f"⏰ {task.title}")
                if task.due_date:
                    print(f"   Due: {task.due_date.strftime('%Y-%m-%d %H:%M')}")
                print()
            print("="*50 + "\n")
        
    finally:
        db.close()


def start_scheduler():
    """Start background scheduler for task reminders"""
    scheduler = BackgroundScheduler()
    
    # Check every hour
    scheduler.add_job(
        check_task_reminders,
        'interval',
        hours=1,
        id='task_reminder_check'
    )
    
    scheduler.start()
    print("✓ Task reminder scheduler started")
    
    return scheduler
