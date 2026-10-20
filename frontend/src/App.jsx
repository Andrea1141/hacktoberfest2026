import React, { useState, useEffect } from 'react';
import katex from 'katex';

function renderLatex(latexStr, displayMode = false) {
  try {
    return katex.renderToString(latexStr, {
      displayMode,
      throwOnError: false
    });
  } catch (e) {
    return latexStr;
  }
}
import GlucoseChart, { generaDatiCurva } from './GlucoseChart';
import BolusCalculator from './BolusCalculator';
import ChatCoach from './ChatCoach';
import {
  Activity,
  Flame,
  Wheat,
  Salad,
  Footprints,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Timer,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Percent,
  Layers,
  HeartPulse,
  Info,
  Home,
  Utensils,
  Pizza,
  Sandwich,
  LineChart,
  Syringe,
  MessageSquare,
  Bot,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Minus,
  Zap,
  ArrowRight,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Check,
  Cpu,
  Server,
  Settings,
  ShieldCheck,
  Wifi,
  WifiOff,
  Camera,
  Soup,
  Apple,
  Croissant,
  Egg,
  Fish,
  UtensilsCrossed,
  Filter,
  Search
} from 'lucide-react';

const CATEGORIE_PASTI = [
  'Tutti',
  'Primi Piatti',
  'Piatti Unici',
  'Colazione',
  'Leggero / Low-Carb'
];

const DEMO_MEALS_DATA = {
  pasta: {
    nome_piatto: "Pasta al Pomodoro & Basilico",
    etichetta: "Pasta al Sugo",
    categoria: "Primi Piatti",
    carboidrati_g: 72,
    zuccheri_semplici_g: 5,
    fibre_g: 4,
    grassi_g: 7,
    proteine_g: 13,
    indice_glicemico: 68,
    icon: Utensils,
    descrizione: "Il grande classico italiano: amido di grano duro a medio assorbimento con picco glicemico concentrato entro 45-60 minuti.",
    consiglio_clinico: "Un pre-carico di verdure o insalata cruda 10 minuti prima riduce l'indice glicemico effettivo e attenua l'impennata iniziale."
  },
  carbonara: {
    nome_piatto: "Spaghetti alla Carbonara",
    etichetta: "Carbonara",
    categoria: "Primi Piatti",
    carboidrati_g: 76,
    zuccheri_semplici_g: 3,
    fibre_g: 3,
    grassi_g: 34,
    proteine_g: 28,
    indice_glicemico: 68,
    icon: UtensilsCrossed,
    descrizione: "Piatto ricco di amidi e lipidi (guanciale e tuorli): determina una salita graduale seguita da una persistente coda iperglicemica a 2-4 ore dal pasto.",
    consiglio_clinico: "Per chi usa insulina, è il candidato ideale per un bolo frazionato/onda quadra (dual-wave) per coprire l'assorbimento ritardato dei grassi."
  },
  risotto: {
    nome_piatto: "Risotto ai Funghi Porcini",
    etichetta: "Risotto Funghi",
    categoria: "Primi Piatti",
    carboidrati_g: 68,
    zuccheri_semplici_g: 3,
    fibre_g: 4,
    grassi_g: 14,
    proteine_g: 11,
    indice_glicemico: 76,
    icon: Soup,
    descrizione: "L'amido gelatinizzato del riso (ricco di amilopectina) viene digerito rapidamente dall'alfa-amilasi gastrica, generando un picco glicemico ripido e precoce a 35-45 min.",
    consiglio_clinico: "15 minuti di camminata leggera post-prandiale stimolano i trasportatori GLUT4 muscolari e assorbono l'onda glicemica sul nascere."
  },
  pizza: {
    nome_piatto: "Pizza Margherita Verace",
    etichetta: "Pizza Margherita",
    categoria: "Piatti Unici",
    carboidrati_g: 84,
    zuccheri_semplici_g: 6,
    fibre_g: 4,
    grassi_g: 24,
    proteine_g: 22,
    indice_glicemico: 80,
    icon: Pizza,
    descrizione: "L'archetipo dell'effetto pizza: forte impennata dei carboidrati dell'impasto unita a oltre 20g di grassi della mozzarella che inducono resistenza insulinica tardiva fino a 4-5 ore.",
    consiglio_clinico: "Bolo prolungato (es. 60% subito, 40% su 3 ore) e idratazione abbondante per limitare l'escursione glicemica prolungata."
  },
  poke: {
    nome_piatto: "Poke Bowl Salmone, Riso & Edamame",
    etichetta: "Poke Salmone",
    categoria: "Piatti Unici",
    carboidrati_g: 58,
    zuccheri_semplici_g: 5,
    fibre_g: 9,
    grassi_g: 18,
    proteine_g: 30,
    indice_glicemico: 54,
    icon: Fish,
    descrizione: "Piatto unico moderno con ottimo equilibrio macro: carboidrati complessi del riso temperati da edamame ricchi di fibre e grassi sani omega-3 del salmone.",
    consiglio_clinico: "Curva glicemica molto stabile con picco smorzato e prolungata sensazione di sazietà senza rimbalzi reattivi."
  },
  toast: {
    nome_piatto: "Toast Farcito Prosciutto & Formaggio",
    etichetta: "Toast Farcito",
    categoria: "Piatti Unici",
    carboidrati_g: 34,
    zuccheri_semplici_g: 3,
    fibre_g: 3,
    grassi_g: 14,
    proteine_g: 18,
    indice_glicemico: 58,
    icon: Sandwich,
    descrizione: "Pasto veloce da pausa pranzo o spuntino: pane tostato con proteine e lipidi che stabilizzano la velocità di salita glicemica rispetto al pane semplice.",
    consiglio_clinico: "Se abbinato a un frutto fresco o a verdure croccanti, l'apporto di fibre riduce ulteriormente l'escursione."
  },
  colazione: {
    nome_piatto: "Colazione Clinica AZT1D (Pancake & Uova)",
    etichetta: "Colazione AZT1D",
    categoria: "Colazione",
    carboidrati_g: 51,
    zuccheri_semplici_g: 6,
    fibre_g: 6,
    grassi_g: 12,
    proteine_g: 15,
    indice_glicemico: 62,
    icon: Egg,
    descrizione: "Profilo reale dal dataset clinico AZT1D 2025 (Subject 2): colazione bilanciata con carboidrati a rilascio controllato monitorata ogni 5 min con sensore CGM.",
    consiglio_clinico: "Bolo puntuale contemporaneo al pasto (rapporto I:C di riferimento 10 g/U): risposta glicemica prevedibile e controllata."
  },
  brioche: {
    nome_piatto: "Cappuccino & Cornetto alla Crema",
    etichetta: "Brioche & Cappuccino",
    categoria: "Colazione",
    carboidrati_g: 56,
    zuccheri_semplici_g: 28,
    fibre_g: 2,
    grassi_g: 20,
    proteine_g: 9,
    indice_glicemico: 78,
    icon: Croissant,
    descrizione: "Classica colazione da bar ad alta densità zuccherina e lipidica: gli zuccheri semplici generano una ripida impennata della glicemia nei primi 30 minuti.",
    consiglio_clinico: "Anticipare il bolo di 15-20 minuti prima del primo morso e associare una camminata mattutina per domare il picco."
  },
  insalata: {
    nome_piatto: "Insalata Mediterranea & Quinoa",
    etichetta: "Insalata Quinoa",
    categoria: "Leggero / Low-Carb",
    carboidrati_g: 32,
    zuccheri_semplici_g: 4,
    fibre_g: 11,
    grassi_g: 14,
    proteine_g: 22,
    indice_glicemico: 38,
    icon: Salad,
    descrizione: "Piatto protettivo con altissimo tenore di fibre vegetali e proteine magre: produce un incremento glicemico quasi piatto e mantiene il Time in Range oltre il 95%.",
    consiglio_clinico: "Ideale per giornate a bassa attività o pasti serali leggeri per prevenire iperglicemie notturne."
  }
};

