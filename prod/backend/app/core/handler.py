import time
from collections.abc import Generator
from typing import Any

from app.core.config import DEFAULT_MODEL_KEY, MODELS
from app.core.llm import call_llm_stream
from app.core.logger import log_event
from app.core.metrics import record_latency, record_request
from app.core.router import route
from app.core.tools import (
    search_products,
    search_products_semantic,
    weather,
)
from app.core.tracing import (
    add_trace_event,
    close_trace,
    new_trace_id,
)


MIN_CONFIDENCE = 0.60
MIN_SUPPORT_CONFIDENCE = 0.80

ALLOWED_MODEL_MODES = {
    "auto",
    "reasoning",
    "code",
    "math",
    "support",
}


GENERAL_SYSTEM_PROMPT = """
You are Tom's AI, a helpful general-purpose AI assistant.

Answer the user's question directly and accurately.

Formatting rules:
- Use clean Markdown.
- Use short paragraphs.
- Put each list item on its own line.
- Use headings when the answer has multiple sections.
- Use bullet points or numbered lists when helpful.
- Use fenced code blocks for code.
- Do not place the entire response in one large paragraph.
- Do not output raw HTML.
""".strip()


SUPPORT_SYSTEM_PROMPT = """
You are CartMir customer support.

Help with customer-service topics such as:
- Orders
- Shipping
- Returns
- Refunds
- Cancellations
- Account problems
- Product assistance

Formatting rules:
- Use clean Markdown.
- Be concise and helpful.
- Ask for missing order details when necessary.
- Do not invent order or customer information.
""".strip()


PRODUCT_SYSTEM_PROMPT = """
You are a product assistant.

Present only the relevant products from the provided search results.

Formatting rules:
- Use clean Markdown.
- Do not dump raw Python objects or raw database records.
- Start with a direct answer to the user's question.
- Use a Markdown table when comparing multiple products.
- Include useful fields such as name, price, category, availability,
  and key features.
- Do not invent missing product information.
- Keep the response concise.
""".strip()


WEATHER_SYSTEM_PROMPT = """
You are a weather assistant.

Explain the provided weather data clearly.

Formatting rules:
- Use clean Markdown.
- Include the location.
- Include current conditions and temperature when available.
- Include relevant forecast information when available.
- Do not invent information that is not present in the weather data.
""".strip()


MATH_SYSTEM_PROMPT = """
You are an expert mathematics assistant.

Solve the mathematical problem accurately.

Formatting rules:
- Use clean Markdown.
- Show the important steps.
- Use readable mathematical notation.
- Clearly identify the final answer.
""".strip()


CODE_SYSTEM_PROMPT = """
You are an expert software engineering assistant.

Provide correct, practical, complete, and maintainable code.

Formatting rules:
- Use clean Markdown.
- Put code inside fenced code blocks.
- Include the programming language in each code fence.
- Always complete every code block.
- Never stop in the middle of a statement.
- Prioritize completing the code before explaining it.
- Keep explanations concise.
""".strip()


SUMMARY_SYSTEM_PROMPT = """
Summarize the provided text clearly and concisely.

Formatting rules:
- Use clean Markdown.
- Preserve important facts.
- Remove repetition.
- Use bullet points when they improve readability.
""".strip()


def normalize_confidence(value: Any) -> float:
    """
    Convert a confidence value into a number between 0.0 and 1.0.
    """
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return 0.0

    return max(0.0, min(confidence, 1.0))


def normalize_query(
    entities: dict[str, Any],
    user_input: str,
) -> str:
    """
    Extract a useful product query from router entities.
    """
    query = (
        entities.get("product")
        or entities.get("product_type")
        or entities.get("prompt")
        or user_input
    )

    return str(query).strip()


