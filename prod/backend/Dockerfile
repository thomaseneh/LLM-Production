FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Install curl and uv.
RUN apt-get update \
    && apt-get install --no-install-recommends -y curl \
    && pip install --no-cache-dir uv \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better Docker caching.
COPY pyproject.toml ./
COPY uv.lock ./

# Install production dependencies into /app/.venv.
RUN uv sync --frozen --no-dev

# Copy the FastAPI application.
COPY prod/backend/app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]