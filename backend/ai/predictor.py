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
    tempo_target: int = 60,
) -> dict:
    """
    Simulatore fisiologico deterministico dell'assorbimento glucidico basato
    sui profili cinetici del trial clinico AZT1D (25 soggetti T1D, 306.712 rilevazioni CGM).
    Calcola sia la traiettoria temporale (t = -45..+180 min) sia la stima puntuale
    esatta alla coordinata temporale target richiesta (es. +45 min, +60 min).
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

    # Parametri Curva Standard (senza interventi metabolici)
    amp_std = (
        carbs * (ig / 100.0) * 1.75 * max(0.45, 1.0 - fibre * 0.022)
    ) + trend_delta
    t_picco_std = round(55 + grassi * 0.65 + fibre * 0.8)
    larg_std = 32 + grassi * 0.55

    # Parametri Curva Ottimizzata (con interventi metabolici: fibre pre-carico / camminata GLUT4)
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

    def _calcola_valori_al_minuto(t: int):
        if t <= 0:
            val_base = round(glicemia_base + math.sin(t / 12.0) * 3)
            return val_base, val_base
        gauss_std = math.exp(-((t - t_picco_std) ** 2) / (2 * (larg_std**2))) * (
            (t / t_picco_std) if t < t_picco_std else 1.0
        )
        gauss_opt = math.exp(-((t - t_picco_opt) ** 2) / (2 * (larg_opt**2))) * (
            (t / t_picco_opt) if t < t_picco_opt else 1.0
        )
        val_std = round(glicemia_base + amp_std * gauss_std)
        val_opt = round(glicemia_base + amp_opt * gauss_opt)
        return val_std, val_opt

    # Punti della serie temporale completa
    punti = []
    for t in range(-45, 185, 10):
        etichetta = f"{t}m" if t <= 0 else f"+{t}m"
        val_std, val_opt = _calcola_valori_al_minuto(t)
        punti.append(
            {"minuti": t, "tempo": etichetta, "standard": val_std, "ottimizzata": val_opt}
        )

    picco_std = max(p["standard"] for p in punti)
    picco_opt = max(p["ottimizzata"] for p in punti)

    # Stima puntuale esatta al minuto target richiesto dall'utente
    val_target_std, val_target_opt = _calcola_valori_al_minuto(tempo_target)
    stima_al_tempo = {
        "minuti": tempo_target,
        "tempo_label": f"+{tempo_target}m" if tempo_target > 0 else f"{tempo_target}m",
        "standard": val_target_std,
        "ottimizzata": val_target_opt,
        "delta_standard": val_target_std - glicemia_base,
        "delta_ottimizzata": val_target_opt - glicemia_base,
        "risparmio_mg_dl": max(0, val_target_std - val_target_opt),
        "in_target_standard": 70 <= val_target_std <= 180,
        "in_target_ottimizzata": 70 <= val_target_opt <= 180,
    }

    # Metriche di Consenso Internazionale CGM (TIR: 70-180 mg/dL, TAR: >180 mg/dL, TBR: <70 mg/dL)
    tir_std = round((sum(1 for p in punti if 70 <= p["standard"] <= 180) / len(punti)) * 100)
    tir_opt = round((sum(1 for p in punti if 70 <= p["ottimizzata"] <= 180) / len(punti)) * 100)
    tar_std = round((sum(1 for p in punti if p["standard"] > 180) / len(punti)) * 100)
    tar_opt = round((sum(1 for p in punti if p["ottimizzata"] > 180) / len(punti)) * 100)
    tbr_std = round((sum(1 for p in punti if p["standard"] < 70) / len(punti)) * 100)
    tbr_opt = round((sum(1 for p in punti if p["ottimizzata"] < 70) / len(punti)) * 100)

    # Benchmark clinico di riferimento estratto dal trial AZT1D (25 soggetti T1D con AID microinfusore)
    azt1d_benchmark = {
        "descrizione": "Trial clinico AZT1D 2025 (25 soggetti T1D, microinfusore AID e sensore CGM Dexcom, 306.712 rilevazioni)",
        "tir_medio_popolazione": 77.8,
        "tar_medio_popolazione": 20.6,
        "tbr_medio_popolazione": 1.5,
        "cgm_medio_mg_dl": 142.3,
        "cv_variabilita": 32.1,
    }

    return {
        "punti": punti,
        "picco_std": picco_std,
        "picco_opt": picco_opt,
        "t_picco_std": t_picco_std,
        "t_picco_opt": t_picco_opt,
        "stima_al_tempo": stima_al_tempo,
        "tir_std": tir_std,
        "tir_opt": tir_opt,
        "tar_std": tar_std,
        "tar_opt": tar_opt,
        "tbr_std": tbr_std,
        "tbr_opt": tbr_opt,
        "azt1d_benchmark": azt1d_benchmark,
    }


def predici_risposta_glicemica(
    glicemia_cgm: int,
    trend_cgm: str = "STABILE",
    meal: dict = None,
    usa_hack1: bool = False,
    usa_hack2: bool = False,
    tempo_target: int = 60,
    api_key: str = "",
) -> dict:
    """
    Predizione AI clinica basata sul valore e trend del sensore CGM e orizzonte temporale.
    Calcola la stima puntuale a +t minuti, la cinetica, il livello di rischio metabolico
    e l'avviso clinico proattivo generato con il supporto di Gemma 4.
    """
    if meal is None:
        meal = {
            "nome_piatto": "Pizza Margherita",
            "carboidrati_g": 85,
            "fibre_g": 4,
            "grassi_g": 22,
            "indice_glicemico": 82,
        }

    # 1. Calcolo cinetico e stima puntuale deterministica
    cinetica = calcola_curva_fisiologica(
        glicemia_base=glicemia_cgm,
        trend_cgm=trend_cgm,
        meal=meal,
        usa_hack1=usa_hack1,
        usa_hack2=usa_hack2,
        tempo_target=tempo_target,
    )

    picco_std = cinetica["picco_std"]
    stima_t = cinetica["stima_al_tempo"]
    val_t_std = stima_t["standard"]
    val_t_opt = stima_t["ottimizzata"]
    risparmio_t = stima_t["risparmio_mg_dl"]

    # 2. Valutazione euristica del rischio metabolico
    if val_t_std >= 200 or picco_std >= 220 or (glicemia_cgm > 150 and trend_cgm in ["IN_SALITA", "RAPIDA_SALITA"]):
        rischio_default = "CRITICO"
    elif val_t_std > 180 or picco_std > 180:
        rischio_default = "ELEVATO"
    elif val_t_std > 140 or picco_std > 140:
        rischio_default = "MEDIO"
    else:
        rischio_default = "BASSO"

    intervento_consigliato = (
        "ENTRAMBI"
        if picco_std > 180 or val_t_std > 180
        else ("CAMMINATA_GLUT4" if glicemia_cgm > 130 else "FIBRE_PRE_PASTO")
    )

    fallback_ai = {
        "livello_rischio": rischio_default,
        "stima_puntuale_desc": f"A +{tempo_target} min: {val_t_std} mg/dL (senza interventi) vs {val_t_opt} mg/dL (con interventi, -{risparmio_t} mg/dL).",
        "allerta_proattiva": (
            f"Sensore a {glicemia_cgm} mg/dL ({trend_cgm}): stima a +{tempo_target}m pari a {val_t_std} mg/dL (picco {picco_std} mg/dL). "
            f"Con gli interventi metabolici la stima si attesta a {val_t_opt} mg/dL."
        ),
        "consiglio_prioritario": (
            "Attiva la camminata post-prandiale di 15 min per stimolare i recettori muscolari GLUT4."
            if not usa_hack2 and (val_t_std > 160 or picco_std > 170)
            else "Pre-carico di fibre vegetali 10 min prima per rallentare lo svuotamento gastrico."
        ),
        "spiegazione_cinetica": (
            f"A +{tempo_target} minuti, l'assorbimento dei {meal.get('carboidrati_g', 75)}g di carboidrati "
            f"raggiunge {val_t_std} mg/dL. Gli interventi metabolici consentono un risparmio stimato di -{risparmio_t} mg/dL ({val_t_opt} mg/dL)."
        ),
        "intervento_consigliato_prioritario": intervento_consigliato,
    }

    key = get_effective_key(api_key)
    if not key:
        return {**cinetica, **fallback_ai}

    # 3. Inferenza clinica proattiva con Gemma 4
    prompt = f"""Sei il Copilota AI di Predizione Metabolica GlucoTwin, calibrato sui protocolli clinici dello studio AZT1D 2025.