def select_intent(
    task: dict[str, Any],
) -> tuple[str, float]:
    """
    Select the highest-confidence intent.

    Reasoning is the safe default.
    """
    intents = task.get("intents", [])

    if not isinstance(intents, list):
        return DEFAULT_MODEL_KEY, 0.0

    selected_intent = DEFAULT_MODEL_KEY
    selected_confidence = 0.0

    for item in intents:
        if not isinstance(item, dict):
            continue

        intent = str(
            item.get("intent", "")
        ).strip().lower()

        confidence = normalize_confidence(
            item.get("confidence")
        )

        if confidence > selected_confidence:
            selected_intent = intent
            selected_confidence = confidence

    valid_intents = {
        "support",
        "product_search",
        "weather",
        "math",
        "code",
        "summarizer",
        "reasoning",
    }

    if selected_intent not in valid_intents:
        return DEFAULT_MODEL_KEY, 0.0

    return selected_intent, selected_confidence


def get_prompt_for_intent(intent: str) -> str:
    """
    Return the system prompt associated with an intent.
    """
    prompts = {
        "reasoning": GENERAL_SYSTEM_PROMPT,
        "code": CODE_SYSTEM_PROMPT,
        "math": MATH_SYSTEM_PROMPT,
        "support": SUPPORT_SYSTEM_PROMPT,
        "summarizer": SUMMARY_SYSTEM_PROMPT,
    }

    return prompts.get(
        intent,
        GENERAL_SYSTEM_PROMPT,
    )


def get_model_key_for_intent(intent: str) -> str:
    """
    Map an intent to a model key from MODELS.
    """
    mapping = {
        "reasoning": "reasoning",
        "code": "code",
        "math": "math",
        "support": "support",
        "summarizer": "summarizer",
    }

    return mapping.get(
        intent,
        DEFAULT_MODEL_KEY,
    )


def stream_model(
    model_key: str,
    system_prompt: str,
    user_content: str,
    trace_id: str,
) -> Generator[str, None, None]:
    """
    Stream a model response one chunk at a time.
    """
    model_name = MODELS[model_key]

    messages = [
        {
            "role": "system",
            "content": f"TRACE_ID: {trace_id}",
        },
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": user_content,
        },
    ]

    add_trace_event(
        trace_id,
        "LLM_CALL_STREAM",
        {
            "model_key": model_key,
            "model": model_name,
        },
    )

    yield from call_llm_stream(
        model_name,
        messages,
    )