const DEFAULT_COACH_DATA = {
  hack_1: {
    label: "Pre-carico di fibre (Verdura cruda 10 min prima)",
    mod_fibre: 12,
    rid_ig: 15,
    riduzione_percentuale: 22
  },
  hack_2: {
    label: "15 min di camminata attiva (30 min post-pasto)",
    mult_picco: 0.68,
    riduzione_percentuale: 30
  },
  commento_clinico: "Questo pasto genera una risposta glicemica marcata a causa dei carboidrati combinati con grassi. Applicando il pre-carico di verdura e una camminata post-prandiale, i trasportatori muscolari GLUT4 consentono di mantenere la glicemia stabilmente entro la soglia di 180 mg/dL."
};

const TREND_OPTIONS = [
  { id: 'RAPIDA_SALITA', label: 'Rapida Salita', freccia: '↑↑', desc: 'Forte pendenza in ascesa' },
  { id: 'IN_SALITA', label: 'In Salita', freccia: '↗', desc: 'Tendenza in ascesa' },
  { id: 'STABILE', label: 'Stabile', freccia: '→', desc: 'Valore stazionario' },
  { id: 'IN_DISCESA', label: 'In Discesa', freccia: '↘', desc: 'Tendenza in calo' },
];

export default function App() {
  // Stato Schede / Pagine
  const [schedaAttiva, setSchedaAttiva] = useState('home'); // 'home' | 'pasto' | 'curva' | 'bolo'

  // Stato apertura Chat Coach (Fissata sullo schermo con toggle apri/chiudi)
  const [chatAperta, setChatAperta] = useState(true);

  // Stato Clinico, Pasto e Orizzonte Temporale
  const [glicemia, setGlicemia] = useState(115);
  const [trendCgm, setTrendCgm] = useState('STABILE');
  const [tempoTargetMin, setTempoTargetMin] = useState(60); // Orizzonte temporale di previsione (minuti post-pasto)
  const [simulatoreCgm, setSimulatoreCgm] = useState(false);
  const [predizioneAi, setPredizioneAi] = useState(null);
  const [loadingPredizione, setLoadingPredizione] = useState(false);
  const [demoId, setDemoId] = useState('pasta');
  const [loading, setLoading] = useState(false);
  const [usaHack1, setUsaHack1] = useState(false);
  const [usaHack2, setUsaHack2] = useState(false);
  const [backendConnesso, setBackendConnesso] = useState(false);
  const [anteprimaFoto, setAnteprimaFoto] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Tutti');
  const [cercaPiatto, setCercaPiatto] = useState('');

  // Parametri Clinici del Paziente
  const [impostazioni, setImpostazioni] = useState({
    targetGlicemico: 100, // mg/dL
    rapportoIC: 10,        // 1U ogni 10g CHO
    fsi: 40,               // 1U abbassa 40 mg/dL
    iob: 0.8               // Insulina Attiva (U)
  });

  // Configurazione AI (Locale Ollama / LM Studio, Cloud, Offline)
  const [aiConfig, setAiConfig] = useState(() => {
    const salvato = localStorage.getItem('gluco_ai_config');
    if (salvato) {
      try { return JSON.parse(salvato); } catch (e) {}
    }
    return {
      provider: 'auto',
      localUrl: 'http://localhost:11434',
      localModel: 'gemma2:2b',
      apiKey: ''
    };
  });
  const [aiStatus, setAiStatus] = useState(null);
  const [mostraModalAi, setMostraModalAi] = useState(false);
  const [loadingVerificaAi, setLoadingVerificaAi] = useState(false);
  const [mostraModalVision, setMostraModalVision] = useState(false);
  const [visionNomeInput, setVisionNomeInput] = useState('');
  const [visionCarbsInput, setVisionCarbsInput] = useState(65);

  const salvaAiConfig = (nuovaConfig) => {
    setAiConfig(nuovaConfig);
    localStorage.setItem('gluco_ai_config', JSON.stringify(nuovaConfig));
  };

  const verificaStatoAi = async (customUrl = null) => {
    setLoadingVerificaAi(true);
    try {
      const url = customUrl !== null ? customUrl : aiConfig.localUrl;
      const res = await fetch(`http://localhost:8000/api/ai/status?local_url=${encodeURIComponent(url || '')}`);
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
        setBackendConnesso(true);
        if (data?.ai?.local_server?.available && data?.ai?.local_server?.models?.length > 0) {
          const models = data.ai.local_server.models;
          if (!models.includes(aiConfig.localModel)) {
            setAiConfig(prev => {
              const updated = { ...prev, localModel: models[0] };
              localStorage.setItem('gluco_ai_config', JSON.stringify(updated));
              return updated;
            });
          }
        }
      }
    } catch (e) {
      // Backend o server locale non raggiungibile
    } finally {
      setLoadingVerificaAi(false);
    }
  };

  useEffect(() => {
    verificaStatoAi();
  }, []);

  const [risultato, setRisultato] = useState({
    meal: DEMO_MEALS_DATA.pasta,
    coach: DEFAULT_COACH_DATA
  });

  // Funzione di analisi pasto (supporta modelli di visione locali Ollama llava e Cloud)
  const analizzaPasto = async (idPiatto = demoId, fileFoto = null, customName = null, customCarbs = null) => {
    setLoading(true);

    if (fileFoto) {
      const reader = new FileReader();
      reader.onload = (e) => setAnteprimaFoto(e.target.result);
      reader.readAsDataURL(fileFoto);
    } else if (fileFoto === false) {
      setAnteprimaFoto(null);
    }

    const targetDemoId = idPiatto || 'pasta';
    const formData = new FormData();
    formData.append('glicemia_base', glicemia);
    formData.append('demo_id', targetDemoId);
    formData.append('provider', aiConfig.provider);
    formData.append('local_url', aiConfig.localUrl || '');
    formData.append('local_model', aiConfig.localModel || '');
    if (aiConfig.apiKey) formData.append('api_key', aiConfig.apiKey);
    if (fileFoto) formData.append('file', fileFoto);
    if (customName) formData.append('custom_name', customName);
    if (customCarbs !== null && customCarbs !== undefined) formData.append('custom_carbs', customCarbs);

    try {
      const controller = new AbortController();
      // Timeout permissivo (25 secondi) per consentire l'inferenza anche a modelli locali su CPU
      const timeoutMs = 25000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const mealData = data.meal || (fileFoto ? {
          nome_piatto: "Pasto da Immagine",
          etichetta: "Foto Pasto",
          carboidrati_g: 65,
          fibre_g: 5,
          grassi_g: 18,
          proteine_g: 22,
          indice_glicemico: 65
        } : (DEMO_MEALS_DATA[targetDemoId] || DEMO_MEALS_DATA.pasta));

        setRisultato({
          meal: { ...mealData, icon: (fileFoto || anteprimaFoto) ? Camera : (DEMO_MEALS_DATA[targetDemoId]?.icon || Utensils) },
          coach: data.coach || DEFAULT_COACH_DATA
        });
        setVisionNomeInput(mealData.nome_piatto || '');
        setVisionCarbsInput(mealData.carboidrati_g || 65);
        setBackendConnesso(true);
      } else {
        throw new Error('Risposta HTTP non valida');
      }
    } catch (err) {
      setBackendConnesso(false);
      const pastoScelto = fileFoto ? {
        nome_piatto: "Pasto da Immagine",
        etichetta: "Foto Pasto",
        carboidrati_g: 65,
        fibre_g: 5,
        grassi_g: 18,
        proteine_g: 20,
        indice_glicemico: 65,
        icon: Camera
      } : (DEMO_MEALS_DATA[targetDemoId] || DEMO_MEALS_DATA.pasta);

      setRisultato({
        meal: pastoScelto,
        coach: {
          ...DEFAULT_COACH_DATA,
          commento_clinico: `Partendo da ${glicemia} mg/dL, i ${pastoScelto.carboidrati_g}g di carboidrati e ${pastoScelto.grassi_g}g di grassi di ${pastoScelto.nome_piatto} produrranno un aumento glicemico progressivo. Consigliati pre-carico di fibre e camminata attiva.`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analizzaPasto(demoId);
  }, [demoId, aiConfig.provider, aiConfig.localModel]);

  // 1. Simulatore dinamico di telemetria CGM Live
  useEffect(() => {
    if (!simulatoreCgm) return;
    const interval = setInterval(() => {
      setGlicemia(prev => {
        let delta = 0;
        if (trendCgm === 'RAPIDA_SALITA') delta = 5;
        else if (trendCgm === 'IN_SALITA') delta = 3;
        else if (trendCgm === 'IN_DISCESA') delta = -3;
        else delta = Math.random() > 0.5 ? 1 : -1;
        return Math.min(240, Math.max(70, prev + delta));
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [simulatoreCgm, trendCgm]);

  // 2. Predizione AI Automatica guidata dal sensore CGM e orizzonte temporale (tempo_min)
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setLoadingPredizione(true);
      try {
        const res = await fetch('http://localhost:8000/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            glicemia_cgm: glicemia,
            trend_cgm: trendCgm,
            meal: risultato.meal,
            usa_hack1: usaHack1,
            usa_hack2: usaHack2,
            tempo_min: tempoTargetMin,
            provider: aiConfig.provider,
            local_url: aiConfig.localUrl,
            local_model: aiConfig.localModel,
            api_key: aiConfig.apiKey
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setPredizioneAi(data);
            setBackendConnesso(true);
          }
        }
      } catch (err) {
        // Mantiene fallback locale
      } finally {
        if (!isCancelled) setLoadingPredizione(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [glicemia, trendCgm, risultato.meal, usaHack1, usaHack2, tempoTargetMin, aiConfig]);

  const { meal, coach } = risultato;
  const localCurva = generaDatiCurva(glicemia, meal, coach, usaHack1, usaHack2);

  // Unione intelligente dei dati: usa la traiettoria AI predittiva del backend se disponibile
  const datiCurva = predizioneAi?.punti || localCurva.punti;
  const tPiccoStd = predizioneAi?.t_picco_std ?? localCurva.tPiccoStd;
  const tPiccoOpt = predizioneAi?.t_picco_opt ?? localCurva.tPiccoOpt;
  const piccoStd = predizioneAi?.picco_std ?? Math.max(...datiCurva.map(d => d.standard));
  const piccoOpt = predizioneAi?.picco_opt ?? Math.max(...datiCurva.map(d => d.ottimizzata));
  const deltaPicco = Math.max(0, piccoStd - piccoOpt);

  // Calcolo valore stimato puntuale al minuto desiderato (tempoTargetMin)
  const puntoTarget = datiCurva.find(d => d.minuti === tempoTargetMin) ||
    datiCurva.reduce((prev, curr) => Math.abs(curr.minuti - tempoTargetMin) < Math.abs(prev.minuti - tempoTargetMin) ? curr : prev, datiCurva[0]);

  const valStdPuntuale = predizioneAi?.stima_al_tempo?.standard ?? puntoTarget?.standard ?? glicemia;
  const valOptPuntuale = predizioneAi?.stima_al_tempo?.ottimizzata ?? puntoTarget?.ottimizzata ?? glicemia;
  const deltaStdPuntuale = valStdPuntuale - glicemia;
  const deltaOptPuntuale = valOptPuntuale - glicemia;
  const risparmioPuntuale = Math.max(0, valStdPuntuale - valOptPuntuale);

  const stimaPuntuale = {
    minuti: tempoTargetMin,
    standard: valStdPuntuale,
    ottimizzata: valOptPuntuale,
    delta_standard: deltaStdPuntuale,
    delta_ottimizzata: deltaOptPuntuale,
    risparmio_mg_dl: risparmioPuntuale,
    in_target_standard: valStdPuntuale >= 70 && valStdPuntuale <= 180,
    in_target_ottimizzata: valOptPuntuale >= 70 && valOptPuntuale <= 180,
  };

  // Time-in-Range (70 - 180 mg/dL)
  const tirStd = predizioneAi?.tir_std ?? Math.round((datiCurva.filter(d => d.standard >= 70 && d.standard <= 180).length / datiCurva.length) * 100);
  const tirOpt = predizioneAi?.tir_opt ?? Math.round((datiCurva.filter(d => d.ottimizzata >= 70 && d.ottimizzata <= 180).length / datiCurva.length) * 100);
  const gainTir = Math.max(0, tirOpt - tirStd);

  // Time-in-Tight-Range (TITR: 70 - 140 mg/dL - Consenso Internazionale ATTD / ADA)
  const titrStd = predizioneAi?.titr_std ?? Math.round((datiCurva.filter(d => d.standard >= 70 && d.standard <= 140).length / datiCurva.length) * 100);
  const titrOpt = predizioneAi?.titr_opt ?? Math.round((datiCurva.filter(d => d.ottimizzata >= 70 && d.ottimizzata <= 140).length / datiCurva.length) * 100);
  const gainTitr = Math.max(0, titrOpt - titrStd);

  // Coefficiente di Variabilità Glicemica (CV% Target <= 36%)
  const calcolaCV = (puntiArray) => {
    if (!puntiArray || puntiArray.length === 0) return 0;
    const media = puntiArray.reduce((a, b) => a + b, 0) / puntiArray.length;
    const sd = Math.sqrt(puntiArray.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / puntiArray.length);
    return Math.round((sd / media) * 1000) / 10;
  };
  const cvStd = predizioneAi?.cv_std ?? calcolaCV(datiCurva.map(d => d.standard));
  const cvOpt = predizioneAi?.cv_opt ?? calcolaCV(datiCurva.map(d => d.ottimizzata));

  // Allerte Cliniche Precoci Predittive
  const minOttimizzata = Math.min(...datiCurva.map(d => d.ottimizzata));
  const allertePrecoci = predizioneAi?.allerte_precoci ?? {
    ipo_prevista: minOttimizzata < 70,
    severita_ipo: minOttimizzata < 54 ? 'SEVERA (<54 mg/dL)' : (minOttimizzata < 70 ? 'MODERATA (54-69 mg/dL)' : 'NESSUNA'),
    iper_prevista: piccoStd > 180,
    severita_iper: piccoStd > 250 ? 'SEVERA (>250 mg/dL)' : (piccoStd > 180 ? 'MODERATA (181-250 mg/dL)' : 'NESSUNA'),
    stabilita_cv: cvOpt <= 36.0 ? 'STABILE (<=36%)' : 'ELEVATA_VARIABILITA (>36%)',
    velocita_ascesa_mg_dl_min: Math.round(((piccoStd - glicemia) / Math.max(25, tPiccoStd)) * 10) / 10
  };

  // Proiezione orario reale dell'orologio (orario attuale + minuti selezionati)
  const [oraCorrente, setOraCorrente] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setOraCorrente(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const oraProiezione = new Date(oraCorrente.getTime() + tempoTargetMin * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const oraInizioPasto = oraCorrente.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Calcolo Bolo Rapido per la Home
  const boloPasto = (meal.carboidrati_g / impostazioni.rapportoIC);
  const deltaGli = Math.max(0, glicemia - impostazioni.targetGlicemico);
  const boloCorrezione = deltaGli / impostazioni.fsi;
  const subtotaleBolo = boloPasto + boloCorrezione;
  const scontoMoto = usaHack2 ? (subtotaleBolo * 0.20) : 0;
  const boloRapidoTotale = Math.max(0, subtotaleBolo - impostazioni.iob - scontoMoto);
  const boloRapidoArrotondato = Math.round(boloRapidoTotale * 10) / 10;
  const richiedeDualWave = meal.grassi_g >= 20;

  // Badge cromatico glicemia intuitivo e umano (Daylight Consumer Health)
  const getGlicemiaInfo = (val) => {
    if (val < 70) return { testo: 'Bassa (Attenzione)', classe: 'text-amber-800 border-amber-200 bg-amber-50' };
    if (val <= 140) return { testo: 'Ottimale', classe: 'text-teal-800 border-teal-200 bg-teal-50' };
    if (val <= 180) return { testo: 'Normale post-pasto', classe: 'text-slate-700 border-slate-200 bg-slate-100' };
    return { testo: 'Alta', classe: 'text-rose-800 border-rose-200 bg-rose-50' };
  };

  const glicemiaInfo = getGlicemiaInfo(glicemia);

  // Stili e dettagli per i livelli di rischio metabolico (Daylight Consumer Health)
  const getRischioDetails = (livello) => {
    switch (livello) {
      case 'CRITICO':
        return {
          pill: 'bg-rose-50 text-rose-800 border-rose-200 shadow-xs',
          alertBox: 'bg-rose-50/80 border-rose-200 text-rose-900',
          glow: 'from-rose-500/10 via-rose-500/5 to-transparent',
          Icon: AlertTriangle
        };
      case 'ELEVATO':
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs',
          alertBox: 'bg-amber-50/80 border-amber-200 text-amber-900',
          glow: 'from-amber-500/10 via-amber-500/5 to-transparent',
          Icon: AlertCircle
        };
      case 'MEDIO':
        return {
          pill: 'bg-sky-50 text-sky-800 border-sky-200 shadow-xs',
          alertBox: 'bg-sky-50/80 border-sky-200 text-sky-900',
          glow: 'from-sky-500/10 via-sky-500/5 to-transparent',
          Icon: Info
        };
      case 'BASSO':
      default:
        return {
          pill: 'bg-teal-50 text-teal-800 border-teal-200 shadow-xs',
          alertBox: 'bg-teal-50/80 border-teal-200 text-teal-900',
          glow: 'from-teal-500/10 via-teal-500/5 to-transparent',
          Icon: CheckCircle2
        };
    }
  };

  // Definizioni Schede / Pagine (5 schede operative con Pagina Info Clinica)
  const SCHEDE = [
    { id: 'home', label: 'Stima Glicemia a Tempo', icon: Clock, badge: `+${tempoTargetMin}m` },
    { id: 'pasto', label: 'Analisi Pasto', icon: Utensils, badge: `${meal.carboidrati_g}g CHO` },
    { id: 'curva', label: 'Curva & Trend', icon: LineChart, badge: `${tirOpt}% TIR` },
    { id: 'bolo', label: 'Calcolatore Bolo', icon: Syringe, badge: `${boloRapidoArrotondato} U` },
    { id: 'info', label: 'Info & Clinica', icon: HelpCircle, badge: 'AZT1D' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500/20 selection:text-teal-900 pb-28 lg:pb-12">
      {/* =========================================================================
          TOP NAVBAR: Header + CGM Quick Bar + Schede (Daylight Consumer Health)
          ========================================================================= */}
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
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition border bg-slate-50 hover:bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:text-slate-900 shadow-2xs group"
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
                className={`flex px-3.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-2 transition border ${
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

        {/* =========================================================================
            BARRA DELLE PAGINE / SCHEDE DI NAVIGAZIONE
            ========================================================================= */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SCHEDE.map(tab => {
            const Icon = tab.icon;
            const isAttiva = schedaAttiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSchedaAttiva(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
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

      {/* =========================================================================
          CONTENUTO PRINCIPALE A SCHEDE (Zero Sovrapposizione: Spazio Riservato Esclusivo)
          ========================================================================= */}
      <div className={`transition-all duration-300 ${
        chatAperta ? 'lg:pr-[415px] xl:pr-[445px]' : ''
      }`}>
        <main className="max-w-5xl xl:max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

            {/* ===================================================================
                SCHEDA 1: HOME (PANORAMICA QUOTIDIANA & FUNZIONALITÀ RAPIDE)
                =================================================================== */}
            {schedaAttiva === 'home' && (
              <div className="space-y-6">
                {/* ===================================================================
                    1. HERO: SIMULATORE PREVENTIVO PRE-PASTO (Previsione Futura a Tempo)
                    =================================================================== */}
                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
                          <Clock className="w-5 h-5" />
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          Simulatore Preventivo Pre-Pasto
                        </h2>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          Previsione Futura (t = 0)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Si usa <strong>prima di mangiare</strong> (inizio pasto: <strong>{oraInizioPasto}</strong>). Seleziona i minuti per vedere dove andrà la glicemia.
                      </p>
                    </div>

                    {/* Indicatore Orizzonte Temporale con orario reale */}
                    <div className="flex items-center gap-2 bg-teal-50/80 px-3.5 py-1.5 rounded-xl border border-teal-200 shrink-0 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-teal-700" />
                      <span className="text-xs text-slate-600">Proiezione:</span>
                      <span className="text-base font-extrabold font-mono text-teal-800">+{tempoTargetMin}m</span>
                      <span className="text-xs font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200 shadow-2xs">alle {oraProiezione}</span>
                    </div>
                  </div>

                  {/* Griglia: Risultato a Grande Display + Selettore Tempo */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Grande Box Risultato */}
                    <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1.5">
                          <span>Glicemia Prevista a +{tempoTargetMin} min</span>
                          <span className="text-teal-700 font-mono font-bold">(ore {oraProiezione})</span>
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          stimaPuntuale.in_target_ottimizzata
                            ? 'bg-teal-50 text-teal-800 border-teal-300'
                            : (stimaPuntuale.ottimizzata > 180 ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-amber-50 text-amber-800 border-amber-300')
                        }`}>
                          {stimaPuntuale.in_target_ottimizzata ? '✓ Nel Target Bersaglio (70-180)' : (stimaPuntuale.ottimizzata > 180 ? '⚠ Oltre Soglia Iperglicemica' : '⚠ Rischio Ipoglicemia')}
                        </span>
                      </div>

                      {/* Valore Gigante */}
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className={`text-6xl sm:text-7xl font-extrabold font-mono tracking-tight ${
                          usaHack1 || usaHack2 ? 'text-teal-700' : 'text-slate-900'
                        }`}>
                          {usaHack1 || usaHack2 ? stimaPuntuale.ottimizzata : stimaPuntuale.standard}
                        </span>
                        <span className="text-lg text-slate-500 font-mono font-bold">mg/dL</span>

                        {/* Variazione da inizio pasto */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono shadow-xs">
                          <span className="text-slate-500">da inizio ({glicemia}):</span>
                          {(() => {
                            const conConsigli = usaHack1 || usaHack2;
                            const deltaVis = conConsigli ? stimaPuntuale.delta_ottimizzata : stimaPuntuale.delta_standard;
                            return (
                              <strong className={conConsigli ? 'text-teal-700 font-bold' : (deltaVis >= 0 ? 'text-rose-600 font-bold' : 'text-teal-700 font-bold')}>
                                {deltaVis >= 0 ? `+${deltaVis}` : deltaVis} mg/dL
                              </strong>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Confronto Dettagliato Senza vs Con Interventi */}
                      <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                          <span className="text-slate-500 block text-[11px] mb-0.5">Senza Interventi (Standard):</span>
                          <span className="text-rose-600 font-mono font-black text-lg">{stimaPuntuale.standard} mg/dL</span>
                        </div>
                        <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-200 shadow-xs">
                          <span className="text-teal-800 block text-[11px] mb-0.5 font-medium">Con Interventi Metabolici:</span>
                          <span className="text-teal-700 font-mono font-black text-lg">{stimaPuntuale.ottimizzata} mg/dL</span>
                          {stimaPuntuale.risparmio_mg_dl > 0 && (
                            <span className="text-[11px] text-teal-800 font-mono block mt-0.5 font-bold">
                              (-{stimaPuntuale.risparmio_mg_dl} mg/dL risparmiati!)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Box Selettore Tempo: Slider + Bottoni Rapidi */}
                    <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5 text-teal-600" />
                            Minuti dall'inizio del pasto ({oraInizioPasto}):
                          </span>
                          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                            +{tempoTargetMin} min ({oraProiezione})
                          </span>
                        </div>

                        {/* Griglia Bottoni Rapidi a 1-Tap */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {[15, 30, 45, 60, 90, 120, 150, 180].map((min) => (
                            <button
                              key={min}
                              onClick={() => setTempoTargetMin(min)}
                              className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition border ${
                                tempoTargetMin === min
                                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs scale-105'
                                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              +{min}m
                            </button>
                          ))}
                        </div>

                        {/* Slider Fluido Continuo */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span>+5 min</span>
                            <span className="text-slate-700 font-medium">Scorri per tempo preciso</span>
                            <span>+180 min (3h)</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="180"
                            step="5"
                            value={tempoTargetMin}
                            onChange={(e) => setTempoTargetMin(Number(e.target.value))}
                            className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Commento Clinico per questo tempo */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-xs">
                        <div className="flex items-center gap-1.5 text-teal-700 font-semibold mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Cinetica al minuto +{tempoTargetMin}:</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {predizioneAi?.spiegazione_cinetica || 
                            `A +${tempoTargetMin} minuti, i ${meal.carboidrati_g}g di carboidrati portano la stima a ${stimaPuntuale.standard} mg/dL (oppure ${stimaPuntuale.ottimizzata} mg/dL con interventi metabolici).`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===================================================================
                    2. INGRESSI CLINICI CHIAVE: Sensore CGM Attuale & Pasto Selezionato
                    =================================================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                  {/* 2A: Sensore CGM Attuale */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-teal-600" />
                          Sensore CGM Attuale (t = 0)
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${glicemiaInfo.classe}`}>
                          {glicemiaInfo.testo}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-3 mt-3">
                        <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900">{glicemia}</span>
                        <span className="text-sm font-bold text-slate-400 font-mono">mg/dL</span>

                        {/* Tendenza Sensore */}
                        <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5 ml-auto">
                          {TREND_OPTIONS.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => setTrendCgm(opt.id)}
                              title={`${opt.label} - ${opt.desc}`}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                                trendCgm === opt.id
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                              }`}
                            >
                              {opt.freccia}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Controlli Rapidi: Step [-5] [+5], Valori Frequenti e Simulatore */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-1">
                          <button
                            onClick={() => setGlicemia(prev => Math.max(70, prev - 5))}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                            title="Diminuisci 5 mg/dL"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-700">±5</span>
                          <button
                            onClick={() => setGlicemia(prev => Math.min(220, prev + 5))}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                            title="Aumenta 5 mg/dL"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Valori Frequenti */}
                        <div className="flex items-center gap-1">
                          {[90, 115, 140, 175].map(val => (
                            <button
                              key={val}
                              onClick={() => setGlicemia(val)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                glicemia === val
                                  ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>

                        {/* Toggle Simulatore Flusso */}
                        <button
                          onClick={() => setSimulatoreCgm(!simulatoreCgm)}
                          title={simulatoreCgm ? "Ferma flusso simulato" : "Simula andamento sensore continuo"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            simulatoreCgm
                              ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-xs'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white'
                          }`}
                        >
                          {simulatoreCgm ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                              <span>Live ON</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-slate-500" />
                              <span>Simula CGM</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Slider per regolazione fine */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">70</span>
                        <input
                          type="range"
                          min="70"
                          max="220"
                          value={glicemia}
                          onChange={e => setGlicemia(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                        />
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">220</span>
                      </div>
                    </div>
                  </div>

                  {/* 2B: Pasto Attuale & Preset Rapidi */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-teal-600" />
                          Pasto Scelto
                        </span>
                        <button
                          onClick={() => setSchedaAttiva('pasto')}
                          className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-0.5"
                        >
                          <span>Tutti i pasti ({Object.keys(DEMO_MEALS_DATA).length})</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Il grande tasto pasto selezionato */}
                      <button
                        onClick={() => setSchedaAttiva('pasto')}
                        className="w-full mt-3 bg-slate-50 hover:bg-teal-50/40 border border-slate-200 hover:border-teal-300 rounded-xl p-3 flex items-center justify-between transition-all group text-left shadow-xs"
                        title="Tocca per cambiare pasto o analizzare con foto"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition shadow-xs">
                            {(() => {
                              const CurrentMealIcon = meal.icon || DEMO_MEALS_DATA[demoId]?.icon || Utensils;
                              return <CurrentMealIcon className="w-5 h-5" />;
                            })()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-900 truncate group-hover:text-teal-800 transition">
                              {meal.nome_piatto}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                              <span className="text-teal-700 font-bold">{meal.carboidrati_g}g carboidrati</span>
                              <span>•</span>
                              <span className="text-slate-500">{meal.grassi_g}g grassi</span>
                              <span>•</span>
                              <span className="text-slate-500">IG {meal.indice_glicemico}</span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 ml-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-xs">
                          <span>Cambia</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    </div>

                    {/* Barra di Selezione Rapida dei Preset */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 px-0.5">
                        <span className="font-semibold">Preset Rapidi 1-Tap:</span>
                        <span className="text-[10px] text-slate-400">Tocca per simulare subito</span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                        {Object.entries(DEMO_MEALS_DATA).map(([id, info]) => {
                          const ItemIcon = info.icon || Utensils;
                          const isSelected = demoId === id && !anteprimaFoto;
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                setDemoId(id);
                                setUsaHack1(false);
                                setUsaHack2(false);
                                setAnteprimaFoto(null);
                              }}
                              title={`${info.nome_piatto} • ${info.carboidrati_g}g CHO • IG ${info.indice_glicemico}`}
                              className={`py-1.5 px-2.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border shrink-0 ${
                                isSelected
                                  ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-2xs ring-2 ring-teal-500/20'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                              <span>{info.etichetta}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                                isSelected ? 'bg-teal-700/80 text-teal-100' : 'bg-slate-200/60 text-slate-600'
                              }`}>
                                {info.carboidrati_g}g
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===================================================================
                    3. STRATEGIA CLINICA, INTERVENTI METABOLICI & STIMA RAPIDA BOLO
                    =================================================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* 3A: Consiglio Coach AI & Interventi Rapidi (Fibre + Camminata) */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                    {/* Banner Coach AI */}
                    {(() => {
                      const consiglio = predizioneAi?.consiglio_prioritario || (piccoStd > 180 ? "Una camminata di 15 min dopo mangiato aiuterà a mantenere la glicemia stabile." : "La risposta glicemica per questo piatto è ottimale.");
                      return (
                        <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white text-teal-700 border border-teal-200 shrink-0 shadow-xs mt-0.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-teal-900">Consiglio Personalizzato Gluco</span>
                              {loadingPredizione && (
                                <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  Ricalcolo...
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-teal-950 mt-1 leading-relaxed">
                              Con <strong className="text-teal-950 font-bold">{meal.nome_piatto}</strong> la glicemia standard toccherebbe <strong className="text-teal-900 font-bold">{piccoStd} mg/dL</strong>. {consiglio}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Due Abitudini / Interventi Metabolici a Tasto */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          Interventi Metabolici Attivabili
                        </span>
                        {(usaHack1 || usaHack2) && (
                          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                            -{deltaPicco} mg/dL sul picco!
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Toggle Fibre */}
                        <button
                          onClick={() => setUsaHack1(!usaHack1)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                            usaHack1
                              ? 'bg-teal-50/80 border-teal-300 text-teal-900 shadow-xs ring-2 ring-teal-500/20'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${usaHack1 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                              <Salad className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">Verdura prima del pasto</div>
                              <div className="text-[10px] text-slate-500">Rallenta l'assorbimento (-22% picco)</div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${usaHack1 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                            {usaHack1 ? 'ATTIVO' : 'OFF'}
                          </span>
                        </button>

                        {/* Toggle Camminata */}
                        <button
                          onClick={() => setUsaHack2(!usaHack2)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                            usaHack2
                              ? 'bg-teal-50/80 border-teal-300 text-teal-900 shadow-xs ring-2 ring-teal-500/20'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${usaHack2 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                              <Footprints className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">15m camminata post-pasto</div>
                              <div className="text-[10px] text-slate-500">Stimolo recettori GLUT4 (-30% picco)</div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${usaHack2 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                            {usaHack2 ? 'ATTIVO' : 'OFF'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3B: Stima Rapida del Bolo Insulinico */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between text-xs px-0.5">
                      <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Syringe className="w-3.5 h-3.5 text-teal-600" />
                        Stima Rapida Bolo
                      </span>
                      <button
                        onClick={() => setSchedaAttiva('bolo')}
                        className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-0.5"
                      >
                        <span>Calcolatore completo</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Box valore dose */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dose Consigliata</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-teal-700">{boloRapidoArrotondato}</span>
                          <span className="text-xs text-slate-500 font-semibold">Unità (U)</span>
                          {usaHack2 && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                              -20% Moto
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-600 border-l border-slate-200 pl-3 space-y-0.5 font-medium">
                        <div>Pasto: <strong className="text-slate-900">{boloPasto.toFixed(1)}U</strong></div>
                        <div>Corr: <strong className="text-slate-900">+{boloCorrezione.toFixed(1)}U</strong></div>
                        <div>IOB: <strong className="text-slate-900">-{impostazioni.iob}U</strong></div>
                      </div>
                    </div>

                    {/* Avviso o parametri paziente */}
                    {richiedeDualWave ? (
                      <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                        <span>Pasto ricco di grassi ({meal.grassi_g}g): consigliata dose prolungata/dual-wave.</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                        <span>Target: <strong className="text-slate-800 font-semibold">{impostazioni.targetGlicemico}</strong> mg/dL</span>
                        <span>1U ogni <strong className="text-slate-800 font-semibold">{impostazioni.rapportoIC}g CHO</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ===================================================================
                    4. CURVA GLICEMICA & INDICATORI CHIAVE (KPI)
                    =================================================================== */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  {/* Valori Chiave (KPI) Metabolici Avanzati */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Picco Normale</div>
                      <div className="text-xl font-bold text-rose-700 mt-0.5">{piccoStd} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
                      <div className="text-[9px] text-slate-500">tra circa {tPiccoStd} min</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Picco con Consigli</div>
                      <div className="text-xl font-bold text-teal-700 mt-0.5">{piccoOpt} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
                      <div className="text-[9px] text-slate-500">tra circa {tPiccoOpt} min</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Risparmio Picco</div>
                      <div className="text-xl font-bold text-sky-700 mt-0.5">-{deltaPicco} <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
                      <div className="text-[9px] text-sky-700 font-semibold">{deltaPicco > 0 ? 'Curva appiattita' : 'Nessun consiglio attivo'}</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Time-in-Range (70-180)</div>
                      <div className="text-xl font-bold text-teal-700 mt-0.5">{tirOpt}%</div>
                      <div className="text-[9px] text-teal-700 font-semibold">{gainTir > 0 ? `+${gainTir}% con consigli` : 'Standard'}</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Target Stretto (70-140)</div>
                      <div className="text-xl font-bold text-indigo-700 mt-0.5">{titrOpt}%</div>
                      <div className="text-[9px] text-indigo-700 font-semibold">{gainTitr > 0 ? `+${gainTitr}% con consigli` : 'Standard TITR'}</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Variabilità CV%</div>
                      <div className={`text-xl font-bold mt-0.5 ${cvOpt <= 36 ? 'text-teal-700' : 'text-amber-700'}`}>{cvOpt}%</div>
                      <div className={`text-[9px] font-semibold ${cvOpt <= 36 ? 'text-teal-700' : 'text-amber-700'}`}>
                        {cvOpt <= 36 ? 'Stabile (<=36%)' : 'Variabilità elevata'}
                      </div>
                    </div>
                  </div>

                  {/* Banner Allerte Precoci Predittive */}
                  {(allertePrecoci?.ipo_prevista || (allertePrecoci?.iper_prevista && piccoStd > 200) || cvOpt > 36) && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      allertePrecoci?.ipo_prevista 
                        ? 'bg-amber-50 border-amber-200 text-amber-900' 
                        : (allertePrecoci?.iper_prevista && piccoStd > 220 
                            ? 'bg-rose-50 border-rose-200 text-rose-900' 
                            : 'bg-teal-50 border-teal-200 text-teal-900')
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${allertePrecoci?.ipo_prevista ? 'text-amber-600' : (allertePrecoci?.iper_prevista && piccoStd > 220 ? 'text-rose-600' : 'text-teal-600')}`} />
                        <div>
                          <span className="font-bold mr-1">
                            {allertePrecoci?.ipo_prevista ? 'Allerta Ipoglicemia:' : (allertePrecoci?.iper_prevista && piccoStd > 220 ? 'Allerta Iperglicemia:' : 'Stabilità Glicemica:')}
                          </span>
                          <span>
                            {allertePrecoci?.ipo_prevista 
                              ? `Rischio calo glicemico sotto 70 mg/dL (${allertePrecoci.severita_ipo}). Tieni pronti 15g di zuccheri rapidi.`
                              : (allertePrecoci?.iper_prevista && piccoStd > 220 
                                  ? `Picco previsto a ${piccoStd} mg/dL (ascesa +${allertePrecoci.velocita_ascesa_mg_dl_min} mg/dL/min). Pre-carico di fibre e moto GLUT4 raccomandati.`
                                  : `Variabilità glicemica ${cvOpt}%. Gli interventi metabolici contengono le oscillazioni.`)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSchedaAttiva('curva')}
                        className="text-[11px] font-bold underline shrink-0 hover:opacity-80"
                      >
                        Vedi Curva
                      </button>
                    </div>
                  )}

                  {/* Header Grafico */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-600" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        Andamento previsto della glicemia
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> Standard
                      </span>
                      <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-teal-600"></span> Con consigli Gluco
                      </span>
                    </div>
                  </div>

                  {/* Recharts Component */}
                  <GlucoseChart
                    data={datiCurva}
                    mostraOttimizzata={usaHack1 || usaHack2}
                    tempoTargetMin={tempoTargetMin}
                  />
                </div>
              </div>
            )}

            {/* ===================================================================
                SCHEDA 2: ANALISI PASTO & VISION AGENT
                =================================================================== */}
            {schedaAttiva === 'pasto' && (
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
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 border ${
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
                          const isSelected = demoId === id && !anteprimaFoto;
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
                              className={`p-3 rounded-2xl text-left transition flex flex-col justify-between gap-2.5 border group relative ${
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
                            className="px-3 py-1 rounded-xl text-[11px] font-bold bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 shadow-2xs transition"
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
            )}

            {/* ===================================================================
                SCHEDA 3: CURVA & TREND GLICEMICO COMPLETO
                =================================================================== */}
            {schedaAttiva === 'curva' && (
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
                  {(() => {
                    const livelloRischio = predizioneAi?.livello_rischio || (piccoStd > 220 ? 'CRITICO' : piccoStd > 180 ? 'ELEVATO' : piccoStd > 140 ? 'MEDIO' : 'BASSO');
                    const { pill, alertBox, Icon: RiskIcon } = getRischioDetails(livelloRischio);
                    const allerta = predizioneAi?.allerta_proattiva || `Sensore a ${glicemia} mg/dL (${trendCgm}): picco previsto a ${piccoStd} mg/dL.`;

                    return (
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
                    );
                  })()}

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
            )}

            {/* ===================================================================
                SCHEDA 4: CALCOLATORE BOLO TRASPARENTE
                =================================================================== */}
            {schedaAttiva === 'bolo' && (
              <div className="space-y-6">
                <BolusCalculator
                  glicemia={glicemia}
                  carbs={meal.carboidrati_g}
                  grassi={meal.grassi_g}
                  usaHackMoto={usaHack2}
                  impostazioni={impostazioni}
                  setImpostazioni={setImpostazioni}
                />
              </div>
            )}

            {/* ===================================================================
                SCHEDA 5: PAGINA INFORMAZIONI CLINICHE & VALIDAZIONE SCIENTIFICA
                =================================================================== */}
            {schedaAttiva === 'info' && (
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
            )}
          </main>

        {/* Chat Coach per Tablet e Mobile (< lg): integrata nella pagina sotto la dashboard senza coprire nulla */}
        {chatAperta && (
          <div id="gluco-coach-chat-mobile" className="block lg:hidden px-4 sm:px-6 pb-8">
            <div className="max-w-5xl mx-auto pt-6 border-t border-slate-200">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Coach AI Gluco (Chat Clinica)
                  </span>
                </div>
                <button
                  onClick={() => setChatAperta(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-0.5 rounded-lg border border-slate-200"
                >
                  Chiudi Chat
                </button>
              </div>
              <ChatCoach
                glicemia={glicemia}
                meal={meal}
                coach={coach}
                usaHack1={usaHack1}
                usaHack2={usaHack2}
                impostazioni={impostazioni}
                datiCurva={datiCurva}
                piccoStd={piccoStd}
                piccoOpt={piccoOpt}
                tPiccoStd={tPiccoStd}
                tPiccoOpt={tPiccoOpt}
                tirStd={tirStd}
                tirOpt={tirOpt}
                aiConfig={aiConfig}
                className="h-[520px] border border-slate-200 shadow-sm"
                onChiudi={() => setChatAperta(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CHAT COACH AI DESKTOP: FISSATA SULLO SCHERMO NELLO SPAZIO DEDICATO (ZERO SOVRAPPOSIZIONE)
          ========================================================================= */}
      {chatAperta && (
        <aside
          id="gluco-coach-chat"
          className="hidden lg:flex fixed z-30 right-4 sm:right-5 top-[6.8rem] bottom-4 w-[385px] xl:w-[415px] flex-col transition-all duration-200"
        >
          <ChatCoach
            glicemia={glicemia}
            meal={meal}
            coach={coach}
            usaHack1={usaHack1}
            usaHack2={usaHack2}
            impostazioni={impostazioni}
            datiCurva={datiCurva}
            piccoStd={piccoStd}
            piccoOpt={piccoOpt}
            tPiccoStd={tPiccoStd}
            tPiccoOpt={tPiccoOpt}
            tirStd={tirStd}
            tirOpt={tirOpt}
            aiConfig={aiConfig}
            className="h-full border border-slate-200 shadow-lg"
            onChiudi={() => setChatAperta(false)}
          />
        </aside>
      )}

      {/* Pulsante Flottante a Scomparsa quando la chat è chiusa */}
      {!chatAperta && (
        <button
          onClick={() => setChatAperta(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xl hover:shadow-2xl hover:border-teal-300 transition group hover:scale-105"
          title="Apri Coach AI"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shadow-2xs">
            <Bot className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-xs font-bold text-slate-900">Apri Coach AI</span>
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
        </button>
      )}

      {/* =========================================================================
          MODAL CONFIGURAZIONE MOTORE AI (LOCALE OLLAMA / CLOUD / OFFLINE)
          ========================================================================= */}
      {mostraModalAi && (
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
                onClick={() => setMostraModalAi(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
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
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
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
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
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
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
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
                className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingVerificaAi ? 'animate-spin' : ''}`} />
                <span>Verifica Connessione</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostraModalAi(false);
                  analizzaPasto(demoId);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
              >
                Salva e Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL VISION AI: CONFERMA E REGOLAZIONE PORZIONE CARBOIDRATI
          ========================================================================= */}
      {mostraModalVision && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
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
                onClick={() => setMostraModalVision(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
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
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
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
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
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
                onClick={() => setMostraModalVision(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  setRisultato(prev => ({
                    ...prev,
                    meal: {
                      ...prev.meal,
                      nome_piatto: visionNomeInput || prev.meal.nome_piatto,
                      carboidrati_g: visionCarbsInput
                    }
                  }));
                  setMostraModalVision(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
              >
                Applica alla Curva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
