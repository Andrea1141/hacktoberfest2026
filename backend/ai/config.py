import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Supporto per Google GenAI SDK (per Gemma 4 e modelli Google)
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

# Supporto per OpenAI / OpenRouter
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# Modelli Gemma ufficiali
GEMMA_GENAI_MODEL = "gemma-4-26b-a4b-it"
GEMMA_OPENROUTER_MODEL = "google/gemma-4-26b-a4b-it"


def get_effective_key(api_key: str = "") -> str:
    """Recupera la chiave API passata o dalle variabili d'ambiente."""
    key = (api_key or "").strip()
    if not key:
        key = (
            os.environ.get("GEMINI_API_KEY", "")
            or os.environ.get("OPENROUTER_API_KEY", "")
            or os.environ.get("GOOGLE_API_KEY", "")
        )
    return key
