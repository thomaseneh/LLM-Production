from backend.app.core.vector_store import semantic_search
from backend.app.core.data.products import products
from backend.app.core.cache import cache_get, cache_set
import requests

# -----------------------------
# SEMANTIC PRODUCT SEARCH
# -----------------------------

def search_products_semantic(query):
    return semantic_search(query)


# -----------------------------
# KEYWORD PRODUCT SEARCH
# -----------------------------

def search_products(query, max_price=None):
    """
    Simple keyword search.
    """

    if not query:
        return []

    query_words = {
        word.lower()
        for word in query.split()
        if len(word) > 1
    }

    matches = []

    for product in products:

        searchable_text = " ".join(
            [
                product["name"],
                product["category"],
                *product["tags"]
            ]
        ).lower()

        score = sum(
            word in searchable_text
            for word in query_words
        )

        if score == 0:
            continue

        if max_price is not None and product["price"] > max_price:
            continue

        matches.append({**product, "_score": score})

    matches.sort(key=lambda p: (-p["_score"], p["price"]))

    for product in matches:
        product.pop("_score")

    return matches

# -----------------------------
# WEATHER LOOKUP
# -----------------------------

# TEXAS_LOCATIONS = {
#     "dallas": (32.7767, -96.7970),
#     "houston": (29.7604, -95.3698),
#     "austin": (30.2672, -97.7431),
#     "san antonio": (29.4241, -98.4936),
#     "fort worth": (32.7555, -97.3308),
#     "plano": (33.0198, -96.6989),
#     "rockwall": (32.9312, -96.4597),
#     "arlington": (32.7357, -97.1081)
# }

def weather(location):
    """
    Production-ready weather lookup using Open-Meteo.
    Supports ANY city globally using geocoding.
    Includes caching to reduce API calls.
    """

    # --- CACHE CHECK ---
    cached = cache_get(location)
    if cached:
        return cached

    # --- Step 1: Geocode the location ---
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1"

    try:
        geo_res = requests.get(geo_url, timeout=5).json()
        results = geo_res.get("results")

        if not results:
            return {"location": location, "error": "Location not found"}

        lat = results[0]["latitude"]
        lon = results[0]["longitude"]

    except Exception as e:
        return {"location": location, "error": f"Geocoding failed: {e}"}

    # --- Step 2: Fetch weather ---
    weather_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&current_weather=true"
    )

    try:
        w_res = requests.get(weather_url, timeout=5).json()
        current = w_res.get("current_weather", {})

        result = {
            "location": location,
            "latitude": lat,
            "longitude": lon,
            "temperature": current.get("temperature"),
            "windspeed": current.get("windspeed"),
            "weathercode": current.get("weathercode"),
            "time": current.get("time")
        }

        # --- CACHE STORE ---
        cache_set(location, result)

        return result

    except Exception as e:
        return {"location": location, "error": f"Weather lookup failed: {e}"}
