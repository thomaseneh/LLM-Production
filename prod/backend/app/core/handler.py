from prod.backend.app.core.router import route
from prod.backend.app.core.tools import *
from prod.backend.app.core.llm import call_llm, call_llm_stream
from prod.backend.app.core.config import MODELS
from prod.backend.app.api.v1.routes.products import products
from prod.backend.app.core.tracing import new_trace_id, add_trace_event, close_trace
from prod.backend.app.core.metrics import METRICS
from prod.backend.app.core.logger import log_event
from prod.backend.app.core.metrics import record_request, record_latency

import time


MIN_CONFIDENCE = 0.60


def handle(user_input):

    # --- TRACE ID ---
    trace_id = new_trace_id()
    add_trace_event(trace_id, "REQUEST_RECEIVED", {"user_input": user_input})
    log_event("TRACE_START", {"trace_id": trace_id})

    start_time = time.time()

    # --- ROUTE INPUT ---
    task = route(user_input)
    add_trace_event(trace_id, "ROUTER_OUTPUT", task)
    log_event("ROUTER_OUTPUT", task, trace_id)

    intents = task.get("intents", [])
    entities = task.get("entities", {})

    add_trace_event(trace_id, "ENTITIES", entities)
    log_event("ENTITIES", entities, trace_id)

    # --- MULTI-INTENT SELECTION ---
    selected_intent = None
    selected_confidence = 0.0

    for item in intents:
        conf = item.get("confidence", 0.0)
        if conf > selected_confidence:
            selected_confidence = conf
            selected_intent = item.get("intent")

    add_trace_event(trace_id, "INTENT_SELECTED", selected_intent)
    log_event("INTENT", selected_intent, trace_id)

    # --- METRICS ---
    record_request(selected_intent)

    # --- CONFIDENCE FALLBACK ---
    if selected_confidence < MIN_CONFIDENCE:
        messages = [
            {"role": "system", "content": f"TRACE_ID: {trace_id}"},
            {"role": "system", "content": "You are CartMir customer support."},
            {"role": "user", "content": user_input}
        ]

        add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["support"]})
        result = call_llm(MODELS["support"], messages)

        record_latency(time.time() - start_time)
        close_trace(trace_id)
        return result

    intent = selected_intent

    # --- PRODUCT SEARCH ---
    if intent == "product_search":
        query = entities.get("query")

        semantic_results = search_products_semantic(query)
        if semantic_results:
            messages = [
                {"role": "system", "content": f"TRACE_ID: {trace_id}"},
                {"role": "system", "content": "Present these products professionally."},
                {"role": "user", "content": str(semantic_results)}
            ]

            add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["reasoning"]})
            result = call_llm(MODELS["reasoning"], messages)

            record_latency(time.time() - start_time)
            close_trace(trace_id)
            return result

        max_price = entities.get("max_price")
        data = search_products(query, max_price)

        if not data:
            close_trace(trace_id)
            return "No matching products found."

        messages = [
            {"role": "system", "content": f"TRACE_ID: {trace_id}"},
            {"role": "system", "content": "Present these products professionally."},
            {"role": "user", "content": str(data)}
        ]

        add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["reasoning"]})
        result = call_llm(MODELS["reasoning"], messages)

        record_latency(time.time() - start_time)
        close_trace(trace_id)
        return result

    # --- WEATHER ---
    elif intent == "weather":
        location = entities.get("location")
        if not location:
            close_trace(trace_id)
            return "Error: No location provided for weather lookup."

        data = weather(location)

        messages = [
            {"role": "system", "content": f"TRACE_ID: {trace_id}"},
            {"role": "system", "content": "Explain this weather data clearly."},
            {"role": "user", "content": str(data)}
        ]

        add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["reasoning"]})
        result = call_llm(MODELS["reasoning"], messages)

        record_latency(time.time() - start_time)
        close_trace(trace_id)
        return result

    # --- MATH ---
    elif intent == "math":
        messages = [
            {"role": "system", "content": f"TRACE_ID: {trace_id}"},
            {"role": "system", "content": "Solve the math problem."},
            {"role": "user", "content": user_input}
        ]

        add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["math"]})
        result = call_llm(MODELS["math"], messages)

        record_latency(time.time() - start_time)
        close_trace(trace_id)
        return result

    # --- CODE (streaming) ---
    elif intent == "code":
        messages = [
            {"role": "system", "content": f"TRACE_ID: {trace_id}"},
            {"role": "user", "content": user_input}
        ]

        add_trace_event(trace_id, "LLM_CALL_STREAM", {"model": MODELS["code"]})
        result = call_llm_stream(MODELS["code"], messages)

        record_latency(time.time() - start_time)
        close_trace(trace_id)
        return result

    # --- SUMMARIZER (streaming) ---
    elif intent == "summarizer":
        if len(user_input.split()) < 20:
            close_trace(trace_id)
            return "Error: No article text provided for summarization."

        messages = [
            {"role": "system", "content": f"TRACE_ID: {trace_id}"},
            {"role": "system", "content": "Summarize the following text clearly and concisely."},
            {"role": "user", "content": user_input}
        ]

        add_trace_event(trace_id, "LLM_CALL_STREAM", {"model": MODELS["summarizer"]})
        result = call_llm_stream(MODELS["summarizer"], messages)

        record_latency(time.time() - start_time)
        close_trace(trace_id)
        return result

    # --- REASONING ---
    elif intent == "reasoning":

        # Hybrid routing: cheap → strong → final
        if selected_confidence < 0.75:

            add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["cheap"]})
            coarse = call_llm(MODELS["cheap"], [
                {"role": "system", "content": f"TRACE_ID: {trace_id}"},
                {"role": "user", "content": user_input}
            ])

            add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["reasoning"]})
            refined = call_llm(MODELS["reasoning"], [
                {"role": "system", "content": f"TRACE_ID: {trace_id}"},
                {"role": "user", "content": user_input}
            ])

            add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["final"]})
            result = call_llm(MODELS["final"], [
                {"role": "system", "content": "Combine these results"},
                {"role": "user", "content": f"{coarse}\n{refined}"}
            ])

            record_latency(time.time() - start_time)
            close_trace(trace_id)
            return result

        # Normal reasoning (streaming)
        messages = [
            {"role": "system", "content": f"TRACE_ID: {trace_id}"},
            {"role": "system", "content": "Provide a clear and correct explanation."},
            {"role": "user", "content": user_input}
        ]

        add_trace_event(trace_id, "LLM_CALL_STREAM", {"model": MODELS["reasoning"]})
        result = call_llm_stream(MODELS["reasoning"], messages)

        record_latency(time.time() - start_time)
        close_trace(trace_id)
        return result

    # --- SUPPORT (DEFAULT) ---
    messages = [
        {"role": "system", "content": f"TRACE_ID: {trace_id}"},
        {"role": "system", "content": "You are CartMir customer support."},
        {"role": "user", "content": user_input}
    ]

    add_trace_event(trace_id, "LLM_CALL", {"model": MODELS["support"]})
    result = call_llm(MODELS["support"], messages)

    record_latency(time.time() - start_time)
    close_trace(trace_id)
    return result


