from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatMessage(BaseModel):
    message: str
    session_id: str

class ChatSession(BaseModel):
    session_id: str
    title: Optional[str] = None
    created_at: datetime = datetime.now()
    timestamp: datetime = datetime.now()
    ai_named: bool = False

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    timestamp: Optional[datetime] = None
