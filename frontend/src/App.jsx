import React, { useState, useEffect } from 'react';
import {
  Clock,
  LineChart,
  Utensils,
  Syringe,
  HelpCircle,
  Bot,
  PanelRightOpen,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Camera
} from 'lucide-react';

import Header from './components/Header';
import HomeTab from './components/tabs/HomeTab';
import MealTab from './components/tabs/MealTab';
import CurveTab from './components/tabs/CurveTab';
import BolusTab from './components/tabs/BolusTab';
import InfoTab from './components/tabs/InfoTab';
import AiConfigModal from './components/modals/AiConfigModal';
import VisionModal from './components/modals/VisionModal';
import ChatCoach from './ChatCoach';
import { generaDatiCurva } from './GlucoseChart';
import { DEMO_MEALS_DATA, DEFAULT_COACH_DATA } from './constants/mealData';

export default function App() {
  // Stato Schede / Pagine
  const [schedaAttiva, setSchedaAttiva] = useState('home'); // 'home' | 'pasto' | 'curva' | 'bolo' | 'info'

  // Stato apertura Chat Coach (Fissata sullo schermo con toggle apri/chiudi)
  const [chatAperta, setChatAperta] = useState(true);

  // Stato Clinico, Pasto e Orizzonte Temporale
  const [glicemia, setGlicemia] = useState(115);
  const [trendCgm, setTrendCgm] = useState('STABILE');
  const [tempoTargetMin, setTempoTargetMin] = useState(60); // Orizzonte temporale di previsione (minuti post-pasto)
  const [simulatoreCgm, setSimulatoreCgm] = useState(false);
  const [predizioneAi, setPredizioneAi] = useState(null);
  const [loadingPredizione, setLoadingPredizione] = useState(false);
  const [demoId, setDemoId] = useState('pasta');
  const [loading, setLoading] = useState(false);
  const [usaHack1, setUsaHack1] = useState(false);
  const [usaHack2, setUsaHack2] = useState(false);
  const [, setBackendConnesso] = useState(false);
  const [anteprimaFoto, setAnteprimaFoto] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Tutti');
  const [cercaPiatto, setCercaPiatto] = useState('');

  // Parametri Clinici del Paziente
  const [impostazioni, setImpostazioni] = useState({
    targetGlicemico: 100, // mg/dL
    rapportoIC: 10,        // 1U ogni 10g CHO
    fsi: 40,               // 1U abbassa 40 mg/dL
    iob: 0.8               // Insulina Attiva (U)
  });

  // Configurazione AI (Locale Ollama / LM Studio, Cloud, Offline)
  const [aiConfig, setAiConfig] = useState(() => {
    const salvato = localStorage.getItem('gluco_ai_config');
    if (salvato) {
      try { return JSON.parse(salvato); } catch (e) {}
    }
    return {
      provider: 'auto',
      localUrl: 'http://localhost:11434',
      localModel: 'gemma2:2b',
      apiKey: ''
    };
  });
  const [aiStatus, setAiStatus] = useState(null);
  const [mostraModalAi, setMostraModalAi] = useState(false);
  const [loadingVerificaAi, setLoadingVerificaAi] = useState(false);
  const [mostraModalVision, setMostraModalVision] = useState(false);
  const [visionNomeInput, setVisionNomeInput] = useState('');
  const [visionCarbsInput, setVisionCarbsInput] = useState(65);

  const salvaAiConfig = (nuovaConfig) => {
    setAiConfig(nuovaConfig);
    localStorage.setItem('gluco_ai_config', JSON.stringify(nuovaConfig));
  };

  const verificaStatoAi = async (customUrl = null) => {
    setLoadingVerificaAi(true);
    try {
      const url = customUrl !== null ? customUrl : aiConfig.localUrl;
      const res = await fetch(`http://localhost:8000/api/ai/status?local_url=${encodeURIComponent(url || '')}`);
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
        setBackendConnesso(true);
        if (data?.ai?.local_server?.available && data?.ai?.local_server?.models?.length > 0) {
          const models = data.ai.local_server.models;
          if (!models.includes(aiConfig.localModel)) {
            setAiConfig(prev => {
              const updated = { ...prev, localModel: models[0] };
              localStorage.setItem('gluco_ai_config', JSON.stringify(updated));
              return updated;
            });
          }
        }
      }
    } catch (e) {
      // Backend o server locale non raggiungibile
    } finally {
      setLoadingVerificaAi(false);
    }
  };

  useEffect(() => {
    verificaStatoAi();
  }, []);

  const [risultato, setRisultato] = useState({
    meal: DEMO_MEALS_DATA.pasta,
    coach: DEFAULT_COACH_DATA
  });

  // Funzione di analisi pasto (supporta modelli di visione locali Ollama llava e Cloud)
  const analizzaPasto = async (idPiatto = demoId, fileFoto = null, customName = null, customCarbs = null) => {
    setLoading(true);

    if (fileFoto) {
      const reader = new FileReader();
      reader.onload = (e) => setAnteprimaFoto(e.target.result);
      reader.readAsDataURL(fileFoto);
    } else if (fileFoto === false) {
      setAnteprimaFoto(null);
    }

    const targetDemoId = idPiatto || 'pasta';
    const formData = new FormData();
    formData.append('glicemia_base', glicemia);
    formData.append('demo_id', targetDemoId);
    formData.append('provider', aiConfig.provider);
    formData.append('local_url', aiConfig.localUrl || '');
    formData.append('local_model', aiConfig.localModel || '');
    if (aiConfig.apiKey) formData.append('api_key', aiConfig.apiKey);
    if (fileFoto) formData.append('file', fileFoto);
    if (customName) formData.append('custom_name', customName);
    if (customCarbs !== null && customCarbs !== undefined) formData.append('custom_carbs', customCarbs);

    try {
      const controller = new AbortController();
      const timeoutMs = 25000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const mealData = data.meal || (fileFoto ? {
          nome_piatto: "Pasto da Immagine",
          etichetta: "Foto Pasto",
          carboidrati_g: 65,
          fibre_g: 5,
          grassi_g: 18,
          proteine_g: 22,
          indice_glicemico: 65
        } : (DEMO_MEALS_DATA[targetDemoId] || DEMO_MEALS_DATA.pasta));

        setRisultato({
          meal: { ...mealData, icon: (fileFoto || anteprimaFoto) ? Camera : (DEMO_MEALS_DATA[targetDemoId]?.icon || Utensils) },
          coach: data.coach || DEFAULT_COACH_DATA
        });
        setVisionNomeInput(mealData.nome_piatto || '');
        setVisionCarbsInput(mealData.carboidrati_g || 65);
        setBackendConnesso(true);
      } else {
        throw new Error('Risposta HTTP non valida');
      }
    } catch (err) {
      setBackendConnesso(false);
      const pastoScelto = fileFoto ? {
        nome_piatto: "Pasto da Immagine",
        etichetta: "Foto Pasto",
        carboidrati_g: 65,
        fibre_g: 5,
        grassi_g: 18,
        proteine_g: 20,
        indice_glicemico: 65,
        icon: Camera
      } : (DEMO_MEALS_DATA[targetDemoId] || DEMO_MEALS_DATA.pasta);

      setRisultato({
        meal: pastoScelto,
        coach: {
          ...DEFAULT_COACH_DATA,
          commento_clinico: `Partendo da ${glicemia} mg/dL, i ${pastoScelto.carboidrati_g}g di carboidrati e ${pastoScelto.grassi_g}g di grassi di ${pastoScelto.nome_piatto} produrranno un aumento glicemico progressivo. Consigliati pre-carico di fibre e camminata attiva.`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analizzaPasto(demoId);
  }, [demoId, aiConfig.provider, aiConfig.localModel]);

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

  // 2. Predizione AI Automatica guidata dal sensore CGM e orizzonte temporale (tempo_min)
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
            tempo_min: tempoTargetMin,
            provider: aiConfig.provider,
            local_url: aiConfig.localUrl,
            local_model: aiConfig.localModel,
            api_key: aiConfig.apiKey
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
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [glicemia, trendCgm, risultato.meal, usaHack1, usaHack2, tempoTargetMin, aiConfig]);

  const { meal, coach } = risultato;
  const localCurva = generaDatiCurva(glicemia, meal, coach, usaHack1, usaHack2);

  // Unione intelligente dei dati: usa la traiettoria AI predittiva del backend se disponibile
  const datiCurva = predizioneAi?.punti || localCurva.punti;
  const tPiccoStd = predizioneAi?.t_picco_std ?? localCurva.tPiccoStd;
  const tPiccoOpt = predizioneAi?.t_picco_opt ?? localCurva.tPiccoOpt;
  const piccoStd = predizioneAi?.picco_std ?? Math.max(...datiCurva.map(d => d.standard));
  const piccoOpt = predizioneAi?.picco_opt ?? Math.max(...datiCurva.map(d => d.ottimizzata));
  const deltaPicco = Math.max(0, piccoStd - piccoOpt);

  // Calcolo valore stimato puntuale al minuto desiderato (tempoTargetMin)
  const puntoTarget = datiCurva.find(d => d.minuti === tempoTargetMin) ||
    datiCurva.reduce((prev, curr) => Math.abs(curr.minuti - tempoTargetMin) < Math.abs(prev.minuti - tempoTargetMin) ? curr : prev, datiCurva[0]);

  const valStdPuntuale = predizioneAi?.stima_al_tempo?.standard ?? puntoTarget?.standard ?? glicemia;
  const valOptPuntuale = predizioneAi?.stima_al_tempo?.ottimizzata ?? puntoTarget?.ottimizzata ?? glicemia;
  const deltaStdPuntuale = valStdPuntuale - glicemia;
  const deltaOptPuntuale = valOptPuntuale - glicemia;
  const risparmioPuntuale = Math.max(0, valStdPuntuale - valOptPuntuale);

  const stimaPuntuale = {
    minuti: tempoTargetMin,
    standard: valStdPuntuale,
    ottimizzata: valOptPuntuale,
    delta_standard: deltaStdPuntuale,
    delta_ottimizzata: deltaOptPuntuale,
    risparmio_mg_dl: risparmioPuntuale,
    in_target_standard: valStdPuntuale >= 70 && valStdPuntuale <= 180,
    in_target_ottimizzata: valOptPuntuale >= 70 && valOptPuntuale <= 180,
  };

  // Time-in-Range (70 - 180 mg/dL)
  const tirStd = predizioneAi?.tir_std ?? Math.round((datiCurva.filter(d => d.standard >= 70 && d.standard <= 180).length / datiCurva.length) * 100);
  const tirOpt = predizioneAi?.tir_opt ?? Math.round((datiCurva.filter(d => d.ottimizzata >= 70 && d.ottimizzata <= 180).length / datiCurva.length) * 100);
  const gainTir = Math.max(0, tirOpt - tirStd);

  // Time-in-Tight-Range (TITR: 70 - 140 mg/dL - Consenso Internazionale ATTD / ADA)
  const titrStd = predizioneAi?.titr_std ?? Math.round((datiCurva.filter(d => d.standard >= 70 && d.standard <= 140).length / datiCurva.length) * 100);
  const titrOpt = predizioneAi?.titr_opt ?? Math.round((datiCurva.filter(d => d.ottimizzata >= 70 && d.ottimizzata <= 140).length / datiCurva.length) * 100);
  const gainTitr = Math.max(0, titrOpt - titrStd);

  // Coefficiente di Variabilità Glicemica (CV% Target <= 36%)
  const calcolaCV = (puntiArray) => {
    if (!puntiArray || puntiArray.length === 0) return 0;
    const media = puntiArray.reduce((a, b) => a + b, 0) / puntiArray.length;
    const sd = Math.sqrt(puntiArray.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / puntiArray.length);
    return Math.round((sd / media) * 1000) / 10;
  };
  const cvStd = predizioneAi?.cv_std ?? calcolaCV(datiCurva.map(d => d.standard));
  const cvOpt = predizioneAi?.cv_opt ?? calcolaCV(datiCurva.map(d => d.ottimizzata));

  // Allerte Cliniche Precoci Predittive
  const minOttimizzata = Math.min(...datiCurva.map(d => d.ottimizzata));
  const allertePrecoci = predizioneAi?.allerte_precoci ?? {
    ipo_prevista: minOttimizzata < 70,
    severita_ipo: minOttimizzata < 54 ? 'SEVERA (<54 mg/dL)' : (minOttimizzata < 70 ? 'MODERATA (54-69 mg/dL)' : 'NESSUNA'),
    iper_prevista: piccoStd > 180,
    severita_iper: piccoStd > 250 ? 'SEVERA (>250 mg/dL)' : (piccoStd > 180 ? 'MODERATA (181-250 mg/dL)' : 'NESSUNA'),
    stabilita_cv: cvOpt <= 36.0 ? 'STABILE (<=36%)' : 'ELEVATA_VARIABILITA (>36%)',
    velocita_ascesa_mg_dl_min: Math.round(((piccoStd - glicemia) / Math.max(25, tPiccoStd)) * 10) / 10
  };

  // Proiezione orario reale dell'orologio (orario attuale + minuti selezionati)
  const [oraCorrente, setOraCorrente] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setOraCorrente(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const oraProiezione = new Date(oraCorrente.getTime() + tempoTargetMin * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const oraInizioPasto = oraCorrente.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Calcolo Bolo Rapido per la Home
  const boloPasto = (meal.carboidrati_g / impostazioni.rapportoIC);
  const deltaGli = Math.max(0, glicemia - impostazioni.targetGlicemico);
  const boloCorrezione = deltaGli / impostazioni.fsi;
  const subtotaleBolo = boloPasto + boloCorrezione;
  const scontoMoto = usaHack2 ? (subtotaleBolo * 0.20) : 0;
  const boloRapidoTotale = Math.max(0, subtotaleBolo - impostazioni.iob - scontoMoto);
  const boloRapidoArrotondato = Math.round(boloRapidoTotale * 10) / 10;
  const richiedeDualWave = meal.grassi_g >= 20;

  // Badge cromatico glicemia intuitivo e umano (Daylight Consumer Health)
  const getGlicemiaInfo = (val) => {
    if (val < 70) return { testo: 'Bassa (Attenzione)', classe: 'text-amber-800 border-amber-200 bg-amber-50' };
    if (val <= 140) return { testo: 'Ottimale', classe: 'text-teal-800 border-teal-200 bg-teal-50' };
    if (val <= 180) return { testo: 'Normale post-pasto', classe: 'text-slate-700 border-slate-200 bg-slate-100' };
    return { testo: 'Alta', classe: 'text-rose-800 border-rose-200 bg-rose-50' };
  };

  const glicemiaInfo = getGlicemiaInfo(glicemia);

  // Stili e dettagli per i livelli di rischio metabolico (Daylight Consumer Health)
  const getRischioDetails = (livello) => {
    switch (livello) {
      case 'CRITICO':
        return {
          pill: 'bg-rose-50 text-rose-800 border-rose-200 shadow-xs',
          alertBox: 'bg-rose-50/80 border-rose-200 text-rose-900',
          glow: 'from-rose-500/10 via-rose-500/5 to-transparent',
          Icon: AlertTriangle
        };
      case 'ELEVATO':
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs',
          alertBox: 'bg-amber-50/80 border-amber-200 text-amber-900',
          glow: 'from-amber-500/10 via-amber-500/5 to-transparent',
          Icon: AlertCircle
        };
      case 'MEDIO':
        return {
          pill: 'bg-sky-50 text-sky-800 border-sky-200 shadow-xs',
          alertBox: 'bg-sky-50/80 border-sky-200 text-sky-900',
          glow: 'from-sky-500/10 via-sky-500/5 to-transparent',
          Icon: Info
        };
      case 'BASSO':
      default:
        return {
          pill: 'bg-teal-50 text-teal-800 border-teal-200 shadow-xs',
          alertBox: 'bg-teal-50/80 border-teal-200 text-teal-900',
          glow: 'from-teal-500/10 via-teal-500/5 to-transparent',
          Icon: CheckCircle2
        };
    }
  };

  // Definizioni Schede / Pagine (5 schede operative con Pagina Info Clinica)
  const SCHEDE = [
    { id: 'home', label: 'Stima Glicemia a Tempo', icon: Clock, badge: `+${tempoTargetMin}m` },
    { id: 'pasto', label: 'Analisi Pasto', icon: Utensils, badge: `${meal.carboidrati_g}g CHO` },
    { id: 'curva', label: 'Curva & Trend', icon: LineChart, badge: `${tirOpt}% TIR` },
    { id: 'bolo', label: 'Calcolatore Bolo', icon: Syringe, badge: `${boloRapidoArrotondato} U` },
    { id: 'info', label: 'Info & Clinica', icon: HelpCircle, badge: 'AZT1D' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500/20 selection:text-teal-900 pb-28 lg:pb-12">
      {/* Top Navbar Header */}
      <Header
        schedaAttiva={schedaAttiva}
        setSchedaAttiva={setSchedaAttiva}
        schede={SCHEDE}
        aiConfig={aiConfig}
        aiStatus={aiStatus}
        chatAperta={chatAperta}
        setChatAperta={setChatAperta}
        setMostraModalAi={setMostraModalAi}
        glicemia={glicemia}
        glicemiaInfo={glicemiaInfo}
      />

      {/* Contenuto Principale a Schede (Zero Sovrapposizione: Spazio Riservato Esclusivo) */}
      <div className={`transition-all duration-300 ${
        chatAperta ? 'lg:pr-[415px] xl:pr-[445px]' : ''
      }`}>
        <main className="max-w-5xl xl:max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {schedaAttiva === 'home' && (
            <HomeTab
              oraInizioPasto={oraInizioPasto}
              oraProiezione={oraProiezione}
              tempoTargetMin={tempoTargetMin}
              setTempoTargetMin={setTempoTargetMin}
              stimaPuntuale={stimaPuntuale}
              usaHack1={usaHack1}
              setUsaHack1={setUsaHack1}
              usaHack2={usaHack2}
              setUsaHack2={setUsaHack2}
              glicemia={glicemia}
              setGlicemia={setGlicemia}
              trendCgm={trendCgm}
              setTrendCgm={setTrendCgm}
              simulatoreCgm={simulatoreCgm}
              setSimulatoreCgm={setSimulatoreCgm}
              glicemiaInfo={glicemiaInfo}
              meal={meal}
              demoId={demoId}
              setDemoId={setDemoId}
              setAnteprimaFoto={setAnteprimaFoto}
              predizioneAi={predizioneAi}
              loadingPredizione={loadingPredizione}
              piccoStd={piccoStd}
              piccoOpt={piccoOpt}
              deltaPicco={deltaPicco}
              tPiccoStd={tPiccoStd}
              tPiccoOpt={tPiccoOpt}
              tirOpt={tirOpt}
              gainTir={gainTir}
              titrOpt={titrOpt}
              gainTitr={gainTitr}
              cvOpt={cvOpt}
              allertePrecoci={allertePrecoci}
              datiCurva={datiCurva}
              boloRapidoArrotondato={boloRapidoArrotondato}
              boloPasto={boloPasto}
              boloCorrezione={boloCorrezione}
              impostazioni={impostazioni}
              richiedeDualWave={richiedeDualWave}
              setSchedaAttiva={setSchedaAttiva}
            />
          )}

          {schedaAttiva === 'pasto' && (
            <MealTab
              categoriaFiltro={categoriaFiltro}
              setCategoriaFiltro={setCategoriaFiltro}
              cercaPiatto={cercaPiatto}
              setCercaPiatto={setCercaPiatto}
              demoId={demoId}
              setDemoId={setDemoId}
              setUsaHack1={setUsaHack1}
              setUsaHack2={setUsaHack2}
              anteprimaFoto={anteprimaFoto}
              setAnteprimaFoto={setAnteprimaFoto}
              analizzaPasto={analizzaPasto}
              loading={loading}
              meal={meal}
              setVisionNomeInput={setVisionNomeInput}
              setVisionCarbsInput={setVisionCarbsInput}
              setMostraModalVision={setMostraModalVision}
            />
          )}

          {schedaAttiva === 'curva' && (
            <CurveTab
              glicemia={glicemia}
              trendCgm={trendCgm}
              predizioneAi={predizioneAi}
              piccoStd={piccoStd}
              piccoOpt={piccoOpt}
              tPiccoStd={tPiccoStd}
              tPiccoOpt={tPiccoOpt}
              deltaPicco={deltaPicco}
              tirOpt={tirOpt}
              gainTir={gainTir}
              titrOpt={titrOpt}
              gainTitr={gainTitr}
              cvOpt={cvOpt}
              datiCurva={datiCurva}
              usaHack1={usaHack1}
              usaHack2={usaHack2}
              coach={coach}
              getRischioDetails={getRischioDetails}
            />
          )}

          {schedaAttiva === 'bolo' && (
            <BolusTab
              glicemia={glicemia}
              carbs={meal.carboidrati_g}
              grassi={meal.grassi_g}
              usaHackMoto={usaHack2}
              impostazioni={impostazioni}
              setImpostazioni={setImpostazioni}
            />
          )}

          {schedaAttiva === 'info' && (
            <InfoTab />
          )}
        </main>

        {/* Chat Coach per Tablet e Mobile (< lg) */}
        {chatAperta && (
          <div id="gluco-coach-chat-mobile" className="block lg:hidden px-4 sm:px-6 pb-8">
            <div className="max-w-5xl mx-auto pt-6 border-t border-slate-200">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Coach AI Gluco (Chat Clinica)
                  </span>
                </div>
                <button
                  onClick={() => setChatAperta(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                >
                  Chiudi Chat
                </button>
              </div>
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
                aiConfig={aiConfig}
                className="h-[520px] border border-slate-200 shadow-sm"
                onChiudi={() => setChatAperta(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat Coach AI Desktop (>= lg) */}
      {chatAperta && (
        <aside
          id="gluco-coach-chat"
          className="hidden lg:flex fixed z-30 right-4 sm:right-5 top-[6.8rem] bottom-4 w-[385px] xl:w-[415px] flex-col transition-all duration-200"
        >
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
            aiConfig={aiConfig}
            className="h-full border border-slate-200 shadow-lg"
            onChiudi={() => setChatAperta(false)}
          />
        </aside>
      )}

      {/* Pulsante Flottante a Scomparsa quando la chat è chiusa */}
      {!chatAperta && (
        <button
          onClick={() => setChatAperta(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xl hover:shadow-2xl hover:border-teal-300 transition group hover:scale-105 cursor-pointer"
          title="Apri Coach AI"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shadow-2xs">
            <Bot className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-xs font-bold text-slate-900">Apri Coach AI</span>
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
        </button>
      )}

      {/* Modal Configurazione AI */}
      <AiConfigModal
        isOpen={mostraModalAi}
        onClose={() => setMostraModalAi(false)}
        aiConfig={aiConfig}
        salvaAiConfig={salvaAiConfig}
        aiStatus={aiStatus}
        verificaStatoAi={verificaStatoAi}
        loadingVerificaAi={loadingVerificaAi}
        onSaveAndAnalyze={() => {
          setMostraModalAi(false);
          analizzaPasto(demoId);
        }}
      />

      {/* Modal Vision AI */}
      <VisionModal
        isOpen={mostraModalVision}
        onClose={() => setMostraModalVision(false)}
        anteprimaFoto={anteprimaFoto}
        meal={meal}
        visionNomeInput={visionNomeInput}
        setVisionNomeInput={setVisionNomeInput}
        visionCarbsInput={visionCarbsInput}
        setVisionCarbsInput={setVisionCarbsInput}
        onConfirm={() => {
          setRisultato(prev => ({
            ...prev,
            meal: {
              ...prev.meal,
              nome_piatto: visionNomeInput || prev.meal.nome_piatto,
              carboidrati_g: visionCarbsInput
            }
          }));
          setMostraModalVision(false);
        }}
      />
    </div>
  );
}
