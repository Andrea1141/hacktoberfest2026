"""
Script per la generazione e catalogazione di tutti i dataset diabetici di riferimento:
1. Dexcom G6/G7 Clarity CGM Export (Time-series ad alta risoluzione 5-minuti)
2. Abbott FreeStyle Libre LibreView Export (Time-series 15-minuti + scan)
3. Nightscout / OpenAPS JSON CGM & Treatments (Standard open-source T1D)
4. UCI Diabetes Time-Series (AIM-94 benchmark storico 70 pazienti)
5. Pima Indians Diabetes Dataset (NIDDK benchmark clinico 768 pazienti)
6. Post-Prandial Meal Glycemic Curves (Cinetiche pasti e hack metabolici GlucoTwin)
7. CDC / BRFSS Diabetes Health Indicators (Indicatori epidemiologici e di rischio)
"""

import os
import json
import math
import random
from datetime import datetime, timedelta

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))
os.makedirs(DATASETS_DIR, exist_ok=True)

random.seed(42)

def generate_dexcom_cgm():
    """Genera 7 giorni di dati Dexcom Clarity CGM a intervalli di 5 minuti."""
    filepath = os.path.join(DATASETS_DIR, "cgm_dexcom_clarity.csv")
    start_time = datetime(2026, 10, 10, 0, 0, 0)
    
    rows = ["Index,Timestamp (YYYY-MM-DDThh:mm:ss),Event Type,Glucose Value (mg/dL),Insulin Value (u),Carb Value (grams),Duration (hh:mm:ss)"]
    
    current_glucose = 110.0
    idx = 1
    
    # 7 giorni * 24 ore * 12 intervalli/ora = 2016 punti
    for step in range(2016):
        t = start_time + timedelta(minutes=step * 5)
        iso_t = t.strftime("%Y-%m-%dT%H:%M:%S")
        hour = t.hour + t.minute / 60.0
        
        # Ritmo circadiano naturale di base (alba, notte)
        circadian = 8 * math.sin((hour - 5) * math.pi / 12)
        
        # Pasti tipici: colazione 08:00, pranzo 13:00, cena 20:00
        event_type = "EGV"
        insulin_val = ""
        carb_val = ""
        
        # Eventi pasto e bolo
        if t.hour == 8 and t.minute == 0:
            carb_val = "45"
            insulin_val = "3.5"
            event_type = "Meal/Bolus"
            current_glucose += 35
        elif t.hour == 13 and t.minute == 0:
            carb_val = "75"
            insulin_val = "6.0"
            event_type = "Meal/Bolus"
            current_glucose += 55
        elif t.hour == 20 and t.minute == 0:
            carb_val = "65"
            insulin_val = "5.0"
            event_type = "Meal/Bolus"
            current_glucose += 45
        
        # Ritorno elastico verso euglicemia (105-120) con rumore fisiologico
        drift = (112 - current_glucose) * 0.04
        noise = random.gauss(0, 2.2)
        current_glucose = max(55.0, min(285.0, current_glucose + drift + noise))
        
        val_rounded = int(round(current_glucose + circadian))
        rows.append(f"{idx},{iso_t},{event_type},{val_rounded},{insulin_val},{carb_val},")
        idx += 1
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(rows))
    print(f"Generato: {filepath} ({len(rows)-1} righe)")


def generate_freestyle_libre():
    """Genera 14 giorni di esportazione Abbott FreeStyle Libre LibreView (15-minuti)."""
    filepath = os.path.join(DATASETS_DIR, "cgm_freestyle_libre.csv")
    start_time = datetime(2026, 10, 3, 0, 0, 0)
    
    rows = [
        "Device,Serial Number,Device Timestamp,Record Type,Historic Glucose mg/dL,Scan Glucose mg/dL,Non-numeric Rapid-Acting Insulin,Rapid-Acting Insulin (units),Non-numeric Food,Carbohydrates (grams)"
    ]
    
    current_glucose = 120.0
    # 14 giorni * 24 ore * 4 intervalli/ora = 1344 punti
    for step in range(1344):
        t = start_time + timedelta(minutes=step * 15)
        ts_str = t.strftime("%Y-%m-%d %H:%M")
        
        hour = t.hour + t.minute / 60.0
        circadian = 6 * math.sin((hour - 6) * math.pi / 12)
        
        # Eventi pasto
        rapid_insulin = ""
        carbs = ""
        if t.hour == 8 and t.minute == 15:
            rapid_insulin = "4.0"
            carbs = "50"
            current_glucose += 40
        elif t.hour == 13 and t.minute == 15:
            rapid_insulin = "7.0"
            carbs = "80"
            current_glucose += 60
        elif t.hour == 20 and t.minute == 30:
            rapid_insulin = "5.5"
            carbs = "65"
            current_glucose += 45
            
        drift = (115 - current_glucose) * 0.08
        noise = random.gauss(0, 3.0)
        current_glucose = max(60.0, min(270.0, current_glucose + drift + noise))
        hist_val = int(round(current_glucose + circadian))
        
        # Di tanto in tanto una scansione manuale
        scan_val = ""
        rec_type = 0
        if random.random() < 0.12:
            scan_val = str(hist_val + random.randint(-4, 4))
            rec_type = 1
            
        rows.append(
            f"FreeStyle LibreLink,FSL-9082731,{ts_str},{rec_type},{hist_val},{scan_val},,{rapid_insulin},,{carbs}"
        )
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(rows))
    print(f"Generato: {filepath} ({len(rows)-1} righe)")


