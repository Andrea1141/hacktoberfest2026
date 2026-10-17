"""
Modulo AI di GlucoTwin:
Gestisce la visione multimodale, la stima bromatologica e il coach clinico basati su Gemma 4.
"""
from .demo_meals import DEMO_MEALS
from .vision import estrai_nutrienti_vision
from .coach import genera_hack_coach, rispondi_chat_coach
from .config import GEMMA_GENAI_MODEL, GEMMA_OPENROUTER_MODEL

__all__ = [
    "DEMO_MEALS",
    "estrai_nutrienti_vision",
    "genera_hack_coach",
    "rispondi_chat_coach",
    "GEMMA_GENAI_MODEL",
    "GEMMA_OPENROUTER_MODEL",
]
