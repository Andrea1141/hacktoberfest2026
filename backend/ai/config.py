import os
import base64
from typing import Optional, List, Dict, Any
import httpx

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Supporto per Google GenAI SDK (Gemini / Gemma su Google AI Studio)
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

# Supporto per OpenAI / OpenRouter / Local OpenAI-compatible (LM Studio, vLLM, Ollama /v1)
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# Configurazione Provider e Modelli
DEFAULT_AI_PROVIDER = os.environ.get("AI_PROVIDER", "auto").strip().lower()
DEFAULT_LOCAL_AI_URL = os.environ.get("LOCAL_AI_URL", "http://localhost:11434").rstrip("/")
DEFAULT_LOCAL_AI_MODEL = os.environ.get("LOCAL_AI_MODEL", "gemma2:2b").strip()
DEFAULT_LOCAL_VISION_MODEL = os.environ.get("LOCAL_VISION_MODEL", "llava").strip()

GEMMA_GENAI_MODEL = os.environ.get("GEMMA_GENAI_MODEL", "gemini-2.5-flash").strip()
GEMMA_OPENROUTER_MODEL = os.environ.get("GEMMA_OPENROUTER_MODEL", "google/gemma-2-9b-it:free").strip()


def get_effective_key(api_key: str = "") -> str:
    """Recupera la chiave API passata o dalle variabili d'ambiente."""
    key = (api_key or "").strip()
    if not key:
        key = (
            os.environ.get("GEMINI_API_KEY", "")
            or os.environ.get("OPENROUTER_API_KEY", "")
            or os.environ.get("GOOGLE_API_KEY", "")
        )
    return key


