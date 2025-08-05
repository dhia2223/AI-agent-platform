# backend/app/schemas/document.py

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    content_type: str
    uploaded_at: datetime

    class Config:
        orm_mode = True
