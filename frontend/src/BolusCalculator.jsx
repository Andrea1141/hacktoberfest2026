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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header del Calcolatore */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              Calcolatore Bolo Guidato
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                Formula I:C + FSI
              </span>
            </h3>
            <p className="text-xs text-slate-500">Stima trasparente basata sui parametri personali della tua terapia</p>
          </div>
        </div>

        <button
          onClick={() => setMostraConfig(!mostraConfig)}
          className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-teal-800 transition bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 font-medium"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Parametri Paziente</span>
          {mostraConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Pannello Configurazione Parametri Paziente */}
      {mostraConfig && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="text-slate-600 block mb-1 font-medium">Target Glicemico</label>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
              <input
                type="number"
                value={targetGlicemico}
                onChange={e => setImpostazioni({ ...impostazioni, targetGlicemico: Number(e.target.value) })}
                className="w-full bg-transparent text-slate-900 font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-medium">mg/dL</span>
            </div>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-medium">Rapporto I:C (CHO)</label>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
              <input
                type="number"
                step="0.5"
                value={rapportoIC}
                onChange={e => setImpostazioni({ ...impostazioni, rapportoIC: Number(e.target.value) })}
                className="w-full bg-transparent text-slate-900 font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-medium">g/U</span>
            </div>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-medium">FSI / Sensibilità</label>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
              <input
                type="number"
                value={fsi}
                onChange={e => setImpostazioni({ ...impostazioni, fsi: Number(e.target.value) })}
                className="w-full bg-transparent text-slate-900 font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-medium">mg/dL</span>
            </div>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-medium">Insulina Attiva (IOB)</label>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
              <input
                type="number"
                step="0.1"
                value={iob}
                onChange={e => setImpostazioni({ ...impostazioni, iob: Number(e.target.value) })}
                className="w-full bg-transparent text-slate-900 font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-medium">U</span>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Matematico Dettagliato */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 flex items-center justify-between font-medium">
            <span>Bolo Pasto</span>
            <span className="text-[10px] text-slate-500">{carbs}g/{rapportoIC}</span>
          </div>
          <div className="text-xl font-bold text-sky-700 mt-1">
            +{boloPasto.toFixed(2)} <span className="text-xs font-normal text-slate-500">U</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 flex items-center justify-between font-medium">
            <span>Bolo Correzione</span>
            <span className="text-[10px] text-slate-500">
              {deltaGlicemia > 0 ? `+${deltaGlicemia}` : '0'}/{fsi}
            </span>
          </div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            +{boloCorrezione.toFixed(2)} <span className="text-xs font-normal text-slate-500">U</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 flex items-center justify-between font-medium">
            <span>Insulina Attiva</span>
            <span className="text-[10px] text-slate-500">IOB</span>
          </div>
          <div className="text-xl font-bold text-rose-700 mt-1">
            -{iobEffettivo.toFixed(2)} <span className="text-xs font-normal text-slate-500">U</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="text-slate-600 flex items-center justify-between font-medium">
            <span>Sconto Camminata</span>
            <span className={`text-[10px] font-semibold ${usaHackMoto ? 'text-teal-700' : 'text-slate-400'}`}>
              {usaHackMoto ? '-20%' : 'Non attivo'}
            </span>
          </div>
          <div className={`text-xl font-bold mt-1 ${usaHackMoto ? 'text-teal-700' : 'text-slate-400'}`}>
            {usaHackMoto ? `-${scontoMoto.toFixed(2)}` : '0.00'} <span className="text-xs font-normal text-slate-500">U</span>
          </div>
        </div>
      </div>

      {/* Risultato Finale In Evidenza */}
      <div className="bg-teal-50/70 p-4 sm:p-5 rounded-xl border border-teal-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider text-teal-800 font-bold block">
            Bolo Consigliato Stimato
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-4xl font-extrabold text-teal-800">
              {boloTotaleArrotondato} <span className="text-lg font-normal text-slate-600">Unità (U)</span>
            </span>
            <span className="text-xs text-slate-500">
              (calcolo esatto: {boloTotaleGrezzo.toFixed(2)} U)
            </span>
          </div>
        </div>

        {usaHackMoto && (
          <div className="flex items-center gap-2 bg-white border border-teal-200 text-teal-800 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
            <Activity className="w-4 h-4 shrink-0 text-teal-600" />
            <span>Riduzione prudenziale applicata: protezione da ipoglicemia post-camminata.</span>
          </div>
        )}
      </div>

      {/* Alert Effetto Pizza / Coda Grassi >= 20g */}
      {richiedeDualWave && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Effetto Pizza ({grassi}g Grassi) — Consigliata suddivisione della dose</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            I grassi rallentano la digestione e possono provocare una risalita della glicemia a 2–3 ore dal pasto.
            Strategia tipica: <strong>{doseImmediata} U subito (65%)</strong> prima di mangiare e <strong>{doseProlungata} U dopo circa 2 ore (35%)</strong> dopo aver verificato il sensore.
          </p>
        </div>
      )}

      {/* Disclaimer Medico */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
        <p>
          <strong>Strumento informativo di supporto:</strong> Questo calcolo si basa esclusivamente sui parametri personali inseriti.
          Conferma sempre le dosi di insulina secondo il tuo piano terapeutico e le indicazioni del medico diabetologo.
        </p>
      </div>
    </div>
  );
}
