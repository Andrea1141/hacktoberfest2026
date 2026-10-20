import pytest
import os
import sys

# Includi la cartella backend nel path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sito import app
from ai.utils import extract_json, detect_image_mime
from ai.predictor import calcola_curva_fisiologica, predici_risposta_glicemica
from ai.coach import genera_hack_coach, rispondi_chat_coach
from ai.vision import estrai_nutrienti_vision
from ai.config import detect_local_ai


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["local_ai_supported"] is True


def test_ai_status_endpoint():
    response = client.get("/api/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "ai" in data
    assert "local_server" in data["ai"]
    assert "offline_engine_ready" in data["ai"]
    assert data["ai"]["offline_engine_ready"] is True


def test_meals_endpoint():
    response = client.get("/api/meals")
    assert response.status_code == 200
    data = response.json()
    assert "meals" in data
    assert len(data["meals"]) == 9
    assert "pizza" in data["meals"]
    assert "carbonara" in data["meals"]
    assert "pasta" in data["meals"]
    assert "risotto" in data["meals"]
    assert "colazione" in data["meals"]
    assert "brioche" in data["meals"]
    assert "insalata" in data["meals"]
    assert "poke" in data["meals"]
    assert "toast" in data["meals"]


def test_extract_json_resilience():
    # 1. JSON pulito
    assert extract_json('{"a": 1, "b": "ok"}') == {"a": 1, "b": "ok"}

    # 2. Markdown code fences
    md_text = """Ecco il risultato richiesto:
```json
{
  "hack_1": {"label": "verdura prima", "mod_fibre": 10},
  "commento_clinico": "Attenzione al picco"
}
```
Spero sia utile."""
    parsed = extract_json(md_text)
    assert parsed["hack_1"]["mod_fibre"] == 10

    # 3. Trailing commas
    trailing_text = '{"x": 10, "y": 20, }'
    assert extract_json(trailing_text) == {"x": 10, "y": 20}


def test_detect_image_mime():
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    assert detect_image_mime(png_bytes) == "image/png"
    jpg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    assert detect_image_mime(jpg_bytes) == "image/jpeg"


def test_calcola_curva_fisiologica():
    meal = {
        "nome_piatto": "Pizza",
        "carboidrati_g": 80,
        "fibre_g": 4,
        "grassi_g": 20,
        "indice_glicemico": 75,
    }
    curva = calcola_curva_fisiologica(
        glicemia_base=120,
        trend_cgm="STABILE",
        meal=meal,
        usa_hack1=True,
        usa_hack2=True,
        tempo_target=60,
    )
    assert len(curva["punti"]) > 0
    assert curva["picco_opt"] <= curva["picco_std"]
    assert "stima_al_tempo" in curva
    assert curva["stima_al_tempo"]["minuti"] == 60


def test_predict_endpoint_offline_mode():
    payload = {
        "glicemia_cgm": 140,
        "trend_cgm": "IN_SALITA",
        "meal": {
            "nome_piatto": "Pasta al pomodoro",
            "carboidrati_g": 70,
            "fibre_g": 3,
            "grassi_g": 10,
            "indice_glicemico": 70,
        },
        "usa_hack1": False,
        "usa_hack2": False,
        "tempo_min": 45,
        "provider": "offline",
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "livello_rischio" in data
    assert "allerta_proattiva" in data
    assert "stima_al_tempo" in data
    assert data["stima_al_tempo"]["minuti"] == 45


def test_chat_endpoint_offline_bolus():
    payload = {
        "message": "Quanto bolo devo fare per questo pasto?",
        "glicemia": 130,
        "meal": {
            "nome_piatto": "Riso e pollo",
            "carboidrati_g": 60,
            "grassi_g": 10,
            "fibre_g": 4,
        },
        "usa_hack1": False,
        "usa_hack2": True,
        "ic_ratio": 10,
        "isf": 40,
        "target": 110,
        "iob": 1.0,
        "provider": "offline",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Bolo" in data["reply"]
    assert "IOB" in data["reply"]


def test_analyze_endpoint():
    response = client.post(
        "/api/analyze",
        data={
            "glicemia_base": 115,
            "demo_id": "carbonara",
            "provider": "offline",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["meal"]["nome_piatto"] == "Spaghetti alla Carbonara"
    assert "coach" in data
    assert "hack_1" in data["coach"]
    assert "hack_2" in data["coach"]


def test_titr_and_cv_prediction():
    payload = {
        "glicemia_cgm": 125,
        "trend_cgm": "STABILE",
        "meal": {
            "nome_piatto": "Pizza Margherita",
            "carboidrati_g": 80,
            "fibre_g": 4,
            "grassi_g": 22,
            "indice_glicemico": 80,
        },
        "usa_hack1": True,
        "usa_hack2": True,
        "tempo_min": 60,
        "provider": "offline",
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "titr_std" in data
    assert "titr_opt" in data
    assert "cv_std" in data
    assert "cv_opt" in data
    assert "allerte_precoci" in data
    assert data["cv_opt"] > 0
    assert "stabilita_cv" in data["allerte_precoci"]


def test_chat_timing_and_swaps_with_history():
    # Test Timing Bolo
    payload_timing = {
        "message": "Quando devo fare il bolo di insulina per questo pasto?",
        "history": [{"role": "user", "content": "Ciao coach"}],
        "glicemia": 120,
        "meal": {"nome_piatto": "Pasta al Sugo", "carboidrati_g": 70, "grassi_g": 10},
        "provider": "offline",
    }
    res_timing = client.post("/api/chat", json=payload_timing)
    assert res_timing.status_code == 200
    assert "Timing Ottimale" in res_timing.json()["reply"]

    # Test Alternative a Basso IG
    payload_swaps = {
        "message": "Quali alternative a basso indice glicemico mi consigli?",
        "glicemia": 120,
        "meal": {"nome_piatto": "Spaghetti al Pomodoro", "carboidrati_g": 70, "grassi_g": 8},
        "provider": "offline",
    }
    res_swaps = client.post("/api/chat", json=payload_swaps)
    assert res_swaps.status_code == 200
    assert "Alternative" in res_swaps.json()["reply"]
    assert "Legumi" in res_swaps.json()["reply"] or "Integrale" in res_swaps.json()["reply"]