def generate_nightscout_json():
    """Genera dataset Nightscout / OpenAPS JSON con sgv e trend arrows."""
    filepath = os.path.join(DATASETS_DIR, "cgm_nightscout.json")
    start_time = datetime(2026, 10, 15, 0, 0, 0)
    
    entries = []
    current_glucose = 115.0
    
    # 3 giorni a 5 min = 864 punti
    for step in range(864):
        t = start_time + timedelta(minutes=step * 5)
        epoch_ms = int(t.timestamp() * 1000)
        
        prev = current_glucose
        # Pasti
        if t.hour == 8 and t.minute == 30:
            current_glucose += 45
        elif t.hour == 13 and t.minute == 0:
            current_glucose += 60
        elif t.hour == 19 and t.minute == 45:
            current_glucose += 50
            
        drift = (110 - current_glucose) * 0.05
        current_glucose = max(62.0, min(260.0, current_glucose + drift + random.gauss(0, 2.0)))
        sgv = int(round(current_glucose))
        
        delta = current_glucose - prev
        if delta > 3.0:
            direction = "DoubleUp"
        elif delta > 1.5:
            direction = "SingleUp"
        elif delta > 0.5:
            direction = "FortyFiveUp"
        elif delta < -3.0:
            direction = "DoubleDown"
        elif delta < -1.5:
            direction = "SingleDown"
        elif delta < -0.5:
            direction = "FortyFiveDown"
        else:
            direction = "Flat"
            
        entries.append({
            "_id": f"ns_{step:04d}",
            "device": "dexcom-g6-transmitter",
            "date": epoch_ms,
            "dateString": t.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "sgv": sgv,
            "direction": direction,
            "type": "sgv",
            "filtered": sgv * 1000,
            "unfiltered": sgv * 1000,
            "rssi": random.randint(160, 210)
        })
        
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2)
    print(f"Generato: {filepath} ({len(entries)} campioni)")


def generate_uci_diabetes():
    """Genera il dataset storico UCI Diabetes (AIM-94) con codici clinici."""
    filepath = os.path.join(DATASETS_DIR, "uci_diabetes_timeseries.csv")
    
    # Codici UCI Diabetes:
    # 33 = Regular insulin dose
    # 34 = NPH insulin dose
    # 48 = Unspecified blood glucose measurement
    # 58 = Pre-breakfast blood glucose measurement
    # 60 = Pre-lunch blood glucose measurement
    # 62 = Pre-dinner blood glucose measurement
    # 64 = Pre-bedtime blood glucose measurement
    # 65 = Hypoglycemic symptoms
    
    start_date = datetime(2026, 9, 1)
    rows = ["Date,Time,Code,Value,Description"]
    
    for day in range(30):
        d = start_date + timedelta(days=day)
        date_str = d.strftime("%m-%d-%Y")
        
        # Pre-breakfast
        glu_bf = random.randint(85, 160)
        ins_bf = random.randint(4, 9)
        rows.append(f"{date_str},07:30,58,{glu_bf},Pre-breakfast blood glucose")
        rows.append(f"{date_str},07:35,33,{ins_bf},Regular insulin dose")
        rows.append(f"{date_str},07:35,34,{random.randint(12, 18)},NPH basal insulin")
        
        # Pre-lunch
        glu_lu = random.randint(90, 185)
        ins_lu = random.randint(5, 12)
        rows.append(f"{date_str},12:45,60,{glu_lu},Pre-lunch blood glucose")
        rows.append(f"{date_str},12:50,33,{ins_lu},Regular insulin dose")
        
        # Pre-dinner
        glu_di = random.randint(95, 195)
        ins_di = random.randint(6, 11)
        rows.append(f"{date_str},19:30,62,{glu_di},Pre-dinner blood glucose")
        rows.append(f"{date_str},19:35,33,{ins_di},Regular insulin dose")
        
        # Pre-bedtime
        glu_bed = random.randint(100, 170)
        rows.append(f"{date_str},22:30,64,{glu_bed},Pre-bedtime blood glucose")
        
        # Episodio ipoglicemico occasionale
        if random.random() < 0.15:
            rows.append(f"{date_str},16:15,65,58,Hypoglycemic symptoms reported")
            
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(rows))
    print(f"Generato: {filepath} ({len(rows)-1} eventi clinici)")


