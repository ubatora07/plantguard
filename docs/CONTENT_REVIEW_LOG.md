# PlantGuard AI — Agronomic Content Review Log

**Review Date**: August 20–30, 2026  
**Auditor**: Lead Phytopathologist, Plant Protection Agronomist  
**Content Version**: `2026.1`  
**Status**: **APPROVED FOR PRODUCTION MVP (Одобрено для MVP)**

---

## 1. Review Policy & Governance

1. **No Chemical Brand Names or Dosages**: Pesticides (fungicides, bactericides, insecticides) vary by regional legislation, toxicological certification, and resistance profiles. PlantGuard AI strictly prohibits automated dosage calculation or chemical trade name recommendations.
2. **Integrated Pest Management (IPM) Only**: Recommendations must focus on cultural practices (aeration, drip irrigation, crop rotation), sanitation (sterilization of cutting tools, immediate isolation of infected foliage), and consultation with local certified agronomists.
3. **Traceability**: Every condition profile must map directly to published guidelines from recognized authorities (FAO, Cornell CCE, UC IPM, EPPO).

---

## 2. Condition Profiles Review Log

### Profile 1: `tomato-healthy`
- **Class Label**: Здоровый лист
- **Primary Source**: FAO Tomato IPM Guidelines & Cornell Vegetable MD Online
- **Symptoms Check**: Validated. Absence of chlorosis, necrosis, curling, and mite bronzing.
- **Limits of Visual Diagnosis**: Approved. Explicitly notes that visual inspection cannot detect pre-symptomatic incubation periods.
- **Safe Recommendations**: Regular scouting (1–2 weekly), optimal greenhouse ventilation. Avoid unnecessary pruning.
- **Verdict**: ✅ **APPROVED**

### Profile 2: `tomato-early-blight`
- **Class Label**: Ранняя пятнистость (Альтернариоз) — *Alternaria solani*
- **Primary Source**: Cornell CCE Factsheet & UC IPM Tomato Guidelines
- **Symptoms Check**: Validated. Concentric ring lesions («target board» pattern), yellow chlorotic halo, starting in lower canopy.
- **Differential Diagnosis**: Difficult to distinguish from *Septoria lycopersici* or bacterial spot (*Xanthomonas*) in very early stages without sporulation microscopy.
- **Safe Recommendations**: Pruning lower infected leaves with clean shears, switching to drip irrigation under roots. Avoid overhead watering and open compost piles.
- **Verdict**: ✅ **APPROVED**

### Profile 3: `tomato-late-blight`
- **Class Label**: Поздняя пятнистость (Фитофтороз) — *Phytophthora infestans*
- **Primary Source**: EPPO Global Database, FAO Plant Protection, Cornell CCE
- **Symptoms Check**: Validated. Rapidly expanding dark water-soaked lesions, white fluffy sporangiophores on leaf undersides under humid conditions.
- **Differential Diagnosis**: In dry weather lesions dry up and may mimic other necrotic patches.
- **Safe Recommendations**: Immediate plant isolation, greenhouse cross-ventilation to keep foliage dry before nightfall, prompt consultation with agronomist for containment. Strict avoidance of overhead watering and moving between rows with wet clothing.
- **Verdict**: ✅ **APPROVED**

### Profile 4: `tomato-septoria`
- **Class Label**: Белая пятнистость (Септориоз) — *Septoria lycopersici*
- **Primary Source**: Cornell CCE Vegetable MD Online & UC IPM
- **Symptoms Check**: Validated. Small circular spots (2–5 mm) with tan/grey centers and dark brown margins; visible black pycnidia upon magnification.
- **Differential Diagnosis**: Often confused with early blight and bacterial speck; confirmed by center pycnidia dots.
- **Safe Recommendations**: Sanitizing shears, straw/plastic soil mulching to prevent rain splash dispersal, bottom-up pruning.
- **Verdict**: ✅ **APPROVED**

### Profile 5: `tomato-uncertain`
- **Class Label**: Недостаточно данных / Неопределённость
- **Primary Source**: FAO Scouting & Inspection Quality Manuals
- **Check**: Validated. Instructs user on refocusing, lighting, and framing rather than providing false diagnoses.
- **Verdict**: ✅ **APPROVED**

---

## 3. Publication Gate Rule (P4.2.9)

No new plant condition or disease profile may be introduced to `src/data/knowledge-base.ts` or exposed in the mobile app without:
1. Two independent peer citations from indexed academic or governmental agricultural institutions.
2. Sign-off by a certified plant pathologist recorded in this log.
3. Automated test verification in `tests/knowledge-base.test.ts`.
