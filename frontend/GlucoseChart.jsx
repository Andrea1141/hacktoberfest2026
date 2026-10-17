import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

export function generaDatiCurva(glicemiaBase, meal, coach, usaHack1, usaHack2) {
  const punti = [];
  const carbs = meal.carboidrati_g;
  const grassi = meal.grassi_g;

  // Parametri Curva Standard (Rossa)
  const fibreStd = meal.fibre_g;
  const igStd = meal.indice_glicemico;
  const ampStd = carbs * (igStd / 100) * 1.75 * Math.max(0.5, 1 - fibreStd * 0.022);
  const tPiccoStd = 55 + grassi * 0.65 + fibreStd * 0.8;
  const largStd = 32 + grassi * 0.55;

  // Parametri Curva Ottimizzata (Verde)
  const fibreOpt = fibreStd + (usaHack1 ? coach.hack_1.mod_fibre : 0);
  const igOpt = Math.max(25, igStd - (usaHack1 ? coach.hack_1.rid_ig : 0));
  const multMoto = usaHack2 ? coach.hack_2.mult_picco : 1.0;
  const ampOpt = carbs * (igOpt / 100) * 1.75 * Math.max(0.5, 1 - fibreOpt * 0.022) * multMoto;
  const tPiccoOpt = 55 + grassi * 0.65 + fibreOpt * 0.8;
  const largOpt = 32 + grassi * 0.55;

  for (let t = -45; t <= 180; t += 10) {
    if (t <= 0) {
      const valPassato = Math.round(glicemiaBase + Math.sin(t / 12) * 3);
      punti.push({ tempo: `${t}m`, standard: valPassato, ottimizzata: valPassato });
    } else {
      const gaussStd = Math.exp(-Math.pow(t - tPiccoStd, 2) / (2 * Math.pow(largStd, 2))) * (t < tPiccoStd ? t / tPiccoStd : 1);
      const gaussOpt = Math.exp(-Math.pow(t - tPiccoOpt, 2) / (2 * Math.pow(largOpt, 2))) * (t < tPiccoOpt ? t / tPiccoOpt : 1);
      punti.push({
        tempo: `+${t}m`,
        standard: Math.round(glicemiaBase + ampStd * gaussStd),
        ottimizzata: Math.round(glicemiaBase + ampOpt * gaussOpt)
      });
    }
  }
  return punti;
}

export default function GlucoseChart({ data, mostraOttimizzata }) {
  return (
    <div className="h-80 w-full bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="tempo" stroke="#94a3b8" />
          <YAxis domain={[60, 250]} stroke="#94a3b8" unit=" mg" />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
          <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Soglia Iperglicemia (180 mg/dL)', fill: '#f87171', position: 'insideTopLeft' }} />
          <ReferenceLine x="0m" stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Pasto', fill: '#cbd5e1', position: 'top' }} />
          <Area type="monotone" dataKey="standard" name="Curva Standard (Picco)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorStd)" />
          {mostraOttimizzata && (
            <Area type="monotone" dataKey="ottimizzata" name="Con Hack GlucoTwin" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorOpt)" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}