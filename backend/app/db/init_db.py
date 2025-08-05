# app/db/init_db.py
import logging
from sqlmodel import SQLModel
from app.db.session import async_engine
from app.models.user import User  # Import all models
from app.models.agent import Agent
from app.models.document import Document
from app.models.message import Message

logger = logging.getLogger(__name__)

async def create_db_and_tables():
    try:
        async with async_engine.begin() as conn:
            logger.info("Dropping existing tables...")
            await conn.run_sync(SQLModel.metadata.drop_all)
            logger.info("Creating fresh tables...")
            await conn.run_sync(SQLModel.metadata.create_all)
            logger.info("Tables created successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise