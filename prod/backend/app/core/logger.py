def log_event(event_type, data, trace_id=None):
    print({
        "event": event_type,
        "data": data,
        "trace_id": trace_id
    })