from pydantic import BaseModel
from datetime import datetime


class TaskResponse(BaseModel):
    id: int
    title: str
    due_date: datetime | None
    status: str
    document_id: int | None
    
    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    status: str
