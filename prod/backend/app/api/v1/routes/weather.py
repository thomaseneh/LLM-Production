from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.core.handler import handle
from app.core.tools import weather as weather_tool

router = APIRouter(prefix="/weather")


class WeatherResponse(BaseModel):
    location: str
    description: str
    temperature_c: Optional[float] = None
    temperature_f: Optional[float] = None


@router.get("", response_model=WeatherResponse)
async def weather_endpoint(
    location: str = Query(..., description="Location name or query"),
) -> WeatherResponse:
    if not location.strip():
        raise HTTPException(status_code=400, detail="Location cannot be empty.")

    data = weather_tool(location)
    if not data:
        raise HTTPException(status_code=404, detail="Weather data not found.")

    desc = data.get("description") or data.get("summary") or "No description"
    temp_c = data.get("temp_c")
    temp_f = data.get("temp_f")

    return WeatherResponse(
        location=location,
        description=desc,
        temperature_c=temp_c,
        temperature_f=temp_f,
    )