def generate_pima_indians():
    """Genera dataset Pima Indians Diabetes conforme alle statistiche ufficiali NIDDK (768 campioni)."""
    filepath = os.path.join(DATASETS_DIR, "pima_indians_diabetes.csv")
    
    rows = ["Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age,Outcome"]
    
    for _ in range(768):
        # Distribuzione realistica basata sui percentili Pima:
        outcome = 1 if random.random() < 0.349 else 0
        
        if outcome == 1:
            age = int(random.gauss(37, 10))
            age = max(21, min(75, age))
            pregnancies = int(random.gauss(4.8, 3.2))
            glucose = int(random.gauss(141, 31))
            bp = int(random.gauss(75, 12))
            skin = int(random.gauss(26, 10))
            insulin = int(random.gauss(100, 75)) if random.random() > 0.3 else 0
            bmi = round(random.gauss(35.1, 7.2), 1)
            dpf = round(random.gauss(0.55, 0.35), 3)
        else:
            age = int(random.gauss(31, 11))
            age = max(21, min(70, age))
            pregnancies = int(random.gauss(3.2, 2.8))
            glucose = int(random.gauss(110, 26))
            bp = int(random.gauss(68, 11))
            skin = int(random.gauss(20, 9))
            insulin = int(random.gauss(68, 55)) if random.random() > 0.4 else 0
            bmi = round(random.gauss(30.3, 6.5), 1)
            dpf = round(random.gauss(0.42, 0.28), 3)
            
        pregnancies = max(0, min(17, pregnancies))
        glucose = max(44, min(200, glucose))
        bp = max(40, min(122, bp))
        skin = max(0, min(65, skin))
        insulin = max(0, min(600, insulin))
        bmi = max(18.2, min(58.0, bmi))
        dpf = max(0.08, min(2.42, dpf))
        
        rows.append(f"{pregnancies},{glucose},{bp},{skin},{insulin},{bmi},{dpf},{age},{outcome}")
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(rows))
    print(f"Generato: {filepath} ({len(rows)-1} cartelle cliniche)")


