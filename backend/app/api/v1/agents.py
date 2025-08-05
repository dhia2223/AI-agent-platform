# app/api/v1/agents.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.agent import AgentCreate, AgentOut
from app.models.user import User
from app.models.agent import Agent

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/", response_model=list[AgentOut])
async def list_agents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all agents for the current user"""
    try:
        result = await db.execute(
            select(Agent).where(Agent.owner_id == current_user.id)
        )
        agents = result.scalars().all()
        return agents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching agents: {str(e)}"
        )

@router.post("/", response_model=AgentOut, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_in: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new agent"""
    try:
        new_agent = Agent(
            name=agent_in.name,
            description=agent_in.description,
            instructions=agent_in.instructions,
            owner_id=current_user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_agent)
        await db.commit()
        await db.refresh(new_agent)
        return new_agent
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating agent: {str(e)}"
        )

@router.get("/{agent_id}", response_model=AgentOut)
async def get_agent(
    agent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific agent by ID"""
    result = await db.execute(
        select(Agent).where(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        )
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return agent

@router.put("/{agent_id}", response_model=AgentOut)
async def update_agent(
    agent_id: UUID,
    agent_in: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing agent"""
    result = await db.execute(
        select(Agent).where(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        )
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    try:
        await db.execute(
            update(Agent)
            .where(Agent.id == agent_id)
            .values(
                name=agent_in.name,
                description=agent_in.description,
                instructions=agent_in.instructions,
                updated_at=datetime.utcnow()
            )
        )
        await db.commit()
        await db.refresh(agent)
        return agent
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating agent: {str(e)}"
        )

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an agent"""
    result = await db.execute(
        select(Agent).where(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        )
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    try:
        await db.execute(
            delete(Agent).where(Agent.id == agent_id)
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error deleting agent: {str(e)}"
        )