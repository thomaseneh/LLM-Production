from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes.chat import router as chat_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.products import router as products_router
from app.api.v1.routes.weather import router as weather_router

app = FastAPI(
    title="Tom's AI API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://3.21.232.216",
        "http://ec2-3-21-232-216.us-east-2.compute.amazonaws.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(weather_router, prefix="/api/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "Tom's AI API",
    }