def generate_postprandial_curves():
    """Genera cinetiche dettagliate di risposta glicemica post-prandiale per vari piatti e hack."""
    filepath = os.path.join(DATASETS_DIR, "postprandial_meal_curves.json")
    
    meals_catalog = [
        {
            "id": "pizza_margherita",
            "nome": "Pizza Margherita Verace",
            "categoria": "High Carb / High Glycemic Index",
            "macronutrienti": {"carboidrati_g": 85, "fibre_g": 4, "grassi_g": 22, "proteine_g": 24, "indice_glicemico": 82},
            "glicemia_base": 115,
            "hack_consigliati": {
                "hack_1": {"titolo": "Pre-carico di fibre", "azione": "Insalata cruda 10 min prima", "mod_fibre": 12, "rid_ig": 15},
                "hack_2": {"titolo": "Attivazione muscolare GLUT4", "azione": "15 min camminata post-pasto", "mult_picco": 0.68}
            }
        },
        {
            "id": "carbonara",
            "nome": "Spaghetti alla Carbonara",
            "categoria": "High Fat / High Protein Pasta",
            "macronutrienti": {"carboidrati_g": 78, "fibre_g": 3, "grassi_g": 36, "proteine_g": 28, "indice_glicemico": 70},
            "glicemia_base": 110,
            "hack_consigliati": {
                "hack_1": {"titolo": "Pre-carico di verdure amare", "azione": "Cicoria o rucola prima della pasta", "mod_fibre": 10, "rid_ig": 12},
                "hack_2": {"titolo": "Sollevamento polpacci (Soleus Pushup)", "azione": "10 min da seduto a 45 min dal pasto", "mult_picco": 0.74}
            }
        },
        {
            "id": "poke_salmon",
            "nome": "Poke Bowl Salmone, Riso e Edamame",
            "categoria": "Balanced Protein & Fiber",
            "macronutrienti": {"carboidrati_g": 62, "fibre_g": 10, "grassi_g": 18, "proteine_g": 32, "indice_glicemico": 60},
            "glicemia_base": 105,
            "hack_consigliati": {
                "hack_1": {"titolo": "Ordine del Cibo (Food Sequencing)", "azione": "Mangia prima edamame e salmone, riso alla fine", "mod_fibre": 5, "rid_ig": 18},
                "hack_2": {"titolo": "Passeggiata Digestiva", "azione": "12 minuti di camminata a passo leggero", "mult_picco": 0.80}
            }
        },
        {
            "id": "lentil_soup",
            "nome": "Zuppa di Lenticchie e Verdure di Stagione",
            "categoria": "High Fiber / Low Glycemic Index",
            "macronutrienti": {"carboidrati_g": 48, "fibre_g": 16, "grassi_g": 8, "proteine_g": 22, "indice_glicemico": 38},
            "glicemia_base": 100,
            "hack_consigliati": {
                "hack_1": {"titolo": "Aggiunta Aceto di Mele", "azione": "1 cucchiaio nell'insalata o diluito in acqua", "mod_fibre": 2, "rid_ig": 10},
                "hack_2": {"titolo": "Stretching postprandiale", "azione": "8 min di mobilità articolare", "mult_picco": 0.88}
            }
        },
        {
            "id": "burger_fries",
            "nome": "Cheeseburger con Patatine Fritte",
            "categoria": "Fast Food Ultra-Processed / High Fat & Carbs",
            "macronutrienti": {"carboidrati_g": 95, "fibre_g": 3, "grassi_g": 44, "proteine_g": 38, "indice_glicemico": 85},
            "glicemia_base": 120,
            "hack_consigliati": {
                "hack_1": {"titolo": "De-costruzione e Verdure", "azione": "Mangia la carne con lattuga prima di toccare le patatine", "mod_fibre": 8, "rid_ig": 14},
                "hack_2": {"titolo": "Camminata prolungata e bolo dual-wave", "azione": "20 min camminata svelta a 40 min", "mult_picco": 0.65}
            }
        }
    ]
    
    # Genera la curva minuto per minuto per ogni piatto da t = -45m a t = +240m
    result_meals = []
    
    for m in meals_catalog:
        macros = m["macronutrienti"]
        base = m["glicemia_base"]
        carbs = macros["carboidrati_g"]
        fats = macros["grassi_g"]
        fibers = macros["fibre_g"]
        ig = macros["indice_glicemico"]
        
        # Curva standard (senza hack)
        amp_std = carbs * (ig / 100.0) * 1.75 * max(0.5, 1.0 - fibers * 0.022)
        t_picco_std = 55 + fats * 0.65 + fibers * 0.8
        width_std = 34 + fats * 0.55
        
        # Curva ottimizzata (entrambi gli hack attivi)
        h1 = m["hack_consigliati"]["hack_1"]
        h2 = m["hack_consigliati"]["hack_2"]
        fibers_opt = fibers + h1["mod_fibre"]
        ig_opt = max(25, ig - h1["rid_ig"])
        mult_moto = h2["mult_picco"]
        amp_opt = carbs * (ig_opt / 100.0) * 1.75 * max(0.5, 1.0 - fibers_opt * 0.022) * mult_moto
        t_picco_opt = 55 + fats * 0.65 + fibers_opt * 0.8
        width_opt = 34 + fats * 0.55
        
        timeline = []
        for t in range(-45, 245, 5):
            time_label = f"{t}m" if t <= 0 else f"+{t}m"
            if t <= 0:
                noise = math.sin(t / 10.0) * 2.5
                v_std = round(base + noise, 1)
                v_opt = v_std
            else:
                gauss_std = math.exp(-((t - t_picco_std) ** 2) / (2 * (width_std ** 2))) * (t / t_picco_std if t < t_picco_std else 1.0)
                # Effetto coda grassi oltre 120 min
                fat_tail = (fats * 0.22) * math.exp(-((t - 150) ** 2) / 3600.0) if t > 100 else 0
                v_std = round(base + amp_std * gauss_std + fat_tail, 1)
                
                gauss_opt = math.exp(-((t - t_picco_opt) ** 2) / (2 * (width_opt ** 2))) * (t / t_picco_opt if t < t_picco_opt else 1.0)
                v_opt = round(base + amp_opt * gauss_opt + (fat_tail * 0.5), 1)
                
            timeline.append({
                "t_minuti": t,
                "label": time_label,
                "glicemia_standard": v_std,
                "glicemia_ottimizzata": v_opt
            })
            
        peak_std = max(p["glicemia_standard"] for p in timeline)
        peak_opt = max(p["glicemia_ottimizzata"] for p in timeline)
        
        result_meals.append({
            **m,
            "metrica_picco": {
                "picco_standard_mg_dl": peak_std,
                "picco_ottimizzato_mg_dl": peak_opt,
                "riduzione_delta_mg_dl": round(peak_std - peak_opt, 1),
                "riduzione_percentuale": round(((peak_std - peak_opt) / (peak_std - base)) * 100, 1)
            },
            "curva_risposta": timeline
        })
        
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({"pasti": result_meals}, f, indent=2)
    print(f"Generato: {filepath} ({len(result_meals)} pasti clinici analizzati)")


