# backend/app/models/agent.py
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Agent(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    description: str = "A specialized AI assistant focused on provided documents"
    instructions: str = (
        "You are a helpful AI assistant that answers questions strictly based on the provided documents. "
        "If a question is unrelated to the documents, respond with: "
        "\"I'm sorry, I can only answer questions related to the documents I was trained on.\" "
        "Never make up answers or speculate beyond the document content. "
        "When answering, always cite which document the information came from."
    )
    owner_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner: Optional["User"] = Relationship(back_populates="agents")