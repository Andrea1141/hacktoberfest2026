import React from 'react';
import {
  Cpu,
  Server,
  ShieldCheck,
  UploadCloud,
  RefreshCw,
  X
} from 'lucide-react';

export default function AiConfigModal({
  isOpen,
  onClose,
  aiConfig,
  salvaAiConfig,
  aiStatus,
  verificaStatoAi,
  loadingVerificaAi,
  onSaveAndAnalyze
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Cpu className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Configurazione Motore AI</h3>
              <p className="text-xs text-slate-500">Gestisci l'esecuzione locale o remota dell'intelligenza artificiale</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stato Connessione Live */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-teal-600" />
              Stato Server AI Locale:
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold ${
              aiStatus?.ai?.local_server?.available
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {aiStatus?.ai?.local_server?.available
                ? `🟢 Connesso (${aiStatus.ai.local_server.type})`
                : '🟡 Non Rilevato (Usa Motore Offline)'}
            </span>
          </div>
          {aiStatus?.ai?.local_server?.available ? (
            <div className="text-slate-600 space-y-1">
              <div><strong>Endpoint:</strong> {aiStatus.ai.local_server.url}</div>
              <div><strong>Modelli installati:</strong> {aiStatus.ai.local_server.models.length > 0 ? aiStatus.ai.local_server.models.join(', ') : 'Nessun modello trovato'}</div>
            </div>
          ) : (
            <div className="text-slate-500 text-[11px]">
              Puoi avviare Ollama in locale digitando nel terminale: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">ollama run gemma2:2b</code>
            </div>
          )}
        </div>

        {/* Scelta Modalità Provider */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Modalità di Esecuzione AI</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => salvaAiConfig({ ...aiConfig, provider: 'local' })}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                aiConfig.provider === 'local'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Cpu className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-xs">Locale</span>
              <span className="text-[10px] text-slate-500">Ollama / LM</span>
            </button>

            <button
              type="button"
              onClick={() => salvaAiConfig({ ...aiConfig, provider: 'offline' })}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                aiConfig.provider === 'offline'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-xs">Offline</span>
              <span className="text-[10px] text-slate-500">Trial AZT1D</span>
            </button>

            <button
              type="button"
              onClick={() => salvaAiConfig({ ...aiConfig, provider: 'cloud' })}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                aiConfig.provider === 'cloud'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-xs">Cloud</span>
              <span className="text-[10px] text-slate-500">Google / OpenR</span>
            </button>
          </div>
        </div>

        {/* Campi di Configurazione in base alla selezione */}
        {aiConfig.provider !== 'offline' && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            {aiConfig.provider === 'local' && (
              <>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">URL Server Locale (Ollama / LM Studio)</label>
                  <input
                    type="text"
                    value={aiConfig.localUrl}
                    onChange={(e) => salvaAiConfig({ ...aiConfig, localUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Nome Modello Locale</label>
                  {aiStatus?.ai?.local_server?.models?.length > 0 ? (
                    <select
                      value={aiConfig.localModel}
                      onChange={(e) => salvaAiConfig({ ...aiConfig, localModel: e.target.value })}
                      className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-teal-500"
                    >
                      {aiStatus.ai.local_server.models.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={aiConfig.localModel}
                      onChange={(e) => salvaAiConfig({ ...aiConfig, localModel: e.target.value })}
                      placeholder="gemma2:2b (es. ollama run gemma2:2b)"
                      className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-teal-500"
                    />
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">
                    💡 Suggerimento: avvia nel tuo terminale <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">ollama run gemma2:2b</code> (o llama3.2, mistral)
                  </p>
                </div>
              </>
            )}

            {aiConfig.provider === 'cloud' && (
              <div>
                <label className="text-slate-700 font-semibold block mb-1">API Key Google AI Studio / OpenRouter</label>
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => salvaAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  placeholder="sk-... oppure AIzaSy..."
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-teal-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Ottieni una chiave gratuita da <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-teal-700 underline">aistudio.google.com</a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer con Azioni */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => verificaStatoAi()}
            disabled={loadingVerificaAi}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingVerificaAi ? 'animate-spin' : ''}`} />
            <span>Verifica Connessione</span>
          </button>

          <button
            type="button"
            onClick={onSaveAndAnalyze}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer"
          >
            Salva e Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
