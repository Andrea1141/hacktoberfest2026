"""
Modulo AI di GlucoTwin:
Gestisce la visione multimodale, la stima bromatologica, il coach clinico
e il motore di predizione automatica basato su sensore CGM (Gemma 4).
"""
from .demo_meals import DEMO_MEALS
from .vision import estrai_nutrienti_vision
from .coach import genera_hack_coach, rispondi_chat_coach
from .predictor import predici_risposta_glicemica, calcola_curva_fisiologica
from .config import GEMMA_GENAI_MODEL, GEMMA_OPENROUTER_MODEL

__all__ = [
    "DEMO_MEALS",
    "estrai_nutrienti_vision",
    "genera_hack_coach",
    "rispondi_chat_coach",
    "predici_risposta_glicemica",
    "calcola_curva_fisiologica",
    "GEMMA_GENAI_MODEL",
    "GEMMA_OPENROUTER_MODEL",
]
