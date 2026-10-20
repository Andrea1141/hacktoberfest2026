from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = None
    glicemia: int = 115
    meal: dict = Field(default_factory=dict)
    usa_hack1: bool = False
    usa_hack2: bool = False
    api_key: str = ""
    ic_ratio: int = 10
    isf: int = 40
    target: int = 110
    iob: float = 0.0
    provider: str = "auto"
    local_url: Optional[str] = None
    local_model: Optional[str] = None


class PredictionRequest(BaseModel):
    glicemia_cgm: int = 115
    trend_cgm: str = "STABILE"
    meal: dict = Field(default_factory=dict)
    usa_hack1: bool = False
    usa_hack2: bool = False
    tempo_min: int = 60
    api_key: str = ""
    provider: str = "auto"
    local_url: Optional[str] = None
    local_model: Optional[str] = None


class AIStatusResponse(BaseModel):
    status: str
    app: str
    version: str
    ai: Dict[str, Any]
