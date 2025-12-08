from pydantic import BaseModel
from datetime import datetime


class DocumentUploadResponse(BaseModel):
    doc_id: int
    title: str
    para_type: str
    topics: list[str]


class DocumentCreate(BaseModel):
    title: str
    type: str
    path: str
    tags: list[str] = []
