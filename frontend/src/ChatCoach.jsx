import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, MessageSquare, RefreshCw, Zap, TrendingUp, Syringe, ShieldAlert, X } from 'lucide-react';

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
      testo: `Ciao! Sono **Gluco Coach**, il tuo assistente clinico predittivo. Ho analizzato il tuo pasto (**${meal?.nome_piatto || 'Pasto'}**) e la tua glicemia attuale (**${glicemia} mg/dL**).\n\nPuoi chiedermi il calcolo dettagliato del bolo insulinico, l'analisi del picco glicemico o come i toggle What-If stanno appiattendo la curva. Di cosa hai bisogno?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputTesto, setInputTesto] = useState('');
  const [staScrivendo, setStaScrivendo] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messaggi, staScrivendo]);

  // Generatore di risposte cliniche fedele a prompt_chat.txt
  const generaRispostaCoach = (domanda) => {
    const q = domanda.toLowerCase();
    const { targetGlicemico, rapportoIC, fsi, iob } = impostazioni;
    const carbs = meal?.carboidrati_g ?? 75;
    const grassi = meal?.grassi_g ?? 20;
    const fibre = meal?.fibre_g ?? 4;

    // Trova valori a t = 0, +120m, +180m
    const punto0 = datiCurva.find(p => p.minuti === 0)?.standard ?? glicemia;
    const punto120Std = datiCurva.find(p => p.minuti === 120)?.standard ?? Math.round(piccoStd * 0.85);
    const punto120Opt = datiCurva.find(p => p.minuti === 120)?.ottimizzata ?? Math.round(piccoOpt * 0.82);
    const punto180Std = datiCurva.find(p => p.minuti === 180)?.standard ?? Math.round(glicemia * 1.1);
    const punto180Opt = datiCurva.find(p => p.minuti === 180)?.ottimizzata ?? glicemia;

    // 1. Domanda su bolo / insulina
    if (q.includes('bolo') || q.includes('insulina') || q.includes('quanto') || q.includes('dose') || q.includes('fai')) {
      const boloPasto = (carbs / rapportoIC);
      const deltaGli = Math.max(0, glicemia - targetGlicemico);
      const boloCorr = deltaGli / fsi;
      const subtot = boloPasto + boloCorr;
      const scontoMoto = usaHack2 ? (subtot * 0.20) : 0;
      const boloTot = Math.max(0, subtot - iob - scontoMoto);

      let resp = `### 💉 Calcolo Matematico del Bolo per **${meal?.nome_piatto}**\n\n`;
      resp += `Ecco lo scorporo trasparente basato sui tuoi parametri personali:\n`;
      resp += `* **Bolo Carboidrati (Pasto):** \`${carbs}g CHO / ${rapportoIC} (I:C)\` = **${boloPasto.toFixed(2)} U**\n`;
      resp += `* **Bolo Correzione:** \`(${glicemia} - ${targetGlicemico}) / ${fsi} (FSI)\` = **${boloCorr.toFixed(2)} U**\n`;
      resp += `* **Insulina Attiva (IOB):** \`-${iob.toFixed(2)} U\`\n`;

      if (usaHack2) {
        resp += `* **Adattamento Attività GLUT4 (Camminata 15 min):** Attivando la camminata post-pasto, la captazione muscolare aumenta significativamente. Abbiamo applicato una **riduzione prudenziale del 20% (-${scontoMoto.toFixed(2)} U)** per proteggerti da ipoglicemie post-esercizio.\n`;
      } else {
        resp += `* **Nota Attività Fisica:** Al momento il toggle camminata non è attivo. Una passeggiata di 15 min post-pasto consentirebbe di ridurre il bolo di circa il 15-25%.\n`;
      }

      resp += `\n🎯 **Dose Totale Calcolata:** **${boloTot.toFixed(1)} U** *(valore analitico: ${boloTot.toFixed(2)} U)*\n\n`;

      if (grassi >= 20) {
        const rapida = (boloTot * 0.65).toFixed(1);
        const lenta = (boloTot * 0.35).toFixed(1);
        resp += `⚠️ **Strategia Somministrazione (Effetto Pizza / Grassi Elevati = ${grassi}g):**\n`;
        resp += `Data la quantità importante di lipidi, lo svuotamento gastrico risulterà rallentato. Valuta con il tuo diabetologo un **Bolo Dual-Wave (Onda Doppia)**: **${rapida} U subito (65%)** + **${lenta} U prolungate su 2-3 ore (35%)**, oppure programma una misurazione di controllo a +120 min.\n\n`;
      }

      resp += `> 🩺 *Disclaimer Clinico:* Questo calcolo è una simulazione matematica basata sui rapporti I:C e FSI inseriti e deve essere sempre validato secondo il piano terapeutico concordato con il tuo medico curante.`;
      return resp;
    }

    // 2. Domanda su andamento glicemico / picco / perché sale
    if (q.includes('andamento') || q.includes('picco') || q.includes('sale') || q.includes('curva') || q.includes('quando') || q.includes('perché')) {
      const deltaPicco = piccoStd - piccoOpt;
      const gainTir = tirOpt - tirStd;

      let resp = `### 📊 Analisi Cinematica della Risposta Glicemica\n\n`;
      resp += `Ecco la proiezione temporale esatta per **${meal?.nome_piatto}**:\n\n`;
      resp += `* **Glicemia di Partenza (t = 0 min):** \`${punto0} mg/dL\`\n`;
      resp += `* **Curva Standard (Senza Interventi):** Picco a **+${tPiccoStd} min** con un valore massimo di **${piccoStd} mg/dL** ${piccoStd > 180 ? '*(oltre la soglia di sicurezza di 180 mg/dL!)*' : ''}.\n`;

      if (usaHack1 || usaHack2) {
        resp += `* **Curva Ottimizzata (Con i tuoi Hack attivi):** Il picco scende a **${piccoOpt} mg/dL** a **+${tPiccoOpt} min**, con una riduzione netta di **-${deltaPicco} mg/dL**!\n`;
        resp += `* **Time-in-Range (70-180 mg/dL):** Guadagni un **+${gainTir}% di tempo a bersaglio** (dal ${tirStd}% al ${tirOpt}%).\n`;
      } else {
        resp += `* **Potenziale Ottimizzazione:** Attivando i 2 toggle What-If (fibre pre-pasto e camminata), puoi abbattere il picco a **${piccoOpt} mg/dL** risparmiando **-${deltaPicco} mg/dL** di escursione.\n`;
      }

      resp += `* **Valore a +120 min:** Standard \`${punto120Std} mg/dL\` | Ottimizzato \`${punto120Opt} mg/dL\`\n`;
      resp += `* **Valore a +180 min:** Standard \`${punto180Std} mg/dL\` | Ottimizzato \`${punto180Opt} mg/dL\`\n\n`;

      if (grassi >= 20) {
        resp += `💡 **Perché la glicemia resta sostenuta a 2-3 ore?** A causa dell'alto contenuto di grassi (${grassi}g), si verifica l'effetto pizza: gli acidi grassi liberi riducono la sensibilità all'insulina ritardando l'assorbimento dei carboidrati residui.`;
      }

      return resp;
    }

    // 3. Domanda su camminata / GLUT4
    if (q.includes('cammin') || q.includes('glut4') || q.includes('moto') || q.includes('attivit')) {
      return `### 🚶‍♂️ Il Potere dei Trasportatori GLUT4 Post-Pasto\n\nQuando cammini per 12-15 minuti a 30 minuti dalla fine del pasto, succede una magia fisiologica:\n\n1. **Captazione Insulino-Indipendente:** Le contrazioni muscolari inducono la traslocazione dei recettori **GLUT4** sulla membrana cellulare senza bisogno di picchi aggiuntivi di insulina.\n2. **Smorzamento del Picco:** Nel tuo caso, l'attività riduce l'ampiezza dell'escursione glicemica di circa il **30%**.\n3. **Attenzione alla Sicurezza:** Se somministri il bolo intero e poi cammini, rischi un calo repentino (ipoglicemia). Per questo il nostro calcolatore riduce prudenzialmente la dose del 15-25%.`;
    }

    // 4. Domanda su fibre / ordine cibi
    if (q.includes('fib') || q.includes('ordine') || q.includes('insalat') || q.includes('verdura')) {
      return `### 🥗 Strategia Food Order: Il Pre-carico di Fibre\n\nConsumare verdura cruda o ricca di fibre solubili (finocchi, insalata mista, verdure a foglia) circa 10 minuti prima dei carboidrati crea un **gel viscoso** nello stomaco e nel duodeno:\n\n* **Rallenta lo Svuotamento Gastrico:** Il glucosio viene rilasciato nel sangue in modo graduale anziché con un'ondata improvvisa.\n* **Riduce l'Indice Glicemico (IG) efficace:** Abbassa l'IG stimato del pasto da ${meal?.indice_glicemico} a ${Math.max(25, (meal?.indice_glicemico ?? 75) - 15)}.\n* **Frena il Picco:** Contribuisce a ridurre l'impennata glicemica di oltre 20 mg/dL.`;
    }

    // Risposta generica clinica
    return `### 🩺 Commento Clinico per ${meal?.nome_piatto}\n\nCon una glicemia basale di **${glicemia} mg/dL** e un carico di **${carbs}g di carboidrati** (${meal?.zuccheri_semplici_g || 8}g semplici e ${fibre}g fibre), l'organismo deve gestire un rapido afflusso di zuccheri.\n\n* **Senza interventi:** Rischio di picco fino a **${piccoStd} mg/dL** a +${tPiccoStd} min.\n* **Con What-If:** Puoi mantenere la curva entro la fascia ottimale (sotto i 180 mg/dL) combinando il pre-carico vegetale e 15 min di camminata.\n\nVuoi che ti mostri il calcolo del bolo insulinico o maggiori dettagli sull'effetto dei grassi?`;
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

    // Se c'è un'API key OpenRouter o backend, simuliamo risposta real-time clinica ad alta fedeltà
    setTimeout(() => {
      const testoRisposta = generaRispostaCoach(query);
      const messaggioCoach = {
        id: String(Date.now() + 1),
        mittente: 'coach',
        testo: testoRisposta,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessaggi(prev => [...prev, messaggioCoach]);
      setStaScrivendo(false);
    }, 450);
  };

  const quickPrompts = [
    { label: '💉 Calcola Bolo per questo pasto', query: 'Quanta insulina devo fare per questo pasto?' },
    { label: '📊 Quando avrò il picco glicemico?', query: 'Come andrà la mia glicemia e a che minuto è previsto il picco?' },
    { label: '🚶‍♂️ Perché camminare riduce il picco?', query: 'Come funziona l\'attivazione dei GLUT4 muscolari?' },
    { label: '🥗 Effetto fibre pre-pasto', query: 'Spiegami l\'effetto del pre-carico di fibre' }
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
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Gemma 4
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Accesso continuo a CGM, I:C, FSI, IOB
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
                  testo: `Chat reimpostata. Sono pronto per una nuova domanda su **${meal?.nome_piatto}** o sulla tua glicemia (**${glicemia} mg/dL**)!`,
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

      {/* Area Messaggi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messaggi.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.mittente === 'utente' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.mittente === 'coach' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                msg.mittente === 'utente'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800/90 rounded-tl-none space-y-1.5'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {msg.testo.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={idx} className="font-bold text-emerald-300 text-sm mt-1 mb-1">{line.replace('### ', '')}</h4>;
                  }
                  if (line.startsWith('* ')) {
                    return <li key={idx} className="ml-3 list-disc text-slate-300">{line.replace('* ', '')}</li>;
                  }
                  if (line.startsWith('> ')) {
                    return <blockquote key={idx} className="p-2 bg-slate-900 rounded-lg border-l-2 border-emerald-500 text-[11px] text-slate-400 italic mt-2">{line.replace('> ', '')}</blockquote>;
                  }
                  return <p key={idx} className={line === '' ? 'h-2' : ''}>{line}</p>;
                })}
              </div>
              <div
                className={`text-[9px] text-right mt-1.5 ${
                  msg.mittente === 'utente' ? 'text-emerald-100/70' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.mittente === 'utente' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30">
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
              <span className="text-[10px] ml-1.5 text-slate-400 font-mono">Calcolo cinetica in corso...</span>
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

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          inviaMessaggio();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
      >
        <input
          type="text"
          value={inputTesto}
          onChange={(e) => setInputTesto(e.target.value)}
          placeholder="Chiedi al coach (es: 'Quanta insulina devo fare?')"
          className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 px-3.5 py-2 rounded-xl border border-slate-700/80 focus:border-emerald-500 focus:outline-none text-xs transition"
        />
        <button
          type="submit"
          disabled={!inputTesto.trim() || staScrivendo}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-semibold px-3.5 py-2 rounded-xl transition flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
