import os
import uuid
from tempfile import NamedTemporaryFile
from shutil import copyfileobj
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.utils.parser import extract_text
from app.utils.chunker import chunk_text
from app.utils.embedding import embed_chunks
from app.models.document import Document
from app.models.agent import Agent
import logging

logger = logging.getLogger(__name__)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def process_document(agent_id: str, file: UploadFile, db: AsyncSession) -> Document:
    try:
        # Verify agent exists
        result = await db.execute(select(Agent).where(Agent.id == agent_id))
        agent = result.scalar_one_or_none()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Save temporary file
        path = save_upload_temp(file)
        logger.info(f"Saved temporary file at {path}")

        # Extract and process text
        text = extract_text(path, file.content_type)
        if not text:
            raise ValueError("No text content extracted from file")
            
        chunks = chunk_text(text)
        doc_id = str(uuid.uuid4())

        # Store embeddings
        embed_chunks(chunks, doc_id=doc_id, agent_id=agent_id)

        # Create document record
        doc = Document(
            id=doc_id,
            filename=file.filename,
            content_type=file.content_type,
            agent_id=agent_id
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        
        # Clean up temp file
        try:
            os.unlink(path)
        except Exception as e:
            logger.warning(f"Failed to delete temp file {path}: {str(e)}")

        return doc
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in process_document: {str(e)}", exc_info=True)
        raise

def save_upload_temp(file: UploadFile) -> str:
    try:
        suffix = os.path.splitext(file.filename)[1]
        with NamedTemporaryFile(delete=False, dir=UPLOAD_DIR, suffix=suffix) as tmp:
            copyfileobj(file.file, tmp)
            return tmp.name
    except Exception as e:
        raise ValueError(f"Failed to save temporary file: {str(e)}")