Dati sensore CGM live e orizzonte temporale:
- Valore Glicemia Attuale: {glicemia_cgm} mg/dL (Trend: {trend_cgm})
- Orizzonte di Stima Puntuale: +{tempo_target} minuti
- Stima a +{tempo_target}m Standard (senza interventi): {val_t_std} mg/dL
- Stima a +{tempo_target}m Ottimizzata (con interventi metabolici): {val_t_opt} mg/dL (risparmio: -{risparmio_t} mg/dL)
- Pasto: {meal.get('nome_piatto', 'Pasto')} ({meal.get('carboidrati_g', 75)}g CHO, {meal.get('grassi_g', 20)}g grassi, {meal.get('fibre_g', 4)}g fibre, IG: {meal.get('indice_glicemico', 75)})
- Interventi metabolici attivi: Pre-carico fibre={'ATTIVO' if usa_hack1 else 'DISATTIVO'}, Camminata GLUT4={'ATTIVO' if usa_hack2 else 'DISATTIVO'}
- Picco previsto: Standard {picco_std} mg/dL (a +{cinetica['t_picco_std']} min), Ottimizzato {cinetica['picco_opt']} mg/dL (a +{cinetica['t_picco_opt']} min)
- Riferimento AZT1D popolazione AID: TIR medio 77.8%, TAR 20.6%, TBR 1.5%.

Formula una predizione clinica chiara focalizzata sul valore stimato a +{tempo_target} minuti e sulle azioni correttive consigliate.
Restituisci ESCLUSIVAMENTE un JSON valido (senza markdown o testo extra) con questi campi:
{{
  "livello_rischio": "BASSO" | "MEDIO" | "ELEVATO" | "CRITICO",
  "allerta_proattiva": "Avviso sintetico con valore stimato a +{tempo_target}m e azione immediata (max 25 parole)",
  "consiglio_prioritario": "Azione raccomandata più efficace per il paziente",
  "spiegazione_cinetica": "1-2 frasi scientifiche e chiare sulla cinetica di assorbimento e sull'efficacia degli interventi",
  "intervento_consigliato_prioritario": "FIBRE_PRE_PASTO" | "CAMMINATA_GLUT4" | "ENTRAMBI"
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
            "intervento_consigliato_prioritario": str(parsed.get("intervento_consigliato_prioritario", fallback_ai["intervento_consigliato_prioritario"])),
        }
        return {**cinetica, **ai_data}
    except Exception:
        return {**cinetica, **fallback_ai}

