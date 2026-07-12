from typing import Literal

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.handler import handle, handle_stream

router = APIRouter()


ModelMode = Literal[
    "auto",
    "reasoning",
    "code",
    "math",
    "support",
]


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=20_000,
    )
    model: ModelMode = "auto"


@router.post("/chat")
def chat(request: ChatRequest):
    reply = handle(
        user_input=request.message,
        selected_model=request.model,
    )

    return {
        "reply": reply,
    }


@router.post("/chat/stream")
def chat_stream(request: ChatRequest):
    return StreamingResponse(
        handle_stream(
            user_input=request.message,
            selected_model=request.model,
        ),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )