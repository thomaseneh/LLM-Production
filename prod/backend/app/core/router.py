# import json
# from pathlib import Path

# from app.core.llm import call_llm
# from app.core.config import MODELS

# PROMPT_PATH = Path(__file__).resolve().parents[2] / "prompts" / "router.txt"

# with open(PROMPT_PATH, encoding="utf-8") as f:
#     ROUTER_PROMPT = f.read()


# def clean_json(text: str) -> str:
#     """
#     Remove Markdown code fences and trim whitespace.
#     """
#     text = text.strip()

#     # Remove ```json or ``` blocks
#     if text.startswith("```"):
#         text = text.replace("```json", "")
#         text = text.replace("```", "")
#         text = text.strip()

#     return text


# def route(user_input):

#     response = call_llm(
#         MODELS["router"],
#         [
#             {"role": "system", "content": ROUTER_PROMPT},
#             {"role": "user", "content": user_input},
#         ],
#     )

#     cleaned = clean_json(response)

#     try:
#         return json.loads(cleaned)

#     except Exception:

#         print("\n========== ROUTER ERROR ==========")
#         print("User:")
#         print(user_input)
#         print()
#         print("Raw Model Response:")
#         print(response)
#         print("==================================\n")

#         return {
#             "intents": [{"intent": "support"}],
#             "entities": {"prompt": user_input}
#         }

import json
import re
from pathlib import Path
from typing import Any

from app.core.config import MODELS
from app.core.llm import call_llm

PROMPT_PATH = Path(__file__).resolve().parents[2] / "prompts" / "router.txt"

with open(PROMPT_PATH, encoding="utf-8") as file:
    ROUTER_PROMPT = file.read()


VALID_INTENTS = {
    "support",
    "product_search",
    "weather",
    "math",
    "code",
    "summarizer",
    "reasoning",
}


def default_route(user_input: str) -> dict[str, Any]:
    """
    Return the safe fallback route.

    Reasoning is the default instead of customer support.
    """
    return {
        "intents": [
            {
                "intent": "reasoning",
                "confidence": 0.0,
            }
        ],
        "entities": {
            "prompt": user_input,
        },
    }


def clean_json(text: str) -> str:
    """
    Remove Markdown code fences and extract the first JSON object.
    """
    if not isinstance(text, str):
        return ""

    cleaned = text.strip()

    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
    )

    # Extract the first complete-looking JSON object when the model
    # includes extra text before or after the JSON.
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)

    if match:
        return match.group(0).strip()

    return cleaned


def normalize_confidence(value: Any) -> float:
    """
    Convert confidence to a value between 0.0 and 1.0.
    """
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return 0.0

    return max(0.0, min(confidence, 1.0))


def validate_router_output(
    result: Any,
    user_input: str,
) -> dict[str, Any]:
    """
    Validate and normalize the router output.

    Invalid or unsupported intents become reasoning.
    """
    if not isinstance(result, dict):
        return default_route(user_input)

    raw_intents = result.get("intents")

    if not isinstance(raw_intents, list) or not raw_intents:
        return default_route(user_input)

    normalized_intents: list[dict[str, Any]] = []

    for item in raw_intents:
        if not isinstance(item, dict):
            continue

        intent = str(item.get("intent", "")).strip().lower()
        confidence = normalize_confidence(item.get("confidence"))

        if intent not in VALID_INTENTS:
            intent = "reasoning"
            confidence = 0.0

        normalized_intents.append(
            {
                "intent": intent,
                "confidence": confidence,
            }
        )

    if not normalized_intents:
        return default_route(user_input)

    entities = result.get("entities")

    if not isinstance(entities, dict):
        entities = {}

    entities.setdefault("prompt", user_input)

    return {
        "intents": normalized_intents,
        "entities": entities,
    }


def route(user_input: str) -> dict[str, Any]:
    """
    Classify the user's message.

    Any model error, invalid JSON, missing intent, or unsupported
    intent safely defaults to reasoning.
    """
    try:
        response = call_llm(
            MODELS["router"],
            [
                {
                    "role": "system",
                    "content": ROUTER_PROMPT,
                },
                {
                    "role": "user",
                    "content": user_input,
                },
            ],
        )

        cleaned = clean_json(response)
        parsed = json.loads(cleaned)

        return validate_router_output(parsed, user_input)

    except Exception as error:
        print("\n========== ROUTER ERROR ==========")
        print("User:")
        print(user_input)
        print()
        print("Error:")
        print(error)
        print("==================================\n")

        return default_route(user_input)