# backend/app/api/v1/documents.py
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.document import DocumentResponse
from app.models.user import User
from app.services.document import process_document
from app.models.document import Document

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/agent", response_model=list[DocumentResponse])
async def get_agent_documents(
    agent_id: UUID = Query(..., alias="agent_id"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        from sqlmodel import select
        statement = select(Document).where(Document.agent_id == agent_id)
        result = await db.execute(statement)
        documents = result.scalars().all()
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    agent_id: UUID = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        doc = await process_document(str(agent_id), file, db)
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        from sqlmodel import delete
        await db.execute(delete(Document).where(Document.id == document_id))
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



