import json
from typing import Optional, Dict, Any
from .config import query_llm
from .utils import extract_json


def genera_hack_coach(
    meal: dict,
    glicemia: int,
    api_key: str = "",
    provider: str = "auto",
    local_url: Optional[str] = None,
    local_model: Optional[str] = None,
) -> dict:
    """
    Genera due interventi metabolici comportamentali (hack) e un commento clinico per appiattire
    il picco glicemico post-prandiale, supportando sia AI locale (Ollama / LM Studio)
    che Cloud o motore clinico offline deterministico.
    """
    meal = meal or {}
    nome = meal.get("nome_piatto", "Pasto")
    carbs = int(meal.get("carboidrati_g", 70))
    grassi = int(meal.get("grassi_g", 20))
    fibre = int(meal.get("fibre_g", 4))
    ig = int(meal.get("indice_glicemico", 70))

    # Calcolo dinamico e personalizzato per il motore clinico deterministico di riserva
    mod_fibre_stim = min(18, max(8, 10 + int(carbs * 0.05)))
    rid_ig_stim = min(22, max(10, 12 + int(ig * 0.1)))
    mult_picco_stim = 0.65 if carbs >= 70 else 0.72

    if glicemia > 160:
        commento = (
            f"Glicemia basale elevata ({glicemia} mg/dL): con {carbs}g di carboidrati e IG {ig}, "
            f"il picco rischia di superare 220 mg/dL. Fondamentale il pre-carico di fibre e moto GLUT4 tempestivo."
        )
    elif grassi >= 25:
        commento = (
            f"Partendo da {glicemia} mg/dL, i {carbs}g di carboidrati di {nome} causeranno ascesa glicemica, "
            f"mentre i {grassi}g di lipidi ritarderanno lo svuotamento gastrico producendo una prolungata coda iperglicemica."
        )
    else:
        commento = (
            f"Partendo da {glicemia} mg/dL, i {carbs}g di carboidrati spingeranno la curva verso l'alto. "
            f"L'abbinamento di fibre prima del piatto e camminata attiva contiene l'escursione entro i 180 mg/dL."
        )

    consiglio_piatto = meal.get("consiglio_clinico")
    if consiglio_piatto and glicemia <= 160:
        commento = f"{commento} {consiglio_piatto}"

    fallback = {
        "hack_1": {
            "label": "🥗 Pre-carico di fibre (Verdura cruda 10 min prima)",
            "mod_fibre": mod_fibre_stim,
            "rid_ig": rid_ig_stim,
        },
        "hack_2": {
            "label": "🚶‍♂️ 15 min di camminata attiva (30 min post-pasto)",
            "mult_picco": mult_picco_stim,
        },
        "commento_clinico": commento,
    }

    prompt = f"""Paziente con diabete (glicemia attuale: {glicemia} mg/dL). Pasto previsto: {json.dumps(meal, ensure_ascii=False)}.
Fornisci due micro-interventi metabolici (hack comportamentali o alimentari) e un commento clinico per appiattire il picco glicemico post-prandiale.
Restituisci ESCLUSIVAMENTE un JSON valido (niente testo extra prima o dopo) con questa struttura:
{{
  "hack_1": {{"label": "consiglio cibo max 8 parole", "mod_fibre": {mod_fibre_stim}, "rid_ig": {rid_ig_stim}}},
  "hack_2": {{"label": "consiglio moto max 8 parole", "mult_picco": {mult_picco_stim}}},
  "commento_clinico": "2 frasi cliniche sull'impatto metabolico di {nome}."
}}"""

    system_prompt = (
        "Sei il Copilota Nutrizionale Gluco clinico per il diabete. "
        "Rispondi ESCLUSIVAMENTE in formato JSON senza markdown aggiuntivo."
    )

    try:
        raw_response = query_llm(
            prompt=prompt,
            system_prompt=system_prompt,
            json_mode=True,
            provider=provider,
            api_key=api_key,
            local_url=local_url,
            local_model=local_model,
        )

        if not raw_response:
            return fallback

        parsed = extract_json(raw_response)
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
    history: Optional[list] = None,
    usa_hack1: bool = False,
    usa_hack2: bool = False,
    ic_ratio: int = 10,
    isf: int = 40,
    target: int = 110,
    iob: float = 0.0,
    api_key: str = "",
    provider: str = "auto",
    local_url: Optional[str] = None,
    local_model: Optional[str] = None,
) -> str:
    """
    Risponde alle domande dell'utente come Gluco Coach clinico, supportando
    sia l'esecuzione tramite LLM locale/remoto che il generatore matematico deterministico.
    """
    meal = meal or {}
    nome_piatto = meal.get("nome_piatto", "il pasto")
    carbs = int(meal.get("carboidrati_g", 70))
    grassi = int(meal.get("grassi_g", 20))
    fibre = int(meal.get("fibre_g", 5))

    # Calcoli analitici del bolo secondo formule internazionali ADA / ATTD
    safe_ic = max(1, ic_ratio)
    safe_isf = max(1, isf)
    bolo_cho = round(carbs / safe_ic, 2)
    diff_glic = max(0, glicemia - target)
    bolo_corr = round(diff_glic / safe_isf, 2)
    subtotale = bolo_cho + bolo_corr
    riduzione_moto = round(subtotale * 0.20, 2) if usa_hack2 else 0.0
    bolo_consigliato = round(max(0.0, subtotale - iob - riduzione_moto), 1)

    # Generatore di risposta di riserva (Motore Clinico Deterministico Avanzato)
    def _fallback_risposta():
        msg_lower = messaggio.lower()

        # 1. Domanda su Timing del Bolo (quando fare l'iniezione/bolo)
        if any(w in msg_lower for w in ["quando", "timing", "anticipo", "minuti prima", "dopo pasto", "dopo mangiato", "orario bolo"]):
            if glicemia < 90:
                consiglio_anticipo = "Glicemia di partenza bassa o tendente al ribasso (<90 mg/dL): inietta **subito all'inizio del pasto o a metà pasto** dopo i primi carboidrati, per scongiurare un calo reattivo prima che gli zuccheri entrino in circolo."
            elif glicemia <= 140:
                consiglio_anticipo = "Glicemia in target (90-140 mg/dL): inietta **10-15 minuti prima** per analoghi rapidi standard (Humalog, Novorapid) o **0-5 minuti prima** per ultra-rapidi (Fiasp, Lyumjev)."
            else:
                consiglio_anticipo = f"Glicemia basale elevata ({glicemia} mg/dL): anticipa il bolo di **20-25 minuti prima del pasto** per consentire all'insulina di iniziare l'azione prima che gli amidi vengano convertiti in glucosio ematico."

            dettaglio_grassi_timing = (
                f"\n\n🍕 **Attenzione ai lipidi ({grassi}g):** I grassi rallentano lo svuotamento gastrico. "
                f"Valuta con il medico un **bolo a onda doppia**: 60% subito e 40% prolungato su 2-3 ore per coprire la coda digestiva tardiva."
                if grassi >= 20
                else ""
            )

            return (
                f"### Timing Ottimale del Bolo per {nome_piatto}:\n\n"
                f"• **Glicemia CGM Attuale:** {glicemia} mg/dL\n"
                f"• **Anticipo Consigliato:** {consiglio_anticipo}\n"
                f"• **Pre-carico di Fibre:** {'Attivo (riduce l\'impennata iniziale)' if usa_hack1 else 'Consigliato 10 min prima per smussare il picco'}\n"
                f"• **Camminata GLUT4:** Inizia 25-30 min dopo il pasto (non prima) per sincronizzare i trasportatori muscolari con l\'assorbimento intestinale.{dettaglio_grassi_timing}\n\n"
                f"⚠️ *Nota di Sicurezza:* Adatta sempre l\'orario alla velocità della tua specifica insulina prescritta dal diabetologo."
            )

        # 2. Domanda su Sostituzioni Alimentari e Alternative a basso IG
        if any(w in msg_lower for w in ["sostituz", "alternativ", "cosa posso mangiare", "invece di", "meno carb", "low carb", "abbassare ig", "opzion"]):
            p_lower = nome_piatto.lower()
            if any(w in p_lower for w in ["pasta", "carbonara", "spaghetti", "penne", "primo"]):
                swaps = (
                    "• **Pasta 100% Farina di Legumi (lenticchie rosse o ceci):** Riduce i carboidrati netti del 40%, triplica le fibre (12g+) e abbassa l'indice glicemico da 70 a circa 32.\n"
                    "• **Pasta Integrale di Grano Duro al Dente:** L'amido cotto al dente preserva la struttura complessa (amido resistente), con IG di 45 invece di 70.\n"
                    "• **Zoodles (Spaghetti di Zucchine) o Shirataki di Konjac:** Praticamente privi di carboidrati (<5g), ideali per condimenti ricchi mantenendo il picco piatto."
                )
            elif "pizza" in p_lower:
                swaps = (
                    "• **Pinsa Romana con farine miste (riso, soia, frumento) a lievitazione 72h:** Molto più digeribile, con assorbimento più graduale.\n"
                    "• **Pizza con Impasto Integrale o Farina Tipo 2:** La crusca crea una matrice che rallenta l'alfa-amilasi gastrica.\n"
                    "• **Strategia Porzione:** 2 tranci di margherita preceduti da una generosa ciotola di verdura cruda (lattuga o finocchi)."
                )
            elif "riso" in p_lower or "risotto" in p_lower:
                swaps = (
                    "• **Riso Basmati Integrale o Riso Venere:** Ricchi di amilosio a catena lineare (digerito lentamente) e privi della rapida gelatinizzazione del riso bianco.\n"
                    "• **Farro o Orzo perlato (Orzotto):** Ricchi di beta-glucani solubili con IG 35-40 (rispetto all'80 del riso raffinato)."
                )
            elif "brioche" in p_lower or "colazione" in p_lower:
                swaps = (
                    "• **Porridge di Avena Integrale con Frutti di Bosco e Noci:** I beta-glucani dell'avena formano un gel gastrico che appiattisce il picco mattutino.\n"
                    "• **Yogurt Greco Intero (o 5%) con Semi di Chia e Cannella:** Ricco di proteine nobili e grassi sani con impatto glicemico quasi nullo."
                )
            else:
                swaps = (
                    "• **Verdure crude pre-pasto:** Finocchi, carote o insalata 10 minuti prima riducono l'IG dell'intero pasto di 15-20 punti.\n"
                    "• **Abbinamento proteico/lipidico:** Accompagnare sempre i carboidrati a una fonte di grassi sani (olio EVO, mandorle) per rallentare lo svuotamento gastrico.\n"
                    "• **Cereali a chicco intero:** Sostituisci amidi raffinati con cereali integri (farro, grano saraceno, quinoa)."
                )
            return (
                f"### Alternative Intelligenti a Basso Indice Glicemico per {nome_piatto}:\n\n"
                f"{swaps}\n\n"
                f"💡 **Regola d'Oro Clinica:** L'ordine dei cibi (Fibre -> Proteine/Grassi -> Carboidrati) riduce il picco fino al 35% a parità di porzione!"
            )

        if any(w in msg_lower for w in ["insulina", "bolo", "dose", "dosi", "unita", "quanto", "calcol"]):
            dettaglio_moto = (
                f"\n• Sconto Attività Fisica (Camminata GLUT4 attiva): -20% (-{riduzione_moto}U)"
                if usa_hack2
                else "\n• Adattamento Attività: Nessuna camminata attiva (0.0U)."
            )
            dettaglio_grassi = (
                f"\n\n💡 **Strategia Grassi Elevati ({grassi}g):** I lipidi prolungano la digestione. "
                f"Valuta con il diabetologo un bolo ad onda doppia: 65% subito ({round(bolo_consigliato * 0.65, 1)}U) "
                f"e 35% dilazionato ({round(bolo_consigliato * 0.35, 1)}U su 2-3 ore)."
                if grassi >= 20
                else ""
            )
            return (
                f"### Calcolo del Bolo per {nome_piatto} ({carbs}g CHO):\n"
                f"• Bolo Carboidrati: {carbs}g / {safe_ic} = **{bolo_cho}U**\n"
                f"• Bolo Correzione: ({glicemia} - {target}) / {safe_isf} = **{bolo_corr}U**\n"
                f"• Insulina Attiva (IOB): **-{iob}U**{dettaglio_moto}\n"
                f"➡ **Dose Consigliata Stimata:** **~{bolo_consigliato}U**{dettaglio_grassi}\n\n"
                f"⚠️ *Nota di Sicurezza:* Questa è una simulazione matematica a scopo educativo. Conferma sempre con il tuo piano terapeutico."
            )
        elif any(w in msg_lower for w in ["picco", "curva", "tempo", "salita", "escursione", "andamento", "sale", "aumenta"]):
            minuti_picco = 55 + int(grassi * 0.65) + int(fibre * 0.8)
            return (
                f"### Dinamica Glicemica Prevista per {nome_piatto}:\n"
                f"• **Glicemia Iniziale CGM:** {glicemia} mg/dL.\n"
                f"• **Tempo Stimato al Picco:** circa **+{minuti_picco} minuti** dall'inizio del pasto.\n"
                f"• **Impatto Interventi:** Con il pre-carico di fibre e la camminata attiva, l'ampiezza del picco si riduce del 30-35% massimizzando il Time-in-Range (70-180 mg/dL).\n"
                f"• **Coda Digestiva:** I {grassi}g di grassi rallentano lo svuotamento gastrico e mantengono la glicemia sostenuta a +120..+180 min."
            )
        elif any(w in msg_lower for w in ["cammin", "glut4", "moto", "attivit"]):
            return (
                f"### Stimolazione Recettori GLUT4 post-pasto:\n"
                f"La contrazione muscolare stimola l'assorbimento diretto di glucosio indipendente dall'insulina:\n"
                f"• **Riduzione Picco:** Smorza il picco glicemico di circa il 25-30%.\n"
                f"• **Riduzione Bolo Prudenziale:** Applichiamo uno sconto del 20% sul bolo totale per prevenire ipoglicemie da sforzo.\n"
                f"• **Timing Ideale:** Inizia 25-35 minuti dopo la fine del pasto per 15-20 minuti a passo svelto."
            )
        elif any(w in msg_lower for w in ["fibr", "verdur", "insalat", "ordine"]):
            return (
                f"### Pre-carico di Fibre Vegetali:\n"
                f"Consumare verdura cruda 10-15 minuti prima del piatto principale:\n"
                f"• Crea una rete gelatinosa naturale nello stomaco che riduce la velocità di svuotamento gastrico.\n"
                f"• Abbassa l'indice glicemico complessivo del pasto di 12-18 punti.\n"
                f"• Trasforma un'impennata ripida in una salita dolce e controllabile dal microinfusore o dall'insulina rapida."
            )
        else:
            return (
                f"Ciao! Sono **Gluco Coach**. Ho registrato i parametri di **{nome_piatto}** "
                f"({carbs}g carboidrati, {grassi}g grassi, {fibre}g fibre) e la glicemia attuale di {glicemia} mg/dL.\n\n"
                f"Puoi chiedermi:\n"
                f"1. *'Quanto bolo devo fare?'* (per la formula matematica dettagliata)\n"
                f"2. *'Quando avrò il picco?'* (per tempi di assorbimento e cinetica)\n"
                f"3. *'Come agisce la camminata post-pasto?'* (per la fisiologia GLUT4)\n"
                f"4. *'Come aiutano le fibre prima del pasto?'*"
            )

    system_prompt = f"""Sei 'Gluco Coach', assistente clinico medico-nutrizionale per il diabete,
addestrato e calibrato sulle evidenze del dataset clinico AZT1D 2025 (25 pazienti Diabete Tipo 1 con sistemi automatici AID, 306.712 campioni CGM ogni 5 min, target ATTD/ADA: TIR > 70%, TAR < 25%, TBR < 4%).
Parametri attuali paziente:
- Glicemia CGM: {glicemia} mg/dL (Target: {target} mg/dL, I:C: 1U/{safe_ic}g, FSI: 1U/{safe_isf} mg/dL, IOB: {iob}U)
- Pasto: {nome_piatto} ({carbs}g CHO, {grassi}g grassi, {fibre}g fibre)
- Pre-carico Fibre: {'ATTIVO' if usa_hack1 else 'DISATTIVO'}
- Camminata 15 min GLUT4: {'ATTIVO' if usa_hack2 else 'DISATTIVO'}
- Calcoli matematici: Bolo CHO={bolo_cho}U, Correzione={bolo_corr}U, Totale standard={round(subtotale - iob, 2)}U, Con sconto moto={bolo_consigliato}U.

Regole di Risposta:
1. Se chiedono del bolo o insulina, illustra il calcolo matematico trasparente, spiega l'eventuale sconto per attività (-20%) o bolo a onda doppia per grassi (>20g), e ricorda che è una simulazione educativa.
2. Se chiedono di picco, curva o cinetica, spiega tempi ed effetti degli interventi metabolici.
3. Rispondi in italiano chiaro, professionale, incoraggiante e sintetico (max 150 parole)."""

    # Formatta la cronologia per conservare la memoria di conversazione
    history_ctx = ""
    if history:
        turns = []
        for t in history[-6:]:
            role = "Paziente" if str(t.get("role") or t.get("mittente") or "").lower() in ["user", "utente"] else "Gluco Coach"
            content = str(t.get("content") or t.get("testo") or "").strip()
            if content:
                turns.append(f"{role}: {content}")
        if turns:
            history_ctx = "\n\nCronologia conversazione recente:\n" + "\n".join(turns) + "\n"

    try:
        prompt_with_history = f"{history_ctx}\nNuova domanda del paziente: {messaggio}" if history_ctx else f"Domanda del paziente: {messaggio}"
        raw_response = query_llm(
            prompt=prompt_with_history,
            system_prompt=system_prompt,
            json_mode=False,
            provider=provider,
            api_key=api_key,
            local_url=local_url,
            local_model=local_model,
        )
        if raw_response and raw_response.strip():
            return raw_response.strip()
        return _fallback_risposta()
    except Exception:
        return _fallback_risposta()
