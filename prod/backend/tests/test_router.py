import json
import pathlib

from prod.backend.app.core.router import route

PASS = 0
FAIL = 0

BASE = pathlib.Path(__file__).parent
with open(BASE / "router_tests.json", encoding="utf-8") as f:
    tests = json.load(f)

print("\nRunning Router Tests\n")

for test in tests:

    result = route(test["prompt"])
    expected = test["expected"]

    success = True

    # -------------------------
    # Intent Check
    # -------------------------

    try:
        detected_intent = result["intents"][0]["intent"]
    except Exception:
        success = False
        detected_intent = None

    if detected_intent != expected["intent"]:
        success = False

    # -------------------------
    # Entity Checks
    # -------------------------

    if "entities" in expected:

        for key, value in expected["entities"].items():

            # Missing entity key
            if key not in result.get("entities", {}):
                success = False
                continue

            # Value mismatch (case-insensitive)
            actual_value = str(result["entities"][key]).lower()
            if value.lower() not in actual_value:
                success = False

    # -------------------------
    # PASS / FAIL Reporting
    # -------------------------

    if success:
        PASS += 1
        print(f"✅ PASS - {test['name']}")
    else:
        FAIL += 1
        print(f"❌ FAIL - {test['name']}")
        print("Prompt:")
        print(test["prompt"])
        print()
        print("Expected:")
        print(expected)
        print()
        print("Actual:")
        print(result)
        print()

print("\n------------------------------")
print(f"Passed: {PASS}")
print(f"Failed: {FAIL}")
print("------------------------------")
