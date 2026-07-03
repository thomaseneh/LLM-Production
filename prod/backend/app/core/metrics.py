METRICS = {
    "requests": 0,
    "intent_counts": {},
    "latency": []
}

def record_request(intent):
    METRICS["requests"] += 1
    METRICS["intent_counts"][intent] = METRICS["intent_counts"].get(intent, 0) + 1

def record_latency(ms):
    METRICS["latency"].append(ms)
