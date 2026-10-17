# 🩸 GlucoTwin AI — Documentazione Tecnica Modifiche Frontend

Questo documento descrive in dettaglio tutte le implementazioni, le scelte architetturali e i componenti realizzati per il front-end di **GlucoTwin AI** all'interno della cartella `frontend/`.

---

## 1. Stack Tecnologico & Architettura

| Tecnologia | Versione / Libreria | Scopo & Ruolo |
| :--- | :--- | :--- |
| **Vite** | `v6.2.0+` | Build tool e dev server ad altissime prestazioni con Hot Module Replacement (HMR). |
| **React** | `v19.0.0` | Libreria UI per la gestione dello stato reattivo e del rendering a 60 FPS. |
| **Tailwind CSS** | `v4.0.9` | Engine CSS nativo con il plugin ufficiale `@tailwindcss/vite`, direttiva `@import "tailwindcss"` e zero file di configurazione legacy. |
| **Recharts** | `v2.15.1` | Rendering reattivo dei grafici SVG per la cinetica glicemica post-prandiale. |
| **Lucide React** | `v1.16.0` | Iconografia moderna medical & digital health. |

---

## 2. Struttura dei File Creata e Organizzata

```text
frontend/
├── dist/                     # Bundle di produzione compilato e ottimizzato
├── node_modules/             # Dipendenze installate (React, Recharts, Tailwind v4, Lucide)
├── src/
│   ├── App.jsx               # Dashboard principale, gestione stato e layout responsive
│   ├── BolusCalculator.jsx   # Modulo di calcolo matematico trasparente del bolo insulinico
│   ├── ChatCoach.jsx         # Chat conversazionale con GlucoTwin Coach AI
│   ├── GlucoseChart.jsx      # Grafico cinetico Recharts (curve glicemiche e Time-in-Range)
│   ├── index.css             # Configurazione Tailwind v4, glassmorphism e design system
│   └── main.jsx              # Entry point React 19 collegato al DOM
├── index.html                # Template HTML5 con metadati SEO e font Google (Plus Jakarta Sans)
├── package.json              # Configurazione dipendenze e script npm
└── vite.config.js            # Configurazione Vite con plugin React e Tailwind CSS v4
```

---

## 3. Dettaglio dei Singoli File e Modifiche

### 3.1. `package.json`
- Configurato il progetto in modalità ES Modules (`"type": "module"`).
- Aggiunti script per:
  - `npm run dev`: Avvio del server locale di sviluppo su porta 5173.
  - `npm run build`: Compilazione bundle ottimizzato con Vite e Rollup.
  - `npm run preview`: Ispezione locale della build di produzione.
- Installate le dipendenze essenziali: `react`, `react-dom`, `recharts`, `lucide-react`, `@tailwindcss/vite`, `tailwindcss`, `@vitejs/plugin-react` e `vite`.

### 3.2. `vite.config.js`
- Integrato il plugin nativo `@tailwindcss/vite` insieme a `@vitejs/plugin-react`.
- Impostata la configurazione server con porta standard `5173` e supporto per accesso host.

### 3.3. `index.html`
- **SEO & Accessibilità:** Tag semantici, metadati `description` focalizzati su digital twin metabolico e monitoraggio CGM, lingua italiana (`lang="it"`).
- **Tipografia:** Integrazione dei font Google ad alta leggibilità **Plus Jakarta Sans** (stile moderno e clinico) e **JetBrains Mono** (per valori numerici e metriche di laboratorio).
- **Dark Mode di default:** Classe `dark` sull'elemento `<html>` e favicon dinamica SVG con goccia ematica 🩸.

### 3.4. `src/index.css`
- Importazione moderna di Tailwind CSS v4 con `@import "tailwindcss";`.
- Definizione di token di design ed effetti visivi ad alto impatto estetico:
  - `.glass-panel` e `.glass-panel-glow`: Effetti di glassmorphism con sfocatura (`backdrop-filter: blur(16px)`), bordi semi-trasparenti `slate-800` e bagliori al neon color smeraldo (`#10b981`), ciano (`#06b6d4`) e rosa (`#f43f5e`).
  - Scrollbar custom minimalista scura.
  - Animazione `@keyframes pulseGlow` per lo stato attivo dei sensori e degli agenti.

