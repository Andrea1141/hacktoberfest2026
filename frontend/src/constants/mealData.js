import {
  Utensils,
  UtensilsCrossed,
  Soup,
  Pizza,
  Fish,
  Sandwich,
  Egg,
  Croissant,
  Salad
} from 'lucide-react';

export const CATEGORIE_PASTI = [
  'Tutti',
  'Primi Piatti',
  'Piatti Unici',
  'Colazione',
  'Leggero / Low-Carb'
];

export const DEMO_MEALS_DATA = {
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

export const DEFAULT_COACH_DATA = {
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

export const TREND_OPTIONS = [
  { id: 'RAPIDA_SALITA', label: 'Rapida Salita', freccia: '↑↑', desc: 'Forte pendenza in ascesa' },
  { id: 'IN_SALITA', label: 'In Salita', freccia: '↗', desc: 'Tendenza in ascesa' },
  { id: 'STABILE', label: 'Stabile', freccia: '→', desc: 'Valore stazionario' },
  { id: 'IN_DISCESA', label: 'In Discesa', freccia: '↘', desc: 'Tendenza in calo' },
];
