"""
Modulo AI di Gluco:
Gestisce la visione multimodale, la stima bromatologica, il coach clinico
e il motore di predizione automatica basato su sensore CGM e trial AZT1D,
supportando sia l'esecuzione in locale (Ollama / LM Studio) che Cloud o motore offline.
"""
from .demo_meals import DEMO_MEALS
from .vision import estrai_nutrienti_vision
from .coach import genera_hack_coach, rispondi_chat_coach
from .predictor import predici_risposta_glicemica, calcola_curva_fisiologica
from .config import (
    GEMMA_GENAI_MODEL,
    GEMMA_OPENROUTER_MODEL,
    DEFAULT_AI_PROVIDER,
    DEFAULT_LOCAL_AI_URL,
    DEFAULT_LOCAL_AI_MODEL,
    DEFAULT_LOCAL_VISION_MODEL,
    detect_local_ai,
    get_effective_key,
    query_llm,
)

__all__ = [
    "DEMO_MEALS",
    "estrai_nutrienti_vision",
    "genera_hack_coach",
    "rispondi_chat_coach",
    "predici_risposta_glicemica",
    "calcola_curva_fisiologica",
    "GEMMA_GENAI_MODEL",
    "GEMMA_OPENROUTER_MODEL",
    "DEFAULT_AI_PROVIDER",
    "DEFAULT_LOCAL_AI_URL",
    "DEFAULT_LOCAL_AI_MODEL",
    "DEFAULT_LOCAL_VISION_MODEL",
    "detect_local_ai",
    "get_effective_key",
    "query_llm",
]
