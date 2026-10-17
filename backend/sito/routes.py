from fastapi import APIRouter, UploadFile, File, Form
from ai import estrai_nutrienti_vision, genera_hack_coach, rispondi_chat_coach
from .schemas import ChatRequest

router = APIRouter()


@router.get("/")
def read_root():
    return {
        "status": "ok",
        "app": "GlucoTwin AI Engine",
        "model": "Gemma 4 (gemma-4-26b-a4b-it)",
    }


@router.post("/api/analyze")
async def analyze_meal(
    glicemia_base: int = Form(115),
    demo_id: str = Form("pizza"),
    api_key: str = Form(""),
    file: UploadFile | None = File(None),
):
    img_bytes = await file.read() if file else None
    meal = estrai_nutrienti_vision(img_bytes, demo_id, api_key)
    coach = genera_hack_coach(meal, glicemia_base, api_key)

    # Restituisce nutrienti + parametri per il motore React a 60fps
    return {
        "meal": meal,
        "coach": coach,
        "glicemia_base": glicemia_base,
    }


@router.post("/api/chat")
async def chat_with_coach(req: ChatRequest):
    reply = rispondi_chat_coach(
        messaggio=req.message,
        glicemia=req.glicemia,
        meal=req.meal,
        usa_hack1=req.usa_hack1,
        usa_hack2=req.usa_hack2,
        ic_ratio=req.ic_ratio,
        isf=req.isf,
        target=req.target,
        iob=req.iob,
        api_key=req.api_key,
    )
    return {"reply": reply}
