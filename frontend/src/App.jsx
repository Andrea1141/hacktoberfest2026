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
  Info,
  Home,
  Utensils,
  LineChart,
  Syringe,
  MessageSquare,
  Bot,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Minus,
  Zap,
  Camera,
  ArrowRight,
  Sliders
} from 'lucide-react';

const DEMO_MEALS_DATA = {
  pasta: {
    nome_piatto: "Pasta al Sugo di Pomodoro",
    etichetta: "Pasta al Sugo",
    carboidrati_g: 74,
    zuccheri_semplici_g: 5,
    fibre_g: 4,
    grassi_g: 8,
    proteine_g: 13,
    indice_glicemico: 68,
    emoji: "🍝",
    descrizione: "Il classico primo della tradizione: amido di grano duro a medio-rapido assorbimento con picco glicemico concentrato entro 60 minuti."
  },
  pizza: {
    nome_piatto: "Pizza Margherita al Trancio",
    etichetta: "Pizza al Trancio",
    carboidrati_g: 82,
    zuccheri_semplici_g: 6,
    fibre_g: 3,
    grassi_g: 24,
    proteine_g: 22,
    indice_glicemico: 80,
    emoji: "🍕",
    descrizione: "Trancio classico con mozzarella e pomodoro: elevato carico glicemico e oltre 20g di lipidi che attivano la coda tardiva (effetto pizza)."
  },
  toast: {
    nome_piatto: "Toast Prosciutto & Formaggio",
    etichetta: "Toast Farcito",
    carboidrati_g: 34,
    zuccheri_semplici_g: 3,
    fibre_g: 2,
    grassi_g: 14,
    proteine_g: 18,
    indice_glicemico: 60,
    emoji: "🥪",
    descrizione: "Pasto veloce da pausa pranzo o spuntino: pane tostato con proteine e lipidi che stabilizzano la velocità di salita glicemica."
  },
  insalata: {
    nome_piatto: "Insalata Mista con Tonno & Pane",
    etichetta: "Insalata & Tonno",
    carboidrati_g: 30,
    zuccheri_semplici_g: 4,
    fibre_g: 7,
    grassi_g: 15,
    proteine_g: 25,
    indice_glicemico: 44,
    emoji: "🥗",
    descrizione: "Piatto equilibrato con abbondanti fibre e proteine nobili: risposta glicemica estremamente controllata nel range bersaglio."
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

const TREND_OPTIONS = [
  { id: 'RAPIDA_SALITA', label: 'Rapida Salita', freccia: '↑↑', desc: 'Forte pendenza in ascesa' },
  { id: 'IN_SALITA', label: 'In Salita', freccia: '↗', desc: 'Tendenza in ascesa' },
  { id: 'STABILE', label: 'Stabile', freccia: '→', desc: 'Valore stazionario' },
  { id: 'IN_DISCESA', label: 'In Discesa', freccia: '↘', desc: 'Tendenza in calo' },
];

export default function App() {
  // Stato Schede / Pagine
  const [schedaAttiva, setSchedaAttiva] = useState('home'); // 'home' | 'pasto' | 'curva' | 'bolo'

  // Stato Chat AI (Desktop laterale & Mobile in rilievo)
  const [chatDesktopAperta, setChatDesktopAperta] = useState(true);
  const [chatMobileAperta, setChatMobileAperta] = useState(false);

  // Stato Clinico e Pasto
  const [glicemia, setGlicemia] = useState(115);
  const [demoId, setDemoId] = useState('pasta');
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
    meal: DEMO_MEALS_DATA.pasta,
    coach: DEFAULT_COACH_DATA
  });

  // Funzione di analisi pasto (con fallback trasparente offline)
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
      const timeoutMs = fileFoto ? 35000 : 10000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
      const pastoScelto = DEMO_MEALS_DATA[idPiatto] || DEMO_MEALS_DATA.pasta;
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

  // 1. Simulatore dinamico di telemetria CGM Live
  useEffect(() => {
    if (!simulatoreCgm) return;
    const interval = setInterval(() => {
      setGlicemia(prev => {
        let delta = 0;
        if (trendCgm === 'RAPIDA_SALITA') delta = 5;
        else if (trendCgm === 'IN_SALITA') delta = 3;
        else if (trendCgm === 'IN_DISCESA') delta = -3;
        else delta = Math.random() > 0.5 ? 1 : -1;
        return Math.min(240, Math.max(70, prev + delta));
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [simulatoreCgm, trendCgm]);

  // 2. Predizione AI Automatica guidata dal sensore CGM (Gemma 4)
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setLoadingPredizione(true);
      try {
        const res = await fetch('http://localhost:8000/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            glicemia_cgm: glicemia,
            trend_cgm: trendCgm,
            meal: risultato.meal,
            usa_hack1: usaHack1,
            usa_hack2: usaHack2,
            api_key: apiKey
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setPredizioneAi(data);
            setBackendConnesso(true);
          }
        }
      } catch (err) {
        // Mantiene fallback locale
      } finally {
        if (!isCancelled) setLoadingPredizione(false);
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [glicemia, trendCgm, risultato.meal, usaHack1, usaHack2, apiKey]);

  const { meal, coach } = risultato;
  const localCurva = generaDatiCurva(glicemia, meal, coach, usaHack1, usaHack2);

  // Unione intelligente dei dati: usa la traiettoria AI predittiva del backend se disponibile
  const datiCurva = predizioneAi?.punti || localCurva.punti;
  const tPiccoStd = predizioneAi?.t_picco_std ?? localCurva.tPiccoStd;
  const tPiccoOpt = predizioneAi?.t_picco_opt ?? localCurva.tPiccoOpt;
  const piccoStd = predizioneAi?.picco_std ?? Math.max(...datiCurva.map(d => d.standard));
  const piccoOpt = predizioneAi?.picco_opt ?? Math.max(...datiCurva.map(d => d.ottimizzata));
  const deltaPicco = Math.max(0, piccoStd - piccoOpt);

  // Time-in-Range (70 - 180 mg/dL)
  const tirStd = predizioneAi?.tir_std ?? Math.round((datiCurva.filter(d => d.standard >= 70 && d.standard <= 180).length / datiCurva.length) * 100);
  const tirOpt = predizioneAi?.tir_opt ?? Math.round((datiCurva.filter(d => d.ottimizzata >= 70 && d.ottimizzata <= 180).length / datiCurva.length) * 100);
  const gainTir = Math.max(0, tirOpt - tirStd);

  // Calcolo Bolo Rapido per la Home
  const boloPasto = (meal.carboidrati_g / impostazioni.rapportoIC);
  const deltaGli = Math.max(0, glicemia - impostazioni.targetGlicemico);
  const boloCorrezione = deltaGli / impostazioni.fsi;
  const subtotaleBolo = boloPasto + boloCorrezione;
  const scontoMoto = usaHack2 ? (subtotaleBolo * 0.20) : 0;
  const boloRapidoTotale = Math.max(0, subtotaleBolo - impostazioni.iob - scontoMoto);
  const boloRapidoArrotondato = Math.round(boloRapidoTotale * 10) / 10;
  const richiedeDualWave = meal.grassi_g >= 20;

  // Badge cromatico glicemia
  const getGlicemiaInfo = (val) => {
    if (val < 70) return { testo: 'Ipoglicemia', classe: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    if (val <= 140) return { testo: 'Bersaglio Ideale', classe: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (val <= 180) return { testo: 'Elevata Accettabile', classe: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
    return { testo: 'Iperglicemia', classe: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  };

  const glicemiaInfo = getGlicemiaInfo(glicemia);

  // Definizioni Schede / Pagine
  const SCHEDE = [
    { id: 'home', label: 'Home Rapida', icon: Zap, badge: 'Daily' },
    { id: 'pasto', label: 'Analisi Pasto', icon: Utensils, badge: `${meal.carboidrati_g}g CHO` },
    { id: 'curva', label: 'Curva & Trend', icon: LineChart, badge: `${tirOpt}% TIR` },
    { id: 'bolo', label: 'Calcolatore Bolo', icon: Syringe, badge: `${boloRapidoArrotondato} U` },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 pb-28 lg:pb-12">
      {/* Background Decorativo Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* =========================================================================
          TOP NAVBAR: Header + CGM Quick Bar + Schede
          ========================================================================= */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo Brand & Stato Connessione */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 pulse-glow">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Gluco
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    v2.6 AI
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className={`inline-flex items-center gap-1.5 font-mono ${backendConnesso ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${backendConnesso ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                    {backendConnesso ? 'FastAPI Connesso' : 'Simulatore Locale'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tasto Toggle Chat Desktop (visibile su lg:) */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setChatDesktopAperta(!chatDesktopAperta)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
                  chatDesktopAperta
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>Coach AI</span>
                {chatDesktopAperta ? <PanelRightClose className="w-3.5 h-3.5 text-slate-400" /> : <PanelRightOpen className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Quick CGM Bar & OpenRouter Key */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Widget Rapido CGM Header */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-sm text-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-[11px] font-medium">CGM:</span>
              <span className="font-mono font-black text-slate-100 text-sm">{glicemia}</span>
              <span className="text-[10px] text-slate-500">mg/dL</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${glicemiaInfo.classe}`}>
                {glicemiaInfo.testo}
              </span>
            </div>

            {/* Input Chiave OpenRouter (Compatto) */}
            <div className="relative flex items-center bg-slate-900/90 rounded-xl border border-slate-800 px-2.5 py-1 text-xs">
              <Key className="w-3 h-3 text-slate-500 mr-1.5" />
              <input
                type={mostraKey ? "text" : "password"}
                placeholder="API Key (Opzionale)"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="bg-transparent text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none w-28 sm:w-36"
              />
              <button
                onClick={() => setMostraKey(!mostraKey)}
                className="text-slate-500 hover:text-slate-300 ml-1 p-0.5"
                title={mostraKey ? "Nascondi chiave" : "Mostra chiave"}
              >
                {mostraKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BARRA DELLE PAGINE / SCHEDE DI NAVIGAZIONE
            ========================================================================= */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SCHEDE.map(tab => {
            const Icon = tab.icon;
            const isAttiva = schedaAttiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSchedaAttiva(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
                  isAttiva
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 hover:border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isAttiva ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isAttiva ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-slate-800/80 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* =========================================================================
          CONTENUTO PRINCIPALE A SCHEDE CON CHAT LATERALE (DESKTOP)
          ========================================================================= */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =====================================================================
              AREA CONTENUTO PRINCIPALE (Col 12 oppure Col 8/7 se chat aperta)
              ===================================================================== */}
          <div className={`${chatDesktopAperta ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>

            {/* ===================================================================
                SCHEDA 1: HOME (PANORAMICA QUOTIDIANA & FUNZIONALITÀ RAPIDE)
                =================================================================== */}
            {schedaAttiva === 'home' && (
              <div className="space-y-6">
                {/* 1. Quick CGM Speed Controller Card */}
                <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Sensore CGM Glicemia di Partenza
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black font-mono text-slate-100">{glicemia}</span>
                          <span className="text-xs text-slate-400 font-mono">mg/dL</span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${glicemiaInfo.classe}`}>
                            {glicemiaInfo.testo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stepper rapido [-5] [+5] e preset */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                        <button
                          onClick={() => setGlicemia(prev => Math.max(70, prev - 5))}
                          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
                          title="Diminuisci 5 mg/dL"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-slate-300">±5</span>
                        <button
                          onClick={() => setGlicemia(prev => Math.min(220, prev + 5))}
                          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
                          title="Aumenta 5 mg/dL"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Preset Glicemici Rapidi */}
                      <div className="flex items-center gap-1">
                        {[90, 115, 140, 175].map(val => (
                          <button
                            key={val}
                            onClick={() => setGlicemia(val)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
                              glicemia === val
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Slider esteso per regolazione fine */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">70</span>
                    <input
                      type="range"
                      min="70"
                      max="220"
                      value={glicemia}
                      onChange={e => setGlicemia(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">220</span>
                  </div>
                </div>

                {/* 2. Selezione Rapida Pasto (1-Tap Fast Choice) & Widget Bolo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Pasto Rapido */}
                  <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Pasto Attuale</h3>
                      </div>
                      <button
                        onClick={() => setSchedaAttiva('pasto')}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      >
                        <span>Personalizza</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Griglia 4 Pasti Veloci */}
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(DEMO_MEALS_DATA).map(([id, info]) => (
                        <button
                          key={id}
                          onClick={() => {
                            setDemoId(id);
                            setUsaHack1(false);
                            setUsaHack2(false);
                            setAnteprimaFoto(null);
                          }}
                          className={`p-2.5 rounded-xl text-left transition flex items-center gap-2.5 border ${
                            demoId === id && !anteprimaFoto
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="text-2xl">{info.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-xs truncate text-slate-100">{info.etichetta}</div>
                            <div className="text-[10px] font-mono text-slate-400">{info.carboidrati_g}g CHO</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Pillola Riepilogo Pasto Selezionato */}
                    <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{meal.emoji}</span>
                        <div>
                          <div className="font-bold text-slate-100">{meal.nome_piatto}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Carbs: <strong className="text-cyan-400 font-mono">{meal.carboidrati_g}g</strong></span>
                            <span>•</span>
                            <span>Grassi: <strong className="text-amber-400 font-mono">{meal.grassi_g}g</strong></span>
                            <span>•</span>
                            <span>Fibre: <strong className="text-emerald-400 font-mono">{meal.fibre_g}g</strong></span>
                          </div>
                        </div>
                      </div>
                      {richiedeDualWave && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                          Coda Grassi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Suggerimento Bolo Istantaneo */}
                  <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Syringe className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Stima Rapida Bolo</h3>
                        </div>
                        <button
                          onClick={() => setSchedaAttiva('bolo')}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                        >
                          <span>Dettagli Calcolo</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Valore Bolo in Grande */}
                      <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Dose Totale Consigliata</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl font-black font-mono text-cyan-400">{boloRapidoArrotondato}</span>
                          <span className="text-xs text-slate-400 font-mono">Unità (U)</span>
                          {usaHack2 && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              -20% Moto GLUT4
                            </span>
                          )}
                        </div>

                        {/* Scorporo Rapido */}
                        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] font-mono text-center">
                          <div className="bg-slate-900/60 p-1.5 rounded-lg">
                            <span className="text-slate-400 block">Pasto</span>
                            <span className="font-bold text-slate-200">{boloPasto.toFixed(1)} U</span>
                          </div>
                          <div className="bg-slate-900/60 p-1.5 rounded-lg">
                            <span className="text-slate-400 block">Corr.</span>
                            <span className="font-bold text-slate-200">+{boloCorrezione.toFixed(1)} U</span>
                          </div>
                          <div className="bg-slate-900/60 p-1.5 rounded-lg">
                            <span className="text-slate-400 block">IOB</span>
                            <span className="font-bold text-slate-200">-{impostazioni.iob} U</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {richiedeDualWave && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Pasto ricco di grassi ({meal.grassi_g}g): suggerito <strong>Bolo Dual-Wave</strong> (65% subito + 35% a 2-3h).</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Toggles Rapidi What-If (Fibre & Moto) */}
                <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Micro-Interventi Rapidi What-If
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Appiattisci la curva</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Toggle Fibre */}
                    <button
                      onClick={() => setUsaHack1(!usaHack1)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                        usaHack1
                          ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${usaHack1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                          <Salad className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-100">🥗 Pre-carico Fibre</div>
                          <div className="text-[10px] text-slate-400">Verdura 10m prima del pasto</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${usaHack1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {usaHack1 ? 'ON (-22%)' : 'OFF'}
                      </span>
                    </button>

                    {/* Toggle Moto GLUT4 */}
                    <button
                      onClick={() => setUsaHack2(!usaHack2)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                        usaHack2
                          ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${usaHack2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                          <Footprints className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-100">🚶 15m Camminata GLUT4</div>
                          <div className="text-[10px] text-slate-400">30 min post-pasto</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${usaHack2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {usaHack2 ? 'ON (-30%)' : 'OFF'}
                      </span>
                    </button>
                  </div>

                  {/* Impact feedback */}
                  {(usaHack1 || usaHack2) && (
                    <div className="p-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center justify-between text-emerald-300 font-mono">
                      <span>✓ Risparmiati <strong>-{deltaPicco} mg/dL</strong> sul picco</span>
                      <span>Time-in-Range: <strong>+{gainTir}%</strong></span>
                    </div>
                  )}
                </div>

                {/* 4. Grafico Glicemia Istantaneo & 4 KPI in Evidenza */}
                <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
                  {/* KPI Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Picco Standard</div>
                      <div className="text-xl font-black font-mono text-rose-400 mt-0.5">{piccoStd} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[9px] text-slate-500 font-mono">al min +{tPiccoStd}</div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Picco Ottimizzato</div>
                      <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">{piccoOpt} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[9px] text-slate-500 font-mono">al min +{tPiccoOpt}</div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Escursione Meno</div>
                      <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">-{deltaPicco} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[9px] text-cyan-400/80 font-mono">{deltaPicco > 0 ? 'Curva smorzata' : 'Nessun hack'}</div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Time-In-Range</div>
                      <div className="text-xl font-black font-mono text-teal-300 mt-0.5">{tirOpt}%</div>
                      <div className="text-[9px] text-emerald-400 font-mono">+{gainTir}% con hack</div>
                    </div>
                  </div>

                  {/* Header Grafico */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                        Proiezione Glicemica Cinetica (-45m a +180m)
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-rose-400">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> Standard
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Con Hack Gluco
                      </span>
                    </div>
                  </div>

                  {/* Recharts Component */}
                  <GlucoseChart data={datiCurva} mostraOttimizzata={usaHack1 || usaHack2} />
                </div>
              </div>
            )}

            {/* ===================================================================
                SCHEDA 2: ANALISI PASTO & VISION AGENT
                =================================================================== */}
            {schedaAttiva === 'pasto' && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-emerald-400" />
                        Analisi Bromatologica del Piatto
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Scegli tra i piatti quotidiani o carica una foto reale per la stima automatica</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                      Gemma 4 Multimodal
                    </span>
                  </div>

                  {/* Pulsanti Pasti Quotidiani */}
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
                        className={`p-3 rounded-xl text-xs font-semibold transition flex flex-col items-center gap-1.5 border ${
                          demoId === id && !anteprimaFoto
                            ? 'bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="text-2xl">{info.emoji}</span>
                        <span className="font-bold text-center">{info.etichetta}</span>
                        <span className="text-[10px] font-mono text-slate-500">{info.carboidrati_g}g Carbs</span>
                      </button>
                    ))}
                  </div>

                  {/* Upload Foto Reale */}
                  <label className="group relative block w-full text-center p-5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/80 bg-slate-950/60 cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files[0] && analizzaPasto(demoId, e.target.files[0])}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs text-slate-200 font-medium">
                        {loading ? "Analisi Vision multimodale in corso..." : "Carica o scatta la foto del piatto"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Riconoscimento automatico volume porzione, carboidrati netti, fibre e grassi
                      </span>
                    </div>
                  </label>

                  {/* Scheda Nutrizionale Completa */}
                  <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{meal.emoji || '🍽️'}</span>
                        <div>
                          <h3 className="text-emerald-400 font-bold text-base leading-tight">{meal.nome_piatto}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{meal.descrizione || 'Analisi nutrizionale del pasto'}</p>
                        </div>
                      </div>
                      {meal.grassi_g >= 20 && (
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                          Coda Grassi Attiva
                        </span>
                      )}
                    </div>

                    {/* Griglia 4 Macronutrienti + Indice Glicemico */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <Wheat className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Carboidrati</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-cyan-400 mt-1">{meal.carboidrati_g}g</div>
                        <span className="text-[9px] text-slate-500 font-mono">netti</span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <Salad className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Fibre</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-emerald-400 mt-1">{meal.fibre_g}g</div>
                        <span className="text-[9px] text-slate-500 font-mono">rallentamento</span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>Grassi</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-amber-400 mt-1">{meal.grassi_g}g</div>
                        <span className="text-[9px] text-slate-500 font-mono">{meal.grassi_g >= 20 ? 'effetto pizza' : 'moderati'}</span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-teal-400" />
                          <span>Proteine</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-teal-400 mt-1">{meal.proteine_g || 20}g</div>
                        <span className="text-[9px] text-slate-500 font-mono">sazietà</span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                          <span>Indice Glic.</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-rose-400 mt-1">{meal.indice_glicemico}</div>
                        <span className="text-[9px] text-slate-500 font-mono">su 100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                SCHEDA 3: CURVA & TREND GLICEMICO COMPLETO
                =================================================================== */}
            {schedaAttiva === 'curva' && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-emerald-400" />
                        Analisi Cinetica Dettagliata & Time-In-Range
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Simulazione farmacodinamica da t = -45m a t = +180m post-prandiale</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Curva Standard
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Curva Ottimizzata (Con Hack)
                      </span>
                    </div>
                  </div>

                  {/* 4 KPI Completi */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Picco Standard</div>
                      <div className="text-2xl font-black font-mono text-rose-400 mt-1">{piccoStd} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">al minuto +{tPiccoStd}</div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Picco Ottimizzato</div>
                      <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{piccoOpt} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">al minuto +{tPiccoOpt}</div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Escursione Ridotta</div>
                      <div className="text-2xl font-black font-mono text-cyan-400 mt-1">-{deltaPicco} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">delta risparmiato</div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Time-In-Range (70-180)</div>
                      <div className="text-2xl font-black font-mono text-teal-300 mt-1">{tirOpt}%</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">+{gainTir}% rispetto a standard</div>
                    </div>
                  </div>

                  {/* Grafico Curva Recharts */}
                  <GlucoseChart data={datiCurva} mostraOttimizzata={usaHack1 || usaHack2} />

                  {/* Commento Clinico Fisiologico */}
                  <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3 leading-relaxed">
                    <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-400 font-semibold block mb-0.5">Valutazione Fisiologica dell'Assorbimento:</strong>
                      {coach.commento_clinico}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                SCHEDA 4: CALCOLATORE BOLO TRASPARENTE
                =================================================================== */}
            {schedaAttiva === 'bolo' && (
              <div className="space-y-6">
                <BolusCalculator
                  glicemia={glicemia}
                  carbs={meal.carboidrati_g}
                  grassi={meal.grassi_g}
                  usaHackMoto={usaHack2}
                  impostazioni={impostazioni}
                  setImpostazioni={setImpostazioni}
                />
              </div>
            )}
          </div>

          {/* =====================================================================
              CHAT COACH AI LATERALE DESKTOP (lg:col-span-4 sticky)
              ===================================================================== */}
          {chatDesktopAperta && (
            <div className="hidden lg:block lg:col-span-4 sticky top-24 z-20">
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
                className="h-[calc(100vh-8.5rem)] min-h-[580px]"
                onChiudi={() => setChatDesktopAperta(false)}
              />
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          PULSANTE FLOTTANTE DOCK DESKTOP (QUANDO LA CHAT LATERALE È CHIUSA)
          ========================================================================= */}
      {!chatDesktopAperta && (
        <button
          onClick={() => setChatDesktopAperta(true)}
          className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 shadow-2xl shadow-emerald-950/80 hover:bg-slate-800 transition group hover:scale-105"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Apri Gluco Coach AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* =========================================================================
          CHAT COACH AI PER MOBILE: IN BASSO IN RILIEVO SULLA PAGINA
          ========================================================================= */}
      {/* 1. Barra Flottante in Rilievo (Mobile Pill Bar) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={() => setChatMobileAperta(true)}
          className="w-full glass-panel-glow bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl shadow-emerald-950/60 flex items-center justify-between text-left active:scale-[0.98] transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">Gluco Coach AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                Tocca per chiedere su bolo, picco o alimenti...
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
            <span>Chiedi</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* 2. Bottom Sheet Scorrevole (Mobile Drawer) */}
      {chatMobileAperta && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700/80 rounded-t-3xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
            {/* Header del Bottom Sheet */}
            <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0 relative">
              <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"></div>
              <div className="flex items-center gap-2 mt-1.5">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-100">Gluco Coach AI Clinico</span>
              </div>
              <button
                onClick={() => setChatMobileAperta(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 mt-1.5"
                title="Chiudi Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenuto Chat Coach a Tutto Schermo su Mobile */}
            <div className="flex-1 overflow-hidden p-2">
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
                className="h-full border-0 shadow-none bg-transparent"
                onChiudi={() => setChatMobileAperta(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
