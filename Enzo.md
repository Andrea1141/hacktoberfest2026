# 🩸 Gluco — Documentazione Tecnica Modifiche Frontend

Questo documento descrive in dettaglio tutte le implementazioni, le scelte architetturali e i componenti realizzati per il front-end di **Gluco** all'interno della cartella `frontend/`.

---

## 1. Stack Tecnologico & Architettura

| Tecnologia | Versione / Libreria | Scopo & Ruolo |
| :--- | :--- | :--- |
| **Vite** | `v6.2.0+` | Build tool e dev server ad altissime prestazioni con Hot Module Replacement (HMR). |
| **React** | `v19.0.0` | Libreria UI per la gestione dello stato reattivo e del rendering a 60 FPS. |
| **Tailwind CSS** | `v4.0.9` | Engine CSS nativo con il plugin ufficiale `@tailwindcss/vite`, direttiva `@import "tailwindcss"` e zero file di configurazione legacy. |
| **Recharts** | `v2.15.1` | Rendering reattivo dei grafici SVG per la cinetica glicemica post-prandiale. |
| **KaTeX** | `v0.16.21` | Motore di rendering matematico ad alte prestazioni per visualizzare formule LaTeX ($\LaTeX$) sia inline ($...$) che in blocco ($$...$$) nella chat del bot. |
| **Lucide React** | `v1.16.0` | Iconografia moderna medical & digital health. |

---

## 2. Struttura dei File Creata e Organizzata

```text
frontend/
├── dist/                     # Bundle di produzione compilato e ottimizzato
├── node_modules/             # Dipendenze installate (React, Recharts, KaTeX, Tailwind v4, Lucide)
├── src/
│   ├── App.jsx               # Dashboard principale, gestione stato e layout responsive
│   ├── BolusCalculator.jsx   # Modulo di calcolo matematico trasparente del bolo insulinico
│   ├── ChatCoach.jsx         # Chat con Gluco Coach con motore di rendering LaTeX (KaTeX)
│   ├── GlucoseChart.jsx      # Grafico cinetico Recharts (curve glicemiche e Time-in-Range)
│   ├── index.css             # Configurazione Tailwind v4, glassmorphism e design system
│   └── main.jsx              # Entry point React 19 con importazione stili KaTeX (katex.min.css)
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
- Installate le dipendenze essenziali: `react`, `react-dom`, `recharts`, `katex`, `lucide-react`, `@tailwindcss/vite`, `tailwindcss`, `@vitejs/plugin-react` e `vite`.

### 3.2. `vite.config.js`
- Integrato il plugin nativo `@tailwindcss/vite` insieme a `@vitejs/plugin-react`.
- Impostata la configurazione server con porta standard `5173` e supporto per accesso host.

### 3.3. `index.html`
- **SEO & Accessibilità:** Tag semantici, metadati `description` focalizzati su digital twin metabolico e monitoraggio CGM, lingua italiana (`lang="it"`).
- **Tipografia:** Integrazione dei font Google ad alta leggibilità **Plus Jakarta Sans** (stile moderno e clinico) e **JetBrains Mono** (per valori numerici e metriche di laboratorio).
- **Dark Mode di default:** Classe `dark` sull'elemento `<html>` e favicon dinamica SVG con goccia ematica 🩸.

### 3.4. `src/index.css` & `src/main.jsx`
- Importazione moderna di Tailwind CSS v4 con `@import "tailwindcss";`.
- Importazione foglio di stile KaTeX `katex/dist/katex.min.css` in `main.jsx` con bundle automatico dei font matematici WOFF/WOFF2.
- Definizione di token di design ed effetti visivi ad alto impatto estetico:
  - `.glass-panel` e `.glass-panel-glow`: Effetti di glassmorphism con sfocatura (`backdrop-filter: blur(16px)`), bordi semi-trasparenti `slate-800` e bagliori al neon color smeraldo (`#10b981`), ciano (`#06b6d4`) e rosa (`#f43f5e`).
  - Stili custom per la visualizzazione di KaTeX (`.katex-display`) con scroll orizzontale automatico e background scuro elegante.
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

### 3.7. `src/ChatCoach.jsx` (con Motore di Rendering $\LaTeX$ Nativo)
Completamente riprogettato con supporto nativo al rendering formale matematico **$\LaTeX$** tramite **KaTeX**:
1. **Parser & Tokenizer KaTeX integrato (`renderLatex`):**
   - Supporto per **formule in blocco (display mode)**: `$$ ... $$` con scroll orizzontale e box evidenziato.
   - Supporto per **formule inline**: `$ ... $` renderizzate perfettamente allineate con il testo clinico.
   - Fallback automatico testuale in caso di sintassi non valida.
2. **Formule Matematiche Cliniche Formalizzate in $\LaTeX$:**
   - **Calcolo Bolo Totale:**
     $$\text{Bolo}_{\text{totale}} = \left( \frac{\text{CHO}}{\text{I:C}} + \max\left(0, \frac{\text{BG}_{\text{curr}} - \text{BG}_{\text{target}}}{\text{FSI}}\right) - \text{IOB} \right) \times (1 - \delta_{\text{GLUT4}})$$
   - **Ripartizione Bolo Dual-Wave (Onda Doppia):**
     $$\text{Bolo}_{\text{normale}} = 0.65 \times \text{Bolo}_{\text{totale}}, \quad \text{Bolo}_{\text{onda quadra}} = 0.35 \times \text{Bolo}_{\text{totale}}$$
   - **Cinetica Glicemica ed Escursione:**
     $$\Delta G(t) = G(t) - G_{\text{basale}}, \quad \text{TIR} = [70, 180]\, \text{mg/dL}$$
