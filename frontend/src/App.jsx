import React, { useState, useEffect } from 'react';
import GlucoseChart, { generaDatiCurva } from './GlucoseChart';
import BolusCalculator from './BolusCalculator';
import ChatCoach from './ChatCoach';
import {
  Activity,
  Flame,
  Wheat,
  Salad,
  Footprints,
  UploadCloud,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Percent,
  Layers,
  HeartPulse,
  Info
} from 'lucide-react';

const DEMO_MEALS_DATA = {
  pizza: {
    nome_piatto: "Pizza Margherita Verace",
    carboidrati_g: 85,
    zuccheri_semplici_g: 8,
    fibre_g: 4,
    grassi_g: 22,
    proteine_g: 24,
    indice_glicemico: 82,
    emoji: "🍕",
    descrizione: "Farina raffinata e mozzarella: elevato carico glucidico con sensibile effetto pizza e coda lipidica a +120/+180 min."
  },
  carbonara: {
    nome_piatto: "Spaghetti alla Carbonara",
    carboidrati_g: 78,
    zuccheri_semplici_g: 4,
    fibre_g: 3,
    grassi_g: 36,
    proteine_g: 28,
    indice_glicemico: 70,
    emoji: "🍝",
    descrizione: "Pasta con guanciale e pecorino: combinazione ad alta densità di carboidrati e grassi che dilata lo svuotamento gastrico."
  },
  poke: {
    nome_piatto: "Poke Bowl Salmone, Riso & Edamame",
    carboidrati_g: 62,
    zuccheri_semplici_g: 6,
    fibre_g: 10,
    grassi_g: 18,
    proteine_g: 32,
    indice_glicemico: 60,
    emoji: "🥗",
    descrizione: "Piatto ben bilanciato con fibre solubili di edamame e proteine nobili del salmone che attenuano la velocità di assorbimento."
  },
  insalata: {
    nome_piatto: "Insalata Mediterranea & Quinoa",
    carboidrati_g: 38,
    zuccheri_semplici_g: 5,
    fibre_g: 14,
    grassi_g: 16,
    proteine_g: 20,
    indice_glicemico: 42,
    emoji: "🥙",
    descrizione: "Basso indice glicemico con rilascio lento e costante: eccellente stabilità glicemica nel range bersaglio."
  }
};

const DEFAULT_COACH_DATA = {
  hack_1: {
    label: "🥗 Pre-carico di fibre (Verdura cruda 10 min prima)",
    mod_fibre: 12,
    rid_ig: 15,
    riduzione_percentuale: 22
  },
  hack_2: {
    label: "🚶‍♂️ 15 min di camminata attiva (30 min post-pasto)",
    mult_picco: 0.68,
    riduzione_percentuale: 30
  },
  commento_clinico: "Questo pasto genera una risposta glicemica marcata a causa dei carboidrati combinati con grassi. Applicando il pre-carico di verdura e una camminata post-prandiale, i trasportatori muscolari GLUT4 consentono di mantenere la glicemia stabilmente entro la soglia di 180 mg/dL."
};

