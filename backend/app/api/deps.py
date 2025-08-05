# backend/app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.db.session import get_db
from app.core.config import settings
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer()

class AuthError(Exception):
    """Base class for authentication errors"""
    pass

class InvalidTokenError(AuthError):
    """Raised when token validation fails"""
    pass

class UserNotFoundError(AuthError):
    """Raised when user is not found"""
    pass

async def validate_token(token: str) -> Tuple[Optional[dict], Optional[AuthError]]:
    """Validate JWT token and return payload or error"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        if not payload.get("sub"):
            raise InvalidTokenError("Missing subject in token")
        return payload, None
    except JWTError as e:
        logger.error(f"Token validation failed: {str(e)}")
        return None, InvalidTokenError("Invalid token")
    except Exception as e:
        logger.error(f"Unexpected token validation error: {str(e)}")
        return None, InvalidTokenError("Token validation error")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    
    # Validate token
    payload, err = await validate_token(token)
    if err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(err),
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    try:
        result = await db.execute(select(User).where(User.id == payload["sub"]))
        user = result.scalar_one_or_none()
        
        if not user:
            raise UserNotFoundError("User not found")
            
        return user
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Database error during user lookup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )

async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    """Dependency to verify admin privileges"""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin privileges required"
        )
    return user