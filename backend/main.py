from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from ai_agents import estrai_nutrienti_vision, genera_hack_coach

app = FastAPI(title="GlucoTwin Open-Weight API")

# FONDAMENTALE: Abilita CORS per far comunicare React (porta 5173) con FastAPI (porta 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_meal(
    glicemia_base: int = Form(115),
    demo_id: str = Form("pizza"),
    api_key: str = Form(""),
    file: UploadFile | None = File(None)
):
    img_bytes = await file.read() if file else None
    meal = estrai_nutrienti_vision(img_bytes, demo_id, api_key)
    coach = genera_hack_coach(meal, glicemia_base, api_key)

    # Restituiamo nutrienti + parametri così React può ricalcolare la curva verde a 60fps senza rifare chiamate HTTP!
    return {
        "meal": meal,
        "coach": coach,
        "glicemia_base": glicemia_base
    }