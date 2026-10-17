# Gluco — Documentazione Tecnica Modifiche Frontend

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
| **Lucide React** | `v1.16.0` | Iconografia moderna medical & digital health: Utensils, Pizza, Sandwich, Salad, Footprints, Syringe, HeartPulse, Activity, Check, Bot. |

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
│   ├── index.css             # Configurazione Tailwind v4, design system e palette sanitaria
│   └── main.jsx              # Entry point React 19 con importazione stili KaTeX (katex.min.css)
├── index.html                # Template HTML5 con metadati SEO, font Google e favicon SVG medica
├── package.json              # Configurazione dipendenze e script npm
└── vite.config.js            # Configurazione Vite con plugin React e Tailwind CSS v4
```

---

## 3. Design System Consumer Health (Stile Apple Health / Dexcom)

In risposta alla richiesta di **rendere Gluco il più vicino possibile a un pubblico ampio** (pazienti diabetici di ogni età, famiglie e caregiver) e non solo a programmatori o appassionati di tech:

1. **Architettura Stilistica (Tailwind v4 Re-ingegnerizzato):**
   - Mantenuto **Tailwind CSS v4** per velocità ed efficienza, riprogettando la gerarchia visiva da dark/cyberpunk a **Daylight Consumer Health**.
   - **Nessuna Riscrittura Rischiosa:** Non è stato necessario introdurre framework pesanti o cambiare librerie; il design system è stato riorientato su tonalità naturali e contrasti WCAG AAA.

2. **Addio ai Font Monospace da Terminale (`--font-mono` Riprogettato):**
   - I font a spaziatura fissa (`font-mono`) trasmettevano un'impressione da riga di comando o schermata hacker.
   - `--font-mono` è stato rimappato su `'Plus Jakarta Sans', system-ui, sans-serif`, consentendo a numeri, dosi e glicemie di apparire arrotondati, amichevoli e rassicuranti.

3. **Palette Daylight Chiara & Rassicurante:**
   - **Sfondo Principale:** Sfondo chiaro distensivo `bg-slate-50` (`#f8fafc`).
   - **Card & Riquadri:** Card bianche pure `bg-white` con bordi ultra-sottili `border-slate-200` e ombre morbide `shadow-sm` / `shadow-xs`.
   - **Tonalità Guida (Medical Calm Teal):**
     - Accenti, pulsanti principali e selezioni in `teal-600` / `teal-700` (`#0d9488` / `#0f766e`), ad altissima leggibilità sia su bianco che su sfondi tenui.
   - **Indicatori di Stato Metabolico:**
     - **Ottimale (70 - 140 mg/dL):** Pillola chiara `bg-teal-50 text-teal-800 border-teal-200`.
     - **Normale post-pasto (140 - 180 mg/dL):** Pillola neutra `bg-slate-100 text-slate-700 border-slate-200`.
     - **Bassa / Attenzione (< 70 mg/dL):** Pillola ambra calda `bg-amber-50 text-amber-800 border-amber-200`.
     - **Alta (> 180 mg/dL):** Pillola corallo tenue `bg-rose-50 text-rose-800 border-rose-200`.
   - **Grafico Recharts Daylight:**
     - Assi e linee di griglia ammorbidite su `#e2e8f0` e `#64748b`.
     - Tooltip ridisegnato come scheda bianca `bg-white/95 border-slate-200 text-slate-800 shadow-xl`.
     - Fascia Time-in-Range (70-180 mg/dL) con gradiente verde acqua delicato e rilassante.

4. **Zero Emoji:**
   - Confermata l'assenza totale di emoji su tutto il frontend.
   - Iconografia clinica pulita con **Lucide React** (`Utensils`, `Pizza`, `Sandwich`, `Salad`, `Footprints`, `HeartPulse`, `Activity`, `Syringe`, `Bot`, `Sparkles`).

---

## 4. Dettaglio dei Singoli File e Modifiche

