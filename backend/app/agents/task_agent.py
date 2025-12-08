from groq import Groq
from app.config import get_settings
from app.utils.date_extract import extract_first_date
import json

settings = get_settings()

def get_groq_client():
    """Get Groq client with lazy initialization"""
    return Groq(api_key=settings.groq_api_key)


def extract_tasks(text: str, document_id: int) -> list[dict]:
    """
    Extract tasks from document text
    
    Args:
        text: Document text
        document_id: ID of source document
    
    Returns:
        List of task dictionaries with title, due_date, status
    """
    prompt = f"""Extract all tasks, action items, TODOs, and assignments from this text.
For each task, identify:
1. Task title/description
2. Due date (if mentioned)

Return a JSON array of tasks. If no tasks found, return empty array [].

Text: {text[:3000]}

Example output:
[
  {{"title": "Complete assignment", "due_date_text": "December 10"}},
  {{"title": "Review chapter 5", "due_date_text": null}}
]

Return ONLY the JSON array, nothing else."""
    
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500
        )
        
        result = response.choices[0].message.content.strip()
        
        # Clean up the response - remove markdown code blocks if present
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
        result = result.strip()
        
        # Fix common JSON issues
        # Replace unquoted null with quoted "null"
        result = result.replace(': null', ': "null"')
        result = result.replace(':null', ': "null"')
        
        # Parse JSON response
        tasks_raw = json.loads(result)
        
        # Handle case where response is not a list
        if not isinstance(tasks_raw, list):
            return []
        
        # Process tasks and extract dates
        tasks = []
        for task_raw in tasks_raw:
            if not isinstance(task_raw, dict):
                continue
                
            title = task_raw.get("title", "").strip()
            if not title:
                continue
            
            # Extract due date
            due_date = None
            due_date_text = task_raw.get("due_date_text")
            if due_date_text:
                due_date = extract_first_date(due_date_text)
            
            tasks.append({
                "title": title,
                "due_date": due_date,
                "status": "pending",
                "document_id": document_id
            })
        
        return tasks
    
    except json.JSONDecodeError as e:
        print(f"Task extraction JSON error: {e}")
        print(f"Response was: {result[:200] if 'result' in locals() else 'No response'}")
        return []
    except Exception as e:
        print(f"Task extraction error: {e}")
        return []
