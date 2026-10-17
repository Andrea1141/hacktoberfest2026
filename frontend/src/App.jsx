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
  Pizza,
  Sandwich,
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
  ArrowRight,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Check
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
    icon: Utensils,
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
    icon: Pizza,
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
    icon: Sandwich,
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
    icon: Salad,
    descrizione: "Piatto equilibrato con abbondanti fibre e proteine nobili: risposta glicemica estremamente controllata nel range bersaglio."
  }
};

const DEFAULT_COACH_DATA = {
  hack_1: {
    label: "Pre-carico di fibre (Verdura cruda 10 min prima)",
    mod_fibre: 12,
    rid_ig: 15,
    riduzione_percentuale: 22
  },
  hack_2: {
    label: "15 min di camminata attiva (30 min post-pasto)",
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
  const [trendCgm, setTrendCgm] = useState('STABILE');
  const [simulatoreCgm, setSimulatoreCgm] = useState(false);
  const [predizioneAi, setPredizioneAi] = useState(null);
  const [loadingPredizione, setLoadingPredizione] = useState(false);
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
          meal: { ...data.meal, icon: DEMO_MEALS_DATA[idPiatto]?.icon || Utensils },
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

  // Badge cromatico glicemia intuitivo e umano
  const getGlicemiaInfo = (val) => {
    if (val < 70) return { testo: 'Bassa (Attenzione)', classe: 'text-amber-300 border-amber-500/30 bg-amber-500/10' };
    if (val <= 140) return { testo: 'Ottimale', classe: 'text-teal-300 border-teal-500/30 bg-teal-500/10' };
    if (val <= 180) return { testo: 'Normale post-pasto', classe: 'text-slate-300 border-slate-600 bg-slate-800/80' };
    return { testo: 'Alta', classe: 'text-rose-300 border-rose-500/30 bg-rose-500/10' };
  };

  const glicemiaInfo = getGlicemiaInfo(glicemia);

  // Stili e dettagli per i livelli di rischio metabolico
  const getRischioDetails = (livello) => {
    switch (livello) {
      case 'CRITICO':
        return {
          pill: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm',
          alertBox: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
          glow: 'from-rose-500/10 via-rose-500/5 to-transparent',
          Icon: AlertTriangle
        };
      case 'ELEVATO':
        return {
          pill: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm',
          alertBox: 'bg-amber-950/30 border-amber-500/40 text-amber-200',
          glow: 'from-amber-500/10 via-amber-500/5 to-transparent',
          Icon: AlertCircle
        };
      case 'MEDIO':
        return {
          pill: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
          alertBox: 'bg-sky-950/30 border-sky-500/40 text-sky-200',
          glow: 'from-sky-500/10 via-sky-500/5 to-transparent',
          Icon: Info
        };
      case 'BASSO':
      default:
        return {
          pill: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
          alertBox: 'bg-teal-950/30 border-teal-500/40 text-teal-200',
          glow: 'from-teal-500/10 via-teal-500/5 to-transparent',
          Icon: CheckCircle2
        };
    }
  };

  // Definizioni Schede / Pagine
  const SCHEDE = [
    { id: 'home', label: 'Home Rapida', icon: Zap, badge: 'Daily' },
    { id: 'pasto', label: 'Analisi Pasto', icon: Utensils, badge: `${meal.carboidrati_g}g CHO` },
    { id: 'curva', label: 'Curva & Trend', icon: LineChart, badge: `${tirOpt}% TIR` },
    { id: 'bolo', label: 'Calcolatore Bolo', icon: Syringe, badge: `${boloRapidoArrotondato} U` },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-300 pb-28 lg:pb-12">
      {/* =========================================================================
          TOP NAVBAR: Header + CGM Quick Bar + Schede
          ========================================================================= */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo Brand & Stato Connessione */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-sm">
                <HeartPulse className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">
                    Gluco
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    Assistente Glicemico
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className={`inline-flex items-center gap-1.5 ${backendConnesso ? 'text-teal-400' : 'text-amber-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${backendConnesso ? 'bg-teal-400' : 'bg-amber-400'}`}></span>
                    {backendConnesso ? 'Sensore collegato' : 'Modalità demo'}
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
                    ? 'bg-teal-500/15 border-teal-500/40 text-teal-200 shadow-sm'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4 text-teal-400" />
                <span>Coach AI</span>
                {chatDesktopAperta ? <PanelRightClose className="w-3.5 h-3.5 text-slate-400" /> : <PanelRightOpen className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Quick CGM Bar & OpenRouter Key */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Widget Rapido CGM Header */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-sm text-xs">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400 text-[11px] font-medium">Glicemia:</span>
              <span className="font-mono font-bold text-slate-100 text-sm">{glicemia}</span>
              <span className="text-[10px] text-slate-400">mg/dL</span>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${glicemiaInfo.classe}`}>
                {glicemiaInfo.testo}
              </span>
            </div>

            {/* Input Chiave OpenRouter (Compatto) */}
            <div className="relative flex items-center bg-slate-800/80 rounded-xl border border-slate-700/60 px-2.5 py-1 text-xs">
              <Key className="w-3 h-3 text-slate-400 mr-1.5" />
              <input
                type={mostraKey ? "text" : "password"}
                placeholder="Chiave API (Opzionale)"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="bg-transparent text-[11px] text-slate-200 placeholder-slate-400 focus:outline-none w-28 sm:w-36"
              />
              <button
                onClick={() => setMostraKey(!mostraKey)}
                className="text-slate-400 hover:text-slate-200 ml-1 p-0.5"
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
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SCHEDE.map(tab => {
            const Icon = tab.icon;
            const isAttiva = schedaAttiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSchedaAttiva(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
                  isAttiva
                    ? 'bg-teal-500/15 border-teal-500/40 text-teal-200 shadow-sm'
                    : 'bg-slate-800/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isAttiva ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isAttiva ? 'bg-teal-500/20 text-teal-200 border border-teal-500/30' : 'bg-slate-800 text-slate-400'
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
              <div className="space-y-5">
                {/* 1. Controller Glicemia Semplificato & Umano */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-sm">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          La tua Glicemia Attuale
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black font-mono text-slate-100">{glicemia}</span>
                          <span className="text-xs text-slate-400 font-mono">mg/dL</span>
                          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${glicemiaInfo.classe}`}>
                            {glicemiaInfo.testo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Controlli Rapidi: Step [-5] [+5] e Preset */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800 p-1">
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

                      {/* Valori Frequenti */}
                      <div className="flex items-center gap-1">
                        {[90, 115, 140, 175].map(val => (
                          <button
                            key={val}
                            onClick={() => setGlicemia(val)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
                              glicemia === val
                                ? 'bg-teal-600 text-white border-teal-500 font-bold shadow-sm'
                                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>

                      {/* Tendenza Sensore */}
                      <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800 p-1">
                        {TREND_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setTrendCgm(opt.id)}
                            title={`${opt.label} - ${opt.desc}`}
                            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                              trendCgm === opt.id
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            {opt.freccia}
                          </button>
                        ))}
                      </div>

                      {/* Toggle Simulatore Flusso */}
                      <button
                        onClick={() => setSimulatoreCgm(!simulatoreCgm)}
                        title={simulatoreCgm ? "Ferma flusso simulato" : "Simula andamento sensore continuo"}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                          simulatoreCgm
                            ? 'bg-teal-500/15 text-teal-200 border-teal-500/40 shadow-sm'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {simulatoreCgm ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                            <span>Simula ON</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-slate-400" />
                            <span>Simula</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Slider per regolazione fine */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">70</span>
                    <input
                      type="range"
                      min="70"
                      max="220"
                      value={glicemia}
                      onChange={e => setGlicemia(Number(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">220</span>
                  </div>
                </div>

                {/* 2. Consiglio del Coach AI (Linguaggio Semplice e Umano) */}
                {(() => {
                  const consiglio = predizioneAi?.consiglio_prioritario || (piccoStd > 180 ? "Una camminata di 15 min dopo mangiato aiuterà a mantenere la glicemia stabile." : "La risposta glicemica per questo piatto è ottimale.");
                  const hackSuggerito = predizioneAi?.hack_consigliato_prioritario;
                  const puoAttivareHack2 = (hackSuggerito === 'HACK_2' || hackSuggerito === 'ENTRAMBI') && !usaHack2;
                  const puoAttivareHack1 = (hackSuggerito === 'HACK_1' || hackSuggerito === 'ENTRAMBI') && !usaHack1;
                  const tuttiAttivi = usaHack1 && usaHack2;

                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">Consiglio Personalizzato Gluco</span>
                            {loadingPredizione && (
                              <span className="text-[10px] text-teal-300 font-mono flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Ricalcolo...
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                            Con <strong className="text-slate-100">{meal.nome_piatto}</strong> la glicemia raggiungerà circa <strong className="text-rose-300 font-mono">{piccoStd} mg/dL</strong>. {consiglio}
                          </p>
                        </div>
                      </div>

                      {/* Azione rapida a 1 tap */}
                      <div className="shrink-0 flex items-center gap-2">
                        {puoAttivareHack2 && (
                          <button
                            onClick={() => setUsaHack2(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Footprints className="w-3.5 h-3.5" />
                            <span>Attiva Camminata</span>
                          </button>
                        )}
                        {puoAttivareHack1 && !puoAttivareHack2 && (
                          <button
                            onClick={() => setUsaHack1(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Salad className="w-3.5 h-3.5" />
                            <span>Attiva Fibre</span>
                          </button>
                        )}
                        {tuttiAttivi && (
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                            <span>Consigli attivi (-{deltaPicco} mg/dL)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Pasto Attuale (a forma di Tasto) & Stima Rapida Bolo Compatta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pasto Attuale - Semplificato come un grande tasto interattivo */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between text-xs px-0.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-teal-400" />
                        Pasto Attuale
                      </span>
                      <button
                        onClick={() => setSchedaAttiva('pasto')}
                        className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5"
                      >
                        <span>Tutti i pasti</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Il grande tasto pasto */}
                    <button
                      onClick={() => setSchedaAttiva('pasto')}
                      className="w-full bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-teal-500/40 rounded-xl p-3 flex items-center justify-between transition-all group text-left shadow-sm"
                      title="Tocca per cambiare pasto o analizzare con foto"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 shrink-0 group-hover:scale-105 transition shadow-sm">
                          {(() => {
                            const CurrentMealIcon = meal.icon || DEMO_MEALS_DATA[demoId]?.icon || Utensils;
                            return <CurrentMealIcon className="w-5 h-5" />;
                          })()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-100 truncate group-hover:text-teal-300 transition">
                            {meal.nome_piatto}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-medium">
                            <span className="text-teal-300 font-mono font-bold">{meal.carboidrati_g}g carboidrati</span>
                            <span>•</span>
                            <span className="text-slate-400">{meal.grassi_g}g grassi</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2 px-2.5 py-1 rounded-lg bg-slate-800/80 group-hover:bg-teal-600 group-hover:text-white text-slate-300 text-xs font-semibold flex items-center gap-1 transition">
                        <span>Cambia</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {/* 4 micro-tasti pasto veloci */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {Object.entries(DEMO_MEALS_DATA).map(([id, info]) => {
                        const ItemIcon = info.icon || Utensils;
                        return (
                          <button
                            key={id}
                            onClick={() => {
                              setDemoId(id);
                              setUsaHack1(false);
                              setUsaHack2(false);
                              setAnteprimaFoto(null);
                            }}
                            title={`${info.nome_piatto} (${info.carboidrati_g}g carboidrati)`}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border truncate ${
                              demoId === id && !anteprimaFoto
                                ? 'bg-teal-600 text-white border-teal-500 font-semibold shadow-sm'
                                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                          >
                            <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate hidden sm:inline">{info.etichetta.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stima Rapida Bolo Compatta */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between text-xs px-0.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Syringe className="w-3.5 h-3.5 text-teal-400" />
                        Stima Rapida Bolo
                      </span>
                      <button
                        onClick={() => setSchedaAttiva('bolo')}
                        className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5"
                      >
                        <span>Vedi dettagli</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Box valore dose compatto e pulito */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dose Consigliata</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl font-black font-mono text-teal-300">{boloRapidoArrotondato}</span>
                          <span className="text-xs text-slate-400 font-mono">Unità (U)</span>
                          {usaHack2 && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                              -20% Moto
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-[11px] font-mono text-slate-400 border-l border-slate-800/80 pl-3 space-y-0.5">
                        <div>Pasto: <strong className="text-slate-200">{boloPasto.toFixed(1)}U</strong></div>
                        <div>Corr: <strong className="text-slate-200">+{boloCorrezione.toFixed(1)}U</strong></div>
                        <div>IOB: <strong className="text-slate-200">-{impostazioni.iob}U</strong></div>
                      </div>
                    </div>

                    {/* Avviso o parametri paziente in una riga */}
                    {richiedeDualWave ? (
                      <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span className="truncate">Pasto ricco di grassi: consigliata dose prolungata.</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                        <span>Target: <strong className="text-slate-300 font-mono">{impostazioni.targetGlicemico}</strong> mg/dL</span>
                        <span>1U ogni <strong className="text-slate-300 font-mono">{impostazioni.rapportoIC}g</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Abitudini Semplici per Abbassare la Glicemia */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                        Consigli per la Stabilità Glicemica
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Due semplici abitudini per evitare rialzi improvvisi</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Toggle Fibre */}
                    <button
                      onClick={() => setUsaHack1(!usaHack1)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                        usaHack1
                          ? 'bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-sm'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${usaHack1 ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                          <Salad className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-100">Verdura prima del pasto</div>
                          <div className="text-[10px] text-slate-400">Rallenta l'assorbimento (-22% picco)</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${usaHack1 ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {usaHack1 ? 'ATTIVO' : 'DISATTIVO'}
                      </span>
                    </button>

                    {/* Toggle Camminata */}
                    <button
                      onClick={() => setUsaHack2(!usaHack2)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                        usaHack2
                          ? 'bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-sm'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${usaHack2 ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                          <Footprints className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-100">15 min di camminata post-pasto</div>
                          <div className="text-[10px] text-slate-400">Muscoli attivi dopo mangiato (-30% picco)</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${usaHack2 ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {usaHack2 ? 'ATTIVO' : 'DISATTIVO'}
                      </span>
                    </button>
                  </div>

                  {/* Risultato risparmiato */}
                  {(usaHack1 || usaHack2) && (
                    <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs flex items-center justify-between text-teal-300 font-mono">
                      <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-400" /> Risparmiati circa <strong>-{deltaPicco} mg/dL</strong> sul picco</span>
                      <span>Nel bersaglio: <strong>{tirOpt}%</strong> (+{gainTir}%)</span>
                    </div>
                  )}
                </div>

                {/* 5. Grafico e Valori Chiave Comprensibili */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                  {/* Valori Chiave (KPI) Semplificati */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Picco Normale</div>
                      <div className="text-xl font-bold font-mono text-rose-300 mt-0.5">{piccoStd} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[9px] text-slate-400 font-mono">tra circa {tPiccoStd} min</div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Picco con Consigli</div>
                      <div className="text-xl font-bold font-mono text-teal-300 mt-0.5">{piccoOpt} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[9px] text-slate-400 font-mono">tra circa {tPiccoOpt} min</div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Differenza Glicemica</div>
                      <div className="text-xl font-bold font-mono text-sky-300 mt-0.5">-{deltaPicco} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[9px] text-sky-300/80 font-mono">{deltaPicco > 0 ? 'Curva più dolce' : 'Nessun consiglio attivo'}</div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Tempo nel Range</div>
                      <div className="text-xl font-bold font-mono text-teal-300 mt-0.5">{tirOpt}%</div>
                      <div className="text-[9px] text-teal-400 font-mono">{gainTir > 0 ? `+${gainTir}% con consigli` : 'Valore standard'}</div>
                    </div>
                  </div>

                  {/* Header Grafico */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-400" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                        Andamento previsto della glicemia
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-rose-300">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> Standard
                      </span>
                      <span className="flex items-center gap-1.5 text-teal-300">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span> Con consigli Gluco
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
                    {Object.entries(DEMO_MEALS_DATA).map(([id, info]) => {
                      const ItemIcon = info.icon || Utensils;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setDemoId(id);
                            setUsaHack1(false);
                            setUsaHack2(false);
                            setAnteprimaFoto(null);
                          }}
                          className={`p-3 rounded-xl text-xs font-semibold transition flex flex-col items-center gap-2 border ${
                            demoId === id && !anteprimaFoto
                              ? 'bg-teal-500/15 border-teal-500 text-teal-200 shadow-sm'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400">
                            <ItemIcon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-center">{info.etichetta}</span>
                          <span className="text-[10px] font-mono text-slate-400">{info.carboidrati_g}g Carbs</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Upload Foto Reale */}
                  <label className="group relative block w-full text-center p-5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-teal-500/80 bg-slate-950/60 cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files[0] && analizzaPasto(demoId, e.target.files[0])}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-teal-400 group-hover:border-teal-500/40 transition">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs text-slate-200 font-medium">
                        {loading ? "Analisi nutrizionale in corso..." : "Carica o scatta la foto del piatto"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Riconoscimento automatico volume porzione, carboidrati netti, fibre e grassi
                      </span>
                    </div>
                  </label>

                  {/* Scheda Nutrizionale Completa */}
                  <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 shrink-0 shadow-sm">
                          {(() => {
                            const CurrentMealIcon = meal.icon || DEMO_MEALS_DATA[demoId]?.icon || Utensils;
                            return <CurrentMealIcon className="w-6 h-6" />;
                          })()}
                        </div>
                        <div>
                          <h3 className="text-teal-300 font-bold text-base leading-tight">{meal.nome_piatto}</h3>
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
                          <Wheat className="w-3.5 h-3.5 text-sky-400" />
                          <span>Carboidrati</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-sky-300 mt-1">{meal.carboidrati_g}g</div>
                        <span className="text-[9px] text-slate-400 font-mono">netti</span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <Salad className="w-3.5 h-3.5 text-teal-400" />
                          <span>Fibre</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-teal-300 mt-1">{meal.fibre_g}g</div>
                        <span className="text-[9px] text-slate-400 font-mono">rallentamento</span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>Grassi</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-amber-300 mt-1">{meal.grassi_g}g</div>
                        <span className="text-[9px] text-slate-400 font-mono">{meal.grassi_g >= 20 ? 'effetto pizza' : 'moderati'}</span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-teal-400" />
                          <span>Proteine</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-teal-300 mt-1">{meal.proteine_g || 20}g</div>
                        <span className="text-[9px] text-slate-400 font-mono">sazietà</span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
                        <div className="text-[10px] uppercase text-slate-400 flex items-center justify-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                          <span>Indice Glic.</span>
                        </div>
                        <div className="font-extrabold font-mono text-base text-rose-300 mt-1">{meal.indice_glicemico}</div>
                        <span className="text-[9px] text-slate-400 font-mono">su 100</span>
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
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-teal-400" />
                        Andamento e Tempo nel Bersaglio (Time-In-Range)
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Simulazione della risposta glicemica da t = -45m a t = +180m post-pasto</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-rose-300 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Curva Standard
                      </span>
                      <span className="flex items-center gap-1.5 text-teal-300 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                        Con consigli Gluco
                      </span>
                    </div>
                  </div>

                  {/* Banner Sintesi Predizione AI CGM */}
                  {(() => {
                    const livelloRischio = predizioneAi?.livello_rischio || (piccoStd > 220 ? 'CRITICO' : piccoStd > 180 ? 'ELEVATO' : piccoStd > 140 ? 'MEDIO' : 'BASSO');
                    const { pill, alertBox, Icon: RiskIcon } = getRischioDetails(livelloRischio);
                    const allerta = predizioneAi?.allerta_proattiva || `Sensore a ${glicemia} mg/dL (${trendCgm}): picco previsto a ${piccoStd} mg/dL.`;

                    return (
                      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${alertBox}`}>
                        <div className="flex items-center gap-3">
                          <RiskIcon className="w-5 h-5 shrink-0" />
                          <div className="text-xs">
                            <span className="font-bold uppercase tracking-wider text-[10px] block text-slate-400">Valutazione Metabolica Sensore ({glicemia} mg/dL • {trendCgm})</span>
                            <span className="font-medium text-slate-100">{allerta}</span>
                          </div>
                        </div>
                        <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase self-start sm:self-center shrink-0 ${pill}`}>
                          {livelloRischio}
                        </span>
                      </div>
                    );
                  })()}

                  {/* 4 KPI Completi */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Picco Standard</div>
                      <div className="text-2xl font-black font-mono text-rose-300 mt-1">{piccoStd} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">al minuto +{tPiccoStd}</div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Picco con Consigli</div>
                      <div className="text-2xl font-black font-mono text-teal-300 mt-1">{piccoOpt} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">al minuto +{tPiccoOpt}</div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Differenza Glicemica</div>
                      <div className="text-2xl font-black font-mono text-sky-300 mt-1">-{deltaPicco} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                      <div className="text-[10px] text-sky-300 font-mono mt-0.5">riduzione del rialzo</div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Tempo nel Bersaglio (70-180)</div>
                      <div className="text-2xl font-black font-mono text-teal-300 mt-1">{tirOpt}%</div>
                      <div className="text-[10px] text-teal-400 font-mono mt-0.5">+{gainTir}% rispetto a standard</div>
                    </div>
                  </div>

                  {/* Grafico Curva Recharts */}
                  <GlucoseChart data={datiCurva} mostraOttimizzata={usaHack1 || usaHack2} />

                  {/* Commento Clinico Fisiologico */}
                  <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3 leading-relaxed">
                    <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-teal-300 font-semibold block mb-0.5">Spiegazione Fisiologica:</strong>
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
          className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-teal-500/30 text-teal-200 shadow-xl hover:bg-slate-850 transition group hover:scale-105"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Apri Coach AI</span>
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
        </button>
      )}

      {/* =========================================================================
          CHAT COACH AI PER MOBILE: IN BASSO IN RILIEVO SULLA PAGINA
          ========================================================================= */}
      {/* 1. Barra Flottante in Rilievo (Mobile Pill Bar) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={() => setChatMobileAperta(true)}
          className="w-full bg-slate-900/95 border border-teal-500/30 rounded-2xl p-3.5 shadow-xl flex items-center justify-between text-left active:scale-[0.98] transition group backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <Bot className="w-5 h-5 text-teal-400 group-hover:scale-105 transition" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">Coach AI Gluco</span>
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                Tocca per chiarimenti su cibo, glicemia o dosi...
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold flex items-center gap-1">
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
                <Bot className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-100">Coach AI Gluco</span>
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
