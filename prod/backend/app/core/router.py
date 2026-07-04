import json
from pathlib import Path

from prod.backend.app.core.llm import call_llm
from prod.backend.app.core.config import MODELS

PROMPT_PATH = Path(__file__).resolve().parents[2] / "prompts" / "router.txt"

with open(PROMPT_PATH, encoding="utf-8") as f:
    ROUTER_PROMPT = f.read()


def clean_json(text: str) -> str:
    """
    Remove Markdown code fences and trim whitespace.
    """
    text = text.strip()

    # Remove ```json or ``` blocks
    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

    return text


def route(user_input):

    response = call_llm(
        MODELS["router"],
        [
            {"role": "system", "content": ROUTER_PROMPT},
            {"role": "user", "content": user_input},
        ],
    )

    cleaned = clean_json(response)

    try:
        return json.loads(cleaned)

    except Exception:

        print("\n========== ROUTER ERROR ==========")
        print("User:")
        print(user_input)
        print()
        print("Raw Model Response:")
        print(response)
        print("==================================\n")

        return {
            "intents": [{"intent": "support"}],
            "entities": {"prompt": user_input}
        }
