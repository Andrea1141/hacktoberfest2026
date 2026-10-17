import json
import re


def extract_json(text: str) -> dict:
    """Estrae e analizza un oggetto JSON dal testo generato dall'LLM."""
    text = text.strip()
    fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence_match:
        return json.loads(fence_match.group(1))
    obj_match = re.search(r"\{.*\}", text, re.DOTALL)
    if obj_match:
        return json.loads(obj_match.group(0))
    return json.loads(text)


def detect_image_mime(data: bytes) -> str:
    """Rileva il MIME type dell'immagine dai magic bytes."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"RIFF") and len(data) >= 12 and data[8:12] == b"WEBP":
        return "image/webp"
    if data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
        return "image/gif"
    return "image/jpeg"
