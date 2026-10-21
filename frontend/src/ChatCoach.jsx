import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, MessageSquare, RefreshCw, Zap, TrendingUp, Syringe, ShieldAlert, X, ChevronLeft, ChevronRight } from 'lucide-react';
import katex from 'katex';

/**
 * Rendering sicuro di stringhe LaTeX tramite KaTeX
 */
function renderLatex(latexStr, displayMode = false) {
  try {
    return katex.renderToString(latexStr, {
      displayMode,
      throwOnError: false
    });
  } catch (e) {
    return latexStr;
  }
}

/**
 * Parsing inline di LaTeX ($...$), grassetto (**...**) e codice (`...`)
 */
function renderInlineSegments(text) {
  if (!text) return null;
  // Tokenizer per math $...$, bold **...**, e inline code `...`
  const parts = text.split(/(\$[^\$\n]+?\$|\*\*[^*]+?\*\*|`[^`]+?`)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    // Inline LaTeX: $ formula $
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1);
      return (
        <span
          key={i}
          className="inline-katex mx-0.5 text-teal-800 font-semibold"
          dangerouslySetInnerHTML={{ __html: renderLatex(math, false) }}
        />
      );
    }

    // Bold Markdown: ** testo **
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Code Monospace: ` codice `
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="bg-slate-100 text-teal-900 px-1.5 py-0.5 rounded text-[11px] border border-slate-200 font-medium">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

/**
 * Componente per il rendering formattato con supporto LaTeX a blocchi ($$...$$) e inline
 */
function FormattedMessageContent({ text }) {
  if (!text) return null;

  // Suddivisione per blocchi LaTeX matematici $$ ... $$
  const blockParts = text.split(/\$\$([\s\S]*?)\$\$/g);

  return (
    <div className="space-y-1.5 leading-relaxed text-xs">
      {blockParts.map((block, bIdx) => {
        // Se indice dispari, è un blocco matematico LaTeX
        if (bIdx % 2 === 1) {
          return (
            <div
              key={bIdx}
              className="my-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto text-slate-900 text-center shadow-xs"
              dangerouslySetInnerHTML={{ __html: renderLatex(block.trim(), true) }}
            />
          );
        }

        // Se indice pari, è normale testo con righe ed elenchi
        const lines = block.split('\n');
        return (
          <React.Fragment key={bIdx}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lIdx} className="h-1.5" />;
              }

              if (line.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="font-bold text-teal-800 text-sm mt-2 mb-1 flex items-center gap-1.5">
                    {renderInlineSegments(line.replace('### ', ''))}
                  </h4>
                );
              }

              if (line.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="font-extrabold text-teal-900 text-base mt-2.5 mb-1.5">
                    {renderInlineSegments(line.replace('## ', ''))}
                  </h3>
                );
              }

              if (line.startsWith('* ') || line.startsWith('- ')) {
                return (
                  <li key={lIdx} className="ml-4 list-disc text-slate-700 my-0.5">
                    {renderInlineSegments(line.replace(/^(\*|-)\s+/, ''))}
                  </li>
                );
              }

              if (line.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="p-2.5 bg-teal-50/70 rounded-xl border-l-2 border-teal-500 text-[11px] text-slate-700 italic my-2">
                    {renderInlineSegments(line.replace('> ', ''))}
                  </blockquote>
                );
              }

              return (
                <p key={lIdx} className="text-slate-700">
                  {renderInlineSegments(line)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ChatCoach({
  glicemia = 115,
  meal = {},
  coach = {},
  usaHack1 = false,
  usaHack2 = false,
  impostazioni = { rapportoIC: 10, fsi: 40, targetGlicemico: 110, iob: 0.0 },
  datiCurva = [],
  piccoStd = 180,
  piccoOpt = 145,
  tPiccoStd = 65,
  tPiccoOpt = 70,
  tirStd = 70,
  tirOpt = 85,
  apiKey = '',
  aiConfig = { provider: 'auto', localUrl: 'http://localhost:11434', localModel: 'gemma2:2b', apiKey: '' },
  className = "h-[520px]",
  onChiudi = null
}) {
  const [messaggi, setMessaggi] = useState([
    {
      id: 'welcome',
      mittente: 'coach',
      testo: `Ciao! Sono **Gluco Coach**.

Ho registrato il tuo pasto (**${meal?.nome_piatto || 'Pasto'}**) e la tua glicemia attuale (**${glicemia} mg/dL**).

Come posso aiutarti?
* **Calcolare il bolo** consigliato passo-passo
* **Prevedere il picco** della glicemia e i tempi
* Scoprire come **ridurre il picco** con una camminata o verdure

Tocca uno dei suggerimenti rapidi qui sotto oppure scrivimi direttamente!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputTesto, setInputTesto] = useState('');
  const [staScrivendo, setStaScrivendo] = useState(false);
  const chatBottomRef = useRef(null);
  const quickPromptsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPillole = () => {
    const el = quickPromptsRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  };

  const scrollPillole = (offset) => {
    if (quickPromptsRef.current) {
      quickPromptsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScrollPillole, 250);
    }
  };

  // Supporto per scorrimento orizzontale sia con rotella del mouse che con resize
  useEffect(() => {
    const el = quickPromptsRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScrollPillole();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    checkScrollPillole();
    window.addEventListener('resize', checkScrollPillole);
    return () => {
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', checkScrollPillole);
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messaggi, staScrivendo]);

  // Generatore di risposte cliniche in formato LaTeX rigoroso
  const generaRispostaCoach = (domanda) => {
    const q = domanda.toLowerCase();
    const safeImpostazioni = impostazioni || { rapportoIC: 10, fsi: 40, targetGlicemico: 110, iob: 0.0 };
    const { targetGlicemico = 110, rapportoIC = 10, fsi = 40, iob = 0.0 } = safeImpostazioni;
    const carbs = meal?.carboidrati_g ?? 74;
    const grassi = meal?.grassi_g ?? 15;
    const fibre = meal?.fibre_g ?? 4;

    const curveList = Array.isArray(datiCurva) ? datiCurva : [];
    // Punti della curva a t = 0, +120m, +180m
    const punto0 = curveList.find(p => p.minuti === 0)?.standard ?? glicemia;
    const punto120Std = curveList.find(p => p.minuti === 120)?.standard ?? Math.round(piccoStd * 0.85);
    const punto120Opt = curveList.find(p => p.minuti === 120)?.ottimizzata ?? Math.round(piccoOpt * 0.82);
    const punto180Std = curveList.find(p => p.minuti === 180)?.standard ?? Math.round(glicemia * 1.1);
    const punto180Opt = curveList.find(p => p.minuti === 180)?.ottimizzata ?? glicemia;

    // 1. Domanda su Timing del Bolo (quando iniettare)
    if (q.includes('timing') || q.includes('anticipo') || (q.includes('quando') && (q.includes('bolo') || q.includes('insulina') || q.includes('iniett') || q.includes('fare')))) {
      let anticipoTxt = '';
      if (glicemia < 90) {
        anticipoTxt = 'Glicemia di partenza tendente al basso ($<90\\text{ mg/dL}$): inietta **subito all\'inizio del pasto o dopo i primi bocconi**, per scongiurare un calo reattivo.';
      } else if (glicemia <= 140) {
        anticipoTxt = 'Glicemia in target ($90-140\\text{ mg/dL}$): inietta **10–15 minuti prima** per analoghi rapidi (Humalog/Novorapid) o **0–5 minuti prima** per ultra-rapidi (Fiasp/Lyumjev).';
      } else {
        anticipoTxt = `Glicemia basale elevata ($${glicemia}\\text{ mg/dL}$): anticipa il bolo di **20–25 minuti prima del pasto** per far partire l\'azione insulinica prima dell\'assorbimento degli amidi.`;
      }

      let resp = `### Timing Ottimale dell\'Iniezione del Bolo\\n\\n`;
      resp += `* **Glicemia CGM Attuale:** $G_0 = ${glicemia}\\text{ mg/dL}$ (${trendCgm || 'STABILE'})\\n`;
      resp += `* **Finestra di Anticipo Consigliata:** ${anticipoTxt}\\n`;
      resp += `* **Pre-carico di Fibre:** ${usaHack1 ? 'Attivo (smorza l\'impennata iniziale)' : 'Consigliato 10 min prima per ritardare il picco'}\\n`;
      resp += `* **Camminata GLUT4:** Da iniziare $25-30\\text{ min}$ post-pasto per sincronizzare i trasportatori muscolari con l\'assorbimento intestinale.\\n\\n`;
      if (grassi >= 20) {
        resp += `**Attenzione ai Lipidi ($${grassi}\\text{g}$ di grassi):** Con pasti ad alto contenuto di grassi, valuta con il diabetologo un **bolo ad onda doppia**: 60% subito e 40% prolungato su 2–3 ore.\\n\\n`;
      }
      resp += `> *Avviso:* Regola sempre i tempi in base alle indicazioni del tuo diabetologo e all\'insulina specifica utilizzata.`;
      return resp;
    }

    // 2. Domanda su Sostituzioni Alimentari e Alternative a Basso IG
    if (q.includes('sostituz') || q.includes('alternativ') || q.includes('basso indice') || q.includes('low carb') || q.includes('meno carb') || q.includes('cosa posso mangiare')) {
      const pNome = (meal?.nome_piatto || '').toLowerCase();
      let swaps = '';
      if (pNome.includes('pasta') || pNome.includes('carbonara') || pNome.includes('spaghetti')) {
        swaps = `* **Pasta 100% Farina di Legumi (lenticchie rosse o ceci):** Riduce i carboidrati netti del 40%, triplica le fibre (12g+) e abbassa l'indice glicemico a ~32.\n` +
          `* **Pasta Integrale di Grano Duro al Dente:** L'amido al dente resiste alla digestione gastrica (amido resistente tipo 3), con IG di 45 invece di 70.\n` +
          `* **Zoodles (Spaghetti di Zucchine) o Shirataki di Konjac:** Praticamente privi di carboidrati (<5g), picco glicemico quasi piatto.`;
      } else if (pNome.includes('pizza')) {
        swaps = `* **Pinsa Romana con farine miste a lievitazione 72h:** Maggiore alveolazione e digeribilità, picco meno violento.\n` +
          `* **Base Integrale o Farina Tipo 2:** La crusca rallenta l'assorbimento dell'alfa-amilasi gastrica.\n` +
          `* **Strategia Porzione:** 2 tranci di pizza accompagnati da abbondante insalata verde pre-pasto per dimezzare l'indice glicemico effettivo.`;
      } else if (pNome.includes('riso') || pNome.includes('risotto')) {
        swaps = `* **Riso Basmati Integrale o Riso Venere:** Ricchi di amilosio e antociani, evitano la rapida gelatinizzazione del riso raffinato.\n` +
          `* **Orzotto o Farrotto perlato:** Ricchi di beta-glucani solubili con IG 35-40 (rispetto all'80 del riso bianco).`;
      } else if (pNome.includes('brioche') || pNome.includes('colazione')) {
        swaps = `* **Porridge di Avena Integrale con Noci e Cannella:** I beta-glucani formano una barriera naturale che modera la salita glicemica del mattino.\n` +
          `* **Yogurt Greco intero (o 5%) con Frutti di Bosco:** Zero zuccheri raffinati, 15g di proteine e picco glicemico stabile (<120 mg/dL).`;
      } else {
        swaps = `* **Verdure crude pre-pasto:** Mangiare insalata o finocchi 10 minuti prima riduce l'IG complessivo di 15-20 punti.\n` +
          `* **Abbinamento proteico e lipidico:** Aggiungere olio EVO a crudo o proteine sane per rallentare lo svuotamento gastrico.\n` +
          `* **Cereali a chicco intero:** Sostituisci farine raffinate con cereali integri (farro, grano saraceno, avena).`;
      }

      return `### Alternative e Sostituzioni a Basso Indice Glicemico per **${meal?.nome_piatto}**:\n\n` +
        `${swaps}\n\n` +
        `💡 **Regola d'Oro:** L'ordine con cui consumi i cibi (Fibre -> Proteine/Grassi -> Carboidrati) riduce il picco fino al 35% anche a parità di porzione!`;
    }

    // 3. Domanda su bolo / insulina
    if (q.includes('bolo') || q.includes('insulina') || q.includes('quanto') || q.includes('dose') || q.includes('fai') || q.includes('calcol')) {
      const boloPasto = (carbs / rapportoIC);
      const deltaGli = Math.max(0, glicemia - targetGlicemico);
      const boloCorr = deltaGli / fsi;
      const subtot = boloPasto + boloCorr;
      const scontoMoto = usaHack2 ? (subtot * 0.20) : 0;
      const boloTot = Math.max(0, subtot - iob - scontoMoto);

      let resp = `### Calcolo del Bolo (Formule $\\LaTeX$)\n\n`;
      resp += `Ecco lo scorporo analitico per **${meal?.nome_piatto}**:\n\n`;

      resp += `* **1. Bolo Carboidrati (Pasto):**\n`;
      resp += `$$ \\text{Bolo}_{\\text{pasto}} = \\frac{\\text{Carboidrati (g)}}{\\text{Rapporto I:C}} = \\frac{${carbs}\\text{ g}}{${rapportoIC}\\text{ g/U}} = ${boloPasto.toFixed(2)}\\text{ U} $$\n\n`;

      resp += `* **2. Bolo di Correzione Glicemica:**\n`;
      if (deltaGli > 0) {
        resp += `$$ \\text{Bolo}_{\\text{corr}} = \\max\\left(0, \\frac{G_{\\text{CGM}} - G_{\\text{target}}}{\\text{FSI}}\\right) = \\frac{${glicemia} - ${targetGlicemico}}{${fsi}} = ${boloCorr.toFixed(2)}\\text{ U} $$\n\n`;
      } else {
        resp += `$$ \\text{Bolo}_{\\text{corr}} = 0.00\\text{ U} \\quad (G_{\\text{CGM}} = ${glicemia} \\le G_{\\text{target}} = ${targetGlicemico}) $$\n\n`;
      }

      resp += `* **3. Insulina Attiva Residua (IOB):**\n`;
      resp += `$$ \\text{IOB}_{\\text{attiva}} = -${iob.toFixed(2)}\\text{ U} $$\n\n`;

      if (usaHack2) {
        resp += `* **4. Adattamento Attività Fisica (Camminata attiva):**\n`;
        resp += `$$ \\text{Sconto}_{\\text{GLUT4}} = -20\\% \\times (\\text{Bolo}_{\\text{pasto}} + \\text{Bolo}_{\\text{corr}}) = -${scontoMoto.toFixed(2)}\\text{ U} $$\n\n`;
      } else {
        resp += `* **4. Adattamento Attività Fisica:** Nessuno sconto applicato ($0.00\\text{ U}$). Attivando la camminata post-pasto potrai ridurre il bolo del $20\\%$.\n\n`;
      }

      resp += `* **5. Equazione della Dose Totale:**\n`;
      resp += `$$ \\mathbf{Dose}_{\\text{totale}} = \\max\\left(0, \\text{Bolo}_{\\text{pasto}} + \\text{Bolo}_{\\text{corr}} - \\text{IOB} - \\text{Sconto}_{\\text{moto}}\\right) $$\n`;
      resp += `$$ \\mathbf{Dose}_{\\text{totale}} = ${boloTot.toFixed(2)}\\text{ U} \\approx \\mathbf{${boloTot.toFixed(1)}\\text{ U}} $$\n\n`;

      if (grassi >= 20) {
        const rapida = (boloTot * 0.65).toFixed(1);
        const lenta = (boloTot * 0.35).toFixed(1);
        resp += `**Strategia a Rilascio Prolungato (Pasto ricco di grassi, $${grassi}\\text{g} \\ge 20\\text{g}$):**\n`;
        resp += `I lipidi ritardano lo svuotamento gastrico. È consigliato valutare un **Bolo a Onda Doppia**:\n`;
        resp += `$$ \\text{Bolo Prolungato} = \\begin{cases} \\text{Dose Immediata (65\\%)} = ${rapida}\\text{ U} & \\text{(all'inizio del pasto)} \\\\[4pt] \\text{Dose Dilazionata (35\\%)} = ${lenta}\\text{ U} & \\text{(distribuita su 2–3 ore)} \\end{cases} $$\n\n`;
      }

      resp += `> *Nota:* Calcolo basato sui parametri $I:C=${rapportoIC}$, $FSI=${fsi}$ e $IOB=${iob}$. Verificare sempre con il proprio piano terapeutico.`;
      return resp;
    }

    // 2. Domanda su andamento glicemico / picco / cinetica
    if (q.includes('andamento') || q.includes('picco') || q.includes('sale') || q.includes('curva') || q.includes('quando') || q.includes('perché')) {
      const deltaPicco = piccoStd - piccoOpt;
      const gainTir = tirOpt - tirStd;

      let resp = `### Andamento e Picco nel Tempo $G(t)$\n\n`;
      resp += `Ecco la proiezione post-prandiale per **${meal?.nome_piatto}**:\n\n`;
      resp += `* **Punto di Partenza:** $G(0) = ${punto0}\\text{ mg/dL}$\n`;
      resp += `* **Curva Standard:** $G_{\\max}^{\\text{std}} = ${piccoStd}\\text{ mg/dL}$ al minuto $t = +${tPiccoStd}\\text{ min}$\n`;

      if (usaHack1 || usaHack2) {
        resp += `* **Curva con Consigli Applicati:** $G_{\\max}^{\\text{opt}} = ${piccoOpt}\\text{ mg/dL}$ al minuto $t = +${tPiccoOpt}\\text{ min}$\n\n`;
        resp += `$$ \\Delta G_{\\text{risparmiato}} = G_{\\max}^{\\text{std}} - G_{\\max}^{\\text{opt}} = -${deltaPicco}\\text{ mg/dL} $$\n\n`;
        resp += `$$ \\text{Tempo nel bersaglio (70–180)}: \\quad ${tirStd}\\% \\rightarrow \\mathbf{${tirOpt}\\%} \\quad (\\Delta = +${gainTir}\\%) $$\n\n`;
      } else {
        resp += `* **Margine di Miglioramento:** Applicando i consigli il picco cala a $G_{\\max}^{\\text{opt}} = ${piccoOpt}\\text{ mg/dL}$ ($-${deltaPicco}\\text{ mg/dL}$).\n\n`;
      }

      resp += `* **Andamento a 2h e 3h:**\n`;
      resp += `$$ G(+120\\text{m}): \\ ${punto120Std}\\text{ mg/dL} \\rightarrow ${punto120Opt}\\text{ mg/dL} $$\n`;
      resp += `$$ G(+180\\text{m}): \\ ${punto180Std}\\text{ mg/dL} \\rightarrow ${punto180Opt}\\text{ mg/dL} $$\n\n`;

      if (grassi >= 20) {
        resp += `**Effetto dei grassi:** Con $${grassi}\\text{g}$ di grassi, gli acidi grassi liberi prolungano l'assorbimento oltre i 120 minuti.`;
      }

      return resp;
    }

    // 3. Domanda su camminata / GLUT4
    if (q.includes('cammin') || q.includes('glut4') || q.includes('moto') || q.includes('attivit')) {
      return `### Attività Fisica e Sensibilità all'Insulina\n\nL'attività muscolare dopo mangiato attiva una via fisiologica naturale che aiuta le cellule ad assorbire il glucosio:\n\n$$ \\text{Attività Fisica} \\implies \\text{Traslocazione GLUT4} \\implies \\text{Riduzione picco} \\approx 30\\% $$\n\n* **Assorbimento Glucosio:** I muscoli in movimento prelevano zucchero dal sangue in modo diretto.\n* **Fattore di Riduzione:** Nel tuo pasto attuale, riduce il picco di circa il **$30\\%$**.\n* **Sicurezza:**\n$$ \\text{Bolo Adattato} = \\text{Bolo Normale} \\times 0.80 $$\nper evitare che la glicemia scenda troppo dopo lo sforzo.`;
    }

    // 4. Domanda su fibre / ordine cibi
    if (q.includes('fib') || q.includes('ordine') || q.includes('insalat') || q.includes('verdura')) {
      const igOriginale = meal?.indice_glicemico ?? 68;
      const igModificato = Math.max(25, igOriginale - 15);
      return `### Effetto delle Fibre prima del Pasto\n\nMangiare verdura o fibre 10 minuti prima dei carboidrati rallenta l'assorbimento gastrico:\n\n$$ \\text{Indice Glicemico Effettivo} = ${igOriginale} - 15 = \\mathbf{${igModificato}} $$\n\n* **Rallentamento Svuotamento Gastrico:** Le fibre creano una barriera naturale che modera la digestione degli amidi.\n* **Curva più Dolce:** La glicemia sale con gradualità invece di creare un'impennata improvvisa.`;
    }

    // Risposta generica clinica
    return `### Valutazione per **${meal?.nome_piatto}**\n\nParametri attuali:\n* Glicemia iniziale: $${glicemia}\\text{ mg/dL}$\n* Carboidrati: $${carbs}\\text{g}$, Fibre: $${fibre}\\text{g}$, Grassi: $${grassi}\\text{g}$\n\n$$ G_{\\max}^{\\text{std}} = ${piccoStd}\\text{ mg/dL} \\rightarrow G_{\\max}^{\\text{con consigli}} = ${piccoOpt}\\text{ mg/dL} $$\n\nPuoi chiedermi il calcolo del bolo insulinico o maggiori dettagli sull'andamento.`;
  };

  const inviaMessaggio = async (testo) => {
    const query = testo || inputTesto;
    if (!query.trim()) return;

    const messaggioUtente = {
      id: String(Date.now()),
      mittente: 'utente',
      testo: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessaggi(prev => [...prev, messaggioUtente]);
    setInputTesto('');
    setStaScrivendo(true);

    let rispostaOttenuta = false;

    try {
      // Prova chiamata API backend (con timeout permissivo per inferenza locale)
      const controller = new AbortController();
      const timeoutMs = 25000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messaggi.slice(-6).map(m => ({
            role: m.mittente === 'utente' ? 'user' : 'assistant',
            content: m.testo
          })),
          glicemia: glicemia || 115,
          meal: meal || {},
          usa_hack1: usaHack1,
          usa_hack2: usaHack2,
          ic_ratio: impostazioni?.rapportoIC || 10,
          isf: impostazioni?.fsi || 40,
          target: impostazioni?.targetGlicemico || 110,
          iob: impostazioni?.iob || 0.0,
          api_key: aiConfig?.apiKey || apiKey || '',
          provider: aiConfig?.provider || 'auto',
          local_url: aiConfig?.localUrl || '',
          local_model: aiConfig?.localModel || ''
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data?.reply) {
          rispostaOttenuta = true;
          setMessaggi(prev => [
            ...prev,
            {
              id: String(Date.now() + 1),
              mittente: 'coach',
              testo: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      }
    } catch (err) {
      // Fallback trasparente al generatore clinico locale
    } finally {
      if (!rispostaOttenuta) {
        const rispostaLocale = generaRispostaCoach(query);
        setMessaggi(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            mittente: 'coach',
            testo: rispostaLocale,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      setStaScrivendo(false);
    }
  };

  const quickPrompts = [
    { label: '💉 Calcola Bolo', query: 'Quanto bolo devo fare per questo pasto? Mostrami le formule di calcolo.' },
    { label: '⏱️ Timing Bolo', query: 'Quando devo fare il bolo di insulina per questo pasto?' },
    { label: '🥗 Alternative Basso IG', query: 'Quali alternative o sostituzioni a basso indice glicemico mi consigli per questo piatto?' },
    { label: '📈 Picco Glicemico', query: 'Quando avrò il picco e come andrà la glicemia?' },
    { label: '🚶‍♂️ Camminata post-pasto', query: 'Cosa succede se faccio una camminata di 15 minuti?' },
    { label: '🥦 Fibre pre-pasto', query: 'Come agiscono le fibre prima del pasto?' }
  ];

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden ${className}`}>
      {/* Header Chat */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shadow-xs">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 absolute -bottom-0.5 -right-0.5 border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">Gluco Coach</h3>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                {aiConfig?.provider === 'offline' ? 'Motore Locale' : (aiConfig?.provider === 'local' ? `Locale (${aiConfig?.localModel || 'Ollama'})` : (aiConfig?.provider === 'cloud' ? 'Cloud AI' : 'AI Attiva'))}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              Il tuo assistente personale per cibo e glicemia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setMessaggi([
                {
                  id: 'welcome_reset',
                  mittente: 'coach',
                  testo: `Chat reimpostata.\n\nSono pronto ad aiutarti con **${meal?.nome_piatto || 'il pasto'}** e la glicemia a **${glicemia} mg/dL**.\n\nTocca un suggerimento rapido o fammi una domanda!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }}
            title="Reimposta conversazione"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {onChiudi && (
            <button
              onClick={onChiudi}
              title="Chiudi pannello chat"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <X className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Area Messaggi con Rendering LaTeX Formattato */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/50">
        {messaggi.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.mittente === 'utente' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.mittente === 'coach' && (
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-xs ${
                msg.mittente === 'utente'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none space-y-1.5'
              }`}
            >
              <FormattedMessageContent text={msg.testo} />

              <div
                className={`text-[9px] text-right mt-1.5 ${
                  msg.mittente === 'utente' ? 'text-teal-100' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.mittente === 'utente' && (
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {staScrivendo && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-slate-500 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] ml-1.5 text-slate-500 font-medium">Gluco Coach sta scrivendo...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Suggestions (Frecce Fisse ai Lati e Zero Barra di Scorrimento Visibile) */}
      <div className="relative bg-white border-t border-slate-100 flex items-center px-2 py-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => scrollPillole(-150)}
          disabled={!canScrollLeft}
          className={`p-1.5 rounded-xl border shrink-0 transition z-10 ${
            canScrollLeft
              ? 'text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-2xs cursor-pointer active:scale-95'
              : 'text-slate-300 bg-slate-50/50 border-slate-100 cursor-not-allowed opacity-30'
          }`}
          title="Scorri a sinistra"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={quickPromptsRef}
          onScroll={checkScrollPillole}
          className="flex-1 overflow-x-auto flex gap-1.5 py-1 px-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => inviaMessaggio(qp.query)}
              className="shrink-0 text-[11px] bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 px-3 py-1.5 rounded-full border border-slate-200 hover:border-teal-300 font-medium transition whitespace-nowrap shadow-2xs active:scale-95"
            >
              {qp.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollPillole(150)}
          disabled={!canScrollRight}
          className={`p-1.5 rounded-xl border shrink-0 transition z-10 ${
            canScrollRight
              ? 'text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-2xs cursor-pointer active:scale-95'
              : 'text-slate-300 bg-slate-50/50 border-slate-100 cursor-not-allowed opacity-30'
          }`}
          title="Scorri a destra"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          inviaMessaggio();
        }}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputTesto}
          onChange={(e) => setInputTesto(e.target.value)}
          placeholder="Chiedi qualcosa (es. 'quanto bolo fare?', 'quando ho il picco?')..."
          className="flex-1 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
        />
        <button
          type="submit"
          disabled={!inputTesto.trim() || staScrivendo}
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition font-medium shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
