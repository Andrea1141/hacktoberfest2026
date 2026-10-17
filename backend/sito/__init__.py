"""
Modulo Sito / Web API di GlucoTwin:
Inizializza l'applicazione FastAPI con configurazione CORS e include i router.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router

app = FastAPI(
    title="GlucoTwin Open-Weight API",
    description="Digital Twin Metabolico basato su Gemma 4",
    version="1.0.0",
)

# Abilita CORS per la comunicazione con il frontend React (porta 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

__all__ = ["app"]
