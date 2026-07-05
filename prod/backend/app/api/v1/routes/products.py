from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List

from prod.backend.app.core.tools import search_products, search_products_semantic

router = APIRouter(prefix="/products")


class Product(BaseModel):
    id: str
    name: str
    price: float
    url: Optional[str] = None


class ProductSearchResponse(BaseModel):
    query: str
    results: List[Product]


@router.get("/search", response_model=ProductSearchResponse)
async def search_products_endpoint(
    q: str = Query(..., description="Search query"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
) -> ProductSearchResponse:
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    semantic = search_products_semantic(q)
    data = semantic or search_products(q, max_price)

    if not data:
        return ProductSearchResponse(query=q, results=[])

    results = [
        Product(
            id=str(item.get("id", "")),
            name=item.get("name", ""),
            price=float(item.get("price", 0.0)),
            url=item.get("url"),
        )
        for item in data
    ]

    return ProductSearchResponse(query=q, results=results)