def generate_cdc_indicators():
    """Genera dataset CDC / BRFSS Diabetes Health Indicators (1000 record)."""
    filepath = os.path.join(DATASETS_DIR, "cdc_diabetes_indicators.csv")
    
    headers = "HighBP,HighChol,BMI,Smoker,Stroke,HeartDiseaseorAttack,PhysActivity,Fruits,Veggies,HvyAlcoholConsump,GenHlth,MentHlth,PhysHlth,DiffWalk,Sex,Age,Diabetes_binary"
    rows = [headers]
    
    for _ in range(1000):
        # 0 = No diabete, 1 = Diabete
        is_diabetic = 1 if random.random() < 0.22 else 0
        
        if is_diabetic:
            high_bp = 1 if random.random() < 0.75 else 0
            high_chol = 1 if random.random() < 0.68 else 0
            bmi = round(random.gauss(32.8, 6.2), 1)
            phys_act = 1 if random.random() < 0.55 else 0
            gen_hlth = min(5, max(1, int(random.gauss(3.4, 0.9))))
            age = min(13, max(5, int(random.gauss(9.2, 2.1))))  # 1-13 scale CDC
            diff_walk = 1 if random.random() < 0.38 else 0
            heart_disease = 1 if random.random() < 0.24 else 0
        else:
            high_bp = 1 if random.random() < 0.32 else 0
            high_chol = 1 if random.random() < 0.35 else 0
            bmi = round(random.gauss(26.4, 4.8), 1)
            phys_act = 1 if random.random() < 0.78 else 0
            gen_hlth = min(5, max(1, int(random.gauss(2.2, 0.8))))
            age = min(13, max(1, int(random.gauss(6.8, 3.2))))
            diff_walk = 1 if random.random() < 0.12 else 0
            heart_disease = 1 if random.random() < 0.06 else 0
            
        smoker = 1 if random.random() < 0.44 else 0
        stroke = 1 if random.random() < (0.09 if is_diabetic else 0.02) else 0
        fruits = 1 if random.random() < 0.65 else 0
        veggies = 1 if random.random() < 0.80 else 0
        alcohol = 1 if random.random() < 0.05 else 0
        ment_hlth = max(0, min(30, int(random.expovariate(0.3))))
        phys_hlth = max(0, min(30, int(random.expovariate(0.2 if is_diabetic else 0.5))))
        sex = 1 if random.random() < 0.48 else 0
        bmi = max(16.0, min(55.0, bmi))
        
        rows.append(f"{high_bp},{high_chol},{bmi},{smoker},{stroke},{heart_disease},{phys_act},{fruits},{veggies},{alcohol},{gen_hlth},{ment_hlth},{phys_hlth},{diff_walk},{sex},{age},{is_diabetic}")
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(rows))
    print(f"Generato: {filepath} ({len(rows)-1} record demografici)")


if __name__ == "__main__":
    print("Inizio generazione dei dataset diabetici...")
    generate_dexcom_cgm()
    generate_freestyle_libre()
    generate_nightscout_json()
    generate_uci_diabetes()
    generate_pima_indians()
    generate_postprandial_curves()
    generate_cdc_indicators()
    print("Tutti i dataset sono stati generati con successo in:", DATASETS_DIR)
