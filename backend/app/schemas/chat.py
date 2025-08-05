# app/schemas/chat.py

from pydantic import BaseModel
from uuid import UUID

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
