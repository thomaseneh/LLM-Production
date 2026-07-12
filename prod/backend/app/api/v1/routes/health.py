from fastapi import APIRouter
from pydantic import BaseModel
import time
from app.core.handler import handle

router = APIRouter(prefix="/health")


class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float


_start_time = time.time()


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        uptime_seconds=time.time() - _start_time,
    )
