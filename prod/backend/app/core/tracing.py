import uuid
import time

# Global trace registry (optional)
ACTIVE_TRACES = {}


def new_trace_id():
    """
    Generate a new trace ID for each request.
    """
    trace_id = str(uuid.uuid4())
    ACTIVE_TRACES[trace_id] = {
        "created_at": time.time(),
        "events": []
    }
    return trace_id


def add_trace_event(trace_id, event_type, data):
    """
    Attach an event to a trace.
    """
    if trace_id not in ACTIVE_TRACES:
        return

    ACTIVE_TRACES[trace_id]["events"].append({
        "timestamp": time.time(),
        "event_type": event_type,
        "data": data
    })


def get_trace(trace_id):
    """
    Retrieve full trace history for debugging or logging.
    """
    return ACTIVE_TRACES.get(trace_id)


def close_trace(trace_id):
    """
    Optional: remove trace from memory after request completes.
    """
    ACTIVE_TRACES.pop(trace_id, None)
