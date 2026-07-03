import json
from pathlib import Path

from prod.backend.app.core.llm import call_llm
from prod.backend.app.core.config import MODELS

PROMPT_PATH = Path(__file__).resolve().parents[2] / "prompts" / "router.txt"

with open(PROMPT_PATH, encoding="utf-8") as f:
    ROUTER_PROMPT = f.read()


def route(user_input):

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

    try:
        return json.loads(response)

    except json.JSONDecodeError:

        print("\n========== ROUTER ERROR ==========")
        print("User:")
        print(user_input)
        print()
        print("Raw Model Response:")
        print(response)
        print("==================================\n")

        return {
            "intent": "support",
            "entities": {
                "prompt": user_input
            }
        }