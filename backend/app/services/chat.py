# backend/app/services/chat.py
import asyncio
import json
from typing import Optional, Callable, Awaitable
from uuid import UUID
from datetime import datetime
import time
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.prompts import PromptTemplate
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA

from app.models.user import User
from app.models.agent import Agent
from app.models.message import Message
from app.models.document import Document

logger = logging.getLogger(__name__)

async def store_message(
    db: AsyncSession,
    agent_id: UUID,
    user_id: UUID,
    content: str,
    is_user: bool,
    response_time: Optional[float] = None
) -> Message:
    """Store chat message in database with timing"""
    message = Message(
        agent_id=agent_id,
        user_id=user_id,
        content=content,
        is_user=is_user,
        response_time=response_time,
        created_at=datetime.utcnow()
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message

async def get_chat_history(db: AsyncSession, agent_id: UUID, limit: int = 5) -> list[Message]:
    """Retrieve recent chat history for an agent"""
    statement = (
        select(Message)
        .where(Message.agent_id == agent_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(statement)
    messages = result.scalars().all()
    return sorted(messages, key=lambda x: x.created_at)  # Return in chronological order


async def get_qa_chain(
    agent_id: UUID,
    db: AsyncSession,
    user_id: UUID
) -> Callable[[str], Awaitable[str]]:
    """Create and return an async QA chain with strict context enforcement"""
    try:
        agent_result = await db.execute(
            select(Agent)
            .where(Agent.id == agent_id, Agent.owner_id == user_id)
        )
        agent = agent_result.scalar_one_or_none()

        if not agent:
            raise ValueError("Agent not found or access denied")

        # Get document count to check if any documents are uploaded
        doc_count = await db.execute(
            select(func.count(Document.id))
            .where(Document.agent_id == agent_id)
        )
        has_documents = doc_count.scalar() > 0

        # Initialize vectorstore for document retrieval
        vectorstore = Chroma(
            collection_name="agent_store",
            embedding_function=OllamaEmbeddings(
                model="llama3",
                base_url="http://backend-ollama-1:11434"
            ),
        ).as_retriever(
            search_kwargs={
                "k": 5,
                "filter": {'agent_id': str(agent_id)}
            }
        )

        # Enhanced prompt template with strict context control
        prompt_template = """You are {agent_name}, a specialized AI assistant focused on provided documents.

Role Guidelines:
- Only answer questions based on the provided context
- Maintain professional yet friendly tone
- Greet users warmly but briefly when conversation starts
- Never speculate or make up answers
- If unsure, say "I don't have information about that in my documents"
- For unrelated questions: "I specialize in {agent_name}. I can help with: {agent_name}"
- Always be concise and factual
- Never role-play or switch domains
- When answering:
   - Be concise but helpful
   - Cite sources when possible
   - Use bullet points for complex information

Current conversation:
{history}

Relevant context from documents:
{context}

Question: {query}

Strictly follow these rules when responding:"""
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["agent_name", "history", "context", "query"]
        )

        llm = Ollama(
            model="llama3",
            base_url="http://backend-ollama-1:11434",
            temperature=0.2,  # Lower temperature for more focused responses
            top_p=0.85,
            top_k=40,
            repeat_penalty=1.2
        )

        async def custom_qa_chain(inputs: dict) -> str:
            """Custom chain with strict context enforcement"""
            if not has_documents:
                return ("I'm configured to answer based on documents, but no documents have been uploaded yet. "
                       "Please upload relevant documents first.")

            docs = await vectorstore.ainvoke(inputs["query"])
            if not docs:
                return "I don't have information about that in my documents."

            context = "\n\n".join(
                f"From {doc.metadata.get('filename', 'document')}:\n{doc.page_content}" 
                for doc in docs
            )

            formatted_prompt = await prompt.aformat(
                agent_name=inputs["agent_name"],
                history=inputs["history"],
                query=inputs["query"],
                context=context
            )

            response = await llm.ainvoke(formatted_prompt)
            return str(response)

        async def wrapped_chain(question: str) -> str:
            """Enhanced chain with message persistence and strict context control"""
            start_time = time.time()
            try:
                try:
                    message_data = json.loads(question)
                    query = message_data.get('query', '')
                except json.JSONDecodeError:
                    query = question

                await store_message(db, agent_id, user_id, query, True)

                history_messages = await get_chat_history(db, agent_id)
                history_str = "\n".join(
                    f"{'User' if m.is_user else 'AI'}: {m.content}"
                    for m in history_messages
                )

                inputs = {
                    "agent_name": agent.name,
                    "history": history_str,
                    "query": query
                }

                response = await custom_qa_chain(inputs)

                response_time = time.time() - start_time
                await store_message(
                    db,
                    agent_id,
                    user_id,
                    response,
                    False,
                    response_time
                )
                return response

            except Exception as e:
                await db.rollback()
                error_msg = f"Error processing question: {str(e)}"
                await store_message(
                    db,
                    agent_id,
                    user_id,
                    error_msg,
                    False,
                    time.time() - start_time
                )
                raise ValueError(error_msg) from e

        return wrapped_chain

    except Exception as e:
        logger.error(f"Error creating QA chain: {str(e)}", exc_info=True)
        raise