3. **Messaggio di Benvenuto Semplice e Intuitivo:**
   - Il messaggio iniziale non sovraccarica l'utente con gergo clinico o formule matematiche complesse: saluta calorosamente, conferma il pasto selezionato e il valore glicemico attuale in formato colloquiale chiaro.
   - Fornisce un elenco immediato a 3 punti sulle azioni possibili: calcolare il bolo, prevedere il picco glicemico o scoprire strategie di mitigazione con camminata/fibre.
4. **Pulsanti di Suggerimento Rapido (Quick Prompts) Naturali:**
   - `💉 Calcola Bolo` (attiva lo scorporo analitico rigoroso con equazioni $\LaTeX$)
   - `📈 Picco Glicemico` (richiede la proiezione temporale $G(t)$ e $G_{\max}$)
   - `🚶‍♂️ Camminata post-pasto` (spiega la traslocazione GLUT4 e lo sconto del $20\%$)
   - `🥗 Effetto Fibre` (spiega il ritardo dell'assorbimento gastrico)
5. **Supporto Markdown Ibrido & KaTeX:** Intestazioni `### `, grassetto `**...**`, citazioni cliniche `> ` ed elenchi puntati con formule $\LaTeX$ inline e in blocco.

---

### 3.8. `src/App.jsx`
Il componente radice che coordina l'intera dashboard con architettura a schede e layout responsivo per la chat:
1. **Navigazione a Schede / Pagine Ordinata:**
   - **⚡ Home Rapida (Daily):** Schermata principale per l'uso quotidiano con controller rapido CGM ($\pm 5\text{ mg/dL}$ e preset rapidi $90, 115, 140, 175$), scelta pasto a 1-tap, stima immediata del bolo consigliato con scorporo, mini-toggle What-If e anteprima diretta della curva glicemica con i 4 KPI.
   - **🍽️ Analisi Pasto:** Selettore pasti con 4 opzioni quotidiane, uploader drag & drop con Vision Agent multimodale Gemma 4, scheda bromatologica completa (Carbs, Fibre, Grassi, Proteine, Indice Glicemico).
   - **📈 Curva & Trend:** Vista immersiva e ingrandita della cinetica post-prandiale ($-45\text{m} \dots +180\text{m}$), soglie di ipo/iperglicemia e Time-in-Range ($70 - 180\text{ mg/dL}$), e spiegazione fisiologica approfondita.
   - **💉 Calcolatore Bolo:** Modulo trasparente interattivo con formule matematiche a 4 fasi, adattamento all'attività GLUT4 ($-20\%$), cassetto configurazione parametri paziente (Target, I:C, FSI, IOB) e alert Onda Doppia per cibi ricchi di lipidi.

2. **Disposizione Responsiva della Chat AI ("Gluco Coach"):**
   - **Modalità Desktop (`lg:`):** Chat laterale sticky sul lato destro dello schermo (`sticky top-24`), costantemente accessibile durante la navigazione tra le schede. Include pulsante di apertura/chiusura nell'header e dock flottante discreto in basso a destra quando compressa.
   - **Modalità Mobile (`< lg`):** Barra flottante in rilievo in basso (`fixed bottom-4 left-4 right-4`) con effetto glassmorphism e bagliore neon. Con un tap si apre un elegante **Bottom Sheet** a tutto schermo con maniglia di trascinamento e tasto di chiusura, garantendo la massima usabilità su smartphone.

3. **Resilienza e Fallback Offline:**
   - In caso di assenza o ritardo del backend FastAPI, l'applicazione non si blocca mai e attiva automaticamente il dataset demo locale garantendo il 100% dell'interattività deterministica.

---

## 4. Validazione e Risultati del Collaudo

- **Installazione pacchetti (`npm install`):**
  - Eseguita con esito positivo: installato `katex` (v0.16.21), 0 vulnerabilità rilevate.
- **Compilazione di Produzione (`npm run build`):**
  - Esito: `Exit Code 0`.
  - Generati con successo i bundle ottimizzati in `dist/assets/`:
    - `dist/index.html` ($1.26\text{ kB}$)
    - `dist/assets/index-B2w_giva.css` ($87.89\text{ kB}$ inclusi font e stili KaTeX)
    - `dist/assets/index-C8-zuvd-.js` ($978.76\text{ kB}$ inclusi motori KaTeX, Recharts e React 19)
- **Dev Server locale (`npm run dev`):**
  - Attivo e funzionante su **`http://localhost:5173/`**.
- **Igiene Repository & Git:**
  - File `.gitignore` aggiornato con regole ricorsive per escludere automaticamente `node_modules/`, directory di build (`dist/`), file di ambiente locali (`.env.*`), cache di bundling (`.vite/`, `.cache/`, `.turbo/`) e file spazzatura del sistema operativo.
  - Risolti i conflitti di tracciamento e rimosse le copie duplicate legacy dalla radice di `frontend/`.