---

### 3.5. `src/GlucoseChart.jsx`
Il componente grafico è stato riprogettato per fornire una rappresentazione fisiologica ad alta precisione:
1. **Finestra Temporale Estesa:** Da $t = -45\text{ min}$ (glicemia basale pre-pasto) fino a $t = +180\text{ min}$ (coda glicemica post-prandiale) con campionamento continuo ogni 5 minuti.
2. **Zona Bersaglio Time-In-Range (TIR):** Area ombreggiata morbida tra **$70\text{ mg/dL}$** e **$180\text{ mg/dL}$** visualizzata tramite `ReferenceArea` per verificare visivamente quando la glicemia rientra nei limiti terapeutici.
3. **Doppia Curva di Risposta:**
   - **Curva Standard (Rossa / Rose):** Riflette la cinetica classica non ottimizzata con picco massimo a $t_{\text{picco}}$ e ampiezza calcolata sulla base dei carboidrati, dell'indice glicemico e del contenuto di fibre.
   - **Curva Ottimizzata (Verde Smeraldo):** Ricalcolata dinamicamente a 60 FPS all'attivazione dei toggle What-If (riduzione dell'indice glicemico per pre-carico fibre e traslocazione GLUT4 per camminata).
4. **Modellazione della Coda dei Grassi (Effetto Pizza):** Se i lipidi del pasto superano i $20\text{g}$, la funzione matematica modella una persistenza glicemica tardiva oltre i $100\text{ minuti}$.
5. **Linee di Riferimento Clinico:**
   - Soglia Iperglicemia a $180\text{ mg/dL}$ tratteggiata rossa.
   - Soglia Ipoglicemia a $70\text{ mg/dL}$ tratteggiata ambra.
   - Marcatore temporale per il consumo del pasto a $t = 0\text{ min}$.
6. **Tooltip Interattivo Avanzato:** Mostra i valori esatti di entrambe le curve e calcola automaticamente il **Delta di escursione risparmiato** (in $\text{mg/dL}$).

---

### 3.6. `src/BolusCalculator.jsx`
Implementato il modulo per il calcolo trasparente del bolo insulinico in conformità alle linee guida cliniche definite in `prompt_chat.txt`:
1. **Formula a 4 Fasi:**
   - **Bolo Pasto:** $\text{Carboidrati (g)} / \text{Rapporto I:C}$
   - **Bolo Correzione:** $\max\left(0, \frac{\text{Glicemia Attuale} - \text{Target Glicemico}}{\text{FSI}}\right)$
   - **Sottrazione Insulina Attiva (IOB):** $-\text{IOB}$
   - **Adattamento Attività Fisica (GLUT4):** Quando il toggle camminata è attivo, applica una **riduzione prudenziale del $20\%$** sul bolo per prevenire ipoglicemie post-esercizio.
2. **Alert Speciale Effetto Pizza / Coda Grassi:**
   - Attivo se $\text{grassi} \ge 20\text{g}$.
   - Fornisce la raccomandazione di valutare un **Bolo Dual-Wave (Onda Doppia)**: $65\%$ come dose immediata (Normal Wave) + $35\%$ distribuito su 2–3 ore (Square Wave).
3. **Cassetto Configurazione Parametri Paziente:**
   - Permette all'utente di modificare in tempo reale: Target Glicemico (default $100\text{ mg/dL}$), Rapporto I:C (default $10\text{ g/U}$), Fattore di Sensibilità FSI (default $40\text{ mg/dL/U}$) e Insulina Attiva IOB (default $0.8\text{ U}$).
4. **Disclaimer Medico:** Esplicita avvertenza sulla natura di simulazione matematica a supporto educativo.

---

### 3.7. `src/ChatCoach.jsx`
Implementato l'agente conversazionale "GlucoTwin Coach" integrato direttamente nell'interfaccia:
1. **Accesso Completo al Contesto:**
   - Riceve in tempo reale lo stato del CGM, i parametri I:C/FSI/IOB, il JSON completo del piatto analizzato, i punti della curva e lo stato dei toggle What-If.
