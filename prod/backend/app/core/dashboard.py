from prod.backend.app.core.metrics import METRICS

def show_dashboard():
    print("=== CartMir AI Dashboard ===")
    print("Total Requests:", METRICS["requests"])
    print("Intent Counts:", METRICS["intent_counts"])
    print("Avg Latency:", sum(METRICS["latency"]) / len(METRICS["latency"]))
