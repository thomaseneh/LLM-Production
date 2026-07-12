import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

MODELS = {
    # Intent router
    "router": "mistralai/mistral-small-3.2-24b-instruct",

    # Customer support
    "support": "meta-llama/llama-3.1-8b-instruct",

    # Mathematics
    "math": "microsoft/phi-4",

    # General knowledge and deep reasoning
    "reasoning": "meta-llama/llama-4-scout",

    # Coding
    "code": "openai/gpt-4o-mini",

    # Summaries
    "summarizer": "meta-llama/llama-4-scout",

    # Vision
    "vision": "meta-llama/llama-3.2-11b-vision-instruct",
}

# Any failed, missing, uncertain, or unknown route uses reasoning.
DEFAULT_MODEL_KEY = "reasoning"
DEFAULT_MODEL = MODELS[DEFAULT_MODEL_KEY]