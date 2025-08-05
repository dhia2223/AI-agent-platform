# backend/app/schemas/agent.py
from pydantic import BaseModel, Field, validator
from uuid import UUID
from datetime import datetime

class AgentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field(
        default="A specialized AI assistant focused on provided documents",
        max_length=500
    )
    instructions: str = Field(
        default=(
            "Answer questions strictly based on provided documents. "
            "For unrelated questions, say you can't answer."
        ),
        max_length=2000
    )

    @validator('instructions')
    def validate_instructions(cls, v):
        if "unrelated" not in v.lower() and "context" not in v.lower():
            raise ValueError("Instructions must include guidance for handling unrelated questions")
        return v

class AgentOut(BaseModel):
    id: UUID
    name: str
    description: str
    instructions: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True