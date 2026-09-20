/**
 * Core domain types for the diagnosis pipeline.
 *
 * The UI layer only talks to `DiagnosisProvider` implementations and the
 * history repository — never to provider internals.
 */

/** Which provider produced a result. */
export type ProviderMode = 'demo' | 'ai';

/** The 14 official crops of the PlantVillage benchmark dataset (1:1 with spMohanty/PlantVillage-Dataset). */
export type CropId =
  | 'apple'
  | 'blueberry'
  | 'cherry'
  | 'corn'
  | 'grape'
  | 'orange'
  | 'peach'
  | 'pepper'
  | 'potato'
  | 'raspberry'
  | 'soybean'
  | 'squash'
  | 'strawberry'
  | 'tomato'
  | 'weed';

export type CropSelection = CropId | 'auto';

export interface Crop {
  id: CropId;
  /** Display name in the UI language. */
  name: string;
  /** Optional icon or emoji for UI display. */
  emoji?: string;
}

/** Origin of the diagnosis result (Roadmap Stage 1). */
export type ResultOrigin = 'demo_sample' | 'model_prediction' | 'no_prediction';

/**
 * Result statuses.
 * - `prediction` — a preliminary class was produced (demo scenario or real model).
 * - `no_signs` — nothing suspicious found (demo "healthy" scenario or model).
 * - `insufficient_data` / `insufficient_quality` — the provider cannot give a meaningful answer.
 * - `uncertain` — ambiguous visual signs, model or classifier cannot confirm with confidence.
 * - `unsupported_crop` — selected crop is not supported by the model.
 * - `model_not_connected` — honest status used in demo mode for arbitrary user photos.
 * - `model_not_configured` — backend endpoint is not set.
 * - `network_error` / `server_error` / `analysis_failed` — communication or server errors.
 * - `cancelled` — user aborted analysis.
 */
export type DiagnosisStatus =
  | 'idle'
  | 'image_selected'
  | 'validating_image'
  | 'ready'
  | 'processing'
  | 'prediction'
  | 'no_signs'
  | 'insufficient_data'
  | 'insufficient_quality'
  | 'uncertain'
  | 'unsupported_crop'
  | 'model_not_connected'
  | 'model_not_configured'
  | 'network_error'
  | 'server_error'
  | 'cancelled'
  | 'not_plant'
  | 'queued'
  | 'analysis_failed';

/** A single stored analysis entry (history record). */
export interface DiagnosisRecord {
  id: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  cropId: CropId;
  /** Display crop name, e.g. "Томат". */
  crop: string;
  /** Local file URI of the photo; empty string for bundled demo scenarios without a photo. */
  imageUri: string;
  status: DiagnosisStatus;
  resultOrigin: ResultOrigin;
  /** Standardized PlantVillage benchmark class, e.g. 'Tomato___Early_blight'. */
  plantVillageClass?: string;
  /** Human-readable class label. Present ONLY for demo scenarios or real model responses. */
  diagnosisClass?: string;
  /** Latin name, when it comes from verified scenario/model data. */
  diagnosisClassLatin?: string;
  /** 0..1. Present ONLY for demo scenarios or real model responses — never invented. */
  confidence?: number;
  severity?: 'healthy' | 'mild' | 'moderate' | 'severe';
  explanation: string;
  symptoms: string[];
  recommendations: string[];
  /** Safe actions the user should avoid until the cause is clear. */
  avoid: string[];
  providerMode: ProviderMode;
  modelVersion?: string;
  /** Content version for agronomic descriptions (e.g. "2026.1"). */
  contentVersion?: string;
  /** Limitations of visual assessment for this class. */
  limitsOfVisual?: string;
  /** Failure code if analysis could not produce a diagnosis. */
  failureCode?: string;
  /** Explainable AI (XAI): coordinates of detected disease hotspots (0..100%). */
  symptomHotspots?: SymptomHotspot[];
  /** Differential diagnosis breakdown (Top-2/3 conditions). */
  differentialDiagnosis?: DifferentialDiagnosisItem[];
  /** Economic loss and bio-treatment ROI estimate. */
  economicImpact?: EconomicImpact;
  /** True when the plant crop was automatically detected by AI instead of manual selection. */
  isAutoDetectedCrop?: boolean;
  /** Detected crop name if auto-identified. */
  detectedCropName?: string;
  /** True only when the record was produced from an explicit bundled demo scenario. */
  isDemoScenario: boolean;
  /** Scenario id when the record was produced from a bundled demo scenario. */
  scenarioId?: string;
}

