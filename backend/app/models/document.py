# app/models/document.py
from sqlmodel import SQLModel, Field
from uuid import uuid4, UUID
from datetime import datetime

class Document(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    agent_id: UUID
    filename: str
    content_type: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)




