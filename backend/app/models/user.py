# backend/app/models/user.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from uuid import uuid4, UUID
from datetime import datetime

if TYPE_CHECKING:
    from app.models.agent import Agent  # type: ignore

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    agents: Optional[List["Agent"]] = Relationship(back_populates="owner")

    def verify_password(self, password: str) -> bool:
        from app.utils.hashing import verify_password
        return verify_password(password, self.hashed_password)