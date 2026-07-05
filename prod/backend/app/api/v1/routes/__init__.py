from fastapi import APIRouter

from .chat import router as chat_router
from .health import router as health_router
from .products import router as products_router
from .weather import router as weather_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router, tags=["health"])
api_v1_router.include_router(chat_router, tags=["chat"])
api_v1_router.include_router(products_router, tags=["products"])
api_v1_router.include_router(weather_router, tags=["weather"])
