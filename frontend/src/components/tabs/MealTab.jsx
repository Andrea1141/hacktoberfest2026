import React from 'react';
import {
  Utensils,
  Search,
  UploadCloud,
  Sparkles,
  Wheat,
  Salad,
  Flame,
  Layers,
  TrendingUp
} from 'lucide-react';
import { CATEGORIE_PASTI, DEMO_MEALS_DATA } from '../../constants/mealData';

export default function MealTab({
  categoriaFiltro,
  setCategoriaFiltro,
  cercaPiatto,
  setCercaPiatto,
  demoId,
  setDemoId,
  setUsaHack1,
  setUsaHack2,
  anteprimaFoto,
  setAnteprimaFoto,
  analizzaPasto,
  loading,
  meal,
  setVisionNomeInput,
  setVisionCarbsInput,
  setMostraModalVision
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-teal-600" />
              Analisi Nutrizionale del Piatto
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Scegli tra i piatti quotidiani o carica una foto reale per la stima automatica</p>
          </div>
          <span className="text-[10px] text-teal-800 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 font-semibold">
            Vision AI (Locale/Cloud)
          </span>
        </div>

        {/* Filtri Categoria e Barra di Ricerca Pasti */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Categorie a pillola */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
              {CATEGORIE_PASTI.map(cat => {
                const isSelected = categoriaFiltro === cat;
                const count = cat === 'Tutti'
                  ? Object.keys(DEMO_MEALS_DATA).length
                  : Object.values(DEMO_MEALS_DATA).filter(m => m.categoria === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs ring-2 ring-teal-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cerca piatto */}
            <div className="relative shrink-0 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cerca piatto..."
                value={cercaPiatto}
                onChange={e => setCercaPiatto(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-xl text-xs border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-teal-600 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Griglia Schede Pasti Preset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {Object.entries(DEMO_MEALS_DATA)
              .filter(([id, info]) => {
                const matchCat = categoriaFiltro === 'Tutti' || info.categoria === categoriaFiltro;
                const matchQuery = !cercaPiatto || 
                  info.nome_piatto.toLowerCase().includes(cercaPiatto.toLowerCase()) || 
                  info.etichetta.toLowerCase().includes(cercaPiatto.toLowerCase()) ||
                  (info.descrizione && info.descrizione.toLowerCase().includes(cercaPiatto.toLowerCase()));
                return matchCat && matchQuery;
              })
              .map(([id, info]) => {
                const ItemIcon = info.icon || Utensils;
                const isSelected = demoId === id && !anteprimaFoto && !meal.vision_meta;
                const igColor = info.indice_glicemico >= 70
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : info.indice_glicemico >= 50
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <button
                    key={id}
                    onClick={() => {
                      setDemoId(id);
                      setUsaHack1(false);
                      setUsaHack2(false);
                      setAnteprimaFoto(null);
                    }}
                    className={`p-3 rounded-2xl text-left transition flex flex-col justify-between gap-2.5 border group relative cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/60 border-teal-500 shadow-xs ring-2 ring-teal-500/20'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? 'bg-white border-teal-300 text-teal-700 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 group-hover:border-teal-200'
                          }`}>
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 group-hover:text-teal-800 transition line-clamp-1">
                              {info.nome_piatto}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {info.categoria}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-600 text-white shrink-0 shadow-2xs">
                            Attivo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {info.descrizione}
                      </p>
                    </div>

                    {/* Badges Nutrizionali */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-mono">
                        {info.carboidrati_g}g CHO
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 font-mono">
                        {info.grassi_g}g Grassi
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 font-mono">
                        {info.fibre_g}g Fibre
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border font-mono ${igColor}`}>
                        IG {info.indice_glicemico}
                      </span>
                      {info.grassi_g >= 20 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          Coda Grassi
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Upload Foto Reale */}
        <label className="group relative block w-full text-center p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/80 hover:bg-teal-50/30 cursor-pointer transition">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files[0] && analizzaPasto(demoId, e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-2">
            {anteprimaFoto ? (
              <div className="relative">
                <img
                  src={anteprimaFoto}
                  alt="Foto Piatto Caricata"
                  className="w-24 h-24 object-cover rounded-2xl border-2 border-teal-500 shadow-md"
                />
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold shadow-xs">
                  {meal.carboidrati_g}g CHO
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 group-hover:scale-105 transition shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>
            )}
            <span className="text-xs text-slate-800 font-semibold">
              {loading ? "Analisi nutrizionale AI in corso..." : (anteprimaFoto ? `Foto: ${meal.nome_piatto} (${meal.carboidrati_g}g CHO)` : "Carica o scatta la foto del piatto")}
            </span>
            <span className="text-[10px] text-slate-500">
              {anteprimaFoto ? "Tocca per sostituire l'immagine" : "Stima automatica macronutrienti, fibre e indice glicemico con Vision AI"}
            </span>
            {anteprimaFoto && (
              <div className="mt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setVisionNomeInput(meal.nome_piatto);
                    setVisionCarbsInput(meal.carboidrati_g);
                    setMostraModalVision(true);
                  }}
                  className="px-3 py-1 rounded-xl text-[11px] font-bold bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 shadow-2xs transition cursor-pointer"
                >
                  ✏️ Modifica Porzione & Carboidrati
                </button>
              </div>
            )}
          </div>
        </label>

        {/* Scheda Nutrizionale Completa */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-xs">
                {(() => {
                  const CurrentMealIcon = meal.icon || DEMO_MEALS_DATA[demoId]?.icon || Utensils;
                  return <CurrentMealIcon className="w-6 h-6" />;
                })()}
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base leading-tight">{meal.nome_piatto}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{meal.descrizione || 'Analisi nutrizionale del pasto'}</p>
              </div>
            </div>
            {meal.grassi_g >= 20 && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                Coda Grassi Attiva
              </span>
            )}
          </div>

          {/* Box Strategia Clinica Personalizzata del Piatto */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-start gap-3 shadow-2xs">
            <div className="p-2 bg-white rounded-lg border border-teal-200 text-teal-700 shadow-2xs shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-teal-900 uppercase tracking-wide flex items-center gap-1.5">
                <span>Strategia Clinica Raccomandata</span>
                <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-teal-100/70 text-teal-800">
                  Pre-Pasto
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {meal.consiglio_clinico || "Applicare il pre-carico di verdure prima del piatto e mantenere 15 minuti di camminata leggera post-prandiale per massimizzare il Time in Range."}
              </p>
            </div>
          </div>

          {/* Griglia 4 Macronutrienti + Indice Glicemico */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase text-slate-500 flex items-center justify-center gap-1 font-bold">
                <Wheat className="w-3.5 h-3.5 text-sky-600" />
                <span>Carboidrati</span>
              </div>
              <div className="font-extrabold text-base text-sky-800 mt-1">{meal.carboidrati_g}g</div>
              <span className="text-[9px] text-slate-400">
                {meal.zuccheri_semplici_g ? `di cui ${meal.zuccheri_semplici_g}g zuccheri` : 'netti'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase text-slate-500 flex items-center justify-center gap-1 font-bold">
                <Salad className="w-3.5 h-3.5 text-teal-600" />
                <span>Fibre</span>
              </div>
              <div className="font-extrabold text-base text-teal-800 mt-1">{meal.fibre_g}g</div>
              <span className="text-[9px] text-slate-400">rallentamento gastrico</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase text-slate-500 flex items-center justify-center gap-1 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Grassi</span>
              </div>
              <div className="font-extrabold text-base text-amber-800 mt-1">{meal.grassi_g}g</div>
              <span className="text-[9px] text-slate-400">{meal.grassi_g >= 20 ? 'coda pizza attiva' : 'moderati'}</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase text-slate-500 flex items-center justify-center gap-1 font-bold">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>Proteine</span>
              </div>
              <div className="font-extrabold text-base text-teal-800 mt-1">{meal.proteine_g || 20}g</div>
              <span className="text-[9px] text-slate-400">sazietà e stabilità</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase text-slate-500 flex items-center justify-center gap-1 font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                <span>Indice Glic.</span>
              </div>
              <div className="font-extrabold text-base text-rose-800 mt-1">{meal.indice_glicemico}</div>
              <span className={`text-[9px] font-bold ${
                meal.indice_glicemico >= 70 ? 'text-rose-600' : meal.indice_glicemico >= 50 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {meal.indice_glicemico >= 70 ? 'Alto Carico' : meal.indice_glicemico >= 50 ? 'Medio Carico' : 'Basso Carico'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