def handle_stream(
    user_input: str,
    selected_model: str = "auto",
) -> Generator[str, None, None]:
    """
    Process and stream a chat response.

    Manual modes bypass the router.
    Auto mode uses router.py.
    """
    trace_id = new_trace_id()
    start_time = time.time()

    if not isinstance(user_input, str):
        user_input = str(user_input)

    user_input = user_input.strip()

    if selected_model not in ALLOWED_MODEL_MODES:
        selected_model = "auto"

    add_trace_event(
        trace_id,
        "REQUEST_RECEIVED",
        {
            "user_input": user_input,
            "selected_model": selected_model,
        },
    )

    log_event(
        "TRACE_START",
        {
            "trace_id": trace_id,
            "selected_model": selected_model,
        },
    )

    try:
        if not user_input:
            yield "Please enter a message."
            return

        # ========================================================
        # MANUAL MODEL SELECTION
        # ========================================================

        if selected_model != "auto":
            intent = selected_model

            record_request(intent)

            add_trace_event(
                trace_id,
                "MANUAL_MODEL_SELECTED",
                {
                    "intent": intent,
                },
            )

            log_event(
                "MANUAL_MODEL_SELECTED",
                {
                    "intent": intent,
                },
                trace_id,
            )

            model_key = get_model_key_for_intent(intent)
            system_prompt = get_prompt_for_intent(intent)

            yield from stream_model(
                model_key=model_key,
                system_prompt=system_prompt,
                user_content=user_input,
                trace_id=trace_id,
            )

            return

        # ========================================================
        # AUTO MODE
        # ========================================================

        task = route(user_input)

        add_trace_event(
            trace_id,
            "ROUTER_OUTPUT",
            task,
        )

        log_event(
            "ROUTER_OUTPUT",
            task,
            trace_id,
        )

        entities = task.get("entities", {})

        if not isinstance(entities, dict):
            entities = {}

        add_trace_event(
            trace_id,
            "ENTITIES",
            entities,
        )

        intent, confidence = select_intent(task)

        # Low-confidence routes become reasoning.
        if confidence < MIN_CONFIDENCE:
            intent = DEFAULT_MODEL_KEY

        # Support requires higher confidence.
        if (
            intent == "support"
            and confidence < MIN_SUPPORT_CONFIDENCE
        ):
            intent = DEFAULT_MODEL_KEY

        record_request(intent)

        add_trace_event(
            trace_id,
            "INTENT_SELECTED",
            {
                "intent": intent,
                "confidence": confidence,
            },
        )

        log_event(
            "INTENT",
            {
                "intent": intent,
                "confidence": confidence,
            },
            trace_id,
        )

        # ========================================================
        # PRODUCT SEARCH
        # ========================================================

        if intent == "product_search":
            query = normalize_query(
                entities,
                user_input,
            )

            max_price = (
                entities.get("max_price")
                or entities.get("price")
            )

            add_trace_event(
                trace_id,
                "PRODUCT_SEARCH",
                {
                    "query": query,
                    "max_price": max_price,
                },
            )

            results = search_products_semantic(query)

            if not results:
                results = search_products(
                    query,
                    max_price,
                )

            if not results:
                yield "No matching products were found."
                return

            product_content = (
                f"Original customer question:\n"
                f"{user_input}\n\n"
                f"Product search results:\n"
                f"{results}"
            )

            yield from stream_model(
                model_key="reasoning",
                system_prompt=PRODUCT_SYSTEM_PROMPT,
                user_content=product_content,
                trace_id=trace_id,
            )

            return

        # ========================================================
        # WEATHER
        # ========================================================

        if intent == "weather":
            location = entities.get("location")

            if not location:
                yield (
                    "Please provide a city or location "
                    "for the weather lookup."
                )
                return

            add_trace_event(
                trace_id,
                "WEATHER_LOOKUP",
                {
                    "location": str(location),
                },
            )

            weather_data = weather(
                str(location)
            )

            weather_content = (
                f"Original question:\n"
                f"{user_input}\n\n"
                f"Weather data:\n"
                f"{weather_data}"
            )

            yield from stream_model(
                model_key="reasoning",
                system_prompt=WEATHER_SYSTEM_PROMPT,
                user_content=weather_content,
                trace_id=trace_id,
            )

            return

        # ========================================================
        # SUMMARIZER VALIDATION
        # ========================================================

        if (
            intent == "summarizer"
            and len(user_input.split()) < 20
        ):
            yield (
                "Please provide the article or text "
                "you want summarized."
            )
            return

        # ========================================================
        # STANDARD INTENTS
        # ========================================================

        model_key = get_model_key_for_intent(intent)
        system_prompt = get_prompt_for_intent(intent)

        yield from stream_model(
            model_key=model_key,
            system_prompt=system_prompt,
            user_content=user_input,
            trace_id=trace_id,
        )

    except Exception as error:
        add_trace_event(
            trace_id,
            "HANDLER_ERROR",
            {
                "error": str(error),
                "selected_model": selected_model,
            },
        )

        log_event(
            "HANDLER_ERROR",
            {
                "error": str(error),
                "selected_model": selected_model,
            },
            trace_id,
        )

        # Attempt one fallback using the reasoning model.
        if selected_model != "reasoning":
            try:
                yield from stream_model(
                    model_key="reasoning",
                    system_prompt=GENERAL_SYSTEM_PROMPT,
                    user_content=user_input,
                    trace_id=trace_id,
                )
                return

            except Exception as fallback_error:
                add_trace_event(
                    trace_id,
                    "FALLBACK_ERROR",
                    {
                        "error": str(fallback_error),
                    },
                )

                log_event(
                    "FALLBACK_ERROR",
                    {
                        "error": str(fallback_error),
                    },
                    trace_id,
                )

        yield (
            "I encountered an error while processing "
            "your request. Please try again."
        )

    finally:
        record_latency(
            time.time() - start_time
        )

        close_trace(trace_id)


def handle(
    user_input: str,
    selected_model: str = "auto",
) -> str:
    """
    Non-streaming version of the handler.

    It consumes handle_stream() and returns one complete string.
    """
    chunks: list[str] = []

    for chunk in handle_stream(
        user_input=user_input,
        selected_model=selected_model,
    ):
        if chunk is None:
            continue

        chunks.append(str(chunk))

    return "".join(chunks)