export default function App() {
  const [glicemia, setGlicemia] = useState(115);
  const [demoId, setDemoId] = useState('pizza');
  const [apiKey, setApiKey] = useState('');
  const [mostraKey, setMostraKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usaHack1, setUsaHack1] = useState(false);
  const [usaHack2, setUsaHack2] = useState(false);
  const [backendConnesso, setBackendConnesso] = useState(false);
  const [anteprimaFoto, setAnteprimaFoto] = useState(null);

  // Parametri Clinici del Paziente
  const [impostazioni, setImpostazioni] = useState({
    targetGlicemico: 100, // mg/dL
    rapportoIC: 10,        // 1U ogni 10g CHO
    fsi: 40,               // 1U abbassa 40 mg/dL
    iob: 0.8               // Insulina Attiva (U)
  });

  const [risultato, setRisultato] = useState({
    meal: DEMO_MEALS_DATA.pizza,
    coach: DEFAULT_COACH_DATA
  });

  // Funzione di analisi pasto (con fallback istantaneo offline)
  const analizzaPasto = async (idPiatto = demoId, fileFoto = null) => {
    setLoading(true);

    if (fileFoto) {
      const reader = new FileReader();
      reader.onload = (e) => setAnteprimaFoto(e.target.result);
      reader.readAsDataURL(fileFoto);
    } else {
      setAnteprimaFoto(null);
    }

    const formData = new FormData();
    formData.append('glicemia_base', glicemia);
    formData.append('demo_id', idPiatto);
    formData.append('api_key', apiKey);
    if (fileFoto) formData.append('file', fileFoto);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setRisultato({
          meal: { ...data.meal, emoji: DEMO_MEALS_DATA[idPiatto]?.emoji || '🍽️' },
          coach: data.coach || DEFAULT_COACH_DATA
        });
        setBackendConnesso(true);
      } else {
        throw new Error('Risposta HTTP non valida');
      }
    } catch (err) {
      // Fallback trasparente al motore simulatore locale
      setBackendConnesso(false);
      const pastoScelto = DEMO_MEALS_DATA[idPiatto] || DEMO_MEALS_DATA.pizza;
      setRisultato({
        meal: pastoScelto,
        coach: {
          ...DEFAULT_COACH_DATA,
          commento_clinico: `Partendo da ${glicemia} mg/dL, i ${pastoScelto.carboidrati_g}g di carboidrati indurranno un aumento significativo della glicemia. I ${pastoScelto.grassi_g}g di grassi prolungheranno la curva post-prandiale.`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analizzaPasto(demoId);
  }, [demoId]);

  const { meal, coach } = risultato;
  const { punti: datiCurva, tPiccoStd, tPiccoOpt } = generaDatiCurva(glicemia, meal, coach, usaHack1, usaHack2);

  const piccoStd = Math.max(...datiCurva.map(d => d.standard));
  const piccoOpt = Math.max(...datiCurva.map(d => d.ottimizzata));
  const deltaPicco = Math.max(0, piccoStd - piccoOpt);

  // Time-in-Range (70 - 180 mg/dL)
  const tirStd = Math.round((datiCurva.filter(d => d.standard >= 70 && d.standard <= 180).length / datiCurva.length) * 100);
  const tirOpt = Math.round((datiCurva.filter(d => d.ottimizzata >= 70 && d.ottimizzata <= 180).length / datiCurva.length) * 100);
  const gainTir = Math.max(0, tirOpt - tirStd);

  // Colore di stato glicemia
  const getGlicemiaColor = (val) => {
    if (val < 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    if (val <= 140) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val <= 180) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background Decorativo Neon Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Principale */}
      <header className="max-w-7xl mx-auto flex flex-wrap justify-between items-center pb-6 mb-8 border-b border-slate-800/80 gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 pulse-glow">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                GlucoTwin AI
              </h1>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                v2.6 Digital Twin
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5 flex items-center gap-2">
              <span>Simulatore Fisiologico Post-Prandiale & AI Coach Medico</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md ${
                backendConnesso ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60' : 'text-amber-400 bg-amber-950/40 border border-amber-800/60'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendConnesso ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                {backendConnesso ? 'FastAPI 8000 Connesso' : 'Motore Locale Attivo'}
              </span>
            </p>
          </div>
        </div>

        {/* Telemetria CGM Live & API Key Card */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Card CGM Live */}
          <div className="flex items-center gap-3.5 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800 shadow-md backdrop-blur-md flex-1 sm:flex-initial">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CGM Live</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-slate-100">{glicemia}</span>
                  <span className="text-[10px] text-slate-400 font-mono">mg/dL</span>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800"></div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400">Regola Glicemia di Partenza</span>
              <input
                type="range"
                min="70"
                max="220"
                value={glicemia}
                onChange={e => setGlicemia(Number(e.target.value))}
                className="w-32 sm:w-40 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${getGlicemiaColor(glicemia)}`}>
              {glicemia <= 140 ? 'Bersaglio' : glicemia <= 180 ? 'Elevata' : 'Iperglicemia'}
            </div>
          </div>

          {/* Input API Key OpenRouter */}
          <div className="relative flex items-center bg-slate-900/80 rounded-2xl border border-slate-800 px-3 py-2 text-xs shadow-md backdrop-blur-md">
            <Key className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <input
              type={mostraKey ? "text" : "password"}
              placeholder="OpenRouter Key (Opzionale)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-36 sm:w-44"
            />
            <button
              onClick={() => setMostraKey(!mostraKey)}
              className="text-slate-400 hover:text-slate-200 ml-1.5 p-0.5"
              title={mostraKey ? "Nascondi chiave" : "Mostra chiave"}
            >
              {mostraKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Grid Principale */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* =========================================================================
            COLONNA SINISTRA (5 Colonne): Pasto, Vision, What-If Toggles & Calcolatore
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sezione 1: Selezione & Vision Pasto */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                1. Analisi del Pasto (Vision Agent)
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Qwen2.5-VL 72B</span>
            </div>

            {/* Pulsanti Pasti Demo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(DEMO_MEALS_DATA).map(([id, info]) => (
                <button
                  key={id}
                  onClick={() => {
                    setDemoId(id);
                    setUsaHack1(false);
                    setUsaHack2(false);
                    setAnteprimaFoto(null);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold transition flex flex-col items-center gap-1 border ${
                    demoId === id && !anteprimaFoto
                      ? 'bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xl">{info.emoji}</span>
                  <span className="truncate w-full text-center">{info.nome_piatto.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Upload Foto Reale del Piatto */}
            <label className="group relative block w-full text-center p-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-emerald-500/80 bg-slate-950/60 cursor-pointer transition">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files[0] && analizzaPasto(demoId, e.target.files[0])}
              />
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition" />
                <span className="text-xs text-slate-300 font-medium">
                  {loading ? "Analisi Vision Open-Weight in corso..." : "Carica o trascina la foto del piatto"}
                </span>
                <span className="text-[10px] text-slate-500">
                  Riconoscimento automatico porzione, carboidrati netti, fibre e grassi
                </span>
              </div>
            </label>

            {/* Scheda Macronutrienti Estratti */}
            <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{meal.emoji || '🍽️'}</span>
                  <div>
                    <h3 className="text-emerald-400 font-bold text-sm leading-tight">{meal.nome_piatto}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{meal.descrizione || 'Analisi nutrizionale del pasto'}</p>
                  </div>
                </div>
                {meal.grassi_g >= 20 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Coda Grassi
                  </span>
                )}
              </div>

              {/* 4 Box Macronutrienti */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                    <Wheat className="w-3 h-3 text-cyan-400" />
                    <span>Carbs</span>
                  </div>
                  <div className="font-extrabold font-mono text-sm text-cyan-400 mt-1">{meal.carboidrati_g}g</div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                    <Salad className="w-3 h-3 text-emerald-400" />
                    <span>Fibre</span>
                  </div>
                  <div className="font-extrabold font-mono text-sm text-emerald-400 mt-1">{meal.fibre_g}g</div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Grassi</span>
                  </div>
                  <div className="font-extrabold font-mono text-sm text-amber-400 mt-1">{meal.grassi_g}g</div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 text-rose-400" />
                    <span>IG</span>
                  </div>
                  <div className="font-extrabold font-mono text-sm text-rose-400 mt-1">{meal.indice_glicemico}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sezione 2: What-If Metabolic Hacks (Toggle Interattivi) */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                2. Simula Interventi Comportamentali (What-If)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Real-time 60fps
              </span>
            </div>

            {/* Hack 1: Fibre Pre-Pasto */}
            <button
              onClick={() => setUsaHack1(!usaHack1)}
              className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                usaHack1
                  ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${usaHack1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  <Salad className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-100">{coach.hack_1.label}</div>
                  <div className="text-[11px] text-slate-400">Crea una barriera viscosa che riduce e rallenta l'assorbimento degli amidi</div>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md font-mono ${
                  usaHack1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {usaHack1 ? 'ATTIVO' : 'SIMULA'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1">-22% Picco</span>
              </div>
            </button>

            {/* Hack 2: Camminata Post-Pasto GLUT4 */}
            <button
              onClick={() => setUsaHack2(!usaHack2)}
              className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                usaHack2
                  ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${usaHack2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-100">{coach.hack_2.label}</div>
                  <div className="text-[11px] text-slate-400">Attiva la captazione muscolare GLUT4 indipendente dall'insulina</div>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md font-mono ${
                  usaHack2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {usaHack2 ? 'ATTIVO' : 'SIMULA'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1">-30% Picco</span>
              </div>
            </button>

            {/* Banner Risparmio se almeno uno attivo */}
            {(usaHack1 || usaHack2) && (
              <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center justify-between text-emerald-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Impatto Combinato Hack:
                </span>
                <span className="font-bold font-mono text-cyan-300">
                  -{deltaPicco} mg/dL al picco | +{gainTir}% Time-in-Range
                </span>
              </div>
            )}
          </div>

          {/* Sezione 3: Calcolatore Bolo Integrato */}
          <BolusCalculator
            glicemia={glicemia}
            carbs={meal.carboidrati_g}
            grassi={meal.grassi_g}
            usaHackMoto={usaHack2}
            impostazioni={impostazioni}
            setImpostazioni={setImpostazioni}
          />
        </div>

        {/* =========================================================================
            COLONNA DESTRA (7 Colonne): Grafico Glicemia, KPI & Chat Coach AI
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 4 KPI Chiave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/90 shadow-md">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Picco Standard</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 mt-1">
                {piccoStd} <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">al minuto +{tPiccoStd}</div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/90 shadow-md">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Picco Ottimizzato</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                {piccoOpt} <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">al minuto +{tPiccoOpt}</div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/90 shadow-md">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Escursione Risparmiata</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400 mt-1">
                -{deltaPicco} <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </div>
              <div className="text-[10px] text-cyan-400/80 mt-1 font-mono">
                {piccoStd > 180 && piccoOpt <= 180 ? '✓ Evita Iperglicemia' : 'Smorzamento curva'}
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/90 shadow-md">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time-in-Range</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-teal-300 mt-1">
                {tirOpt}% <span className="text-xs font-normal text-slate-400">({tirStd}%)</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-mono">+{gainTir}% a bersaglio</div>
            </div>
          </div>

          {/* Grafico Curva Glicemica */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Traiettoria Glicemica Prevista (-45m a +180m)
                </h3>
                <p className="text-[11px] text-slate-400">Modello matematico cinetico Gaussiano + dinamica di assorbimento intestinale</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Standard</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Con Hack GlucoTwin</span>
                </div>
              </div>
            </div>

            <GlucoseChart data={datiCurva} mostraOttimizzata={usaHack1 || usaHack2} />

            {/* Commento Clinico del Coach */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-emerald-400 font-semibold">Valutazione Clinico-Metabolica: </strong>
                {coach.commento_clinico}
              </div>
            </div>
          </div>

          {/* Chat Conversazionale con GlucoTwin Coach AI */}
          <ChatCoach
            glicemia={glicemia}
            meal={meal}
            coach={coach}
            usaHack1={usaHack1}
            usaHack2={usaHack2}
            impostazioni={impostazioni}
            datiCurva={datiCurva}
            piccoStd={piccoStd}
            piccoOpt={piccoOpt}
            tPiccoStd={tPiccoStd}
            tPiccoOpt={tPiccoOpt}
            tirStd={tirStd}
            tirOpt={tirOpt}
            apiKey={apiKey}
          />
        </div>
      </main>
    </div>
  );
}
