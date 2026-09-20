# PlantGuard AI — Machine Learning Model Evaluation Report

**Model Candidate**: `plantguard-tomato-v1.2`  
**Architecture Specification**: MobileNetV4-Conv-Small (quantized to INT8)  
**Input Resolution**: 256×256 px, RGB, ImageNet normalization  
**Evaluation Date**: September 2026  
**Status**: **PRE-PILOT STAGING AUDIT (Предпилотный аудит)**

---

## 1. Important Note on Metrics & Honesty

> **HONESTY NOTICE**: The target thresholds (\(\text{Top-1 Accuracy} \ge 92.0\%\), \(\text{ECE} < 0.05\), \(\text{p95 latency} < 2500\text{ ms}\)) documented in [`ML_REQUIREMENTS.md`](ML_REQUIREMENTS.md) are **target acceptance gates**, not claimed historical measurements. No production server is currently spun up in `.env` (`EXPO_PUBLIC_API_BASE_URL` is empty). Therefore, live cloud latency and test-set inference are documented here as the mandatory evaluation protocol prior to opening the AI mode to general users.

---

## 2. Evaluation Protocol & Target Test Set (P4.3.1 – P4.3.4)

### 2.1 Preprocessing Pipeline Alignment (P4.3.2)
1. Input: Binary JPEG/PNG/WebP.
2. Aspect ratio preserving resize: Short side scaled to 256 px.
3. Center crop to 256×256 px.
4. Tensor normalization: Mean `[0.485, 0.456, 0.406]`, Std `[0.229, 0.224, 0.225]`.

### 2.2 Test Set Composition (P4.3.3)
Hold-out test partition of 600 in-situ field photos:
- `tomato-healthy`: 120 images
- `tomato-early-blight`: 120 images
- `tomato-late-blight`: 120 images
- `tomato-septoria`: 120 images
- `challenge-blur-or-weed` (rejection cohort): 120 images

---

## 3. Evaluation Metrics & Confusion Matrix Template (P4.3.5 – P4.3.8)

### Target Confusion Matrix Schema
```
                 Predicted Healthy | Early Blight | Late Blight | Septoria | Uncertain / Rejection
Actual Healthy       [ T_H ]             [   ]          [   ]        [   ]             [   ]
Early Blight         [   ]               [ T_EB]        [   ]        [   ]             [   ]
Late Blight          [   ]               [   ]          [ T_LB]      [   ]             [   ]
Septoria             [   ]               [   ]          [   ]        [ T_S ]           [   ]
Challenge Cohort     [   ]               [   ]          [   ]        [   ]             [ T_R ]
```

### Critical Pathogen Protection (Late Blight)
Due to the aggressive destruction caused by *Phytophthora infestans*, the operational false-negative cost is catastrophic.
- **Rule**: If the predicted probability for *Phytophthora* exceeds `0.40`, the model must NOT classify the leaf as healthy; it must trigger `status: "uncertain"` with an advisory warning to inspect leaf undersides for sporangiophores.

---

## 4. Rejection Policy on Ambiguous & Blur Photos (P4.3.10 – P4.3.12)

The client and server enforce calibrated rejection:
- When max softmax probability \(P < 0.60\), the response status MUST be `insufficient_data` or `uncertain`.
- Tested in [`tests/model-provider.test.ts`](../tests/model-provider.test.ts):
  *Mock payload with `status: "insufficient_data"` correctly maps to `resultOrigin: "no_prediction"`, `failureCode: "insufficient_quality"`, and prompts the user to retake the photo.*

---

## 5. Decision on Pilot Admission (P4.3.17)

- **Phase 1 (Offline DEMO & Agronomic Usability)**: **ADMITTED**. Field agronomists can test symptom guides, photo alignment, and cultural recommendations on mobile devices immediately.
- **Phase 2 (Cloud AI Inference)**: **CONDITIONAL ON SERVER DEPLOYMENT**. Live AI inference will be unlocked in `.env` once the server checkpoint benchmark test run is logged in this file with empirical metrics.
