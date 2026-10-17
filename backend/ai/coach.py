import json
from .config import (
    genai,
    types,
    OpenAI,
    GEMMA_GENAI_MODEL,
    GEMMA_OPENROUTER_MODEL,
    get_effective_key,
)
from .utils import extract_json


def genera_hack_coach(meal: dict, glicemia: int, api_key: str) -> dict:
    """
    Genera due interventi comportamentali (hack) e un commento clinico per appiattire
    il picco glicemico post-prandiale usando Gemma 4.
    """
    carbs = meal.get("carboidrati_g", 70)
    grassi = meal.get("grassi_g", 20)
    fallback = {
        "hack_1": {
            "label": "🥗 Pre-carico di fibre (Verdura cruda 10 min prima)",
            "mod_fibre": 12,
            "rid_ig": 15,
        },
        "hack_2": {
            "label": "🚶‍♂️ 15 min di camminata attiva (30 min post-pasto)",
            "mult_picco": 0.68,
        },
        "commento_clinico": (
            f"Partendo da {glicemia} mg/dL, i {carbs}g di carboidrati spingeranno la curva "
            f"oltre la soglia di 180 mg/dL, mentre i {grassi}g di grassi prolungheranno la coda glicemica."
        ),
    }

    key = get_effective_key(api_key)
    if not key:
        return fallback

    prompt = f"""Paziente diabetico (glicemia attuale: {glicemia} mg/dL). Pasto: {json.dumps(meal, ensure_ascii=False)}.
Fornisci due micro-interventi metabolici (hack comportamentali o alimentari) e un commento clinico per appiattire il picco glicemico post-prandiale.
Restituisci ESCLUSIVAMENTE un JSON valido (niente dosi insulina, nessun testo all'infuori del JSON) con questa struttura:
{{
  "hack_1": {{"label": "consiglio cibo max 8 parole", "mod_fibre": 12, "rid_ig": 15}},
  "hack_2": {{"label": "consiglio moto max 8 parole", "mult_picco": 0.68}},
  "commento_clinico": "2 frasi cliniche sull'impatto metabolico."
}}"""

    try:
        if (key.startswith("sk-") or genai is None) and OpenAI is not None:
            client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=key)
            res = client.chat.completions.create(
                model=GEMMA_OPENROUTER_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            parsed = extract_json(res.choices[0].message.content or "")
        elif genai is not None:
            client = genai.Client(api_key=key)
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            )
            response = client.models.generate_content(
                model=GEMMA_GENAI_MODEL,
                contents=prompt,
                config=config,
            )
            parsed = extract_json(response.text or "")
        else:
            return fallback

        hack_1 = parsed.get("hack_1", {})
        hack_2 = parsed.get("hack_2", {})
        return {
            "hack_1": {
                "label": str(hack_1.get("label", fallback["hack_1"]["label"])),
                "mod_fibre": int(hack_1.get("mod_fibre", fallback["hack_1"]["mod_fibre"])),
                "rid_ig": int(hack_1.get("rid_ig", fallback["hack_1"]["rid_ig"])),
            },
            "hack_2": {
                "label": str(hack_2.get("label", fallback["hack_2"]["label"])),
                "mult_picco": float(hack_2.get("mult_picco", fallback["hack_2"]["mult_picco"])),
            },
            "commento_clinico": str(parsed.get("commento_clinico", fallback["commento_clinico"])),
        }
    except Exception:
        return fallback


