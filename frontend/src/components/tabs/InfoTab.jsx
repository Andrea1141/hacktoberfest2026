import React from 'react';
import {
  Sparkles,
  HeartPulse,
  Salad,
  Footprints,
  Syringe,
  Pizza,
  Cpu,
  Server,
  Camera,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { renderLatex } from '../../utils/latex';

export default function InfoTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header Pagina Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 via-sky-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              Trial Clinico AZT1D (2025)
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Consenso Internazionale ATTD / ADA
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Local-First AI & Fisiologia
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Guida Scientifica & Funzionamento di GlucoTwin
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            GlucoTwin è un gemello digitale metabolico predittivo progettato per persone con Diabete di Tipo 1 e professionisti della salute.
            Simula in tempo reale l'impatto glicemico dei pasti, calcola il dosaggio insulinico con trasparenza matematica
            e guida verso interventi comportamentali mirati ad appiattire i picchi post-prandiali e massimizzare il Time-in-Range.
          </p>
        </div>
      </div>

      {/* Sezione 1: Il Dataset Clinico di Riferimento AZT1D */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
            <HeartPulse className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Dataset Clinico di Calibrazione: Studio AZT1D (2025)
            </h3>
            <p className="text-[11px] text-slate-500">
              Evidenze cliniche su pazienti con Diabete Tipo 1 e sistemi microinfusore automatici AID
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          I modelli di cinetica enzimatica e assorbimento dei carboidrati di GlucoTwin sono stati calibrati sulle evidenze estratte dallo studio clinico <strong>AZT1D (2025)</strong>,
          comprendente rilevazioni glicemiche ad alta risoluzione da sensori continui (CGM) su soggetti diabetici in terapia con microinfusore automatico a circuito chiuso.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl font-black text-slate-900">25</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Pazienti Monitorati</div>
            <div className="text-[9px] text-slate-500 mt-1">Trial clinico T1D</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl font-black text-teal-700">306.712</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Campioni CGM</div>
            <div className="text-[9px] text-slate-500 mt-1">Rilevazioni ogni 5 min</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl font-black text-sky-700">77.8%</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">TIR Popolazione</div>
            <div className="text-[9px] text-slate-500 mt-1">Target 70-180 mg/dL</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-2xl font-black text-indigo-700">32.1%</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">CV% Variabilità</div>
            <div className="text-[9px] text-slate-500 mt-1">Stabilità ottimale (&le;36%)</div>
          </div>
        </div>
      </div>

      {/* Sezione 2: I Due Interventi Fisiologici (Hack Metabolici) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hack 1: Fibre */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs">
              <Salad className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Pre-carico di Fibre Vegetali</h4>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                -15 Punti Indice Glicemico
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consumare verdura cruda (es. finocchi, insalata mista, cetrioli) <strong>10 minuti prima</strong> del pasto principale crea una barriera vischiosa gelatinosa nello stomaco.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li><strong>Rallentamento Svuotamento Gastrico:</strong> Gli amidi raggiungono il duodeno con gradualità controllata.</li>
            <li><strong>Inibizione Alfa-Amilasi:</strong> Minore velocità di idrolisi dei carboidrati complessi in molecole di glucosio.</li>
            <li><strong>Eliminazione Picco a Spillo:</strong> La curva sale dolcemente consentendo all'insulina rapida di coprire l'ascesa in modo sincrono.</li>
          </ul>
        </div>

        {/* Hack 2: Camminata GLUT4 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shadow-2xs">
              <Footprints className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Camminata & Recettori GLUT4</h4>
              <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                -30% Ampiezza Picco
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            15–20 minuti di camminata a passo svelto avviata circa <strong>25–30 minuti dopo il pasto</strong> attivano una via metabolica cellulare straordinaria:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li><strong>Traslocazione Indipendente da Insulina:</strong> La contrazione muscolare induce il passaggio dei trasportatori GLUT4 sulla membrana dei miociti.</li>
            <li><strong>Assorbimento Diretto:</strong> Il glucosio ematico viene assorbito direttamente dai muscoli in movimento.</li>
            <li><strong>Sconto Prudenziale (-20% Bolo):</strong> Per scongiurare ipoglicemie da sforzo tardive, il calcolatore riduce del 20% il fabbisogno insulinico.</li>
          </ul>
        </div>
      </div>

      {/* Sezione 3: Formule Matematiche del Bolo (Standard ADA / ATTD) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
            <Syringe className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Equazioni Matematiche del Calcolo del Bolo (Linee Guida Internazionali)
            </h3>
            <p className="text-[11px] text-slate-500">
              Formule trasparenti calcolate su Rapporto I:C, Fattore di Sensibilità (FSI) e Insulina Attiva (IOB)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <strong className="text-slate-900 font-bold block text-sm">1. Quota Carboidrati Pasto:</strong>
            <div
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderLatex(String.raw`\text{Bolo}_{\text{pasto}} = \frac{\text{Carboidrati (g)}}{\text{Rapporto I:C}}`, true) }}
            />
            <p className="text-slate-600 text-[11px]">
              Rappresenta le unità di insulina rapida necessarie a coprire i grammi di carboidrati assunti (es. 70g con I:C=10 &rarr; 7.0 U).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <strong className="text-slate-900 font-bold block text-sm">2. Quota Correzione Glicemica:</strong>
            <div
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderLatex(String.raw`\text{Bolo}_{\text{corr}} = \max\left(0, \frac{G_{\text{CGM}} - G_{\text{target}}}{\text{FSI}}\right)`, true) }}
            />
            <p className="text-slate-600 text-[11px]">
              Unità necessarie a riportare la glicemia attuale al valore bersaglio (default: 110 mg/dL).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <strong className="text-slate-900 font-bold block text-sm">3. Sconto Attività Fisica (GLUT4):</strong>
            <div
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderLatex(String.raw`\text{Sconto}_{\text{moto}} = -20\% \times (\text{Bolo}_{\text{pasto}} + \text{Bolo}_{\text{corr}})`, true) }}
            />
            <p className="text-slate-600 text-[11px]">
              Detrazione prudenziale del 20% in presenza di camminata post-prandiale attiva.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <strong className="text-slate-900 font-bold block text-sm">4. Equazione della Dose Totale Finale:</strong>
            <div
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderLatex(String.raw`\mathbf{Dose} = \max\left(0, \text{Bolo}_{\text{pasto}} + \text{Bolo}_{\text{corr}} - \text{IOB} - \text{Sconto}\right)`, true) }}
            />
            <p className="text-slate-600 text-[11px]">
              Sottrae l'insulina ancora attiva nel corpo (IOB) per prevenire il pericoloso fenomeno del sovradosaggio da stacking insulinico.
            </p>
          </div>
        </div>

        {/* Coda Grassi ed Effetto Pizza */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Pizza className="w-4 h-4 text-amber-700" />
            <span>Strategia Pasti Ricchi di Lipidi (&ge;20g Grassi) & Bolo a Onda Doppia:</span>
          </div>
          <p className="leading-relaxed">
            I grassi rallentano lo svuotamento gastrico e riducono temporaneamente la sensibilità epatica all'insulina a 2–5 ore dal pasto (effetto pizza).
            In questi casi le linee guida diabetologiche consigliano di valutare un <strong>bolo ad onda doppia (dual-wave)</strong>:
            il <strong>60%</strong> erogato immediatamente e il rimanente <strong>40%</strong> dilazionato nell'arco di 2–3 ore.
          </p>
        </div>
      </div>

      {/* Sezione 4: Architettura Tecnologica & Privacy Locale */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
            <Cpu className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Architettura Software Ibrida & Privacy-First
            </h3>
            <p className="text-[11px] text-slate-500">
              Tre livelli di esecuzione per garantire massima affidabilità e protezione dei dati clinici
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Server className="w-4 h-4 text-teal-600" />
              <span>1. Motore Offline</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Algoritmo cinetico deterministico sempre attivo nel backend e nel frontend. Garantisce latenza zero (&lt;10ms) e affidabilità anche in aereo o senza internet.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>2. LLM Locale (Ollama)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Supporto nativo a modelli open-source come <code>gemma2:2b</code> o <code>llama3.2</code> in esecuzione sul PC dell'utente. Nessun dato clinico lascia il computer.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Camera className="w-4 h-4 text-sky-600" />
              <span>3. Vision AI Multimodale</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Modelli di visione artificiale per riconoscere porzioni e macronutrienti da fotografie di piatti reali, con controllo umano per confermare o correggere i grammi stimati.
            </p>
          </div>
        </div>
      </div>

      {/* Sezione 5: Glossario Termini Clinici */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
            <HelpCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Glossario dei Termini Diabetologici
            </h3>
            <p className="text-[11px] text-slate-500">
              I parametri fondamentali utilizzati nei calcoli e nelle predizioni
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">TIR (Time-in-Range)</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Percentuale di tempo trascorsa con glicemia tra 70 e 180 mg/dL. Il target clinico internazionale raccomandato è &gt;70%.
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">TITR (Time-in-Tight-Range)</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Intervallo stretto tra 70 e 140 mg/dL. È il nuovo gold standard per prevenire la variabilità glicemica asintomatica.
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">Rapporto I:C (Insulina:Carboidrati)</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Grammi di carboidrati coperti da 1 unità di insulina rapida (es. 1U ogni 10g).
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">FSI (Fattore di Sensibilità)</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Di quanti mg/dL scende la glicemia per 1 unità di insulina di correzione (es. 1U abbassa 40 mg/dL).
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">IOB (Insulin on Board)</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Insulina rapida precedentemente iniettata che è ancora attiva nel circolo sanguigno (durata d'azione tipica: 3-4 ore).
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">CV% (Coefficiente di Variabilità)</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Rapporto percentuale tra deviazione standard e media glicemica. Un valore &le;36% indica glicemia stabile e sicura.
            </div>
          </div>
        </div>
      </div>

      {/* Sezione 6: Disclaimer di Sicurezza Medica */}
      <div className="p-5 rounded-3xl bg-slate-100/90 border border-slate-200 flex items-start gap-4 text-xs text-slate-600">
        <ShieldCheck className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-900 font-bold block text-sm">
            Avvertenza di Sicurezza e Disclaimer Clinico
          </strong>
          <p className="leading-relaxed">
            GlucoTwin è uno strumento software sperimentale a scopo educativo e di supporto decisionale.
            Tutte le proiezioni cinetiche e i dosaggi insulinici simulati devono sempre essere verificati con il proprio medico diabetologo
            e adattati al piano terapeutico personale prescritto.
          </p>
        </div>
      </div>
    </div>
  );
}
