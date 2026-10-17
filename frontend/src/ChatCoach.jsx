import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, MessageSquare, RefreshCw, Zap, TrendingUp, Syringe, ShieldAlert, X } from 'lucide-react';
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
          className="inline-katex mx-0.5 text-emerald-300 font-medium"
          dangerouslySetInnerHTML={{ __html: renderLatex(math, false) }}
        />
      );
    }

    // Bold Markdown: ** testo **
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Code Monospace: ` codice `
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="font-mono bg-slate-900/90 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] border border-slate-800">
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
              className="my-2.5 p-3 rounded-xl bg-slate-900/95 border border-emerald-500/30 overflow-x-auto text-emerald-200 text-center shadow-lg shadow-emerald-950/40"
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
                  <h4 key={lIdx} className="font-bold text-emerald-300 text-sm mt-2 mb-1 flex items-center gap-1.5">
                    {renderInlineSegments(line.replace('### ', ''))}
                  </h4>
                );
              }

              if (line.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="font-extrabold text-teal-300 text-base mt-2.5 mb-1.5">
                    {renderInlineSegments(line.replace('## ', ''))}
                  </h3>
                );
              }

              if (line.startsWith('* ') || line.startsWith('- ')) {
                return (
                  <li key={lIdx} className="ml-4 list-disc text-slate-300 my-0.5">
                    {renderInlineSegments(line.replace(/^(\*|-)\s+/, ''))}
                  </li>
                );
              }

              if (line.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="p-2.5 bg-slate-900/90 rounded-xl border-l-2 border-emerald-400 text-[11px] text-slate-400 italic my-2">
                    {renderInlineSegments(line.replace('> ', ''))}
                  </blockquote>
                );
              }

              return (
                <p key={lIdx} className="text-slate-200">
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
  glicemia,
  meal,
  coach,
  usaHack1,
  usaHack2,
  impostazioni,
  datiCurva,
  piccoStd,
  piccoOpt,
  tPiccoStd,
  tPiccoOpt,
  tirStd,
  tirOpt,
  apiKey,
  className = "h-[520px]",
  onChiudi = null
}) {
  const [messaggi, setMessaggi] = useState([
    {
      id: 'welcome',
      mittente: 'coach',
      testo: `Ciao! Sono **Gluco Coach**, il tuo assistente clinico predittivo con supporto $\\LaTeX$. Ho analizzato il tuo pasto (**${meal?.nome_piatto || 'Pasto'}**) e la tua glicemia basale ($G_0 = ${glicemia}\\text{ mg/dL}$).\n\nPuoi chiedermi il calcolo dettagliato del bolo con formule matematiche in $\\LaTeX$, l'analisi cinetica di picco $G(t)$ o la simulazione What-If. Di cosa hai bisogno?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputTesto, setInputTesto] = useState('');
  const [staScrivendo, setStaScrivendo] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messaggi, staScrivendo]);

  // Generatore di risposte cliniche in formato LaTeX rigoroso
  const generaRispostaCoach = (domanda) => {
    const q = domanda.toLowerCase();
    const { targetGlicemico, rapportoIC, fsi, iob } = impostazioni;
    const carbs = meal?.carboidrati_g ?? 74;
    const grassi = meal?.grassi_g ?? 15;
    const fibre = meal?.fibre_g ?? 4;

    // Punti della curva a t = 0, +120m, +180m
    const punto0 = datiCurva.find(p => p.minuti === 0)?.standard ?? glicemia;
    const punto120Std = datiCurva.find(p => p.minuti === 120)?.standard ?? Math.round(piccoStd * 0.85);
    const punto120Opt = datiCurva.find(p => p.minuti === 120)?.ottimizzata ?? Math.round(piccoOpt * 0.82);
    const punto180Std = datiCurva.find(p => p.minuti === 180)?.standard ?? Math.round(glicemia * 1.1);
    const punto180Opt = datiCurva.find(p => p.minuti === 180)?.ottimizzata ?? glicemia;

    // 1. Domanda su bolo / insulina
    if (q.includes('bolo') || q.includes('insulina') || q.includes('quanto') || q.includes('dose') || q.includes('fai') || q.includes('calcol')) {
      const boloPasto = (carbs / rapportoIC);
      const deltaGli = Math.max(0, glicemia - targetGlicemico);
      const boloCorr = deltaGli / fsi;
      const subtot = boloPasto + boloCorr;
      const scontoMoto = usaHack2 ? (subtot * 0.20) : 0;
      const boloTot = Math.max(0, subtot - iob - scontoMoto);

      let resp = `### 💉 Calcolo Matematico del Bolo (Formule $\\LaTeX$)\n\n`;
      resp += `Ecco lo scorporo analitico rigoroso per **${meal?.nome_piatto}**:\n\n`;

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
        resp += `* **4. Adattamento Esercizio GLUT4 (Camminata 15 min attiva):**\n`;
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
        resp += `⚠️ **Strategia Dual-Wave (Effetto Pizza, Grassi = $${grassi}\\text{g} \\ge 20\\text{g}$):**\n`;
        resp += `I lipidi dilatano lo svuotamento gastrico. È consigliato valutare un **Bolo a Onda Doppia**:\n`;
        resp += `$$ \\text{Bolo Dual-Wave} = \\begin{cases} \\text{Dose Immediata (65\\%)} = ${rapida}\\text{ U} & \\text{(alla prima forchettata)} \\\\[4pt] \\text{Dose Quadra (35\\%)} = ${lenta}\\text{ U} & \\text{(spalmata su 2–3 ore)} \\end{cases} $$\n\n`;
      }

      resp += `> 🩺 *Disclaimer Clinico:* Calcolo basato sui parametri $I:C=${rapportoIC}$, $FSI=${fsi}$ e $IOB=${iob}$. Verificare sempre con il proprio piano terapeutico.`;
      return resp;
    }

    // 2. Domanda su andamento glicemico / picco / cinetica
    if (q.includes('andamento') || q.includes('picco') || q.includes('sale') || q.includes('curva') || q.includes('quando') || q.includes('perché')) {
      const deltaPicco = piccoStd - piccoOpt;
      const gainTir = tirOpt - tirStd;

      let resp = `### 📊 Cinetica e Traiettoria Temporale $G(t)$\n\n`;
      resp += `Ecco la proiezione cinematica post-prandiale per **${meal?.nome_piatto}**:\n\n`;
      resp += `* **Punto di Partenza:** $G(0) = ${punto0}\\text{ mg/dL}$\n`;
      resp += `* **Curva Standard:** $G_{\\max}^{\\text{std}} = ${piccoStd}\\text{ mg/dL}$ al minuto $t = +${tPiccoStd}\\text{ min}$\n`;

      if (usaHack1 || usaHack2) {
        resp += `* **Curva Ottimizzata (What-If):** $G_{\\max}^{\\text{opt}} = ${piccoOpt}\\text{ mg/dL}$ al minuto $t = +${tPiccoOpt}\\text{ min}$\n\n`;
        resp += `$$ \\Delta G_{\\text{risparmiato}} = G_{\\max}^{\\text{std}} - G_{\\max}^{\\text{opt}} = -${deltaPicco}\\text{ mg/dL} $$\n\n`;
        resp += `$$ \\text{Time-in-Range (70–180)}: \\quad ${tirStd}\\% \\xrightarrow{\\text{What-If}} \\mathbf{${tirOpt}\\%} \\quad (\\Delta = +${gainTir}\\%) $$\n\n`;
      } else {
        resp += `* **Margine di Miglioramento:** Attivando i 2 What-If il picco cala a $G_{\\max}^{\\text{opt}} = ${piccoOpt}\\text{ mg/dL}$ ($-${deltaPicco}\\text{ mg/dL}$).\n\n`;
      }

      resp += `* **Coda Temporale a 2h e 3h:**\n`;
      resp += `$$ G(+120\\text{m}): \\ ${punto120Std}\\text{ mg/dL} \\rightarrow ${punto120Opt}\\text{ mg/dL} $$\n`;
      resp += `$$ G(+180\\text{m}): \\ ${punto180Std}\\text{ mg/dL} \\rightarrow ${punto180Opt}\\text{ mg/dL} $$\n\n`;

      if (grassi >= 20) {
        resp += `💡 **Effetto Coda Lipidica:** Con $${grassi}\\text{g}$ di grassi, gli acidi grassi liberi prolungano la resistenza insulinica ritardata oltre i 120 minuti.`;
      }

      return resp;
    }

    // 3. Domanda su camminata / GLUT4
    if (q.includes('cammin') || q.includes('glut4') || q.includes('moto') || q.includes('attivit')) {
      return `### 🚶‍♂️ Equazione di Traslocazione GLUT4\n\nL'attività muscolare post-prandiale sfrutta una via biochimica indipendente dall'insulina:\n\n$$ \\text{Contrazione Muscolare} \\implies \\text{Traslocazione GLUT4} \\implies \\frac{\\mathrm{d}G}{\\mathrm{d}t} \\downarrow 30\\% $$\n\n* **Assorbimento Glucosio:** I trasportatori GLUT4 migrano dalle vescicole intracellulari alla superficie del miocita.\n* **Fattore di Riduzione:** Nel tuo pasto attuale, abbatte il picco di circa il **$30\\%$**.\n* **Sicurezza Terapeutica:**\n$$ \\text{Bolo}_{\\text{adattato}} = \\text{Bolo}_{\\text{lordo}} \\times (1 - 0.20) $$\nper evitare ipoglicemie improvvise da sforzo.`;
    }

    // 4. Domanda su fibre / ordine cibi
    if (q.includes('fib') || q.includes('ordine') || q.includes('insalat') || q.includes('verdura')) {
      const igOriginale = meal?.indice_glicemico ?? 68;
      const igModificato = Math.max(25, igOriginale - 15);
      return `### 🥗 Cinetica del Pre-carico di Fibre Solubili\n\nConsumare fibre 10 minuti prima dei carboidrati forma un gel viscoso endoluminale:\n\n$$ \\text{IG}_{\\text{effettivo}} = \\text{IG}_{\\text{base}} - \\Delta\\text{IG}_{\\text{fibre}} = ${igOriginale} - 15 = \\mathbf{${igModificato}} $$\n\n$$ v_{\\text{assorbimento intestinale}} \\downarrow 22\\% $$\n\n* **Rallentamento Svuotamento Gastrico:** La barriera viscoelastica ritarda il contatto tra enzimi amilasici e carboidrati.\n* **Appiattimento Curva:** L'incremento glicemico $\\Delta G$ risulta progressivo anziché impulsivo.`;
    }

    // Risposta generica clinica
    return `### 🩺 Valutazione Clinica in $\\LaTeX$ per **${meal?.nome_piatto}**\n\nParametri attuali:\n* $G_0 = ${glicemia}\\text{ mg/dL}$\n* $\\text{Carboidrati} = ${carbs}\\text{g}$, $\\text{Fibre} = ${fibre}\\text{g}$, $\\text{Grassi} = ${grassi}\\text{g}$\n\n$$ G_{\\max}^{\\text{std}} = ${piccoStd}\\text{ mg/dL} \\xrightarrow{\\text{What-If}} G_{\\max}^{\\text{opt}} = ${piccoOpt}\\text{ mg/dL} $$\n\nPuoi chiedermi il calcolo del bolo insulinico o l'analisi dettagliata delle formule matematiche.`;
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

    try {
      // Prova chiamata API backend se configurato
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          glicemia,
          meal,
          usa_hack1: usaHack1,
          usa_hack2: usaHack2,
          ic_ratio: impostazioni.rapportoIC,
          isf: impostazioni.fsi,
          target: impostazioni.targetGlicemico,
          iob: impostazioni.iob,
          api_key: apiKey
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setMessaggi(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            mittente: 'coach',
            testo: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }
    } catch (err) {
      // Fallback trasparente al generatore clinico locale
    } finally {
      setStaScrivendo(false);
    }

    // Risposta deterministica locale in LaTeX
    setTimeout(() => {
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
      setStaScrivendo(false);
    }, 450);
  };

  const quickPrompts = [
    { label: '💉 Calcola Bolo in LaTeX', query: 'Mostrami il calcolo matematico trasparente del bolo in LaTeX' },
    { label: '📊 Formula Cinetica G(t)', query: 'Analisi cinetica temporale del picco glicemico e Time-in-Range' },
    { label: '🚶‍♂️ Equazione GLUT4', query: 'Spiegami l\'equazione e la traslocazione dei GLUT4 muscolari' },
    { label: '🥗 Cinetica Fibre & IG', query: 'Come agisce il pre-carico di fibre sull\'indice glicemico?' }
  ];

  return (
    <div className={`bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col shadow-2xl backdrop-blur-md overflow-hidden ${className}`}>
      {/* Header Chat */}
      <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border-2 border-slate-950"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-100">Gluco Coach AI</h3>
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                LaTeX Enabled
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Formulazioni matematiche rigorose KaTeX
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
                  testo: `Chat reimpostata. Sono pronto per una nuova analisi in $\\LaTeX$ per **${meal?.nome_piatto}** o per la glicemia ($G_0 = ${glicemia}\\text{ mg/dL}$)!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }}
            title="Reimposta conversazione"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {onChiudi && (
            <button
              onClick={onChiudi}
              title="Chiudi pannello chat"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <X className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Area Messaggi con Rendering LaTeX Formattato */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messaggi.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.mittente === 'utente' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.mittente === 'coach' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                msg.mittente === 'utente'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800/90 rounded-tl-none space-y-1.5'
              }`}
            >
              <FormattedMessageContent text={msg.testo} />

              <div
                className={`text-[9px] text-right mt-1.5 ${
                  msg.mittente === 'utente' ? 'text-emerald-100/70' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.mittente === 'utente' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {staScrivendo && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[10px] ml-1.5 text-slate-400 font-mono">Compilazione equazioni LaTeX in corso...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => inviaMessaggio(qp.query)}
            className="shrink-0 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/40 transition whitespace-nowrap"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          inviaMessaggio();
        }}
        className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputTesto}
          onChange={(e) => setInputTesto(e.target.value)}
          placeholder="Chiedi a Gluco Coach (es. 'calcola il bolo', 'cinetica del picco')..."
          className="flex-1 bg-slate-900 text-xs text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60"
        />
        <button
          type="submit"
          disabled={!inputTesto.trim() || staScrivendo}
          className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
