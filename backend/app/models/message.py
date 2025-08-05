# app/models/message.py

from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Message(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    agent_id: UUID
    content: str
    is_user: bool
    created_at: datetime = Field(default_factory=datetime.utcnow)