# from prod.backend.app.core.router import route
# from prod.backend.app.core.tools import *
# from prod.backend.app.core.llm import call_llm
# from prod.backend.app.core.config import MODELS

# def handle(user_input):

#     task = route(user_input)
#     intent = task.get("intent", "support")
#     entities = task.get("entities", {})
#     confidence = task.get("confidence", 1.0)

#     # PRODUCT SEARCH
#     if intent == "product_search":
#         query = entities.get("query")
#         if not query:
#             return "Error: No product query provided."

#         max_price = entities.get("max_price")
#         data = search_products(query, max_price)

#         if not data:
#             return "No matching products found."

#         return call_llm(
#             MODELS["reasoning"],
#             [
#                 {
#                     "role": "system",
#                     "content": "Present these products professionally."
#                 },
#                 {
#                     "role": "user",
#                     "content": str(data)
#                 }
#             ]
#         )

#     # WEATHER
#     elif intent == "weather":
#         location = entities.get("location")
#         if not location:
#             return "Error: No location provided for weather lookup."

#         data = weather(location)

#         return call_llm(
#             MODELS["reasoning"],
#             [
#                 {
#                     "role": "system",
#                     "content": "Explain this weather data clearly."
#                 },
#                 {
#                     "role": "user",
#                     "content": str(data)
#                 }
#             ]
#         )

#     # MATH
#     elif intent == "math":
#         return call_llm(
#             MODELS["math"],
#             [
#                 {
#                     "role": "system",
#                     "content": "Solve the math problem."
#                 },
#                 {
#                     "role": "user",
#                     "content": user_input
#                 }
#             ]
#         )

#     # CODE
#     elif intent == "code":
#         return call_llm(
#             MODELS["code"],
#             [
#                 {
#                     "role": "user",
#                     "content": user_input
#                 }
#             ]
#         )

#     # SUMMARIZER
#     elif intent == "summarizer":
#         if len(user_input.split()) < 20:
#             return "Error: No article text provided for summarization."

#         return call_llm(
#             MODELS["summarizer"],
#             [
#                 {
#                     "role": "system",
#                     "content": "Summarize the following text clearly and concisely."
#                 },
#                 {
#                     "role": "user",
#                     "content": user_input
#                 }
#             ]
#         )

#     # REASONING
#     elif intent == "reasoning":
#         return call_llm(
#             MODELS["reasoning"],
#             [
#                 {
#                     "role": "system",
#                     "content": "Provide a clear and correct explanation."
#                 },
#                 {
#                     "role": "user",
#                     "content": user_input
#                 }
#             ]
#         )

#     # SUPPORT (DEFAULT)
#     return call_llm(
#         MODELS["support"],
#         [
#             {
#                 "role": "system",
#                 "content": "You are CartMir customer support."
#             },
#             {
#                 "role": "user",
#                 "content": user_input
#             }
#         ]
#     )
