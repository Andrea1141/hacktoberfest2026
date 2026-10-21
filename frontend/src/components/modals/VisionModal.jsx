import React from 'react';
import { Camera, X } from 'lucide-react';

export default function VisionModal({
  isOpen,
  onClose,
  anteprimaFoto,
  meal,
  visionNomeInput,
  setVisionNomeInput,
  visionCarbsInput,
  setVisionCarbsInput,
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
              <Camera className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Verifica Nutrienti Vision AI</h3>
              <p className="text-[11px] text-slate-500">Regola la stima prima di calcolare la curva</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {anteprimaFoto && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              src={anteprimaFoto}
              alt="Foto Piatto"
              className="w-16 h-16 object-cover rounded-xl border border-teal-400 shrink-0"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">{meal.nome_piatto}</span>
              <span className="text-[11px] text-slate-500">Stima porzione: ~250g con indice glicemico {meal.indice_glicemico}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nome del Piatto</label>
            <input
              type="text"
              value={visionNomeInput}
              onChange={(e) => setVisionNomeInput(e.target.value)}
              className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-teal-500"
              placeholder="Es. Pasta al pomodoro e basilico"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Carboidrati Totali Stimati</label>
              <span className="text-sm font-black text-teal-700">{visionCarbsInput} g CHO</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setVisionCarbsInput(prev => Math.max(5, prev - 5))}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                -5g
              </button>
              <input
                type="range"
                min="5"
                max="160"
                step="1"
                value={visionCarbsInput}
                onChange={(e) => setVisionCarbsInput(Number(e.target.value))}
                className="flex-1 accent-teal-600"
              />
              <button
                type="button"
                onClick={() => setVisionCarbsInput(prev => Math.min(200, prev + 5))}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                +5g
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              💡 Regola se la porzione è sensibilmente più abbondante o ridotta rispetto alla media.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer"
          >
            Applica alla Curva
          </button>
        </div>
      </div>
    </div>
  );
}
