import React, { useState, useEffect } from 'react';
import GlucoseChart, { generaDatiCurva } from './GlucoseChart';

export default function App() {
  const [glicemia, setGlicemia] = useState(115);
  const [demoId, setDemoId] = useState('pizza');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [usaHack1, setUsaHack1] = useState(false);
  const [usaHack2, setUsaHack2] = useState(false);
  const [risultato, setRisultato] = useState(null);

  const analizzaPasto = async (idPiatto = demoId, fileFoto = null) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('glicemia_base', glicemia);
    formData.append('demo_id', idPiatto);
    formData.append('api_key', apiKey);
    if (fileFoto) formData.append('file', fileFoto);

    try {
      const res = await fetch('http://localhost:8000/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setRisultato(data);
    } catch (err) {
      console.error("Errore connessione backend:", err);
    }
    setLoading(false);
  };

  useEffect(() => { analizzaPasto(demoId); }, [demoId]);

  if (!risultato) return <div className="min-h-screen bg-slate-950 text-white p-10">Avvio GlucoTwin Engine...</div>;

  const { meal, coach } = risultato;
  const datiCurva = generaDatiCurva(glicemia, meal, coach, usaHack1, usaHack2);
  const piccoStd = Math.max(...datiCurva.map(d => d.standard));
  const piccoOpt = Math.max(...datiCurva.map(d => d.ottimizzata));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="max-w-6xl mx-auto flex flex-wrap justify-between items-center pb-6 mb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            🩸 GlucoTwin AI
          </h1>
          <p className="text-slate-400 text-sm">Digital Twin Metabolico basato su Modelli Open-Weight (Qwen2.5-VL + Llama 3.3)</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-sm text-slate-400">CGM Live: <strong className="text-emerald-400 text-lg">{glicemia} mg/dL</strong></span>
          <input type="range" min="85" max="165" value={glicemia} onChange={e => setGlicemia(Number(e.target.value))} className="accent-emerald-500" />
          <input type="password" placeholder="OpenRouter Key (Opzionale)" value={apiKey} onChange={e => setApiKey(e.target.value)} className="bg-slate-950 text-xs px-3 py-1.5 rounded border border-slate-700" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonna Sinistra: Input & Nutrienti */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-lg font-semibold">1. Seleziona o Fotografa il Pasto</h2>
          <div className="grid grid-cols-3 gap-2">
            {[['pizza', '🍕 Pizza'], ['carbonara', '🍝 Carbonara'], ['poke', '🥗 Poke']].map(([id, label]) => (
              <button key={id} onClick={() => { setDemoId(id); setUsaHack1(false); setUsaHack2(false); }}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition ${demoId === id ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>

          <label className="block w-full text-center py-3 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 cursor-pointer text-sm text-slate-400">
            📷 {loading ? "Analisi Vision Open-Weight in corso..." : "Oppure carica foto reale del piatto"}
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && analizzaPasto(demoId, e.target.files[0])} />
          </label>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-bold text-lg mb-3">{meal.nome_piatto}</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900 p-2 rounded-lg"><div className="text-xs text-slate-400">Carbs</div><div className="font-bold">{meal.carboidrati_g}g</div></div>
              <div className="bg-slate-900 p-2 rounded-lg"><div className="text-xs text-slate-400">Fibre</div><div className="font-bold">{meal.fibre_g}g</div></div>
              <div className="bg-slate-900 p-2 rounded-lg"><div className="text-xs text-slate-400">Grassi</div><div className="font-bold">{meal.grassi_g}g</div></div>
              <div className="bg-slate-900 p-2 rounded-lg"><div className="text-xs text-slate-400">IG</div><div className="font-bold text-amber-400">{meal.indice_glicemico}</div></div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-semibold">2. Simula Interventi Preventivi (What-If)</h2>
            <button onClick={() => setUsaHack1(!usaHack1)} className={`w-full text-left p-3.5 rounded-xl border transition flex justify-between items-center ${usaHack1 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
              <span className="text-sm font-medium">{coach.hack_1.label}</span>
              <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">{usaHack1 ? 'ATTIVO' : 'SIMULA'}</span>
            </button>
            <button onClick={() => setUsaHack2(!usaHack2)} className={`w-full text-left p-3.5 rounded-xl border transition flex justify-between items-center ${usaHack2 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
              <span className="text-sm font-medium">{coach.hack_2.label}</span>
              <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">{usaHack2 ? 'ATTIVO' : 'SIMULA'}</span>
            </button>
          </div>
        </div>

        {/* Colonna Destra: Grafico & KPI */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400">Picco Previsto (Senza Azioni)</div>
              <div className="text-2xl font-bold text-red-400">{piccoStd} mg/dL</div>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400">Picco Ottimizzato</div>
              <div className="text-2xl font-bold text-emerald-400">{piccoOpt} mg/dL</div>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400">Riduzione Escursione</div>
              <div className="text-2xl font-bold text-cyan-400">-{piccoStd - piccoOpt} mg/dL</div>
            </div>
          </div>

          <GlucoseChart data={datiCurva} mostraOttimizzata={usaHack1 || usaHack2} />

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-sm text-slate-300">
            <strong className="text-emerald-400">🩺 Analisi Agente Clinico (Llama-3.3-70B): </strong>
            {coach.commento_clinico}
          </div>
        </div>
      </main>
    </div>
  );
}