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

## 3. Design System Umano & Palette Colori Non-Tech

In risposta all'esigenza di rendere l'interfaccia **più umana, intuitiva e accessibile**, lontana da un'estetica sterile o da "hacker/cyberpunk":
1. **Eliminazione Totale delle Emoji:**
   - Tutte le emoji (piatti, gocce, siringhe, omini, faccine) sono state rimosse dall'interfaccia, dalle intestazioni, dai selettori e dai messaggi del bot.
   - Sostituite con un'iconografia professionale, uniforme e accessibile tramite **Lucide React** (`Utensils`, `Pizza`, `Sandwich`, `Salad`, `Footprints`, `Check`, `HeartPulse`, `Bot`).
2. **Palette Cromatica Medical-Grade e Rassicurante:**
   - **Sfondo Base:** Transizione da nero puro OLED/cyberpunk (`#030712`) a un ardesia profondo e morbido (`#0f172a` / `slate-900`), riducendo l'affaticamento visivo.
   - **Tonalità Guida (Calm Teal):** Adozione del verde petrolio/teal medico (`#14b8a6` / `teal-400`/`teal-300`) per identificare lo stato di salute ottimale, la curva consigliata e gli accenti primari, sostituendo i verdi fosforescenti/neon.
   - **Stati Glicemici Intuitivi:**
     - **Ottimale (70 - 140 mg/dL):** Soft teal rassicurante.
     - **Normale post-pasto (140 - 180 mg/dL):** Grigio ardesia neutro discreto.
     - **Bassa / Attenzione (< 70 mg/dL):** Ambra caldo per richiamare attenzione senza generare panico.
     - **Alta (> 180 mg/dL):** Corallo morbido tenue.
   - **Bolo e Carboidrati:** Tonalità cielo polveroso (`sky-300`) e ardesia, eliminando il ciano elettrico ad alto contrasto.
3. **Rimozione dei Bagliori Neon:**
   - Eliminati i glow neon fluttuanti (`blur-3xl`, `.glow-emerald`, `.pulse-glow`), sostituendoli con pannelli puliti con bordi sottili e ombre morbide.

---

## 4. Dettaglio dei Singoli File e Modifiche

### 4.1. `index.html`
- **Favicon Medica Vettoriale:** Sostituita l'emoji con una goccia medica stilizzata in SVG a tonalità teal.
- **Accessibilità & SEO:** Metadati italiani, tipografia **Plus Jakarta Sans** (stile moderno e clinico) e **JetBrains Mono** per la lettura nitida delle metriche numeriche.

### 4.2. `src/index.css`
- Configurazione Tailwind v4 con base background `#0f172a`.
- Rimozione di utility neon artificiali a favore di pannelli puliti con ombreggiatura naturale (`shadow-sm`, `shadow-xl`).
- Foglio di stile per KaTeX integrato e scrollbar minimalista non invasiva.

### 4.3. `src/GlucoseChart.jsx`
- **Curva Ottimizzata in Medical Teal:** Gradiente morbido `#14b8a6` per la traiettoria post-pasto consigliata.
- **Area Time-In-Range (TIR 70–180 mg/dL):** Campitura delicata in teal con soglie tratteggiate intuitive.
- **Marcatore Pasto Discreto:** Linea cielo a $t = 0\text{m}$ con etichetta pulita `Inizio Pasto`.
- **Tooltip Umano:** Visualizza il confronto esatto con il dato `Differenza glicemica: -X mg/dL` e `Con consigli Gluco`.

### 4.4. `src/BolusCalculator.jsx`
- Palette ricalibrata su toni teal e sky per eliminare l'aspetto "software da sviluppatore".
- Scomposizione chiara a 4 fasi:
  - **Bolo Pasto:** $\text{Carboidrati (g)} / \text{Rapporto I:C}$
  - **Bolo Correzione:** $\max\left(0, \frac{\text{Glicemia} - \text{Target}}{\text{FSI}}\right)$
  - **Insulina Attiva (IOB):** $-\text{IOB}$
  - **Attività Fisica (GLUT4):** Riduzione protettiva del $20\%$ all'attivazione del moto post-pasto.
- Alert "Effetto Pizza / Coda Grassi" spiegato in linguaggio comprensibile con ripartizione consigliata (65% subito + 35% prolungato).
- Cassetto parametri paziente (Target, I:C, FSI, IOB) e disclaimer medico trasparente.

### 4.5. `src/ChatCoach.jsx` (con Motore $\LaTeX$ KaTeX & Tono Umano)
- **Zero Emoji:** Rimossi tutti i simboli grafici da messaggi di sistema, avatar, quick prompts e risposte del bot.
- **Linguaggio Empatico e Chiaro:** Il messaggio di benvenuto accoglie calorosamente l'utente, riepiloga il pasto corrente e spiega le opzioni con chiarezza colloquiale.
- **Motore di Rendering $\LaTeX$:**
  - Formule in blocco `$$ ... $$` con scroll orizzontale automatico.
  - Formule inline `$ ... $` armonizzate con il testo discorsivo.
- **Pulsanti Rapidi Umani:** `Calcola Bolo`, `Picco Glicemico`, `Camminata post-pasto`, `Verdure prima del pasto`.

### 4.6. `src/App.jsx`
- **Header:** Brand "Gluco" in bianco nitido con badge discreto "Assistente Glicemico" e stato connessione rassicurante ("Sensore collegato" / "Modalità demo").
- **Home Rapida Quotidiana:**
  - **Pasto Attuale come Tasto:** Grande pulsante interattivo con icona vettoriale Lucide (`Utensils`, `Pizza`, `Sandwich`, `Salad`), nome, carboidrati e indicatore "Cambia".
  - **4 Micro-tasti Veloci:** Selezione rapida a 1-tap con icone pulite e stato attivo in teal solido.
  - **Stima Rapida Bolo Compatta:** Dose consigliata in grande (`U`), riepilogo rapido e link diretto al calcolatore.
  - **Consigli per la Stabilità Glicemica:** Toggle What-If riformulati in abitudini quotidiane ("Verdura prima del pasto" e "15 min di camminata post-pasto") con icone `Salad` e `Footprints`.
  - **KPI Intuitivi:** "Picco Normale", "Picco con Consigli", "Differenza Glicemica", "Tempo nel Range".
- **Analisi Pasto:** Selettore 4 pasti quotidiani con icone dedicate, uploader fotografico e scheda macronutrienti bilanciata.
- **Curva & Trend:** Vista cinetica ad alta risoluzione da $t = -45\text{m}$ a $+180\text{m}$.
- **Layout Responsivo Chat Coach:**
  - **Desktop (`lg:`):** Chat laterale sticky sul lato destro, collassabile con pulsante dock discreto.
  - **Mobile (`< lg`):** Barra flottante in rilievo in basso (`fixed bottom-4`) con icona e apertura immediata di un Bottom Sheet ergonomico a tutto schermo.

---

## 5. Validazione e Risultati del Collaudo

- **Verifica Assenza Emoji:** Eseguita scansione automatica regex su tutti i file sorgente in `frontend/src/` con esito: **0 emoji rilevate**.
- **Compilazione di Produzione (`npm run build`):**
  - Esito: `Exit Code 0` in $13.06\text{s}$.
  - Asset ottimizzati pronti per il deploy:
    - `dist/index.html` ($1.36\text{ kB}$)
    - `dist/assets/index-C0tyPO98.css` ($77.37\text{ kB}$)
    - `dist/assets/index-D6EWuWTy.js` ($976.61\text{ kB}$)
- **Dev Server locale (`npm run dev`):**
  - Attivo su **`http://localhost:5173/`**.