def detect_local_ai(local_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Rileva se un'istanza locale di Ollama o LM Studio / server compatibile OpenAI è in esecuzione.
    """
    url = (local_url or DEFAULT_LOCAL_AI_URL).rstrip("/")
    result = {
        "available": False,
        "provider": "none",
        "url": url,
        "models": [],
        "model_count": 0,
        "recommended_model": DEFAULT_LOCAL_AI_MODEL,
    }

    # 1. Prova endpoint nativo Ollama: GET {url}/api/tags
    try:
        with httpx.Client(timeout=1.2) as client:
            resp = client.get(f"{url}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", []) if m.get("name")]
                result["available"] = True
                result["provider"] = "ollama"
                result["models"] = models
                result["model_count"] = len(models)
                if models and DEFAULT_LOCAL_AI_MODEL not in models:
                    result["recommended_model"] = models[0]
                return result
    except Exception:
        pass

    # 2. Prova endpoint OpenAI compatibile (LM Studio, vLLM, LocalAI): GET {url}/v1/models
    try:
        with httpx.Client(timeout=1.2) as client:
            resp = client.get(f"{url}/v1/models")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("id", "") for m in data.get("data", []) if m.get("id")]
                result["available"] = True
                result["provider"] = "local_openai"
                result["models"] = models
                result["model_count"] = len(models)
                if models:
                    result["recommended_model"] = models[0]
                return result
    except Exception:
        pass

    return result


def call_local_ollama(
    prompt: str,
    system_prompt: str = "",
    model: Optional[str] = None,
    local_url: Optional[str] = None,
    json_mode: bool = False,
    image_bytes: Optional[bytes] = None,
    timeout: float = 35.0,
) -> Optional[str]:
    """
    Esegue inferenza direttamente tramite API Ollama locale (/api/generate o /api/chat).
    Supporta modalità JSON e input multimodale/visione.
    """
    url = (local_url or DEFAULT_LOCAL_AI_URL).rstrip("/")
    target_model = model or DEFAULT_LOCAL_AI_MODEL

    payload: Dict[str, Any] = {
        "model": target_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.2,
        },
    }

    if system_prompt:
        payload["system"] = system_prompt

    if json_mode:
        payload["format"] = "json"

    if image_bytes:
        # Per modelli di visione Ollama come llava o moondream
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        payload["images"] = [b64]

    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(f"{url}/api/generate", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("response", "").strip()
    except Exception:
        pass

    return None


def call_local_openai_compat(
    prompt: str,
    system_prompt: str = "",
    model: Optional[str] = None,
    local_url: Optional[str] = None,
    json_mode: bool = False,
    image_bytes: Optional[bytes] = None,
    timeout: float = 35.0,
) -> Optional[str]:
    """
    Esegue inferenza tramite endpoint locale compatibile OpenAI (LM Studio, vLLM, LocalAI).
    """
    url = (local_url or DEFAULT_LOCAL_AI_URL).rstrip("/")
    target_model = model or DEFAULT_LOCAL_AI_MODEL

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    if image_bytes:
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
            ]
        })
    else:
        messages.append({"role": "user", "content": prompt})

    payload: Dict[str, Any] = {
        "model": target_model,
        "messages": messages,
        "temperature": 0.2,
    }

    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    endpoint = f"{url}/v1/chat/completions" if not url.endswith("/v1") else f"{url}/chat/completions"

    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(endpoint, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
    except Exception:
        pass

    return None


def query_llm(
    prompt: str,
    system_prompt: str = "",
    json_mode: bool = False,
    image_bytes: Optional[bytes] = None,
    provider: str = "auto",
    api_key: str = "",
    local_url: Optional[str] = None,
    local_model: Optional[str] = None,
) -> Optional[str]:
    """
    Funzione unificata di inferenza AI:
    - Se provider == 'local': invoca server locale (Ollama / LM Studio)
    - Se provider == 'cloud': invoca Google GenAI o OpenRouter con API Key
    - Se provider == 'offline': salta i modelli esterni e usa il motore clinico locale
    - Se provider == 'auto': prova prima il server locale, poi Cloud, poi offline
    """
    mode = (provider or DEFAULT_AI_PROVIDER).strip().lower()
    if mode == "offline":
        return None

    key = get_effective_key(api_key)
    target_url = (local_url or DEFAULT_LOCAL_AI_URL).rstrip("/")
    target_model = local_model or (DEFAULT_LOCAL_VISION_MODEL if image_bytes else DEFAULT_LOCAL_AI_MODEL)

    # 1. Tentativo Locale (se richiesto 'local' o in 'auto')
    if mode in ["local", "auto"]:
        detection = detect_local_ai(target_url)
        if detection["available"]:
            if detection["provider"] == "ollama":
                res = call_local_ollama(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    model=target_model,
                    local_url=target_url,
                    json_mode=json_mode,
                    image_bytes=image_bytes,
                )
                if res:
                    return res
            elif detection["provider"] == "local_openai":
                res = call_local_openai_compat(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    model=target_model,
                    local_url=target_url,
                    json_mode=json_mode,
                    image_bytes=image_bytes,
                )
                if res:
                    return res
        elif mode == "local":
            # Se l'utente ha esplicitamente richiesto 'local' ma non c'è Ollama attivo,
            # prova comunque una chiamata con timeout breve nel caso sia appena partito
            res = call_local_ollama(
                prompt=prompt,
                system_prompt=system_prompt,
                model=target_model,
                local_url=target_url,
                json_mode=json_mode,
                image_bytes=image_bytes,
            )
            if res:
                return res

    # 2. Tentativo Cloud (se richiesto 'cloud' o fallback da 'auto' se c'è una chiave)
    if (mode in ["cloud", "auto"]) and key:
        try:
            if (key.startswith("sk-") or genai is None) and OpenAI is not None:
                client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=key)
                msgs = []
                if system_prompt:
                    msgs.append({"role": "system", "content": system_prompt})
                if image_bytes:
                    b64 = base64.b64encode(image_bytes).decode("utf-8")
                    msgs.append({
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
                        ]
                    })
                else:
                    msgs.append({"role": "user", "content": prompt})

                kwargs: Dict[str, Any] = {
                    "model": GEMMA_OPENROUTER_MODEL,
                    "messages": msgs,
                    "temperature": 0.2,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                completion = client.chat.completions.create(**kwargs)
                return completion.choices[0].message.content or ""

            elif genai is not None:
                client = genai.Client(api_key=key)
                contents = []
                if image_bytes:
                    from .utils import detect_image_mime
                    mime = detect_image_mime(image_bytes)
                    contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime))
                
                full_text = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
                contents.append(full_text)

                config_kwargs: Dict[str, Any] = {"temperature": 0.2}
                if json_mode:
                    config_kwargs["response_mime_type"] = "application/json"

                config = types.GenerateContentConfig(**config_kwargs)
                response = client.models.generate_content(
                    model=GEMMA_GENAI_MODEL,
                    contents=contents,
                    config=config,
                )
                return response.text or ""
        except Exception:
            pass

    return None
