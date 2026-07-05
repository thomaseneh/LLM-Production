from fastapi import FastAPI
from api.v1.routes import api_v1_router

app = FastAPI(
    title="CartMir Public API",
    version="1.0.0",
)

app.include_router(api_v1_router)
