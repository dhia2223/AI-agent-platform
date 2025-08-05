# backend/app/api/v1/database.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from uuid import UUID
import asyncpg

router = APIRouter(prefix="/database", tags=["Database"])

class DatabaseConnection(BaseModel):
    agent_id: UUID
    db_type: str = "postgresql"
    host: str
    port: int = 5432
    database: str
    username: str
    password: str
    schema: str = "public"

@router.post("/connect")
async def connect_database(
    connection: DatabaseConnection,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test and save a database connection for an agent"""
    try:
        # Test the connection first
        conn = await asyncpg.connect(
            host=connection.host,
            port=connection.port,
            user=connection.username,
            password=connection.password,
            database=connection.database
        )
        await conn.close()
        
        # Save to database
        db_conn = DatabaseConnectionModel(
            agent_id=connection.agent_id,
            connection_string=f"postgresql://{connection.username}:{connection.password}@{connection.host}:{connection.port}/{connection.database}",
            schema=connection.schema
        )
        db.add(db_conn)
        await db.commit()
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Database connection failed: {str(e)}"
        )