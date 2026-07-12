from fastapi import FastAPI

# THESE ARE THE REAL PATHS BASED ON YOUR SCREENSHOT
from app.api.v1.routes.chat import router as chat_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.products import router as products_router
from app.api.v1.routes.weather import router as weather_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(weather_router, prefix="/api/v1")

# app.include_router(chat_router)
# app.include_router(health_router)
# app.include_router(products_router)
# app.include_router(weather_router)
