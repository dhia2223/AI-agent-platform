# backend/app/api/v1/analytics.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from sqlalchemy import distinct
from datetime import datetime, timedelta
from uuid import UUID

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.agent import Agent
from app.models.message import Message

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
async def get_overview_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overview analytics for all agents"""
    try:
        # Total agents
        total_agents_result = await db.execute(
            select(func.count(Agent.id))
            .where(Agent.owner_id == current_user.id)
        )
        total_agents = total_agents_result.scalar_one() or 0
        
        # Active agents (have messages in last 7 days)
        active_agents_result = await db.execute(
            select(func.count(distinct(Message.agent_id)))
            .join(Agent, Agent.id == Message.agent_id)
            .where(
                Agent.owner_id == current_user.id,
                Message.created_at >= datetime.utcnow() - timedelta(days=7)
            )
        )
        active_agents = active_agents_result.scalar_one() or 0
        
        # Queries today
        queries_today_result = await db.execute(
            select(func.count(Message.id))
            .join(Agent, Agent.id == Message.agent_id)
            .where(
                Agent.owner_id == current_user.id,
                func.date(Message.created_at) == datetime.utcnow().date()
            )
        )
        queries_today = queries_today_result.scalar_one() or 0
        
        return {
            "total_agents": total_agents,
            "active_agents": active_agents,
            "queries_today": queries_today
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching analytics: {str(e)}"
        )

@router.get("/{agent_id}")
async def get_agent_analytics(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics for a specific agent"""
    try:
        agent_result = await db.execute(
            select(Agent)
            .where(
                Agent.id == agent_id,
                Agent.owner_id == current_user.id
            )
        )
        if not agent_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Agent not found")

        # Query volume (last 7 days)
        query_volume = []
        for i in range(7):
            date = (datetime.utcnow() - timedelta(days=6-i)).date()
            count_result = await db.execute(
                select(func.count(Message.id))
                .where(
                    Message.agent_id == agent_id,
                    func.date(Message.created_at) == date
                )
            )
            query_volume.append({
                "date": date.isoformat(),
                "count": count_result.scalar_one() or 0
            })

        # Response times (last 7 days)
        response_times = []
        for i in range(7):
            date = (datetime.utcnow() - timedelta(days=6-i)).date()
            time_result = await db.execute(
                select(
                    func.avg(Message.response_time)
                )
                .where(
                    Message.agent_id == agent_id,
                    Message.response_time.is_not(None),
                    func.date(Message.created_at) == date
                )
            )
            response_times.append({
                "date": date.isoformat(),
                "avg_time": float(time_result.scalar_one() or 0)
            })

        return {
            "query_volume": query_volume,
            "response_times": response_times,
            "total_queries": sum(q["count"] for q in query_volume),
            "avg_response_time": sum(
                rt["avg_time"] for rt in response_times
            ) / max(1, len(response_times))
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching agent analytics: {str(e)}"
        )