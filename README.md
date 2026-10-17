# 🩸 Gluco — Guida Intelligente per la tua Glicemia
### Digital Twin Metabolico Preventivo basato su Google Gemma 4 e Dati Clinici AZT1D 2025

> **Comprendi e prevedi la risposta glicemica post-prandiale prima del primo boccone. Appiattisci il picco con micro-interventi metabolici scientificamente validati e l'intelligenza artificiale aperta di Google Gemma 4.**

[![Hackathon](https://img.shields.io/badge/Hackathon-Hacktoberfest_2026-teal.svg)](https://github.com)
[![AI Model](https://img.shields.io/badge/Model-Google_Gemma_4_(26B_MoE)-cyan.svg)](https://ai.google.dev/gemma)
[![Clinical Dataset](https://img.shields.io/badge/Clinical_Trial-AZT1D_2025_(25_Pazienti_AID)-blue.svg)](https://github.com)
[![Design System](https://img.shields.io/badge/Design-Daylight_Consumer_Health-emerald.svg)](https://github.com)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Open--Weight_%7C_GDPR_Ready-purple.svg)](https://github.com)
[![Stack](https://img.shields.io/badge/Stack-FastAPI_%7C_React_19_%7C_Tailwind_v4_%7C_Recharts_%7C_KaTeX-slate.svg)](https://github.com)

---

## 🎯 Il Problema Clinico

Una persona affetta da diabete (Tipo 1 o Tipo 2 insulinodipendente) prende in media **oltre 180 decisioni extra ogni giorno** unicamente correlate alla gestione metabolica e alla stima nutrizionale.

I moderni sistemi di monitoraggio continuo del glucosio (CGM) sono strumenti eccezionali, ma operano quasi esclusivamente in modo **reattivo**: notificano il paziente quando l'escursione glicemica o l'ipoglicemia è già in corso. Stimare a mente l'effetto congiunto di carboidrati, indice glicemico, fibre e lipidi ("effetto pizza") genera un carico cognitivo cronico e sfiancante, noto nella letteratura clinica come **Diabetes Burnout**.

---

## 💡 La Soluzione: Gluco

**Gluco** trasforma la gestione metabolica da reattiva a **preventiva, predittiva ed educativa**:

```
                       ┌─────────────────────────┐
                       │  📷 Analisi Pasto       │
                       │  (Gemma 4 Vision)       │
                       └────────────┬────────────┘
                                    │  Macronutrienti & Indice Glicemico
                                    ▼
┌──────────────────────┐   ┌─────────────────────────┐   ┌───────────────────────┐
│ 📡 Telemetria CGM    ├──►│  Predittore Cinetico    │◄──┤ 🌿 Hack Metabolici    │
│ (Valore Live + Trend)│   │  (Calibrato su AZT1D)   │   │ (Fibre + GLUT4 Moto)  │
└──────────────────────┘   └────────────┬────────────┘   └───────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌─────────────────────────┐                               ┌─────────────────────────┐
│ 📈 Display Glicemia     │                               │ 💬 Gluco Coach AI       │
│ Stimata a +t minuti     │                               │ con Formule KaTeX       │
│ e Curva Recharts 60 FPS │                               │ e Calcolo Bolo Trasp.   │
└─────────────────────────┘                               └─────────────────────────┘
```

### 1. ⏱️ Stima Glicemica Preventiva a Tempo ($+t\text{ min}$)
- Non aspetta che la glicemia salga: calcola in anticipo l'andamento atteso della curva a $+15$, $+30$, $+45$, $+60$, $+90$, $+120$ e $+180$ minuti dal pasto.
- Ago temporale interattivo con visualizzazione istantanea del valore stimato e badge clinico di sicurezza:
  - **Ottimale:** $70 - 140\text{ mg/dL}$
  - **Nel Bersaglio (Target TIR):** $70 - 180\text{ mg/dL}$
  - **Attenzione Iperglicemia:** $> 180\text{ mg/dL}$
  - **Attenzione Ipoglicemia:** $< 70\text{ mg/dL}$

### 2. 🥗 Micro-Interventi Metabolici Personalizzati (What-If Engine)
- Simula l'effetto combinato di due "biohack" metabolici non farmacologici scientificamente validati:
  - **Hack Alimentare (Pre-carico di Fibre):** consumare una porzione di verdura cruda 10 minuti prima del pasto crea una barriera visco-gelatinosa nel duodeno, riducendo l'indice glicemico effettivo del piatto e smussando il picco di oltre $20\text{ mg/dL}$.
  - **Hack Motorio (Attivazione Muscolare GLUT4):** 10–15 minuti di camminata leggera a 30 minuti dal termine del pasto stimolano la traslocazione dei trasportatori GLUT4 indipendentemente dall'insulina, abbattendo il picco massimo di circa il $30\%$.
- Confronta visivamente a 60 FPS la **Curva Standard** vs la **Curva con Interventi**, quantificando il risparmio netto di escursione (fino a **$-67\text{ mg/dL}$** al picco).

### 3. 📊 Evidenze Cliniche del Trial Reale AZT1D 2025
- Il motore matematico di Gluco è calibrato sui dati reali del trial **AZT1D 2025** (*A Real-World Dataset for Type 1 Diabetes*): 25 pazienti monitorati per 40–55 giorni continui con sistemi di infusione automatica ad anello chiuso (AID) e sensori CGM ad alta risoluzione (oltre **306.700 record telemetrici a 5 minuti**).
- Calcolo automatico e dinamico delle metriche di consenso diabetologico internazionale:
  - **TIR (Time-in-Range 70–180 mg/dL)**
  - **TAR (Time-Above-Range >180 mg/dL)**
  - **TBR (Time-Below-Range <70 mg/dL)**
  - **GMI (Glucose Management Indicator / HbA1c stimata)**

### 4. 📷 Analisi Nutrizionale Multimodale con Gemma 4
- Utilizza il modello multimodale aperto **Google Gemma 4** (`gemma-4-26b-a4b-it`) per analizzare foto di piatti reali o descrizioni testuali.
- Estrae con precisione: carboidrati netti, zuccheri semplici, fibre, grassi, proteine e indice glicemico stimato, con forzatura di output strutturato in formato JSON nativo (`response_mime_type="application/json"`).

### 5. 💉 Calcolatore Bolo Trasparente & Alert "Effetto Pizza"
- Scorporo matematico a 4 fasi basato sui parametri personalizzati del paziente:
  - **Bolo Carboidrati:** $\text{Carboidrati (g)} / \text{Rapporto I:C}$
  - **Bolo Correzione:** $\max\left(0, \frac{\text{Glicemia Attuale} - \text{Target}}{\text{FSI}}\right)$
  - **Sottrazione Insulina Attiva (IOB):** $-\text{IOB}$
  - **Adattamento Attività Fisica:** riduzione prudenziale del $20\%$ sul bolo in caso di camminata post-prandiale per prevenire ipoglicemie muscolari da sforzo.
- **Alert Effetto Pizza (Grassi Elevati $\ge 20\text{g}$):** consiglia una strategia di somministrazione ad onda doppia (**Bolo Dual-Wave**: $65\%$ subito $+ 35\%$ distribuito su 2–3 ore) per coprire il rallentamento dello svuotamento gastrico indotto dai lipidi.

### 6. 💬 Assistente Clinico Conversazionale con KaTeX
- Chatbot clinico integrato che interpreta i dubbi del paziente e spiega la fisiologia della risposta glicemica.
- Rendering matematico ad altissima fedeltà tramite **KaTeX**, sia per formule inline ($I:C$, $FSI$) che in blocco per calcoli complessi del bolo.

### 7. 🎨 Design System "Daylight Consumer Health" (Stile Apple Health / Dexcom)
- Riprogettato per la massima accessibilità di pazienti di ogni età, famiglie e caregiver:
  - Palette chiara, distensiva e rassicurante su toni `teal-600` e sfondi neutri `slate-50`.
  - Contrasti certificati conformi alle linee guida di accessibilità **WCAG AAA**.
  - Tipografia amichevole e leggibile con font Google **Plus Jakarta Sans**, eliminando caratteri da terminale per una consultazione rilassata.

---

## 🧭 Struttura del Repository

```text
hacktoberfest2026/
├── backend/                       # 🐍 Server API FastAPI & Motore AI
│   ├── ai/                        # Moduli di intelligenza artificiale & cinetica
│   │   ├── coach.py               # Agente clinico & chat conversazionale Gemma 4
│   │   ├── config.py              # Gestione client GenAI / OpenRouter e API key
│   │   ├── data_loader.py         # Parsing e benchmark statistico dataset AZT1D
│   │   ├── demo_meals.py          # Database bromatologico pasti demo validati
│   │   ├── predictor.py           # Predittore cinetico post-prandiale & allerte proattive
│   │   ├── utils.py               # Parser JSON robusto e rilevamento magic bytes
│   │   └── vision.py              # Stima multimodale nutrienti con Gemma 4
│   ├── sito/                      # Routing HTTP & Validazione Contratti
│   │   ├── __init__.py            # Inizializzazione FastAPI e configurazione CORS
│   │   ├── routes.py              # Endpoint API (/api/predict, /api/analyze, /api/chat)
│   │   └── schemas.py             # Schemi Pydantic (PredictionRequest, ChatRequest)
│   ├── .env.example               # Template configurazione variabili d'ambiente
│   ├── ai_agent.py                # Wrapper di retrocompatibilità
│   ├── main.py                    # Entrypoint applicazione Uvicorn
│   └── requirements.txt           # Dipendenze Python
│
├── data/                          # 🔬 Trial Clinico AZT1D & Evidenze Scientifiche
│   ├── AZT1D_DATASET_SUMMARY_FOR_AI.txt  # Mappatura e dizionario dati del trial clinico
│   ├── generate_datasets.py       # Script di generazione benchmark clinici
│   └── stressdiabete.txt          # Approfondimento clinico su stress e fattori ormonali
│
├── datasets/                      # 📁 Benchmark Telemetrici Standardizzati
│   ├── cdc_diabetes_indicators.csv       # Indicatori epidemiologici e fattori di rischio
│   ├── cgm_dexcom_clarity.csv            # Time-series Dexcom Clarity a 5 minuti
│   ├── cgm_freestyle_libre.csv           # Time-series Abbott FreeStyle Libre a 15 minuti
│   ├── cgm_nightscout.json               # Formato interoperabile standard OpenAPS/Nightscout
│   ├── pima_indians_diabetes.csv         # Benchmark clinico storico NIDDK
│   ├── postprandial_meal_curves.json     # Curve validate di cinetica post-prandiale
│   └── uci_diabetes_timeseries.csv       # Dataset time-series UCI Diabetes
│
├── frontend/                      # ⚛️ Dashboard Web React 19 (Daylight UI)
│   ├── src/
│   │   ├── App.jsx                # Layout principale, Hero stima a tempo e navigazione
│   │   ├── BolusCalculator.jsx    # Calcolatore matematico trasparente del bolo
│   │   ├── ChatCoach.jsx          # Assistente conversazionale con rendering LaTeX KaTeX
│   │   ├── GlucoseChart.jsx       # Grafico cinetico Recharts con ago a +t min e TIR
│   │   ├── index.css              # Design system Tailwind CSS v4 Daylight Health
│   │   └── main.jsx               # Entrypoint React 19 con fogli di stile KaTeX
│   ├── index.html                 # Template HTML5 con metadati SEO e Google Fonts
│   ├── package.json               # Configurazione dipendenze e script npm
│   └── vite.config.js             # Configurazione Vite con Tailwind v4
│
├── .gitignore                     # Esclusioni git complete e ricorsive
└── README.md                      # Documentazione ufficiale del progetto
```

---

## 🚀 Guida di Installazione e Avvio Rapido

### Prerequisiti
* **Python 3.10+**
* **Node.js 18+** e npm

---

### 1. Avvio del Backend (FastAPI)

Apri un terminale nella radice del progetto:

```bash
cd backend

# Crea e attiva l'ambiente virtuale
python3 -m venv .venv
source .venv/bin/activate

# Installa le dipendenze
pip install -r requirements.txt

# (Opzionale) Configura la chiave API Google AI Studio o OpenRouter per Gemma 4
cp .env.example .env
# Inserisci la tua GEMINI_API_KEY o OPENROUTER_API_KEY nel file .env

# Avvia il server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> 💡 **Modalità Offline / Zero-Config:** se non inserisci alcuna chiave API, il backend attiva automaticamente la modalità simulatore locale garantendo il $100\%$ delle funzionalità tramite database demo e cinetiche fisiologiche calibrate.

* **API attiva su:** `http://localhost:8000`
* **Swagger Documentation interattiva:** `http://localhost:8000/docs`

---

### 2. Avvio del Frontend (React + Vite)

In un secondo terminale:

```bash
cd frontend

# Installa i pacchetti npm
npm install

# (Opzionale) Esegui la build di produzione per verificare che sia tutto pulito
npm run build

# Avvia il dev server
npm run dev
```

Apri il browser all'indirizzo: **`http://localhost:5173`**.

---

## 👥 Il Team & Divisione dei Ruoli

Il progetto è stato sviluppato in occasione dell'**Hacktoberfest 2026** attraverso una suddivisione modulare dei compiti:

| Ruolo | Componente | Responsabilità Chiave |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind v4, Recharts, KaTeX | Design system accessibile *Daylight Consumer Health*, grafico reattivo a 60 FPS con ago a tempo, calcolatore bolo e chat conversazionale con supporto $\LaTeX$. |
| **Backend** | FastAPI, Gemma 4, Uvicorn | Architettura modulare (`ai/` e `sito/`), integrazione del modello Google Gemma 4 multimodale, endpoint REST (`/api/predict`, `/api/analyze`, `/api/chat`) e gestione CORS. |
| **Data** | Trial AZT1D 2025, Benchmark Telemetrici | Selezione e mappatura clinica del dataset reale AZT1D (306k record AID), generazione dei benchmark Dexcom/Libre/Nightscout e modellazione dei fattori di stress metabolico. |
| **Integration** | Cinetica Fisiologica, Contratti & E2E Pipeline | Collegamento tra ricerca dati e codice computabile, incapsulamento del predittore metabolico in `data_loader.py` / `predictor.py`, sincronizzazione contrattuale Pydantic e collaudo end-to-end. |

---

## 🛡️ Disclaimer Clinico ed Etico

**Gluco** è una tecnologia sviluppata ad esclusivo scopo **educativo, preventivo e di simulazione comportamentale**:
* ❌ **Non costituisce un dispositivo medico certificato**, non sostituisce il giudizio clinico del medico diabetologo e non modifica autonomamente piani terapeutici o dosaggi di farmaci.
* ✅ Mostra sempre calcoli matematici trasparenti basati sui parametri inseriti dall'utente ($I:C$, $FSI$, $IOB$), invitando a discuterli con il proprio team curante.
* ✅ Promuove micro-interventi non invasivi scientificamente validati (ordine dei cibi e movimento aerobico leggero post-pasto) per favorire la stabilità metabolica e prevenire escursioni iperglicemiche.

---

<div align="center">
  <sub>Sviluppato con passione per l'Hacktoberfest 2026 • 100% Modelli Open-Weight • Focus Paziente</sub>
</div>