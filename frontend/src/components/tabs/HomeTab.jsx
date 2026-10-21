import React from 'react';
import {
  Clock,
  Timer,
  Sparkles,
  Activity,
  Play,
  Minus,
  Plus,
  Utensils,
  ChevronRight,
  Salad,
  Footprints,
  Syringe,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import GlucoseChart from '../../GlucoseChart';
import { DEMO_MEALS_DATA, TREND_OPTIONS } from '../../constants/mealData';

export default function HomeTab({
  oraInizioPasto,
  oraProiezione,
  tempoTargetMin,
  setTempoTargetMin,
  stimaPuntuale,
  usaHack1,
  setUsaHack1,
  usaHack2,
  setUsaHack2,
  glicemia,
  setGlicemia,
  trendCgm,
  setTrendCgm,
  simulatoreCgm,
  setSimulatoreCgm,
  glicemiaInfo,
  meal,
  demoId,
  setDemoId,
  setAnteprimaFoto,
  predizioneAi,
  loadingPredizione,
  piccoStd,
  piccoOpt,
  deltaPicco,
  tPiccoStd,
  tPiccoOpt,
  tirOpt,
  gainTir,
  titrOpt,
  gainTitr,
  cvOpt,
  allertePrecoci,
  datiCurva,
  boloRapidoArrotondato,
  boloPasto,
  boloCorrezione,
  impostazioni,
  richiedeDualWave,
  setSchedaAttiva
}) {
  return (
    <div className="space-y-6">
      {/* ===================================================================
          1. HERO: SIMULATORE PREVENTIVO PRE-PASTO (Previsione Futura a Tempo)
          =================================================================== */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Simulatore Preventivo Pre-Pasto
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Previsione Futura (t = 0)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Si usa <strong>prima di mangiare</strong> (inizio pasto: <strong>{oraInizioPasto}</strong>). Seleziona i minuti per vedere dove andrà la glicemia.
            </p>
          </div>

          {/* Indicatore Orizzonte Temporale con orario reale */}
          <div className="flex items-center gap-2 bg-teal-50/80 px-3.5 py-1.5 rounded-xl border border-teal-200 shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            <span className="text-xs text-slate-600">Proiezione:</span>
            <span className="text-base font-extrabold font-mono text-teal-800">+{tempoTargetMin}m</span>
            <span className="text-xs font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200 shadow-2xs">alle {oraProiezione}</span>
          </div>
        </div>

        {/* Griglia: Risultato a Grande Display + Selettore Tempo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Grande Box Risultato */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1.5">
                <span>Glicemia Prevista a +{tempoTargetMin} min</span>
                <span className="text-teal-700 font-mono font-bold">(ore {oraProiezione})</span>
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                stimaPuntuale.in_target_ottimizzata
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : (stimaPuntuale.ottimizzata > 180 ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-amber-50 text-amber-800 border-amber-300')
              }`}>
                {stimaPuntuale.in_target_ottimizzata ? '✓ Nel Target Bersaglio (70-180)' : (stimaPuntuale.ottimizzata > 180 ? '⚠ Oltre Soglia Iperglicemica' : '⚠ Rischio Ipoglicemia')}
              </span>
            </div>

            {/* Valore Gigante */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className={`text-6xl sm:text-7xl font-extrabold font-mono tracking-tight ${
                usaHack1 || usaHack2 ? 'text-teal-700' : 'text-slate-900'
              }`}>
                {usaHack1 || usaHack2 ? stimaPuntuale.ottimizzata : stimaPuntuale.standard}
              </span>
              <span className="text-lg text-slate-500 font-mono font-bold">mg/dL</span>

              {/* Variazione da inizio pasto */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono shadow-xs">
                <span className="text-slate-500">da inizio ({glicemia}):</span>
                {(() => {
                  const conConsigli = usaHack1 || usaHack2;
                  const deltaVis = conConsigli ? stimaPuntuale.delta_ottimizzata : stimaPuntuale.delta_standard;
                  return (
                    <strong className={conConsigli ? 'text-teal-700 font-bold' : (deltaVis >= 0 ? 'text-rose-600 font-bold' : 'text-teal-700 font-bold')}>
                      {deltaVis >= 0 ? `+${deltaVis}` : deltaVis} mg/dL
                    </strong>
                  );
                })()}
              </div>
            </div>

            {/* Confronto Dettagliato Senza vs Con Interventi */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] mb-0.5">Senza Interventi (Standard):</span>
                <span className="text-rose-600 font-mono font-black text-lg">{stimaPuntuale.standard} mg/dL</span>
              </div>
              <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-200 shadow-xs">
                <span className="text-teal-800 block text-[11px] mb-0.5 font-medium">Con Interventi Metabolici:</span>
                <span className="text-teal-700 font-mono font-black text-lg">{stimaPuntuale.ottimizzata} mg/dL</span>
                {stimaPuntuale.risparmio_mg_dl > 0 && (
                  <span className="text-[11px] text-teal-800 font-mono block mt-0.5 font-bold">
                    (-{stimaPuntuale.risparmio_mg_dl} mg/dL risparmiati!)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Box Selettore Tempo: Slider + Bottoni Rapidi */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-teal-600" />
                  Minuti dall'inizio del pasto ({oraInizioPasto}):
                </span>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                  +{tempoTargetMin} min ({oraProiezione})
                </span>
              </div>

              {/* Griglia Bottoni Rapidi a 1-Tap */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[15, 30, 45, 60, 90, 120, 150, 180].map((min) => (
                  <button
                    key={min}
                    onClick={() => setTempoTargetMin(min)}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                      tempoTargetMin === min
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs scale-105'
                        : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    +{min}m
                  </button>
                ))}
              </div>

              {/* Slider Fluido Continuo */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>+5 min</span>
                  <span className="text-slate-700 font-medium">Scorri per tempo preciso</span>
                  <span>+180 min (3h)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={tempoTargetMin}
                  onChange={(e) => setTempoTargetMin(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Commento Clinico per questo tempo */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-xs">
              <div className="flex items-center gap-1.5 text-teal-700 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cinetica al minuto +{tempoTargetMin}:</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {predizioneAi?.spiegazione_cinetica || 
                  `A +${tempoTargetMin} minuti, i ${meal.carboidrati_g}g di carboidrati portano la stima a ${stimaPuntuale.standard} mg/dL (oppure ${stimaPuntuale.ottimizzata} mg/dL con interventi metabolici).`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. INGRESSI CLINICI CHIAVE: Sensore CGM Attuale & Pasto Selezionato
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* 2A: Sensore CGM Attuale */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                Sensore CGM Attuale (t = 0)
              </span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${glicemiaInfo.classe}`}>
                {glicemiaInfo.testo}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900">{glicemia}</span>
              <span className="text-sm font-bold text-slate-400 font-mono">mg/dL</span>

              {/* Tendenza Sensore */}
              <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5 ml-auto">
                {TREND_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setTrendCgm(opt.id)}
                    title={`${opt.label} - ${opt.desc}`}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      trendCgm === opt.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {opt.freccia}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controlli Rapidi: Step [-5] [+5], Valori Frequenti e Simulatore */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => setGlicemia(prev => Math.max(70, prev - 5))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition cursor-pointer"
                  title="Diminuisci 5 mg/dL"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-bold text-slate-700">±5</span>
                <button
                  onClick={() => setGlicemia(prev => Math.min(220, prev + 5))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition cursor-pointer"
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
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                      glicemia === val
                        ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              {/* Toggle Simulatore Flusso */}
              <button
                onClick={() => setSimulatoreCgm(!simulatoreCgm)}
                title={simulatoreCgm ? "Ferma flusso simulato" : "Simula andamento sensore continuo"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  simulatoreCgm
                    ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {simulatoreCgm ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                    <span>Live ON</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-slate-500" />
                    <span>Simula CGM</span>
                  </>
                )}
              </button>
            </div>

            {/* Slider per regolazione fine */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-semibold font-mono">70</span>
              <input
                type="range"
                min="70"
                max="220"
                value={glicemia}
                onChange={e => setGlicemia(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 font-semibold font-mono">220</span>
            </div>
          </div>
        </div>

        {/* 2B: Pasto Attuale & Preset Rapidi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-teal-600" />
                Pasto Scelto
              </span>
              <button
                onClick={() => setSchedaAttiva('pasto')}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Tutti i pasti ({Object.keys(DEMO_MEALS_DATA).length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Il grande tasto pasto selezionato */}
            <button
              onClick={() => setSchedaAttiva('pasto')}
              className="w-full mt-3 bg-slate-50 hover:bg-teal-50/40 border border-slate-200 hover:border-teal-300 rounded-xl p-3 flex items-center justify-between transition-all group text-left shadow-xs cursor-pointer"
              title="Tocca per cambiare pasto o analizzare con foto"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition shadow-xs">
                  {(() => {
                    const CurrentMealIcon = meal.icon || DEMO_MEALS_DATA[demoId]?.icon || Utensils;
                    return <CurrentMealIcon className="w-5 h-5" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate group-hover:text-teal-800 transition">
                    {meal.nome_piatto}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                    <span className="text-teal-700 font-bold">{meal.carboidrati_g}g carboidrati</span>
                    <span>•</span>
                    <span className="text-slate-500">{meal.grassi_g}g grassi</span>
                    <span>•</span>
                    <span className="text-slate-500">IG {meal.indice_glicemico}</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 ml-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-xs">
                <span>Cambia</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Barra di Selezione Rapida dei Preset */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 px-0.5">
              <span className="font-semibold">Preset Rapidi 1-Tap:</span>
              <span className="text-[10px] text-slate-400">Tocca per simulare subito</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              {Object.entries(DEMO_MEALS_DATA).map(([id, info]) => {
                const ItemIcon = info.icon || Utensils;
                const isSelected = demoId === id && !meal.vision_meta;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setDemoId(id);
                      setUsaHack1(false);
                      setUsaHack2(false);
                      setAnteprimaFoto(null);
                    }}
                    title={`${info.nome_piatto} • ${info.carboidrati_g}g CHO • IG ${info.indice_glicemico}`}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-2xs ring-2 ring-teal-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{info.etichetta}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isSelected ? 'bg-teal-700/80 text-teal-100' : 'bg-slate-200/60 text-slate-600'
                    }`}>
                      {info.carboidrati_g}g
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          3. STRATEGIA CLINICA, INTERVENTI METABOLICI & STIMA RAPIDA BOLO
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 3A: Consiglio Coach AI & Interventi Rapidi (Fibre + Camminata) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          {/* Banner Coach AI */}
          {(() => {
            const consiglio = predizioneAi?.consiglio_prioritario || (piccoStd > 180 ? "Una camminata di 15 min dopo mangiato aiuterà a mantenere la glicemia stabile." : "La risposta glicemica per questo piatto è ottimale.");
            return (
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white text-teal-700 border border-teal-200 shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-900">Consiglio Personalizzato Gluco</span>
                    {loadingPredizione && (
                      <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Ricalcolo...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-teal-950 mt-1 leading-relaxed">
                    Con <strong className="text-teal-950 font-bold">{meal.nome_piatto}</strong> la glicemia standard toccherebbe <strong className="text-teal-900 font-bold">{piccoStd} mg/dL</strong>. {consiglio}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Due Abitudini / Interventi Metabolici a Tasto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Interventi Metabolici Attivabili
              </span>
              {(usaHack1 || usaHack2) && (
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                  -{deltaPicco} mg/dL sul picco!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Toggle Fibre */}
              <button
                onClick={() => setUsaHack1(!usaHack1)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                  usaHack1
                    ? 'bg-teal-50/80 border-teal-300 text-teal-900 shadow-xs ring-2 ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${usaHack1 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                    <Salad className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Verdura prima del pasto</div>
                    <div className="text-[10px] text-slate-500">Rallenta l'assorbimento (-22% picco)</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${usaHack1 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                  {usaHack1 ? 'ATTIVO' : 'OFF'}
                </span>
              </button>

              {/* Toggle Camminata */}
              <button
                onClick={() => setUsaHack2(!usaHack2)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                  usaHack2
                    ? 'bg-teal-50/80 border-teal-300 text-teal-900 shadow-xs ring-2 ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${usaHack2 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">15m camminata post-pasto</div>
                    <div className="text-[10px] text-slate-500">Stimolo recettori GLUT4 (-30% picco)</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${usaHack2 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                  {usaHack2 ? 'ATTIVO' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3B: Stima Rapida del Bolo Insulinico */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Syringe className="w-3.5 h-3.5 text-teal-600" />
              Stima Rapida Bolo
            </span>
            <button
              onClick={() => setSchedaAttiva('bolo')}
              className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Calcolatore completo</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Box valore dose */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dose Consigliata</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-teal-700">{boloRapidoArrotondato}</span>
                <span className="text-xs text-slate-500 font-semibold">Unità (U)</span>
                {usaHack2 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    -20% Moto
                  </span>
                )}
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-600 border-l border-slate-200 pl-3 space-y-0.5 font-medium">
              <div>Pasto: <strong className="text-slate-900">{boloPasto.toFixed(1)}U</strong></div>
              <div>Corr: <strong className="text-slate-900">+{boloCorrezione.toFixed(1)}U</strong></div>
              <div>IOB: <strong className="text-slate-900">-{impostazioni.iob}U</strong></div>
            </div>
          </div>

          {/* Avviso o parametri paziente */}
          {richiedeDualWave ? (
            <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>Pasto ricco di grassi ({meal.grassi_g}g): consigliata dose prolungata/dual-wave.</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
              <span>Target: <strong className="text-slate-800 font-semibold">{impostazioni.targetGlicemico}</strong> mg/dL</span>
              <span>1U ogni <strong className="text-slate-800 font-semibold">{impostazioni.rapportoIC}g CHO</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================
          4. CURVA GLICEMICA & INDICATORI CHIAVE (KPI)
          =================================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Valori Chiave (KPI) Metabolici Avanzati */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Picco Normale</div>
            <div className="text-xl font-bold text-rose-700 mt-0.5">{piccoStd} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
            <div className="text-[9px] text-slate-500">tra circa {tPiccoStd} min</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Picco con Consigli</div>
            <div className="text-xl font-bold text-teal-700 mt-0.5">{piccoOpt} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
            <div className="text-[9px] text-slate-500">tra circa {tPiccoOpt} min</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Risparmio Picco</div>
            <div className="text-xl font-bold text-sky-700 mt-0.5">-{deltaPicco} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
            <div className="text-[9px] text-sky-700 font-semibold">{deltaPicco > 0 ? 'Curva appiattita' : 'Nessun consiglio attivo'}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Time-in-Range (70-180)</div>
            <div className="text-xl font-bold text-teal-700 mt-0.5">{tirOpt}%</div>
            <div className="text-[9px] text-teal-700 font-semibold">{gainTir > 0 ? `+${gainTir}% con consigli` : 'Standard'}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Target Stretto (70-140)</div>
            <div className="text-xl font-bold text-indigo-700 mt-0.5">{titrOpt}%</div>
            <div className="text-[9px] text-indigo-700 font-semibold">{gainTitr > 0 ? `+${gainTitr}% con consigli` : 'Standard TITR'}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Variabilità CV%</div>
            <div className={`text-xl font-bold mt-0.5 ${cvOpt <= 36 ? 'text-teal-700' : 'text-amber-700'}`}>{cvOpt}%</div>
            <div className={`text-[9px] font-semibold ${cvOpt <= 36 ? 'text-teal-700' : 'text-amber-700'}`}>
              {cvOpt <= 36 ? 'Stabile (<=36%)' : 'Variabilità elevata'}
            </div>
          </div>
        </div>

        {/* Banner Allerte Precoci Predittive */}
        {(allertePrecoci?.ipo_prevista || (allertePrecoci?.iper_prevista && piccoStd > 200) || cvOpt > 36) && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            allertePrecoci?.ipo_prevista 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : (allertePrecoci?.iper_prevista && piccoStd > 220 
                  ? 'bg-rose-50 border-rose-200 text-rose-900' 
                  : 'bg-teal-50 border-teal-200 text-teal-900')
          }`}>
            <div className="flex items-center gap-2.5">
              <AlertTriangle className={`w-4 h-4 shrink-0 ${allertePrecoci?.ipo_prevista ? 'text-amber-600' : (allertePrecoci?.iper_prevista && piccoStd > 220 ? 'text-rose-600' : 'text-teal-600')}`} />
              <div>
                <span className="font-bold mr-1">
                  {allertePrecoci?.ipo_prevista ? 'Allerta Ipoglicemia:' : (allertePrecoci?.iper_prevista && piccoStd > 220 ? 'Allerta Iperglicemia:' : 'Stabilità Glicemica:')}
                </span>
                <span>
                  {allertePrecoci?.ipo_prevista 
                    ? `Rischio calo glicemico sotto 70 mg/dL (${allertePrecoci.severita_ipo}). Tieni pronti 15g di zuccheri rapidi.`
                    : (allertePrecoci?.iper_prevista && piccoStd > 220 
                        ? `Picco previsto a ${piccoStd} mg/dL (ascesa +${allertePrecoci.velocita_ascesa_mg_dl_min} mg/dL/min). Pre-carico di fibre e moto GLUT4 raccomandati.`
                        : `Variabilità glicemica ${cvOpt}%. Gli interventi metabolici contengono le oscillazioni.`)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSchedaAttiva('curva')}
              className="text-[11px] font-bold underline shrink-0 hover:opacity-80 cursor-pointer"
            >
              Vedi Curva
            </button>
          </div>
        )}

        {/* Header Grafico */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Andamento previsto della glicemia
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Standard
            </span>
            <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span> Con consigli Gluco
            </span>
          </div>
        </div>

        {/* Recharts Component */}
        <GlucoseChart
          data={datiCurva}
          mostraOttimizzata={usaHack1 || usaHack2}
          tempoTargetMin={tempoTargetMin}
        />
      </div>
    </div>
  );
}
