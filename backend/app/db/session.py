# app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Safe defaults if settings not configured
DEBUG_MODE = getattr(settings, "DEBUG", False)
SERVERLESS_MODE = getattr(settings, "IS_SERVERLESS", False)

# Connection URL (asyncpg driver for PostgreSQL)
DATABASE_URL = (
    f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
    f"@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
)

# Async Engine Configuration
async_engine = create_async_engine(
    DATABASE_URL,
    echo=DEBUG_MODE,  # Only log SQL in debug mode
    pool_pre_ping=True,   # Checks connection health
    pool_size=20,         # Default pool size
    max_overflow=10,      # Allow temporary overflow
    pool_timeout=30,      # 30 sec timeout
    pool_recycle=3600,    # Recycle connections every hour
    pool_use_lifo=True,   # Better for FastAPI's request/response cycle
    future=True,
    # Use NullPool if running in serverless (Lambda, etc.)
    poolclass=NullPool if settings.IS_SERVERLESS else None
)

# Async Session Factory (using async_sessionmaker)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Essential for SQLModel
    autoflush=False
)

# FastAPI Dependency
async def get_db() -> AsyncSession:
    """
    Yields an async database session with automatic cleanup.
    Usage:
    ```python
    async def endpoint(db: AsyncSession = Depends(get_db)):
        # Use db...
    ```
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()  # Commit if no exceptions
        except Exception:
            await session.rollback()  # Rollback on errors
            raise
        finally:
            await session.close()  # Return connection to pool

# Sync fallback (ONLY for legacy code - avoid mixing sync/async)
def get_sync_db():
    """
    Warning: Mixing sync/async can cause deadlocks!
    Only use for:
    - CLI scripts
    - Legacy sync code
    - During migrations
    """
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    sync_url = DATABASE_URL.replace("+asyncpg", "")
    sync_engine = create_engine(
        sync_url,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )
    
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=sync_engine
    )
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()