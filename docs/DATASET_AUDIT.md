# PlantGuard AI — Dataset Audit & Benchmark Analysis

**Document Version**: 1.0  
**Target Crop**: Tomato (*Solanum lycopersicum*)  
**Date**: September 2026

---

## 1. Supported Disease Classes (P4.1.1)

| Class ID | Agronomic Label | Pathogen | Taxonomy | Severity Focus |
|---|---|---|---|---|
| `tomato-healthy` | Здоровый лист | None | Normal foliage | Vegetative stage |
| `tomato-early-blight` | Ранняя пятнистость | *Alternaria solani* | Fungi (Pleosporaceae) | Lower/middle canopy |
| `tomato-late-blight` | Поздняя пятнистость | *Phytophthora infestans* | Oomycota (Peronosporaceae) | Critical quarantine pathogen |
| `tomato-septoria` | Белая пятнистость | *Septoria lycopersici* | Fungi (Mycosphaerellaceae) | Circular lesions with pycnidia |
| `tomato-uncertain` | Неопределённое состояние | Out-of-distribution / Poor quality | Any | Rejection threshold |

---

## 2. Dataset Provenance & Licensing (P4.1.2 & P4.1.3)

| Dataset | Origin | Number of Images | In-Situ vs Lab | License | Status for Training |
|---|---|---|---|---|---|
| **PlantVillage (Tomato subset)** | Hughes & Salathé (Penn State, 2015) | 15,914 | **Lab only** (detached leaves, uniform grey/black paper) | CC-BY 4.0 | Approved for pre-training only. **Forbidden** as sole evaluation set due to background bias. |
| **PlantDoc** | Singh et al. (IIT, 2019) | 2,598 | **In-situ field** (real plants, weeds, natural lighting) | CC-BY 4.0 | Approved for fine-tuning & evaluation. |
| **FieldTomato-2026 (Internal Pilot)** | Collected during Phase 1 pilot | 1,200 | **Real greenhouses & fields** (smartphones) | Proprietary / Consented | Target hold-out evaluation benchmark. |

---

## 3. Data Leak Prevention & Partitioning (P4.1.4)

### Grouped Split by Plant & Farm
A critical failure in agricultural computer vision is splitting photos of the same plant or cluster across training and testing sets.
- **Partitioning Rule**: Splits must be grouped by **Unique Plant ID** and **Collection Date**.
- Images taken from consecutive angles of the same diseased plant must NEVER exist in both train and test partitions.
- **Split Ratio**: 70% Train / 15% Validation / 15% Test.

---

## 4. Diversity & Robustness Criteria (P4.1.5 – P4.1.9)

### 4.1 In-Situ Conditions vs Lab (P4.1.5)
Hold-out test benchmark must comprise **100% field images**:
- Plants with varying soil background (dark humus, sandy, straw mulch, black plastic).
- Ambient foliage and trellis strings.

### 4.2 Environmental Variations (P4.1.6)
- **Direct Sun**: High contrast, cast shadows, harsh highlights.
- **Overcast**: Low contrast, diffused shadows.
- **Greenhouse Polyethylene**: Yellow-tinted diffused illumination.
- **Wet foliage**: Natural dew and spray drops (must not trigger false positive blight predictions).

### 4.3 Negative & Challenge Cohorts (P4.1.7 – P4.1.9)
1. **Healthy Leaves (P4.1.7)**: Clean leaves across young seedlings, mature fruiting plants, and senescent lower leaves.
2. **Poor Quality / Blur (P4.1.8)**: Motion blur, defocus, extreme underexposure (< 15 lux), extreme overexposure. The model MUST output `status: "insufficient_data"` for this cohort.
3. **Out-of-Scope Objects (P4.1.9)**: Hands holding leaves, garden tools, weeds, tomato fruits only, cucumber leaves submitted under tomato category. Must trigger `unsupported_crop` or `uncertain`.

---

## 5. Dataset Versioning & Governance (P4.1.10 – P4.1.12)

- **Active Dataset Version**: `plantguard-tomato-ds-v1.0`
- **Labeling Protocol**: Double-blind annotation by two certified agronomists; disagreements resolved by senior phytopathologist.
- **Test Set Isolation**: The test partition is sealed in cold storage; hyperparameters and feature weights must never be tuned against it.
