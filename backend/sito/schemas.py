from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    glicemia: int = 115
    meal: dict = Field(default_factory=dict)
    usa_hack1: bool = False
    usa_hack2: bool = False
    api_key: str = ""
    ic_ratio: int = 10
    isf: int = 40
    target: int = 110
    iob: float = 0.0
