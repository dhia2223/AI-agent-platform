# backend/app/services/auth.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.user import User
from app.utils.hashing import hash_password, verify_password
from app.core.security import create_access_token
from datetime import timedelta
from app.core.config import settings

async def register_user(db: AsyncSession, email: str, password: str) -> User:
    normalized_email = email.lower().strip()
    result = await db.execute(select(User).where(User.email == normalized_email))
    if result.scalar_one_or_none():
        raise ValueError("User already exists")
    
    hashed_pw = hash_password(password)
    new_user = User(email=normalized_email, hashed_password=hashed_pw)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def authenticate_user(db: AsyncSession, email: str, password: str):
    result = await db.execute(select(User).where(User.email == email.lower().strip()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

async def update_user_email(db: AsyncSession, user: User, new_email: str, password: str):
    if not verify_password(password, user.hashed_password):
        raise ValueError("Invalid password")
    
    # Check if new email is already taken
    result = await db.execute(select(User).where(User.email == new_email.lower().strip()))
    if result.scalar_one_or_none():
        raise ValueError("Email already in use")
    
    user.email = new_email.lower().strip()
    await db.commit()
    await db.refresh(user)
    return user

async def update_user_password(db: AsyncSession, user: User, current_password: str, new_password: str):
    if not verify_password(current_password, user.hashed_password):
        raise ValueError("Invalid current password")
    
    if current_password == new_password:
        raise ValueError("New password must be different from current password")
    
    user.hashed_password = hash_password(new_password)
    await db.commit()
    await db.refresh(user)
    return user

def generate_user_token(user: User) -> str:
    return create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )