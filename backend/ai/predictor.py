"""
Modulo di Predizione AI Metabolica GlucoTwin.
Predice automaticamente l'impatto glicemico, la cinetica di assorbimento,
i livelli di rischio e le allerte cliniche in base al valore live del sensore CGM e al pasto.
"""
import json
import math
from .config import (
    genai,
    types,
    OpenAI,
    GEMMA_GENAI_MODEL,
    GEMMA_OPENROUTER_MODEL,
    get_effective_key,
)
from .utils import extract_json


def calcola_curva_fisiologica(
    glicemia_base: int,
    trend_cgm: str = "STABILE",
    meal: dict = None,
    usa_hack1: bool = False,
    usa_hack2: bool = False,
) -> dict:
    """
    Simulatore fisiologico deterministico dell'assorbimento glucidico.
    Calcola la serie temporale a intervalli di 10 minuti da t = -45 a t = +180 min.
    """
    if meal is None:
        meal = {
            "nome_piatto": "Pasto",
            "carboidrati_g": 75,
            "fibre_g": 4,
            "grassi_g": 20,
            "indice_glicemico": 75,
        }

    carbs = meal.get("carboidrati_g", 75)
    fibre = meal.get("fibre_g", 4)
    grassi = meal.get("grassi_g", 20)
    ig = meal.get("indice_glicemico", 75)

    # Impatto del trend del sensore CGM (slancio cinetico)
    trend_deltas = {
        "RAPIDA_SALITA": 24,
        "IN_SALITA": 12,
        "STABILE": 0,
        "IN_DISCESA": -12,
        "RAPIDA_DISCESA": -24,
    }
    trend_delta = trend_deltas.get(trend_cgm.upper(), 0)

    # Parametri Curva Standard (Rossa)
    amp_std = (
        carbs * (ig / 100.0) * 1.75 * max(0.45, 1.0 - fibre * 0.022)
    ) + trend_delta
    t_picco_std = round(55 + grassi * 0.65 + fibre * 0.8)
    larg_std = 32 + grassi * 0.55

    # Parametri Curva Ottimizzata (Verde con Hack What-If)
    fibre_opt = fibre + (12 if usa_hack1 else 0)
    ig_opt = max(25, ig - (15 if usa_hack1 else 0))
    mult_moto = 0.68 if usa_hack2 else 1.0
    amp_opt = (
        carbs
        * (ig_opt / 100.0)
        * 1.75
        * max(0.45, 1.0 - fibre_opt * 0.022)
        * mult_moto
    ) + (trend_delta * 0.65)
    t_picco_opt = round(55 + grassi * 0.65 + fibre_opt * 0.8)
    larg_opt = 32 + grassi * 0.55

    punti = []
    for t in range(-45, 185, 10):
        etichetta = f"{t}m" if t <= 0 else f"+{t}m"
        if t <= 0:
            val_base = round(glicemia_base + math.sin(t / 12.0) * 3)
            punti.append(
                {"minuti": t, "tempo": etichetta, "standard": val_base, "ottimizzata": val_base}
            )
        else:
            gauss_std = math.exp(-((t - t_picco_std) ** 2) / (2 * (larg_std**2))) * (
                (t / t_picco_std) if t < t_picco_std else 1.0
            )
            gauss_opt = math.exp(-((t - t_picco_opt) ** 2) / (2 * (larg_opt**2))) * (
                (t / t_picco_opt) if t < t_picco_opt else 1.0
            )

            val_std = round(glicemia_base + amp_std * gauss_std)
            val_opt = round(glicemia_base + amp_opt * gauss_opt)

            punti.append(
                {"minuti": t, "tempo": etichetta, "standard": val_std, "ottimizzata": val_opt}
            )

    picco_std = max(p["standard"] for p in punti)
    picco_opt = max(p["ottimizzata"] for p in punti)

    # Calcolo Time-in-Range (70 - 180 mg/dL)
    tir_std = round(
        (sum(1 for p in punti if 70 <= p["standard"] <= 180) / len(punti)) * 100
    )
    tir_opt = round(
        (sum(1 for p in punti if 70 <= p["ottimizzata"] <= 180) / len(punti)) * 100
    )

    return {
        "punti": punti,
        "picco_std": picco_std,
        "picco_opt": picco_opt,
        "t_picco_std": t_picco_std,
        "t_picco_opt": t_picco_opt,
        "tir_std": tir_std,
        "tir_opt": tir_opt,
    }


def predici_risposta_glicemica(
    glicemia_cgm: int,
    trend_cgm: str = "STABILE",
    meal: dict = None,
    usa_hack1: bool = False,
    usa_hack2: bool = False,
    api_key: str = "",
) -> dict:
    """
    Predizione AI automatica basata sul valore attuale del sensore CGM.
    Restituisce la cinetica della curva, il livello di rischio metabolico
    e l'avviso clinico proattivo generato da Gemma 4.
    """
    if meal is None:
        meal = {
            "nome_piatto": "Pizza Margherita",
            "carboidrati_g": 85,
            "fibre_g": 4,
            "grassi_g": 22,
            "indice_glicemico": 82,
        }

    # 1. Calcolo cinetico fisiologico
    cinetica = calcola_curva_fisiologica(
        glicemia_base=glicemia_cgm,
        trend_cgm=trend_cgm,
        meal=meal,
        usa_hack1=usa_hack1,
        usa_hack2=usa_hack2,
    )

    picco_std = cinetica["picco_std"]
    picco_opt = cinetica["picco_opt"]

    # 2. Valutazione euristica del rischio di base
    if picco_std >= 220 or (glicemia_cgm > 150 and trend_cgm in ["IN_SALITA", "RAPIDA_SALITA"]):
        rischio_default = "CRITICO"
    elif picco_std > 180:
        rischio_default = "ELEVATO"
    elif picco_std > 140:
        rischio_default = "MEDIO"
    else:
        rischio_default = "BASSO"

    hack_consigliato = (
        "ENTRAMBI"
        if picco_std > 180
        else ("HACK_2" if glicemia_cgm > 130 else "HACK_1")
    )

    fallback_ai = {
        "livello_rischio": rischio_default,
        "allerta_proattiva": (
            f"Sensore a {glicemia_cgm} mg/dL ({trend_cgm}): picco previsto a {picco_std} mg/dL. "
            f"Consigliato attivare gli hack per restare sotto 180 mg/dL."
        ),
        "consiglio_prioritario": (
            "Attiva la camminata attiva di 15 min per stimolare i recettori GLUT4."
            if usa_hack2 is False and picco_std > 170
            else "Pre-carico di fibre 10 min prima del pasto per rallentare l'assorbimento."
        ),
        "spiegazione_cinetica": (
            f"Partendo da {glicemia_cgm} mg/dL, i {meal.get('carboidrati_g', 75)}g di carboidrati "
            f"generano un afflusso rapido, mentre i {meal.get('grassi_g', 20)}g di grassi rallentano la discesa."
        ),
        "hack_consigliato_prioritario": hack_consigliato,
    }

    key = get_effective_key(api_key)
    if not key:
        return {**cinetica, **fallback_ai}

    # 3. Inferenza clinica proattiva con Gemma 4
    prompt = f"""Sei l'Agente AI di Predizione Metabolica GlucoTwin per pazienti diabetici.
Dati sensore CGM live:
- Valore Glicemia Attuale: {glicemia_cgm} mg/dL (Trend: {trend_cgm})
- Pasto: {meal.get('nome_piatto', 'Pasto')} ({meal.get('carboidrati_g', 75)}g CHO, {meal.get('grassi_g', 20)}g grassi, {meal.get('fibre_g', 4)}g fibre, IG: {meal.get('indice_glicemico', 75)})
- Interventi attivi: Fibre pre-pasto={'ATTIVO' if usa_hack1 else 'DISATTIVO'}, Camminata GLUT4={'ATTIVO' if usa_hack2 else 'DISATTIVO'}
- Cinetica calcolata: Picco standard={picco_std} mg/dL a +{cinetica['t_picco_std']} min. Picco ottimizzato={picco_opt} mg/dL a +{cinetica['t_picco_opt']} min.

Formula una predizione clinica e un avviso proattivo per il paziente.
Restituisci ESCLUSIVAMENTE un JSON valido (senza markdown o testo extra) con questi campi:
{{
  "livello_rischio": "BASSO" | "MEDIO" | "ELEVATO" | "CRITICO",
  "allerta_proattiva": "Avviso sintetico orientato all'azione (max 20 parole)",
  "consiglio_prioritario": "Azione raccomandata più efficace per questo valore di glicemia",
  "spiegazione_cinetica": "1-2 frasi chiare sulla fisiologia di questa curva",
  "hack_consigliato_prioritario": "HACK_1" | "HACK_2" | "ENTRAMBI"
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
            return {**cinetica, **fallback_ai}

        ai_data = {
            "livello_rischio": str(parsed.get("livello_rischio", fallback_ai["livello_rischio"])),
            "allerta_proattiva": str(parsed.get("allerta_proattiva", fallback_ai["allerta_proattiva"])),
            "consiglio_prioritario": str(parsed.get("consiglio_prioritario", fallback_ai["consiglio_prioritario"])),
            "spiegazione_cinetica": str(parsed.get("spiegazione_cinetica", fallback_ai["spiegazione_cinetica"])),
            "hack_consigliato_prioritario": str(parsed.get("hack_consigliato_prioritario", fallback_ai["hack_consigliato_prioritario"])),
        }
        return {**cinetica, **ai_data}
    except Exception:
        return {**cinetica, **fallback_ai}
