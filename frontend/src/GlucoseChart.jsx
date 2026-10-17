import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer
} from 'recharts';

export function generaDatiCurva(glicemiaBase, meal, coach, usaHack1, usaHack2) {
  const punti = [];
  const carbs = meal?.carboidrati_g ?? 75;
  const grassi = meal?.grassi_g ?? 20;

  // Parametri Curva Standard (Rossa)
  const fibreStd = meal?.fibre_g ?? 4;
  const igStd = meal?.indice_glicemico ?? 75;
  const ampStd = carbs * (igStd / 100) * 1.75 * Math.max(0.5, 1 - fibreStd * 0.022);
  const tPiccoStd = Math.round(55 + grassi * 0.65 + fibreStd * 0.8);
  const largStd = 32 + grassi * 0.55;

  // Parametri Curva Ottimizzata (Verde)
  const modFibre = coach?.hack_1?.mod_fibre ?? 12;
  const ridIg = coach?.hack_1?.rid_ig ?? 15;
  const multMoto = usaHack2 ? (coach?.hack_2?.mult_picco ?? 0.68) : 1.0;

  const fibreOpt = fibreStd + (usaHack1 ? modFibre : 0);
  const igOpt = Math.max(25, igStd - (usaHack1 ? ridIg : 0));
  const ampOpt = carbs * (igOpt / 100) * 1.75 * Math.max(0.5, 1 - fibreOpt * 0.022) * multMoto;
  const tPiccoOpt = Math.round(55 + grassi * 0.65 + fibreOpt * 0.8);
  const largOpt = 32 + grassi * 0.55;

  for (let t = -45; t <= 180; t += 5) {
    if (t <= 0) {
      const valPassato = Math.round(glicemiaBase + Math.sin(t / 12) * 2.5);
      punti.push({
        tempo: `${t}m`,
        minuti: t,
        standard: valPassato,
        ottimizzata: valPassato,
        targetMin: 70,
        targetMax: 180
      });
    } else {
      const gaussStd = Math.exp(-Math.pow(t - tPiccoStd, 2) / (2 * Math.pow(largStd, 2))) * (t < tPiccoStd ? t / tPiccoStd : 1);
      const gaussOpt = Math.exp(-Math.pow(t - tPiccoOpt, 2) / (2 * Math.pow(largOpt, 2))) * (t < tPiccoOpt ? t / tPiccoOpt : 1);

      // Coda tardiva dei grassi se grassi elevati
      const codaGrassiStd = grassi >= 20 && t > 100 ? (grassi * 0.4) * Math.sin((t - 100) / 40) : 0;
      const codaGrassiOpt = grassi >= 20 && t > 100 ? (grassi * 0.25) * Math.sin((t - 100) / 40) : 0;

      const stdVal = Math.round(glicemiaBase + ampStd * gaussStd + Math.max(0, codaGrassiStd));
      const optVal = Math.round(glicemiaBase + ampOpt * gaussOpt + Math.max(0, codaGrassiOpt));

      punti.push({
        tempo: `+${t}m`,
        minuti: t,
        standard: stdVal,
        ottimizzata: optVal,
        targetMin: 70,
        targetMax: 180
      });
    }
  }
  return { punti, tPiccoStd, tPiccoOpt };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const stdVal = payload.find(p => p.dataKey === 'standard')?.value;
    const optVal = payload.find(p => p.dataKey === 'ottimizzata')?.value;
    const diff = (stdVal && optVal) ? stdVal - optVal : 0;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[210px]">
        <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1.5 flex justify-between items-center">
          <span>Tempo: {label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Simulazione CGM</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50"></span>
            Curva Standard:
          </span>
          <span className="font-mono font-bold text-slate-100">{stdVal} mg/dL</span>
        </div>
        {optVal !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
              Con consigli Gluco:
            </span>
            <span className="font-mono font-bold text-emerald-300">{optVal} mg/dL</span>
          </div>
        )}
        {diff > 0 && (
          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-teal-300 font-semibold">
            <span>Differenza glicemica:</span>
            <span className="bg-teal-500/10 px-1.5 py-0.5 rounded">-{diff} mg/dL</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function GlucoseChart({ data, mostraOttimizzata }) {
  // Calcolo dinamico del dominio Y per visualizzazione ottimale
  const allValues = data.flatMap(d => [d.standard, mostraOttimizzata ? d.ottimizzata : null].filter(Boolean));
  const minVal = Math.min(60, ...allValues);
  const maxVal = Math.max(220, ...allValues + 15);

  return (
    <div className="h-84 sm:h-96 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 15, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5} />
              <stop offset="60%" stopColor="#14b8a6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tirFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

          {/* Range Bersaglio Time-In-Range (70 - 180 mg/dL) */}
          <ReferenceArea
            y1={70}
            y2={180}
            fill="url(#tirFill)"
            strokeOpacity={0}
          />

          <XAxis
            dataKey="tempo"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            interval={3}
          />
          <YAxis
            domain={[Math.floor(minVal / 10) * 10, Math.ceil(maxVal / 10) * 10]}
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            unit=" mg"
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Linea Soglia Iperglicemia (180 mg/dL) */}
          <ReferenceLine
            y={180}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: 'Soglia Iperglicemia (180 mg/dL)',
              fill: '#fb7185',
              position: 'insideTopRight',
              fontSize: 10,
              fontWeight: 600
            }}
          />

          {/* Linea Soglia Ipoglicemia (70 mg/dL) */}
          <ReferenceLine
            y={70}
            stroke="#eab308"
            strokeDasharray="4 4"
            strokeWidth={1.2}
            label={{
              value: 'Target Min (70 mg/dL)',
              fill: '#facc15',
              position: 'insideBottomRight',
              fontSize: 10,
              fontWeight: 600
            }}
          />

          {/* Linea Momento Pasto (t = 0m) */}
          <ReferenceLine
            x="0m"
            stroke="#38bdf8"
            strokeDasharray="3 3"
            strokeWidth={1.5}
            label={{
              value: 'Inizio Pasto',
              fill: '#38bdf8',
              position: 'top',
              fontSize: 11,
              fontWeight: 600
            }}
          />

          {/* Curva Standard (Rossa) */}
          <Area
            type="monotone"
            dataKey="standard"
            name="Curva Standard"
            stroke="#f43f5e"
            strokeWidth={2.8}
            fillOpacity={1}
            fill="url(#colorStd)"
            dot={false}
            activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
          />

          {/* Curva Ottimizzata (Teal) */}
          {mostraOttimizzata && (
            <Area
              type="monotone"
              dataKey="ottimizzata"
              name="Con consigli Gluco"
              stroke="#14b8a6"
              strokeWidth={3.5}
              fillOpacity={1}
              fill="url(#colorOpt)"
              dot={false}
              activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