export interface SymptomHotspot {
  label: string;
  x: number; // 0..100%
  y: number; // 0..100%
  type?: 'necrosis' | 'halo' | 'pustule' | 'mildew' | 'lesion' | 'pest';
  description?: string;
  radius?: number; // 0..100%
}

export interface DifferentialDiagnosisItem {
  condition: string;
  confidence: number;
}

export interface EconomicImpact {
  estimatedLossPercent: number;
  estimatedLossRubPerHa: number;
  treatmentCostRubPerHa: number;
  roiMultiplier: number;
}

/** Input for a diagnosis request. */
export interface AnalyzeRequest {
  /** Local image URI. */
  imageUri: string;
  cropId: CropSelection;
  /** Active language for AI response ('ru' | 'kk' | 'en'). */
  language?: 'ru' | 'kk' | 'en';
  /** Optional scenario id (if any). */
  scenarioId?: string;
  /** Abort signal for cancellable model requests. */
  signal?: AbortSignal;
}

/** What a provider returns before the app wraps it into a stored record. */
export interface DiagnosisResult {
  status: DiagnosisStatus;
  resultOrigin: ResultOrigin;
  /** Standardized PlantVillage benchmark class, e.g. 'Tomato___Early_blight'. */
  plantVillageClass?: string;
  diagnosisClass?: string;
  diagnosisClassLatin?: string;
  /** 0..1 — only when it comes from a demo scenario or a real model response. */
  confidence?: number;
  severity?: 'healthy' | 'mild' | 'moderate' | 'severe';
  explanation: string;
  symptoms: string[];
  recommendations: string[];
  avoid: string[];
  modelVersion?: string;
  contentVersion?: string;
  limitsOfVisual?: string;
  failureCode?: string;
  symptomHotspots?: SymptomHotspot[];
  differentialDiagnosis?: DifferentialDiagnosisItem[];
  economicImpact?: EconomicImpact;
  /** True when the plant crop was automatically detected by AI instead of manual selection. */
  isAutoDetectedCrop?: boolean;
  /** Detected crop name or key. */
  detectedCrop?: string;
  /** True only for bundled demo scenario outcomes. */
  isDemoScenario: boolean;
  scenarioId?: string;
}

/** Static provider metadata. */
export interface DiagnosisProviderInfo {
  id: string;
  mode: ProviderMode;
  /** Human-readable model/scenario version, when available. */
  modelVersion?: string;
  /** True when the provider can run right now (offline demo or configured backend). */
  available: boolean;
  /** Short user-facing explanation why the provider is unavailable, if applicable. */
  availabilityNote?: string;
}

/**
 * Typed error codes shared by providers. UI maps codes to human messages
 * and never shows stack traces or raw server payloads.
 */
export type DiagnosisErrorCode =
  | 'model_not_configured'
  | 'invalid_file'
  | 'unsupported_crop'
  | 'network'
  | 'timeout'
  | 'server'
  | 'invalid_response'
  | 'aborted'
  | 'invalid_request';

export class DiagnosisError extends Error {
  readonly code: DiagnosisErrorCode;

  constructor(code: DiagnosisErrorCode, message: string) {
    super(message);
    this.name = 'DiagnosisError';
    this.code = code;
  }
}

/** The contract every diagnosis provider must implement. */
export interface DiagnosisProvider {
  info: DiagnosisProviderInfo;
  analyze(request: AnalyzeRequest): Promise<DiagnosisResult>;
}
