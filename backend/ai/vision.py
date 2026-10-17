import base64
from .config import (
    genai,
    types,
    OpenAI,
    GEMMA_GENAI_MODEL,
    GEMMA_OPENROUTER_MODEL,
    get_effective_key,
)
from .demo_meals import DEMO_MEALS
from .utils import extract_json, detect_image_mime


def estrai_nutrienti_vision(image_bytes: bytes | None, demo_id: str, api_key: str) -> dict:
    """
    Analizza la foto di un pasto ed estrae i macronutrienti per la simulazione glicemica
    usando Gemma 4 multimodale (gemma-4-26b-a4b-it).
    """
    fallback_meal = DEMO_MEALS.get(demo_id, DEMO_MEALS["pizza"])
    key = get_effective_key(api_key)

    if not image_bytes or not key:
        return fallback_meal

    prompt = (
        "Sei un assistente nutrizionale per la gestione del diabete. "
        "Analizza con attenzione l'immagine di questo pasto e stima i macronutrienti.\n"
        "Restituisci ESCLUSIVAMENTE un JSON valido senza testo aggiuntivo né markdown con questo formato:\n"
        '{"nome_piatto": str, "carboidrati_g": int, "fibre_g": int, "grassi_g": int, "proteine_g": int, "indice_glicemico": int}'
    )

    try:
        # Se la chiave è OpenRouter (es. sk-...) o genai non è presente
        if (key.startswith("sk-") or genai is None) and OpenAI is not None:
            client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=key)
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            mime = detect_image_mime(image_bytes)
            res = client.chat.completions.create(
                model=GEMMA_OPENROUTER_MODEL,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}}
                    ]
                }],
                temperature=0.1
            )
            parsed = extract_json(res.choices[0].message.content or "")
        elif genai is not None:
            client = genai.Client(api_key=key)
            mime = detect_image_mime(image_bytes)
            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime)
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
            response = client.models.generate_content(
                model=GEMMA_GENAI_MODEL,
                contents=[image_part, prompt],
                config=config
            )
            parsed = extract_json(response.text or "")
        else:
            return fallback_meal

        return {
            "nome_piatto": str(parsed.get("nome_piatto", fallback_meal["nome_piatto"])),
            "carboidrati_g": int(parsed.get("carboidrati_g", fallback_meal["carboidrati_g"])),
            "fibre_g": int(parsed.get("fibre_g", fallback_meal["fibre_g"])),
            "grassi_g": int(parsed.get("grassi_g", fallback_meal["grassi_g"])),
            "proteine_g": int(parsed.get("proteine_g", fallback_meal["proteine_g"])),
            "indice_glicemico": int(parsed.get("indice_glicemico", fallback_meal["indice_glicemico"])),
        }
    except Exception:
        return fallback_meal
