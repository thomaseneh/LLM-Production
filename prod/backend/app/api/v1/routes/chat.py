from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from prod.backend.app.core.handler import handle

router = APIRouter(prefix="/chat")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    reply = handle(payload.message)
    return ChatResponse(reply=reply)
