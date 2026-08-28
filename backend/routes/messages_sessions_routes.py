from fastapi import APIRouter, Header, HTTPException
from models.chat import ChatSession, SessionUpdate
from database import chat_sessions_collection, chat_messages_collection
router = APIRouter()

@router.get("/chat/session/{session_id}/messages")
async def get_messages(session_id: str, owner_id: str = Header(..., alias="X-Chat-Browser-Id")):
    """Get all messages for a given session"""
    message_cursor = chat_messages_collection.find(
        {"session_id": session_id, "owner_id": owner_id}
    ).sort("timestamp", -1)

    messages = []
    async for message in message_cursor:
        message["_id"] = str(message["_id"])
        message["session_id"] = str(message["session_id"])
        messages.append(message)

    return {"messages": messages[::-1]}



@router.post("/chat/sessions")
async def create_session(session: ChatSession, owner_id: str = Header(..., alias="X-Chat-Browser-Id")):
    """Create a new chat session"""
    await chat_sessions_collection.insert_one({**session.dict(), "owner_id": owner_id})
    return {"message": "Session created", "session_id": session.session_id}

@router.get("/chat/sessions")
async def get_sessions(owner_id: str = Header(..., alias="X-Chat-Browser-Id")):
    """Get all chat sessions"""
    sessions_cursor = chat_sessions_collection.find({"owner_id": owner_id}).sort("timestamp", -1)
    sessions = []
    async for session in sessions_cursor:
        session["_id"] = str(session["_id"])
        sessions.append(session)
    return {"sessions": sessions}
@router.put("/chat/sessions/{session_id}")
async def update_session(session_id: str, update_data: SessionUpdate, owner_id: str = Header(..., alias="X-Chat-Browser-Id")):
    """Update a chat session's title and/or timestamp"""
    
    update_fields = {}
    if update_data.title is not None:
        update_fields["title"] = update_data.title
    if update_data.timestamp is not None:
        update_fields["timestamp"] = update_data.timestamp

    if not update_fields:
        raise HTTPException(status_code=400, detail="No data provided for update")

    result = await chat_sessions_collection.update_one(
        {"session_id": session_id, "owner_id": owner_id},
        {"$set": update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session updated", "session_id": session_id, "updated_fields": list(update_fields.keys())}

@router.delete("/chat/sessions/{session_id}")
async def delete_session(session_id: str, owner_id: str = Header(..., alias="X-Chat-Browser-Id")):
    """Delete a session and its messages"""
    await chat_sessions_collection.delete_one({"session_id": session_id, "owner_id": owner_id})
    await chat_messages_collection.delete_many({"session_id": session_id, "owner_id": owner_id})
    return {"message": "Session deleted"}
