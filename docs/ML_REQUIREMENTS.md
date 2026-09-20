# PlantGuard AI — Machine Learning Requirements & Governance

**Target Crop**: Tomato (*Solanum lycopersicum*)  
**Version**: 1.0  
**Date**: September 2026  
**Status**: Requirements Specification for Model Training & Deployment

---

## 1. Objectives

PlantGuard AI delivers preliminary field assessment of plant disease symptoms from photos taken on mobile devices. Because agricultural decisions impact crop yield and food security, model training, validation, and calibration must follow strict agronomic and technical governance.

---

## 2. Dataset Criteria & Diversity

### 2.1 Domain Distribution
Models trained solely on pristine lab images (e.g. leaves cut and placed on plain black/white backgrounds under ring lights) fail catastrophically in production. The training corpus must reflect real agricultural reality:

1. **In-situ Field Conditions (≥ 70%)**:
   - Outdoor natural daylight (overcast, direct sun, golden hour).
   - Greenhouse plastic and glass diffused light.
   - Soil, mulch, weeds, strings, and stakes in the background.
   - Dust, dew drops, and spray residue on foliage.
2. **Lab Benchmarks (≤ 30%)**:
   - Curated references for initial feature extraction only.

### 2.2 Class Distribution & Minimum Counts
For Tomato MVP v1:

| Class ID | Agronomic Name | Pathogen / Condition | Minimum Training Images | Validation Images |
|---|---|---|---|---|
| `tomato-healthy` | Здоровый лист | None (normal vegetative growth) | 2,500 | 500 |
| `tomato-early-blight` | Ранняя пятнистость | *Alternaria solani* | 2,500 | 500 |
| `tomato-late-blight` | Поздняя пятнистость | *Phytophthora infestans* | 2,500 | 500 |
| `tomato-septoria` | Белая пятнистость | *Septoria lycopersici* | 2,000 | 400 |
| `out-of-domain` | Невалидный объект / не лист | Weeds, hands, fruit only, non-plant | 3,000 | 600 |

### 2.3 Photographic Variations
- **Sensor Diversity**: Photos must be gathered across at least 15 different smartphone camera sensors (budget Android to flagship iOS).
- **Resolutions**: Native capture from 2 MP to 48 MP; augmented with slight blur, exposure variation (±1.5 EV), and slight digital noise.

---

## 3. Metrics & Quality Gates

Before any model checkpoint is certified for staging or production deployment:

### 3.1 Quantitative Gates
| Metric | Threshold | Evaluation Set |
|---|---|---|
| **Macro Top-1 Accuracy** | \(\ge 92.0\%\) | Hold-out field test set |
| **Per-Class Precision** | \(\ge 88.0\%\) for all classes | Hold-out field test set |
| **Per-Class Recall** | \(\ge 86.0\%\) for all classes | Hold-out field test set |
| **Late Blight Recall** | \(\ge 93.0\%\) (critical pathogen) | High-severity hold-out set |
| **Expected Calibration Error (ECE)** | \(< 0.05\) (5%) | Calibrated via Platt scaling or temperature scaling |
| **False Positive Rate on Healthy** | \(< 5.0\%\) | Healthy cohort |

---

## 4. Uncertainty Policy & Confidence Thresholding

The mobile application enforces strict honesty. The model server must map softmax/sigmoid outputs through calibrated decision boundaries:

```
                  Confidence Score (Calibrated P)
0.00 ------------------- 0.60 ------------------- 0.85 ------------------- 1.00
       [ REJECT ]               [ UNCERTAIN ]               [ PREDICTION ]
 status: "insufficient_data"  status: "uncertain"         status: "prediction"
 No class assigned            Warning badge               Confirmed class
 Prompt to retake photo       Recommends expert check     Actionable guidance
```

1. **High Confidence (\(P \ge 0.85\))**:
   - `status: "prediction"`
   - Provide class name, symptoms, and non-chemical IPM cultural recommendations.
2. **Moderate Confidence (\(0.60 \le P < 0.85\))**:
   - `status: "prediction"` with warning indicator or `status: "uncertain"`.
   - Explains that symptoms are ambiguous (e.g. early Alternaria vs Septoria).
   - Explicitly instructs the grower to inspect undersides of leaves and monitor for 48 hours.
3. **Low Confidence (\(P < 0.60\))**:
   - `status: "insufficient_data"`
   - `failureCode: "insufficient_quality"`
   - Do NOT guess a disease class. Direct the user to retake the photo according to the photo guide.

---

## 5. Model Architecture & Latency Budgets

- **Target Architecture**: MobileNetV4 / EfficientNet-B0 or lightweight Vision Transformer (ViT-Tiny).
- **Input Resolution**: 256×256 px or 384×384 px.
- **Inference Latency Target**:
  - Single GPU (T4/L4): \(< 60\text{ ms}\).
  - CPU fallback (2 vCPU): \(< 300\text{ ms}\).
- **Edge Deployment (Future)**: INT8 quantized ONNX / TFLite runtime target: \(< 12\text{ MB}\) model footprint, \(< 150\text{ ms}\) on mobile NPU.
