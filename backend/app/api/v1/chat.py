# #app/api/v1/chat.py

import asyncio
from asyncio.log import logger
import logging
from fastapi import APIRouter, Depends, status , WebSocket, WebSocketDisconnect, Query
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from jose import JWTError, jwt
from datetime import datetime
import time
from typing import Optional, Callable, Awaitable
from uuid import UUID
from collections import defaultdict

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import get_qa_chain
from app.models.user import User
from app.models.message import Message
from app.models.agent import Agent
from app.core.config import settings




router = APIRouter(prefix="/chat", tags=["Chat"])

logger = logging.getLogger(__name__)
active_connections = defaultdict(dict)
MAX_CONNECTIONS_PER_USER = 5

async def validate_websocket_token(token: str, db: AsyncSession) -> Optional[User]:
    """Validate JWT token for WebSocket connections"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None

        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    except JWTError:
        return None

@router.websocket("/{agent_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    agent_id: UUID,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    await websocket.accept()
    logger.info(f"WebSocket connection opened for agent {agent_id}")

    try:
        user = await validate_websocket_token(token, db)
        if not user:
            logger.warning("Invalid token, closing connection")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        agent = await db.execute(
            select(Agent)
            .where(Agent.id == agent_id, Agent.owner_id == user.id)
        )
        agent = agent.scalar_one_or_none()

        if not agent:
            logger.warning(f"Agent {agent_id} not found or access denied")
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Agent not found"
            )
            return

        logger.info(f"WebSocket authenticated for user {user.id} and agent {agent_id}")

        qa_chain = await get_qa_chain(agent_id, db, user.id)
        last_ping = time.time()

        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30)
                
                if data == "ping":
                    await websocket.send_text("pong")
                    last_ping = time.time()
                    continue
                
                # Process the message
                response = await qa_chain(data)
                await websocket.send_text(response)

            except asyncio.TimeoutError:
                if time.time() - last_ping > 25:
                    try:
                        await websocket.send_text("ping")
                        last_ping = time.time()
                    except:
                        break
                continue

            except WebSocketDisconnect:
                logger.info("Client disconnected normally")
                break

            except Exception as e:
                logger.error(f"WebSocket error: {str(e)}", exc_info=True)
                try:
                    await websocket.send_text(f"Error: {str(e)}")
                except:
                    break
                continue

    except Exception as e:
        logger.error(f"WebSocket setup failed: {str(e)}", exc_info=True)
    finally:
        try:
            await websocket.close()
        except:
            pass
        logger.info("WebSocket connection closed")