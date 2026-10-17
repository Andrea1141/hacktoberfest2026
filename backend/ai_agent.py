import base64
import json
from openai import OpenAI

DEMO_MEALS = {
    "pizza": {
        "nome_piatto": "Pizza Margherita Verace",
        "carboidrati_g": 85, "fibre_g": 4, "grassi_g": 22, "proteine_g": 24, "indice_glicemico": 82
    },
    "carbonara": {
        "nome_piatto": "Spaghetti alla Carbonara",
        "carboidrati_g": 78, "fibre_g": 3, "grassi_g": 36, "proteine_g": 28, "indice_glicemico": 70
    },
    "poke": {
        "nome_piatto": "Poke Bowl Salmone, Riso e Edamame",
        "carboidrati_g": 62, "fibre_g": 10, "grassi_g": 18, "proteine_g": 32, "indice_glicemico": 60
    }
}

def estrai_nutrienti_vision(image_bytes: bytes | None, demo_id: str, api_key: str) -> dict:
    if not image_bytes or not api_key:
        return DEMO_MEALS.get(demo_id, DEMO_MEALS["pizza"])
    try:
        client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        res = client.chat.completions.create(
            model="qwen/qwen2.5-vl-72b-instruct",
            messages=[{"role": "user", "content": [
                {"type": "text", "text": 'Analizza il piatto e restituisci SOLO JSON: {"nome_piatto": str, "carboidrati_g": int, "fibre_g": int, "grassi_g": int, "proteine_g": int, "indice_glicemico": int}'},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
            ]}],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        return json.loads(res.choices[0].message.content)
    except Exception:
        return DEMO_MEALS["pizza"]

def genera_hack_coach(meal: dict, glicemia: int, api_key: str) -> dict:
    fallback = {
        "hack_1": {"label": "🥗 Pre-carico di fibre (Verdura cruda 10 min prima)", "mod_fibre": 12, "rid_ig": 15},
        "hack_2": {"label": "🚶‍♂️ 15 min di camminata attiva (30 min post-pasto)", "mult_picco": 0.68},
        "commento_clinico": f"Partendo da {glicemia} mg/dL, i {meal['carboidrati_g']}g di carboidrati spingeranno la curva oltre la soglia di 180 mg/dL, mentre i {meal['grassi_g']}g di grassi prolungheranno la coda glicemica."
    }
    if not api_key:
        return fallback
    try:
        client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
        prompt = f"""Paziente diabetico (glicemia: {glicemia} mg/dL). Pasto: {json.dumps(meal)}.
        Restituisci SOLO JSON (niente dosi insulina):
        {{"hack_1": {{"label": "consiglio cibo max 8 parole", "mod_fibre": 12, "rid_ig": 15}},
          "hack_2": {{"label": "consiglio moto max 8 parole", "mult_picco": 0.68}},
          "commento_clinico": "2 frasi cliniche sull'impatto metabolico."}}"""
        res = client.chat.completions.create(
            model="meta-llama/llama-3.3-70b-instruct",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        return json.loads(res.choices[0].message.content)
    except Exception:
        return fallback