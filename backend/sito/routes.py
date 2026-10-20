from fastapi import APIRouter, UploadFile, File, Form, Query
from typing import Optional
from ai import (
    estrai_nutrienti_vision,
    genera_hack_coach,
    rispondi_chat_coach,
    predici_risposta_glicemica,
    detect_local_ai,
    DEMO_MEALS,
    DEFAULT_AI_PROVIDER,
    DEFAULT_LOCAL_AI_URL,
    DEFAULT_LOCAL_AI_MODEL,
    DEFAULT_LOCAL_VISION_MODEL,
    get_effective_key,
)
from .schemas import ChatRequest, PredictionRequest

router = APIRouter()


@router.get("/")
def read_root():
    return {
        "status": "ok",
        "app": "Gluco AI Engine",
        "version": "1.0.0",
        "local_ai_supported": True,
        "default_provider": DEFAULT_AI_PROVIDER,
    }


@router.get("/api/ai/status")
@router.get("/api/status")
def get_system_status(local_url: Optional[str] = Query(None)):
    """
    Rileva lo stato del backend e la connettività con il server AI locale (Ollama / LM Studio)
    o con i servizi Cloud.
    """
    target_url = local_url or DEFAULT_LOCAL_AI_URL
    local_info = detect_local_ai(target_url)
    has_cloud_key = bool(get_effective_key(""))

    # Determina il provider attivo effettivo
    if DEFAULT_AI_PROVIDER == "offline":
        active_provider = "offline"
    elif DEFAULT_AI_PROVIDER == "local":
        active_provider = "local" if local_info["available"] else "offline"
    elif DEFAULT_AI_PROVIDER == "cloud":
        active_provider = "cloud" if has_cloud_key else "offline"
    else:  # "auto"
        if local_info["available"]:
            active_provider = "local"
        elif has_cloud_key:
            active_provider = "cloud"
        else:
            active_provider = "offline"

    return {
        "status": "ok",
        "app": "Gluco AI Engine",
        "version": "1.0.0",
        "ai": {
            "configured_mode": DEFAULT_AI_PROVIDER,
            "active_provider": active_provider,
            "local_server": {
                "available": local_info["available"],
                "type": local_info["provider"],
                "url": local_info["url"],
                "models": local_info["models"],
                "default_model": DEFAULT_LOCAL_AI_MODEL,
                "default_vision_model": DEFAULT_LOCAL_VISION_MODEL,
            },
            "cloud_configured": has_cloud_key,
            "offline_engine_ready": True,
        },
    }


@router.get("/api/meals")
def get_demo_meals():
    """Restituisce il catalogo dei pasti clinici di riferimento."""
    return {"meals": DEMO_MEALS}


@router.post("/api/analyze")
async def analyze_meal(
    glicemia_base: int = Form(115),
    demo_id: str = Form("pizza"),
    custom_name: Optional[str] = Form(None),
    custom_carbs: Optional[int] = Form(None),
    api_key: str = Form(""),
    provider: str = Form("auto"),
    local_url: str = Form(""),
    local_model: str = Form(""),
    file: UploadFile | None = File(None),
):
    img_bytes = await file.read() if file else None
    meal = estrai_nutrienti_vision(
        image_bytes=img_bytes,
        demo_id=demo_id,
        custom_name=custom_name,
        custom_carbs=custom_carbs,
        api_key=api_key,
        provider=provider,
        local_url=local_url or None,
        local_model=local_model or None,
    )
    coach = genera_hack_coach(
        meal=meal,
        glicemia=glicemia_base,
        api_key=api_key,
        provider=provider,
        local_url=local_url or None,
        local_model=local_model or None,
    )

    return {
        "meal": meal,
        "coach": coach,
        "glicemia_base": glicemia_base,
    }


@router.post("/api/predict")
async def predict_glucose_response(req: PredictionRequest):
    """
    Predizione automatica AI basata sul valore e trend del sensore CGM,
    con calcolo della cinetica e generazione di allerte cliniche proattive.
    """
    prediction = predici_risposta_glicemica(
        glicemia_cgm=req.glicemia_cgm,
        trend_cgm=req.trend_cgm,
        meal=req.meal,
        usa_hack1=req.usa_hack1,
        usa_hack2=req.usa_hack2,
        tempo_target=req.tempo_min,
        api_key=req.api_key,
        provider=req.provider,
        local_url=req.local_url,
        local_model=req.local_model,
    )
    return prediction


@router.post("/api/chat")
async def chat_with_coach(req: ChatRequest):
    reply = rispondi_chat_coach(
        messaggio=req.message,
        glicemia=req.glicemia,
        meal=req.meal,
        history=req.history,
        usa_hack1=req.usa_hack1,
        usa_hack2=req.usa_hack2,
        ic_ratio=req.ic_ratio,
        isf=req.isf,
        target=req.target,
        iob=req.iob,
        api_key=req.api_key,
        provider=req.provider,
        local_url=req.local_url,
        local_model=req.local_model,
    )
    return {"reply": reply}
