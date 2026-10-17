import React, { useState } from 'react';
import { Syringe, AlertTriangle, ShieldCheck, Settings2, Activity, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function BolusCalculator({
  glicemia,
  carbs,
  grassi,
  usaHackMoto,
  impostazioni,
  setImpostazioni
}) {
  const [mostraConfig, setMostraConfig] = useState(false);

  const { targetGlicemico, rapportoIC, fsi, iob } = impostazioni;

  // Calcoli Formule Matematiche
  // 1. Bolo Carboidrati = Carbs / (I:C)
  const boloPasto = carbs > 0 && rapportoIC > 0 ? (carbs / rapportoIC) : 0;

  // 2. Bolo Correzione = (Glicemia - Target) / FSI (0 se <= target)
  const deltaGlicemia = Math.max(0, glicemia - targetGlicemico);
  const boloCorrezione = fsi > 0 ? (deltaGlicemia / fsi) : 0;

  // 3. Subtotale prima dell'attività e IOB
  const subtotaleLordo = boloPasto + boloCorrezione;

  // 4. Detrazione IOB
  const iobEffettivo = Math.min(subtotaleLordo, Math.max(0, iob));

  // 5. Adattamento Attività Fisica GLUT4 (-20% se camminata attiva)
  const percentualeRiduzioneMoto = usaHackMoto ? 0.20 : 0.0;
  const scontoMoto = usaHackMoto ? (subtotaleLordo * percentualeRiduzioneMoto) : 0;

  // Totale Netto
  const boloTotaleGrezzo = Math.max(0, subtotaleLordo - iobEffettivo - scontoMoto);
  const boloTotaleArrotondato = Math.round(boloTotaleGrezzo * 10) / 10;

  // Strategia Dual-Wave per Grassi >= 20g
  const richiedeDualWave = grassi >= 20;
  const doseImmediata = Math.round((boloTotaleGrezzo * 0.65) * 10) / 10;
  const doseProlungata = Math.round((boloTotaleGrezzo * 0.35) * 10) / 10;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header del Calcolatore */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              Calcolatore Bolo Trasparente
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Formula I:C + FSI
              </span>
            </h3>
            <p className="text-xs text-slate-400">Algoritmo predittivo basato sui parametri personali del paziente</p>
          </div>
        </div>

        <button
          onClick={() => setMostraConfig(!mostraConfig)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Parametri Paziente</span>
          {mostraConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Pannello Configurazione Parametri Paziente */}
      {mostraConfig && (
        <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="text-slate-400 block mb-1">Target Glicemico</label>
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <input
                type="number"
                value={targetGlicemico}
                onChange={e => setImpostazioni({ ...impostazioni, targetGlicemico: Number(e.target.value) })}
                className="w-full bg-transparent text-slate-100 font-mono font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">mg/dL</span>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Rapporto I:C (CHO)</label>
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <input
                type="number"
                step="0.5"
                value={rapportoIC}
                onChange={e => setImpostazioni({ ...impostazioni, rapportoIC: Number(e.target.value) })}
                className="w-full bg-transparent text-slate-100 font-mono font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">g/U</span>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">FSI / Sensibilità</label>
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <input
                type="number"
                value={fsi}
                onChange={e => setImpostazioni({ ...impostazioni, fsi: Number(e.target.value) })}
                className="w-full bg-transparent text-slate-100 font-mono font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">mg/dL</span>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Insulina Attiva (IOB)</label>
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <input
                type="number"
                step="0.1"
                value={iob}
                onChange={e => setImpostazioni({ ...impostazioni, iob: Number(e.target.value) })}
                className="w-full bg-transparent text-slate-100 font-mono font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">U</span>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Matematico Dettagliato */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Bolo Pasto</span>
            <span className="font-mono text-[10px] text-slate-500">{carbs}g/{rapportoIC}</span>
          </div>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
            +{boloPasto.toFixed(2)} <span className="text-xs font-normal text-slate-400">U</span>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Bolo Correzione</span>
            <span className="font-mono text-[10px] text-slate-500">
              {deltaGlicemia > 0 ? `+${deltaGlicemia}` : '0'}/{fsi}
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1">
            +{boloCorrezione.toFixed(2)} <span className="text-xs font-normal text-slate-400">U</span>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Insulina Attiva</span>
            <span className="font-mono text-[10px] text-slate-500">IOB</span>
          </div>
          <div className="text-lg font-bold font-mono text-rose-400 mt-1">
            -{iobEffettivo.toFixed(2)} <span className="text-xs font-normal text-slate-400">U</span>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Captazione GLUT4</span>
            <span className={`font-mono text-[10px] ${usaHackMoto ? 'text-emerald-400' : 'text-slate-500'}`}>
              {usaHackMoto ? '-20%' : 'Disattivato'}
            </span>
          </div>
          <div className={`text-lg font-bold font-mono mt-1 ${usaHackMoto ? 'text-emerald-400' : 'text-slate-500'}`}>
            {usaHackMoto ? `-${scontoMoto.toFixed(2)}` : '0.00'} <span className="text-xs font-normal text-slate-400">U</span>
          </div>
        </div>
      </div>

      {/* Risultato Finale In Evidenza */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 p-4 rounded-xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-300 font-semibold block">
            Bolo Consigliato Stimato
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">
              {boloTotaleArrotondato} <span className="text-lg font-normal text-slate-300">Unità (U)</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              (valore esatto: {boloTotaleGrezzo.toFixed(2)} U)
            </span>
          </div>
        </div>

        {usaHackMoto && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl text-xs">
            <Activity className="w-4 h-4 shrink-0 text-emerald-400 animate-pulse" />
            <span>Riduzione prudenziale applicata: salvaguardia da ipoglicemia da esercizio.</span>
          </div>
        )}
      </div>

      {/* Alert Effetto Pizza / Coda Grassi >= 20g */}
      {richiedeDualWave && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2 text-amber-200">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Effetto Pizza Rilevato ({grassi}g Grassi) — Valuta Bolo Dual-Wave / Prolungato</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            I lipidi ritardano lo svuotamento gastrico e generano una coda iperglicemica a +120/+180 min.
            Strategia tipica: <strong>{doseImmediata} U subito (65%)</strong> + <strong>{doseProlungata} U spalmate in 2-3 ore (35%)</strong> o controllo glicemico a 2 ore.
          </p>
        </div>
      )}

      {/* Disclaimer Medico */}
      <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500/70 mt-0.5" />
        <p>
          <strong>Simulazione clinico-matematica:</strong> Questo calcolo si basa esclusivamente sui parametri I:C e FSI inseriti.
          Conferma sempre la dose secondo il piano terapeutico e le indicazioni del tuo diabetologo curante.
        </p>
      </div>
    </div>
  );
}
