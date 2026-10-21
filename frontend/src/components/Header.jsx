import React from 'react';
import {
  HeartPulse,
  Cpu,
  Bot,
  PanelRightClose,
  PanelRightOpen,
  Activity
} from 'lucide-react';

export default function Header({
  schedaAttiva,
  setSchedaAttiva,
  schede,
  aiConfig,
  aiStatus,
  chatAperta,
  setChatAperta,
  setMostraModalAi,
  glicemia,
  glicemiaInfo
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo Brand & Badge a Sinistra */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
            <HeartPulse className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Gluco
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Assistente Glicemico
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5 text-teal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                Monitoraggio attivo
              </span>
            </div>
          </div>
        </div>

        {/* Sezione Destra: Tasti AI e Coach staccati dal brand, e Glicemia TUTTO A DESTRA */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 md:ml-auto">
          {/* Gruppo Controlli AI & Coach: staccati da Assistente Glicemico con ampio margine */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMostraModalAi(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition border bg-slate-50 hover:bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:text-slate-900 shadow-2xs group cursor-pointer"
              title="Configura motore AI (Locale Ollama / Cloud / Offline)"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition" />
              <span className="hidden sm:inline text-slate-500 font-medium">AI:</span>
              <span className="font-bold text-teal-700">
                {aiConfig.provider === 'offline'
                  ? 'Offline'
                  : (aiStatus?.ai?.local_server?.available
                      ? `Ollama (${aiConfig.localModel || 'Locale'})`
                      : (aiConfig.provider === 'local' ? 'Locale (Ollama)' : (aiConfig.apiKey ? 'Cloud' : 'Offline')))}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                aiConfig.provider === 'offline' ? 'bg-amber-400' : (aiStatus?.ai?.local_server?.available ? 'bg-emerald-500 animate-pulse' : (aiConfig.apiKey ? 'bg-sky-500' : 'bg-slate-400'))
              }`}></span>
            </button>

            <button
              onClick={() => setChatAperta(!chatAperta)}
              className={`flex px-3.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-2 transition border cursor-pointer ${
                chatAperta
                  ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
              }`}
              title={chatAperta ? "Chiudi Coach AI" : "Apri Coach AI"}
            >
              <Bot className={`w-4 h-4 ${chatAperta ? 'text-white' : 'text-teal-600'}`} />
              <span>Coach AI</span>
              {chatAperta ? (
                <PanelRightClose className="w-3.5 h-3.5 text-teal-100" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* Separatore verticale */}
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Widget Rapido CGM Header — TUTTO A DESTRA */}
          <div className="flex items-center gap-2 bg-slate-50 hover:bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs transition shrink-0">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-slate-500 text-[11px] font-medium">Glicemia:</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{glicemia}</span>
            <span className="text-[10px] text-slate-400 font-mono">mg/dL</span>
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${glicemiaInfo.classe}`}>
              {glicemiaInfo.testo}
            </span>
          </div>
        </div>
      </div>

      {/* Barra di Navigazione Schede */}
      <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {schede.map(tab => {
          const Icon = tab.icon;
          const isAttiva = schedaAttiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSchedaAttiva(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border cursor-pointer ${
                isAttiva
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isAttiva ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isAttiva ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
