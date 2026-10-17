# 📋 Report Attività GlucoTwin AI — Andrea

Questo documento riassume tutte le modifiche architetturali, le integrazioni di intelligenza artificiale e le ottimizzazioni implementate nel repository.

---

## 1. Integrazione Modello Gemma 4 (`gemma-4-26b-a4b-it`)

Inizialmente il codice presentava una bozza incompleta con chiamate non valide all'SDK e variabili non definite. È stata completata l'integrazione di **Gemma 4** sfruttando l'SDK ufficiale di Google (`google-genai`), con supporto parallelo a OpenRouter e modalità offline:

- **Analisi Visiva Multimodale (`estrai_nutrienti_vision`)**:
  - Invece di tentare l'upload di stringhe base64 sul File API di Google (che generava eccezione), i byte grezzi della foto del pasto vengono passati direttamente in memoria tramite:
    ```python
    types.Part.from_bytes(data=image_bytes, mime_type=mime)
    ```
  - Forzatura di output strutturato in formato JSON nativo:
    ```python
    config = types.GenerateContentConfig(response_mime_type="application/json", temperature=0.1)
    ```
  - Estrazione dei macronutrienti per il modello metabolico: `carboidrati_g`, `fibre_g`, `grassi_g`, `proteine_g`, `indice_glicemico`.

- **Agente Clinico Preventivo (`genera_hack_coach`)**:
  - Genera i 2 micro-interventi comportamentali (hack alimentare pre-pasto per la barriera di fibre + hack motorio post-pasto per attivazione GLUT4) e il commento clinico personalizzato sul paziente.

- **Agente Conversazionale Clinico (`rispondi_chat_coach`)**:
  - Basato sulle direttive di `prompt_chat.txt`, risponde a domande su:
    - **Calcolo matematico trasparente del bolo**: rapporto I:C, fattore di sensibilità FSI, insulina attiva IOB.
    - **Adattamento all'attività fisica**: riduzione prudenziale del 20% in caso di camminata post-pasto per evitare ipoglicemie.
    - **Gestione dei grassi (effetto pizza)**: raccomandazione di bolo prolungato (dual-wave) per pasti con lipidi $\ge 20\text{g}$.
    - **Analisi della cinetica di picco** e Time-in-Range (70-180 mg/dL).

- **Gestione Fallback & Offline**:
  - In assenza di API key o di connessione, il sistema risponde istantaneamente con pasti demo verificati (`pizza`, `carbonara`, `poke`) e con calcoli deterministici affidabili.

---

## 2. Separazione Architetturale del Backend (`sito/` e `ai/`)

Il backend è stato riorganizzato separando la logica web (FastAPI/HTTP) dalla logica di intelligenza artificiale:

```
backend/
├── ai/                      # 🧠 LOGICA AI & MODELLI
│   ├── __init__.py          # Facade di esportazione pubblica
│   ├── config.py            # Gestione client GenAI / OpenRouter e API keys
│   ├── demo_meals.py        # Dati piatti demo per test offline
│   ├── vision.py            # Estrazione nutrienti visiva con Gemma 4
│   ├── coach.py             # Hack metabolici e chat conversazionale
│   └── utils.py             # Parsing JSON robusto e rilevamento magic bytes MIME
│
├── sito/                    # 🌐 WEB API & ROUTING FASTAPI
│   ├── __init__.py          # Istanza FastAPI e configurazione CORS (porta 5173)
│   ├── routes.py            # Endpoint HTTP (/api/analyze, /api/chat, /)
│   └── schemas.py           # Validazione modelli Pydantic (ChatRequest)
│
├── main.py                  # Entrypoint del server
├── ai_agent.py              # Wrapper retrocompatibile (riesporta da ai)
└── requirements.txt         # Dipendenze Python
```

### Vantaggi:
1. **Zero errori di import**: risolto il conflitto tra `ai_agent.py` e `from ai_agents import ...`.
2. **Manutenibilità**: chi lavora sugli agenti AI modifica solo `ai/`, chi lavora sulle API modifica `sito/`.
3. **Estendibilità**: pronto per aggiungere altri modelli o nuovi endpoint senza toccare la logica esistente.

---

## 3. Configurazione Dipendenze e Sicurezza Git

- **File `backend/requirements.txt`**:
  Definite le dipendenze necessarie per eseguire il backend:
  ```txt
  fastapi>=0.115.0
  uvicorn>=0.30.0
  google-genai>=2.0.0
  openai>=1.40.0
  numpy>=2.0.0
  python-multipart>=0.0.9
  ```

- **File `.gitignore`**:
  Creato nella radice del progetto per escludere automaticamente:
  - Cache Python (`__pycache__/`, `*.pyc`).
  - Ambienti virtuali (`venv/`, `.venv/`).
  - Dipendenze e build Node.js (`node_modules/`, `dist/`, `.vite/`).
  - Variabili d'ambiente e segreti (`.env`, `.env.*`, `*.key`).
  - File spazzatura di sistema operativo (`Thumbs.db`, `.DS_Store`).

- **Integrità Frontend**:
  - Come richiesto, la cartella `frontend/` non è stata modificata ed è rimasta intatta allo stato del repository.

---

## 4. Test e Verifica

Tutti i moduli sono stati verificati tramite test automatizzati interni con `TestClient`:
- `GET /` $\rightarrow$ **200 OK** (Health check attivo con identificativo Gemma 4).
- `POST /api/analyze` $\rightarrow$ **200 OK** (Calcolo corretto dei macronutrienti e degli hack comportamentali).
- `POST /api/chat` $\rightarrow$ **200 OK** (Risposta clinica sul calcolo dell'insulina).
- Importazione congiunta di `main`, `sito`, `ai` e `ai_agent` senza conflitti.

---

## 5. Come Avviare il Progetto

Dalla cartella del backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Il server sarà accessibile su `http://localhost:8000` con documentazione interattiva su `http://localhost:8000/docs`.
