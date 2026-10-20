import json
import re


def extract_json(text: str) -> dict:
    """
    Estrae e analizza un oggetto JSON in modo resiliente dal testo generato
    da modelli AI sia cloud che locali (Ollama, LM Studio, Gemma, LLaMA).
    Gestisce fence markdown, testo extra prima/dopo e virgole pendenti.
    """
    if not text or not isinstance(text, str):
        raise ValueError("Testo vuoto o non valido per estrazione JSON")

    cleaned = text.strip()

    # 1. Rimuove eventuali blocchi markdown ```json ... ```
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    candidate_text = fence_match.group(1).strip() if fence_match else cleaned

    # 2. Cerca il primo blocco tra parentesi graffe bilanciate
    start_idx = candidate_text.find("{")
    end_idx = candidate_text.rfind("}")

    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = candidate_text[start_idx : end_idx + 1]
    else:
        json_str = candidate_text

    # 3. Prova diretta con json.loads standard
    try:
        return json.loads(json_str)
    except Exception:
        pass

    # 4. Sanitizzazione comune (virgole trailing prima di } o ], commenti)
    sanitized = re.sub(r",\s*([\}\]])", r"\1", json_str)
    # Rimuove eventuali commenti // o /* */
    sanitized = re.sub(r"//.*?\n", "\n", sanitized)
    sanitized = re.sub(r"/\*.*?\*/", "", sanitized, flags=re.DOTALL)

    try:
        return json.loads(sanitized)
    except Exception:
        pass

    # 5. Tentativo con regex euristico per i campi noti (es. hack_1, hack_2, commento_clinico, livello_rischio)
    extracted = {}
    for match in re.finditer(r'["\']([a-zA-Z0-9_]+)["\']\s*:\s*([^,\}\]]+)', sanitized):
        k = match.group(1)
        v = match.group(2).strip().strip('"\'')
        if v.isdigit():
            extracted[k] = int(v)
        elif re.match(r"^-?\d+\.\d+$", v):
            extracted[k] = float(v)
        elif v.lower() == "true":
            extracted[k] = True
        elif v.lower() == "false":
            extracted[k] = False
        else:
            extracted[k] = v

    if extracted:
        return extracted

    raise json.JSONDecodeError("Impossibile decodificare JSON dal testo", text, 0)


def detect_image_mime(data: bytes) -> str:
    """Rileva il MIME type dell'immagine dai magic bytes."""
    if not data:
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"RIFF") and len(data) >= 12 and data[8:12] == b"WEBP":
        return "image/webp"
    if data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
        return "image/gif"
    return "image/jpeg"
