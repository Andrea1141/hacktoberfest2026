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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4">
        {/* Logo Brand & Badge a Sinistra (con CGM compatto a destra su mobile) */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs shrink-0">
              <HeartPulse className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  Gluco
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Assistente Glicemico
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5 text-teal-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  Monitoraggio attivo
                </span>
              </div>
            </div>
          </div>

          {/* Widget CGM Rapido compatto per mobile */}
          <div className="flex md:hidden items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-bold text-slate-900 text-xs font-mono">{glicemia}</span>
            <span className="text-[9px] text-slate-400 font-mono">mg/dL</span>
          </div>
        </div>

        {/* Sezione Destra: Tasti AI e Coach, e Glicemia completa su schermi >= md */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 md:ml-auto">
          {/* Gruppo Controlli AI */}
          <button
            onClick={() => setMostraModalAi(true)}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition border bg-slate-50 hover:bg-white border-slate-200 hover:border-teal-300 text-slate-700 shadow-2xs cursor-pointer"
            title="Configura motore AI (Locale Ollama / Cloud / Offline)"
          >
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden xs:inline text-slate-500 font-medium">AI:</span>
            <span className="font-bold text-teal-700 text-[11px] sm:text-xs">
              {aiConfig.provider === 'offline'
                ? 'Offline'
                : (aiStatus?.ai?.local_server?.available
                    ? `Ollama (${aiConfig.localModel || 'Locale'})`
                    : (aiConfig.provider === 'local' ? 'Locale' : (aiConfig.apiKey ? 'Cloud' : 'Offline')))}
            </span>
            <span className={`w-2 h-2 rounded-full ${
              aiConfig.provider === 'offline' ? 'bg-amber-400' : (aiStatus?.ai?.local_server?.available ? 'bg-emerald-500 animate-pulse' : (aiConfig.apiKey ? 'bg-sky-500' : 'bg-slate-400'))
            }`}></span>
          </button>

          {/* Toggle Coach AI */}
          <button
            onClick={() => setChatAperta(!chatAperta)}
            className={`flex px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 sm:gap-2 transition border cursor-pointer ${
              chatAperta
                ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
            }`}
            title={chatAperta ? "Chiudi Coach AI" : "Apri Coach AI"}
          >
            <Bot className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${chatAperta ? 'text-white' : 'text-teal-600'}`} />
            <span className="text-[11px] sm:text-xs">Coach AI</span>
            {chatAperta ? (
              <PanelRightClose className="w-3.5 h-3.5 text-teal-100 hidden sm:inline" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            )}
          </button>

          {/* Separatore verticale */}
          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Widget Rapido CGM Header — Schermi >= md */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs transition shrink-0">
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
      <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {schede.map(tab => {
          const Icon = tab.icon;
          const isAttiva = schedaAttiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSchedaAttiva(tab.id)}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all border cursor-pointer ${
                isAttiva
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isAttiva ? 'text-white' : 'text-slate-400'}`} />
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
