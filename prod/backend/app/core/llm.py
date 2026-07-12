import json
from collections.abc import Generator

import requests

from app.core.config import BASE_URL, OPENROUTER_API_KEY


def _build_headers() -> dict[str, str]:
    if not OPENROUTER_API_KEY:
        raise RuntimeError(
            "OPENROUTER_API_KEY is missing. "
            "Add it to your .env file."
        )

    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "CartMir-LLM-Router/1.0",
    }


def call_llm(
    model: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.2,
    max_tokens: int = 2048,
) -> str:
    """
    Make a normal, non-streaming LLM request.

    Used by router.py because the router needs the full JSON response
    before it can parse the selected intent.
    """
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    response = requests.post(
        BASE_URL,
        headers=_build_headers(),
        json=payload,
        timeout=180,
    )

    response.raise_for_status()

    data = response.json()

    choices = data.get("choices", [])

    if not choices:
        raise RuntimeError(
            f"No choices returned from model: {model}"
        )

    message = choices[0].get("message", {})
    content = message.get("content")

    if not isinstance(content, str):
        raise RuntimeError(
            f"No text content returned from model: {model}"
        )

    return content


def call_llm_stream(
    model: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.2,
    max_tokens: int = 8192,
) -> Generator[str, None, None]:
    """
    Stream an LLM response one text chunk at a time.
    """
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    with requests.post(
        BASE_URL,
        headers=_build_headers(),
        json=payload,
        stream=True,
        timeout=180,
    ) as response:
        response.raise_for_status()

        for line in response.iter_lines(
            decode_unicode=True,
        ):
            if not line:
                continue

            if not line.startswith("data:"):
                continue

            data = line.removeprefix("data:").strip()

            if data == "[DONE]":
                break

            try:
                event = json.loads(data)
            except json.JSONDecodeError:
                continue

            choices = event.get("choices", [])

            if not choices:
                continue

            choice = choices[0]
            delta = choice.get("delta", {})
            content = delta.get("content")

            if isinstance(content, str) and content:
                yield content

            finish_reason = choice.get("finish_reason")

            if finish_reason:
                print(
                    "STREAM FINISH REASON:",
                    finish_reason,
                )