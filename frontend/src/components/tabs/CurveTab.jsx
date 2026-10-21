import React from 'react';
import {
  LineChart,
  Info
} from 'lucide-react';
import GlucoseChart from '../../GlucoseChart';

export default function CurveTab({
  glicemia,
  trendCgm,
  predizioneAi,
  piccoStd,
  piccoOpt,
  tPiccoStd,
  tPiccoOpt,
  deltaPicco,
  tirOpt,
  gainTir,
  titrOpt,
  gainTitr,
  cvOpt,
  datiCurva,
  usaHack1,
  usaHack2,
  coach,
  getRischioDetails
}) {
  const livelloRischio = predizioneAi?.livello_rischio || (piccoStd > 220 ? 'CRITICO' : piccoStd > 180 ? 'ELEVATO' : piccoStd > 140 ? 'MEDIO' : 'BASSO');
  const { pill, alertBox, Icon: RiskIcon } = getRischioDetails(livelloRischio);
  const allerta = predizioneAi?.allerta_proattiva || `Sensore a ${glicemia} mg/dL (${trendCgm}): picco previsto a ${piccoStd} mg/dL.`;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-teal-600" />
              Andamento e Tempo nel Bersaglio (Time-In-Range)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Simulazione della risposta glicemica da t = -45m a t = +180m post-pasto</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Curva Standard
            </span>
            <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              Con consigli Gluco
            </span>
          </div>
        </div>

        {/* Banner Sintesi Predizione AI CGM */}
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${alertBox}`}>
          <div className="flex items-center gap-3">
            <RiskIcon className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] block text-slate-500">Valutazione Metabolica Sensore ({glicemia} mg/dL • {trendCgm})</span>
              <span className="font-medium text-slate-900">{allerta}</span>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase self-start sm:self-center shrink-0 ${pill}`}>
            {livelloRischio}
          </span>
        </div>

        {/* KPI Metabolici Completi (6 Metriche di Consenso) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Picco Standard</div>
            <div className="text-xl font-black text-rose-700 mt-1">{piccoStd} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
            <div className="text-[10px] text-slate-500 mt-0.5">al minuto +{tPiccoStd}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Picco con Consigli</div>
            <div className="text-xl font-black text-teal-700 mt-1">{piccoOpt} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
            <div className="text-[10px] text-slate-500 mt-0.5">al minuto +{tPiccoOpt}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Risparmio Picco</div>
            <div className="text-xl font-black text-sky-700 mt-1">-{deltaPicco} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
            <div className="text-[10px] text-sky-700 font-semibold mt-0.5">riduzione del rialzo</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">TIR (70-180)</div>
            <div className="text-xl font-black text-teal-700 mt-1">{tirOpt}%</div>
            <div className="text-[10px] text-teal-700 font-semibold mt-0.5">+{gainTir}% guadagno</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Target Stretto (70-140)</div>
            <div className="text-xl font-black text-indigo-700 mt-1">{titrOpt}%</div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">+{gainTitr}% TITR</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Variabilità CV%</div>
            <div className={`text-xl font-black mt-1 ${cvOpt <= 36 ? 'text-teal-700' : 'text-amber-700'}`}>{cvOpt}%</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${cvOpt <= 36 ? 'text-teal-700' : 'text-amber-700'}`}>
              {cvOpt <= 36 ? 'Stabile (<=36%)' : 'Instabile (>36%)'}
            </div>
          </div>
        </div>

        {/* Grafico Curva Recharts */}
        <GlucoseChart data={datiCurva} mostraOttimizzata={usaHack1 || usaHack2} />

        {/* Commento Clinico Fisiologico */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-3 leading-relaxed">
          <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 font-bold block mb-0.5">Spiegazione Fisiologica:</strong>
            {coach.commento_clinico}
          </div>
        </div>
      </div>
    </div>
  );
}
