import json
import requests

from prod.backend.app.core.config import OPENROUTER_API_KEY
from prod.backend.app.core.config import BASE_URL


def call_llm(model, messages):

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "CartMir-LLM-Router/1.0"
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 512,
        "temperature": 0.3,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    }

    response = requests.post(
        BASE_URL,
        headers=headers,
        json=payload,
        timeout=30
    )

    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def call_llm_stream(model, messages):

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "CartMir-LLM-Router/1.0"
    }

    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "max_tokens": 512,
        "temperature": 0.3,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    }

    with requests.post(
        BASE_URL,
        headers=headers,
        json=payload,
        stream=True,
        timeout=30
    ) as response:

        response.raise_for_status()

        for line in response.iter_lines():
            if not line:
                continue

            if not line.startswith(b"data: "):
                continue

            data = line[len(b"data: "):]

            if data == b"[DONE]":
                break

            try:
                chunk = json.loads(data)
                delta = chunk["choices"][0]["delta"]
                content = delta.get("content")
                if content:
                    yield content
            except Exception:
                continue


def call_llm_fallback(models, messages):
    for m in models:
        try:
            return call_llm(m, messages)
        except Exception:
            continue
    return "All models failed."
