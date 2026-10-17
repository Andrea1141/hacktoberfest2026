"""
Entry point principale del backend GlucoTwin.
Espone l'applicazione FastAPI configurata nel modulo `sito`.
"""
import uvicorn
from sito import app

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)