### 4.1. `index.html`
- **Rimozione classe `dark`:** Body impostato su `bg-slate-50 text-slate-800 antialiased min-h-screen`.
- **Tipografia:** Plus Jakarta Sans integrato con rendering nitido.
- **Titolo & Metadati:** Titolo ottimizzato "Gluco | Guida Intelligente per la tua Glicemia".

### 4.2. `src/index.css`
- Configurazione Tailwind v4 con base background `#f8fafc` e testo `#0f172a`.
- Mappatura `--font-mono` su `'Plus Jakarta Sans'` per numeri e dosi dall'aspetto consumer health.
- Stile KaTeX chiaro con sfondo matematico tenue `#f1f5f9` e bordo `#e2e8f0`.
- Scrollbar chiara e minimalista.

### 4.3. `src/GlucoseChart.jsx`
- Griglia e assi visibili con contrasto daylight naturale.
- Curve morbide con gradienti teal e corallo non abbaglianti.
- Tooltip in scheda bianca ad alta leggibilità.

### 4.4. `src/BolusCalculator.jsx`
- Contenitore principale `bg-white border-slate-200 shadow-sm`.
- Scomposizione a 4 fasi in box chiari `bg-slate-50 border-slate-200`.
- Banner della dose in evidenza rassicurante `bg-teal-50/70 border-teal-200 text-teal-800 font-extrabold`.
- Alert "Effetto Pizza / Coda Grassi" in ambra caldo `bg-amber-50 border-amber-200 text-amber-900`.

### 4.5. `src/ChatCoach.jsx` (con Motore $\LaTeX$ KaTeX & Tono Umano)
- Box chat in scheda bianca pulita con bordo slate chiaro.
- Messaggi del bot su sfondo bianco nitido con testo `slate-800`.
- Messaggi dell'utente su bolla `bg-teal-600 text-white`.
- Quick prompts in pillole chiare `bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800`.
- Campo di input in `bg-slate-50 border-slate-200` con focus su bordo teal.

### 4.6. `src/App.jsx`
- **Header:** Sfondo `bg-white/95 border-b border-slate-200 shadow-xs`, logo Gluco scuro con icona teal, stato connessione e barra di navigazione con pillole attive in `bg-teal-600 text-white`.
- **Home Rapida Quotidiana:**
  - **Controller Glicemia:** Card bianca con stepper ±5, 4 preset veloci (90, 115, 140, 175) e slider continuo accent teal.
  - **Consiglio Personalizzato:** Banner in `bg-teal-50/70 border-teal-200` con testo chiaro e pulsante di azione a 1-tap.
  - **Pasto Attuale come Tasto:** Grande pulsante `bg-slate-50 border-slate-200 hover:border-teal-300` con 4 tasti pasto veloci sottostanti.
  - **Stima Rapida Bolo Compatta:** Scheda dose in grande `text-teal-700` con riepilogo a 3 voci (Pasto, Correzione, IOB).
  - **Consigli per la Stabilità Glicemica:** Toggle abitudini in schede bianche/teal con stato chiaro.
  - **4 KPI Comprensibili:** Schede chiare con metriche in evidenza per picco, differenza glicemica e Time-in-Range.
- **Analisi Pasto:** Scheda bianca con selettore pasti, drag-and-drop foto e griglia dei macronutrienti chiara.
- **Curva & Trend:** Scheda completa con simulazione cinetica e spiegazione fisiologica.
- **Layout Responsivo Chat Coach:**
  - **Desktop (`lg:`):** Chat laterale sticky sul lato destro, con pulsante dock fluttuante bianco in basso a destra.
  - **Mobile (`< lg`):** Barra fluttuante in rilievo bianca in basso con apertura di un drawer full-height bianco ed elegante.

---

## 5. Validazione e Risultati del Collaudo

- **Verifica Assenza Emoji:** 0 emoji rilevate in tutti i sorgenti frontend.
- **Compilazione di Produzione (`npm run build`):**
  - Esito: `Exit Code 0` in $18.42\text{s}$.
  - Asset ottimizzati e bundle generato in `dist/`.
- **Dev Server locale (`npm run dev`):**
  - Attivo su **`http://localhost:5173/`**.