def rispondi_chat_coach(
    messaggio: str,
    glicemia: int,
    meal: dict,
    usa_hack1: bool = False,
    usa_hack2: bool = False,
    ic_ratio: int = 10,
    isf: int = 40,
    target: int = 110,
    iob: float = 0.0,
    api_key: str = "",
) -> str:
    """
    Risponde alle domande dell'utente come GlucoTwin Coach clinico basato su Gemma 4,
    implementando le linee guida per calcolo del bolo e cinetica glicemica.
    """
    carbs = meal.get("carboidrati_g", 70)
    grassi = meal.get("grassi_g", 20)
    fibre = meal.get("fibre_g", 5)

    # Calcoli matematici simulati
    bolo_cho = round(carbs / max(1, ic_ratio), 1)
    diff_glic = max(0, glicemia - target)
    bolo_corr = round(diff_glic / max(1, isf), 1)
    bolo_totale_nominale = round(max(0.0, (bolo_cho + bolo_corr) - iob), 1)
    riduzione_moto = round(bolo_totale_nominale * 0.20, 1) if usa_hack2 else 0.0
    bolo_consigliato = round(max(0.0, bolo_totale_nominale - riduzione_moto), 1)

    key = get_effective_key(api_key)

    def _fallback_risposta():
        msg_lower = messaggio.lower()
        if any(w in msg_lower for w in ["insulina", "bolo", "dose", "dosi", "unita", "quanto"]):
            dettaglio_moto = (
                f" Con l'attività post-pasto (Hack Camminata attivo), suggerisco una riduzione prudenziale del 20% "
                f"(-{riduzione_moto}U) per prevenire ipoglicemie muscolari GLUT4."
                if usa_hack2
                else ""
            )
            dettaglio_grassi = (
                f" Con {grassi}g di grassi, valuta con il diabetologo un bolo prolungato (dual-wave) "
                f"per coprire l'effetto pizza ritardato."
                if grassi >= 20
                else ""
            )
            return (
                f"Simulazione Bolo per {meal.get('nome_piatto', 'questo pasto')} ({carbs}g CHO):\n"
                f"• Bolo Carboidrati: {carbs}g / {ic_ratio} = {bolo_cho}U\n"
                f"• Bolo Correzione: ({glicemia} - {target}) / {isf} = {bolo_corr}U\n"
                f"• Insulina Attiva (IOB): -{iob}U\n"
                f"➡ Bolo Standard Stimato: {bolo_totale_nominale}U.{dettaglio_moto}{dettaglio_grassi}\n"
                f"💡 Suggerimento: ~{bolo_consigliato}U.\n\n"
                f"⚠️ Nota: questa è una simulazione matematica educativa basata sui parametri impostati e va sempre confermata secondo il piano del tuo medico."
            )
        elif any(w in msg_lower for w in ["picco", "curva", "quando", "tempo", "salita", "escursione"]):
            minuti_picco = 55 + int(grassi * 0.65) + int(fibre * 0.8)
            return (
                f"Analisi della cinetica glicemica per {meal.get('nome_piatto', 'il pasto')}:\n"
                f"• Valore CGM di partenza: {glicemia} mg/dL a t=0 min.\n"
                f"• Minuti stimati al picco: circa +{minuti_picco} min.\n"
                f"• Effetto degli Hack: combinando antipasto di fibre e camminata attiva, la curva si appiattisce significativamente aumentando il Time-in-Range (70-180 mg/dL).\n"
                f"• I {grassi}g di lipidi rallentano lo svuotamento gastrico prolungando la discesa."
            )
        else:
            return (
                f"Ciao! Sono GlucoTwin Coach. Ho caricato i dati del tuo pasto ({meal.get('nome_piatto')}: {carbs}g carboidrati, {grassi}g grassi, {fibre}g fibre) "
                f"e la glicemia attuale di {glicemia} mg/dL. "
                f"I due hack metabolici attivati ti consentono di smorzare il picco e proteggere la tua variabilità glicemica. "
                f"Chiedimi pure chiarimenti sul calcolo matematico del bolo o sui tempi della curva!"
            )

    if not key:
        return _fallback_risposta()

    system_prompt = f"""Sei 'GlucoTwin Coach', assistente clinico medico-nutrizionale per il diabete,
addestrato e calibrato sulle evidenze del dataset clinico AZT1D 2025 (25 pazienti Diabete Tipo 1 con sistemi automatici AID, 306.712 campioni CGM ogni 5 min, target ATTD/ADA: TIR > 70%, TAR < 25%, TBR < 4%).
Dati paziente attuali:
- Glicemia CGM: {glicemia} mg/dL (Target: {target} mg/dL, I:C: 1U/{ic_ratio}g, FSI: 1U/{isf} mg/dL, IOB: {iob}U)
- Pasto: {json.dumps(meal, ensure_ascii=False)}
- Intervento 1 Pre-Pasto (Fibre): {'ATTIVO' if usa_hack1 else 'DISATTIVO'}
- Intervento 2 Post-Pasto (Camminata 15 min): {'ATTIVO' if usa_hack2 else 'DISATTIVO'}
- Calcolo Bolo Matematico: Bolo CHO={bolo_cho}U, Correzione={bolo_corr}U, Totale standard={bolo_totale_nominale}U, Con intervento moto GLUT4={bolo_consigliato}U.

Regole:
1. Se chiedono del bolo o insulina, mostra il calcolo trasparente, spiega l'eventuale riduzione per camminata (-20%) o il bolo prolungato per i grassi (>20g), e ricorda sempre che è una simulazione da confermare con il medico.
2. Se chiedono della curva o picco o stima temporale, cita i tempi e l'effetto degli interventi metabolici sul Time-in-Range.
3. Sii chiaro, sintetico (max 150 parole), professionale ed incoraggiante."""

    try:
        if (key.startswith("sk-") or genai is None) and OpenAI is not None:
            client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=key)
            res = client.chat.completions.create(
                model=GEMMA_OPENROUTER_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": messaggio},
                ],
                temperature=0.3,
            )
            return res.choices[0].message.content or _fallback_risposta()
        elif genai is not None:
            client = genai.Client(api_key=key)
            full_prompt = f"{system_prompt}\n\nDomanda dell'utente: {messaggio}"
            config = types.GenerateContentConfig(temperature=0.3)
            response = client.models.generate_content(
                model=GEMMA_GENAI_MODEL,
                contents=full_prompt,
                config=config,
            )
            return response.text or _fallback_risposta()
        else:
            return _fallback_risposta()
    except Exception:
        return _fallback_risposta()
