"""
Modulo per retrocompatibilità con importazioni esistenti.
Le funzionalità AI sono modularizzate nel package `ai/`.
"""
from ai import (
    DEMO_MEALS,
    estrai_nutrienti_vision,
    genera_hack_coach,
    rispondi_chat_coach,
    GEMMA_GENAI_MODEL,
    GEMMA_OPENROUTER_MODEL,
)

__all__ = [
    "DEMO_MEALS",
    "estrai_nutrienti_vision",
    "genera_hack_coach",
    "rispondi_chat_coach",
    "GEMMA_GENAI_MODEL",
    "GEMMA_OPENROUTER_MODEL",
]