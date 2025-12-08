from sqlalchemy.orm import Session
from app.db.sql_models import Document, Task, Topic
from datetime import datetime, timedelta
from groq import Groq
from app.config import get_settings

settings = get_settings()


def get_groq_client():
    """Get Groq client with lazy initialization"""
    return Groq(api_key=settings.groq_api_key)


def generate_insights(db: Session) -> list[dict]:
    """
    Generate AI-powered insights based on user's documents, tasks, and activity
    
    Returns:
        List of insight dictionaries
    """
    insights = []
    
    # Get statistics
    total_docs = db.query(Document).count()
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == "completed").count()
    pending_tasks = db.query(Task).filter(Task.status == "pending").count()
    
    # Get recent documents (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    recent_docs = db.query(Document).filter(Document.created_at >= week_ago).all()
    
    # Get top topics
    top_topics = db.query(Topic).order_by(Topic.frequency_score.desc()).limit(5).all()
    
    # Generate weekly reflection if there's activity
    if recent_docs:
        reflection = generate_weekly_reflection(recent_docs, top_topics, completed_tasks)
        if reflection:
            insights.append({
                "id": "reflection_1",
                "type": "reflection",
                "title": "Weekly Reflection",
                "content": reflection,
                "date": datetime.now().strftime("%Y-%m-%d")
            })
    
    # Generate suggestions based on patterns
    if total_docs > 0 and pending_tasks > 0:
        suggestion = generate_suggestion(db, top_topics, pending_tasks)
        if suggestion:
            insights.append({
                "id": "suggestion_1",
                "type": "suggestion",
                "title": "Suggested Action",
                "content": suggestion,
                "date": datetime.now().strftime("%Y-%m-%d")
            })
    
    # Detect patterns
    if total_docs >= 3:
        pattern = detect_learning_pattern(db, top_topics)
        if pattern:
            insights.append({
                "id": "pattern_1",
                "type": "pattern",
                "title": "Learning Pattern Detected",
                "content": pattern,
                "date": datetime.now().strftime("%Y-%m-%d")
            })
    
    # Achievement milestone
    if completed_tasks > 0:
        achievement = generate_achievement(completed_tasks, total_tasks)
        if achievement:
            insights.append({
                "id": "achievement_1",
                "type": "achievement",
                "title": "Milestone Reached",
                "content": achievement,
                "date": datetime.now().strftime("%Y-%m-%d")
            })
    
    return insights


def generate_weekly_reflection(recent_docs, top_topics, completed_tasks) -> str:
    """Generate weekly reflection using AI"""
    try:
        client = get_groq_client()
        
        topics_str = ", ".join([t.name for t in top_topics[:3]])
        docs_count = len(recent_docs)
        
        prompt = f"""Generate a brief, encouraging weekly reflection for a user based on their activity:
- Uploaded {docs_count} documents this week
- Main topics: {topics_str}
- Completed {completed_tasks} tasks

Write 2-3 sentences that:
1. Acknowledge their progress
2. Highlight their focus areas
3. Suggest a next step

Keep it personal, positive, and actionable."""
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating reflection: {e}")
        return f"This week you've been productive with {docs_count} new documents focusing on {topics_str}. Keep up the great work!"


def generate_suggestion(db: Session, top_topics, pending_tasks) -> str:
    """Generate actionable suggestion"""
    try:
        client = get_groq_client()
        
        topics_str = ", ".join([t.name for t in top_topics[:3]])
        
        prompt = f"""Generate a brief, actionable suggestion for a user based on their knowledge base:
- Main topics: {topics_str}
- Pending tasks: {pending_tasks}

Write 1-2 sentences suggesting a practical action they could take to apply their knowledge or organize their work better.

Keep it specific and actionable."""
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=100
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating suggestion: {e}")
        return f"Consider organizing your {pending_tasks} pending tasks by priority to stay focused on what matters most."


def detect_learning_pattern(db: Session, top_topics) -> str:
    """Detect and describe learning patterns"""
    if not top_topics:
        return None
    
    try:
        client = get_groq_client()
        
        topics_str = ", ".join([t.name for t in top_topics[:3]])
        
        prompt = f"""Based on a user's focus on these topics: {topics_str}

Generate a brief insight about their learning pattern or suggest how these topics connect.

Write 1-2 sentences that help them see the bigger picture or optimize their learning approach."""
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=100
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error detecting pattern: {e}")
        return f"Your focus on {topics_str} shows a clear learning direction. Consider how these topics interconnect."


def generate_achievement(completed_tasks, total_tasks) -> str:
    """Generate achievement message"""
    if completed_tasks == 0:
        return None
    
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    if completed_tasks >= 10:
        return f"Congratulations! You've completed {completed_tasks} tasks with a {completion_rate:.0f}% completion rate. Your consistency is impressive!"
    elif completed_tasks >= 5:
        return f"Great progress! You've completed {completed_tasks} tasks. Keep building this momentum!"
    else:
        return f"You've completed {completed_tasks} tasks. Every step forward counts!"
