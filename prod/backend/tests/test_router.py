import json
import pathlib

from prod.backend.app.core.router import route

PASS = 0
FAIL = 0

BASE = pathlib.Path(__file__).parent
with open(BASE / "router_tests.json", encoding="utf-8") as f:
    tests = json.load(f)

print("\nRunning Router Tests\n")

def normalize(v):
    """Normalize values for comparison."""
    if isinstance(v, str) and v.startswith("$"):
        return v.replace("$", "")
    return v

for test in tests:

    result = route(test["prompt"])
    expected = test["expected"]

    success = True

    # -------------------------
    # Intent Check
    # -------------------------

    try:
        detected_intent = result["intents"][0]["intent"]
        expected_intent = expected["intents"][0]["intent"]
    except Exception:
        success = False
        detected_intent = None
        expected_intent = None

    if detected_intent != expected_intent:
        success = False

    # -------------------------
    # Entity Checks (flexible)
    # -------------------------

    if "entities" in expected:
        for key, value in expected["entities"].items():

            # If key exists directly
            if key in result["entities"]:
                actual = normalize(result["entities"][key])
                if str(actual).lower() != str(value).lower():
                    success = False
                continue

            # If key does NOT exist, try flexible matching
            found_match = False

            # Search inside nested structures
            for actual_key, actual_value in result["entities"].items():

                # Normalize
                actual_value_norm = normalize(actual_value)

                # Case 1: list of numbers
                if isinstance(actual_value_norm, list):
                    if str(value).lower() in str(actual_value_norm).lower():
                        found_match = True
                        break

                # Case 2: nested dicts
                if isinstance(actual_value_norm, dict):
                    if str(value).lower() in str(actual_value_norm).lower():
                        found_match = True
                        break

                # Case 3: simple value
                if str(value).lower() in str(actual_value_norm).lower():
                    found_match = True
                    break

            if not found_match:
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
