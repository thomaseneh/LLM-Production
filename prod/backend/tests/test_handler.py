import json
import pathlib

from prod.backend.app.core.handler import handle

BASE = pathlib.Path(__file__).parent
with open(BASE / "test_handler.json", encoding="utf-8") as f:
    tests = json.load(f)

for test in tests:
    result = handle(test["prompt"])
    print(f"{test['name']} → {result}")

[
    {
        "name": "Weather",
        "prompt": "What's the weather in Dallas?"
    },
    {
        "name": "Products",
        "prompt": "Show me gaming laptops under $1000."
    },
    {
        "name": "Python",
        "prompt": "Write bubble sort in Python."
    },
    {
        "name": "Reasoning",
        "prompt": "Why is the ocean blue?"
    },
    {
        "name": "Summary",
        "prompt": "Summarize this article..."
    }
]