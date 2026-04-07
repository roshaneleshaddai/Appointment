from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from database import get_db

router = APIRouter(prefix="/api/chat", tags=["chat"])

class Message(BaseModel):
    appointment_id: str
    sender_id: str
    sender_role: str
    text: str
    timestamp: Optional[str] = None

@router.post("/")
async def send_message(message: Message, db=Depends(get_db)):
    msg_dict = message.dict()
    msg_dict['timestamp'] = datetime.now().isoformat()
    result = await db.messages.insert_one(msg_dict)
    msg_dict['id'] = str(result.inserted_id)
    msg_dict.pop('_id', None)
    return {"message": "Sent", "data": msg_dict}

@router.get("/{appointment_id}")
async def get_messages(appointment_id: str, db=Depends(get_db)):
    cursor = db.messages.find({"appointment_id": appointment_id}).sort("timestamp", 1)
    messages = []
    async for msg in cursor:
        msg["id"] = str(msg["_id"])
        del msg["_id"]
        messages.append(msg)
    return {"messages": messages}