2. **Generatore di Risposte Cliniche Dedicato (Compatibile con `prompt_chat.txt`):**
   - **Domande sul Bolo:** Calcola e mostra l'intero scorporo matematico trasparente, la correzione, l'IOB e la strategia Dual-Wave.
   - **Domande sull'Andamento Glicemico:** Cita valori numerici reali (partenza a $t=0$, picco standard con minuto esatto es. $+75\text{m}$, picco ottimizzato, valori a $+120\text{m}$ e $+180\text{m}$, guadagno percentuale di Time-in-Range).
   - **Domande sui Meccanismi d'Azione:** Spiega la traslocazione indipendente da insulina dei GLUT4 muscolari e il gel viscoso indotto dalle fibre solubili pre-pasto.
3. **Pulsanti di Suggerimento Rapido (Quick Prompts):**
   - `💉 Calcola Bolo per questo pasto`
   - `📊 Quando avrò il picco glicemico?`
   - `🚶‍♂️ Perché camminare riduce il picco?`
   - `🥗 Effetto fibre pre-pasto`
4. **Supporto Formattazione:** Titoli, elenchi puntati, blocchi di citazione clinica e messaggi utente/coach distinti.

---

### 3.8. `src/App.jsx`
Il componente radice che coordina l'intera dashboard:
1. **Header Intelligente:**
   - Indicatore di stato dinamico: segnala in tempo reale se il backend FastAPI (`http://localhost:8000`) è connesso oppure se è attiva la modalità simulatore locale offline.
   - Slider CGM Live per regolare istantaneamente la glicemia di partenza ($70 - 220\text{ mg/dL}$) con badge cromatico di stato (Bersaglio, Elevata, Iperglicemia).
   - Campo input per l'API Key OpenRouter con pulsante show/hide.
2. **Selettore Pasti & Vision Uploader:**
   - 4 pasti pre-configurati completi di emoji, descrizione e valori nutrizionali precisi:
     - 🍕 **Pizza Margherita Verace:** $85\text{g}$ Carbs, $4\text{g}$ Fibre, $22\text{g}$ Grassi, IG 82 (con Coda Grassi attiva).
     - 🍝 **Spaghetti alla Carbonara:** $78\text{g}$ Carbs, $3\text{g}$ Fibre, $36\text{g}$ Grassi, IG 70 (con Coda Grassi attiva).
     - 🥗 **Poke Bowl Salmone & Edamame:** $62\text{g}$ Carbs, $10\text{g}$ Fibre, $18\text{g}$ Grassi, IG 60.
     - 🥙 **Insalata Mediterranea & Quinoa:** $38\text{g}$ Carbs, $14\text{g}$ Fibre, $16\text{g}$ Grassi, IG 42.
   - Area di caricamento foto reale con anteprima e stato di analisi.
3. **Pannello What-If con feedback immediato:**
   - Toggle Hack 1 (Pre-carico fibre) e Toggle Hack 2 (Camminata 15 min GLUT4).
   - Badge con indicazione combinata del delta di riduzione del picco e dell'incremento di Time-in-Range.
4. **Metriche KPI Superiori:**
   - Picco Previsto Standard (mg/dL) e minuto esatto.
   - Picco Previsto Ottimizzato (mg/dL) e minuto esatto.
   - Escursione Risparmiata (-mg/dL).
   - Percentuale di Time-in-Range (TIR) Standard vs Ottimizzata.
5. **Resilienza e Fallback Offline:**
   - In caso di assenza o ritardo del backend FastAPI, l'applicazione non si blocca mai e attiva automaticamente il dataset demo locale garantendo il 100% dell'interattività.

---

## 4. Validazione e Risultati del Collaudo

- **Installazione pacchetti (`npm install`):**
  - Eseguita con esito positivo: 0 vulnerabilità rilevate.
- **Compilazione di Produzione (`npm run build`):**
  - Esito: `Exit Code 0`.
  - Generati con successo i bundle in `frontend/dist/`:
    - `dist/index.html` ($1.29\text{ kB}$)
    - `dist/assets/index.css` ($43.06\text{ kB}$)
    - `dist/assets/index.js` ($682.15\text{ kB}$)
- **Dev Server locale (`npm run dev`):**
  - Attivo e funzionante su **`http://localhost:5173/`**.
