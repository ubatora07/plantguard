# PlantGuard AI — Data Dictionary & Entity Specifications

**Version**: 1.0.0  
**Date**: September 2026

---

## 1. Domain Entities

### 1.1 `DiagnosisRecord` (History Entity)
Persisted locally inside `AsyncStorage` key `plantguard.history.v1`.

| Property | Type | Nullable | Description |
|---|---|---|---|
| `id` | `string` | No | Unique identifier (e.g. `an-m8x2z1-9f2b`). |
| `createdAt` | `string` | No | ISO 8601 UTC timestamp of creation. |
| `cropId` | `CropId` | No | Identifier of crop. Supported: `'tomato'`. |
| `crop` | `string` | No | Human-readable crop label, e.g. `"Томат"`. |
| `imageUri` | `string` | No | Local sandbox file URI (`file:///.../plantguard-photos/photo-...jpg`) or empty for demo scenarios. |
| `status` | `DiagnosisStatus` | No | Status code of diagnosis outcome. |
| `resultOrigin` | `ResultOrigin` | No | `'demo_sample'`, `'model_prediction'`, or `'no_prediction'`. |
| `diagnosisClass` | `string` | Yes | Human-readable condition label (present only on successful prediction/scenario). |
| `diagnosisClassLatin`| `string` | Yes | Pathogen binomial name (e.g. `"Alternaria solani"`). |
| `confidence` | `number` | Yes | Calibrated probability in range `0.0..1.0`. Never generated arbitrarily. |
| `explanation` | `string` | No | Explanatory description of symptoms and observations. |
| `symptoms` | `string[]` | No | Array of observable visual symptom descriptors. |
| `recommendations` | `string[]` | No | Safe, non-chemical IPM agronomic practices. |
| `avoid` | `string[]` | No | Harmful or high-risk actions to refrain from. |
| `providerMode` | `ProviderMode` | No | `'demo'` or `'ai'`. |
| `modelVersion` | `string` | Yes | Model identifier string (e.g. `"plantguard-tomato-v1.2"`). |
| `contentVersion` | `string` | Yes | Version of agronomic knowledge base (e.g. `"2026.1"`). |
| `limitsOfVisual` | `string` | Yes | Documented limitations of optical diagnosis for this condition. |
| `failureCode` | `string` | Yes | Error or rejection code if analysis failed or could not classify. |
| `isDemoScenario` | `boolean` | No | Flag indicating whether this record was generated from a bundled scenario. |
| `scenarioId` | `string` | Yes | Bundled scenario identifier (e.g. `"tomato-early-blight-demo"`). |

---

## 2. Enums & Unions

### 2.1 `ResultOrigin`
- `demo_sample`: Result came from a predefined educational scenario.
- `model_prediction`: Result came from an inference model output.
- `no_prediction`: No classification was performed (arbitrary demo photo, blur, or error).

### 2.2 `DiagnosisStatus`
- `idle`: Initial ready state.
- `image_selected`: Photo picked, awaiting user confirmation.
- `validating_image`: Checking dimensions, format, and aspect ratio.
- `ready`: Ready to submit.
- `processing`: Network request or inference in progress.
- `prediction`: Disease or condition identified with acceptable confidence.
- `no_signs`: Healthy leaf without detectable disease symptoms.
- `insufficient_data`: Image resolution, lighting, or focus insufficient for classification.
- `insufficient_quality`: Image rejected by quality pre-check.
- `uncertain`: Symptoms detected but below operational confidence threshold.
- `unsupported_crop`: Image does not belong to supported crop classes.
- `model_not_connected`: Offline DEMO mode with non-scenario photo.
- `model_not_configured`: Backend server URL not set in app configuration.
- `network_error`: Client failed to reach server.
- `server_error`: Server returned HTTP 5xx.
- `cancelled`: Aborted by user action.
- `analysis_failed`: Generic catch-all failure.
