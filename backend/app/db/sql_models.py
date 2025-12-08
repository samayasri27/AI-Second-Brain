from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    type = Column(Text, nullable=False)
    path = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    tags = Column(JSON, default=list)
    para_type = Column(Text, nullable=True)  # Projects, Areas, Resources, Archives
    
    # Relationships
    tasks = relationship("Task", back_populates="document")
    topics = relationship("Topic", secondary="doc_topic_map", back_populates="documents")


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    due_date = Column(DateTime, nullable=True)
    status = Column(Text, nullable=False, default="pending")
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    
    # Relationships
    document = relationship("Document", back_populates="tasks")


class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False, unique=True)
    frequency_score = Column(Float, default=0.0)
    
    # Relationships
    documents = relationship("Document", secondary="doc_topic_map", back_populates="topics")


class DocTopicMap(Base):
    __tablename__ = "doc_topic_map"
    
    doc_id = Column(Integer, ForeignKey("documents.id"), primary_key=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), primary_key=True)
