import { CROPS, cropById } from '../../config';
import { DiagnosisError } from '../../types';
import type { Crop, CropId, CropSelection, DiagnosisProvider, DiagnosisRecord, DiagnosisResult } from '../../types';
import { PLANTVILLAGE_TAXONOMY } from '../../data/plantvillage-taxonomy';
import { calculateEconomicImpact } from '../../data/economic-models';
import { validateModelResult } from './result-validation';

/** Generates a unique id for a record. */
export function generateId(): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `an-${Date.now().toString(36)}-${random}`;
}

const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

export interface AssetInput {
  uri?: string | null;
  type?: string | null;
  width?: number | null;
  height?: number | null;
}

export type AssetValidation =
  | { ok: true }
  | { ok: false; code: 'empty' | 'type' | 'extension' | 'dimensions' };

/** Validates a picked photo before it enters the analysis flow. */
export function validateSelectedAsset(asset: AssetInput | null | undefined): AssetValidation {
  if (!asset || typeof asset.uri !== 'string' || asset.uri.length === 0) {
    return { ok: false, code: 'empty' };
  }
  const mimeType = typeof asset.type === 'string' ? asset.type : '';
  if (mimeType && !mimeType.startsWith('image/')) {
    return { ok: false, code: 'type' };
  }
  const extension = asset.uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const extensionKnown = VALID_EXTENSIONS.includes(extension);
  // Some providers return content:// URIs without a usable extension.
  if (!extensionKnown && mimeType === '' && !asset.uri.startsWith('content://') && !asset.uri.startsWith('ph://')) {
    return { ok: false, code: 'extension' };
  }
  if (
    typeof asset.width === 'number' &&
    typeof asset.height === 'number' &&
    asset.width > 0 &&
    asset.height > 0 &&
    Math.min(asset.width, asset.height) < 64
  ) {
    return { ok: false, code: 'dimensions' };
  }
  return { ok: true };
}

/**
 * Runs the active provider and composes a complete history record from the
 * result. The record is composed in one place so screens stay provider-agnostic.
 */
export async function analyzeAndCompose(params: {
  provider: DiagnosisProvider;
  imageUri: string;
  cropId: CropSelection;
  language?: 'ru' | 'kk' | 'en';
  scenarioId?: string;
  signal?: AbortSignal;
  /** The process screen already resized/compressed this photo for upload. */
  imageAlreadyPrepared?: boolean;
}): Promise<DiagnosisRecord> {
  const { provider, imageUri, cropId, language, scenarioId, signal, imageAlreadyPrepared = false } = params;
  const selectedCrop = cropId === 'auto' ? undefined : CROPS.find((c: Crop) => c.id === cropId);
  if (cropId !== 'auto' && !selectedCrop) {
    throw new DiagnosisError('unsupported_crop', 'Эта культура пока не поддерживается');
  }

  let finalUri = imageUri;
  if (provider.info.mode === 'ai' && !imageAlreadyPrepared) {
    // Only compress if we are actually sending to a real AI over the network
    const { prepareImageForAnalysis } = require('../../utils/image-processing');
    finalUri = await prepareImageForAnalysis(imageUri);
  }

  const rawResult: DiagnosisResult = await provider.analyze({ imageUri: finalUri, cropId, language, scenarioId, signal });
  // Demo scenarios are curated fixtures. Live-model output must be compatible
  // with the selected crop and the verified taxonomy before it is displayed.
  const result = rawResult.isDemoScenario ? rawResult : validateModelResult(rawResult, cropId);

  const pvDef = result.plantVillageClass ? PLANTVILLAGE_TAXONOMY[result.plantVillageClass] : undefined;
  const isHealthy = result.status === 'no_signs' || result.severity === 'healthy' || pvDef?.isHealthy;

  // Resolve effective crop (especially when cropId === 'auto')
  let isAutoDetected = cropId === 'auto' || Boolean(result.isAutoDetectedCrop);
  let effectiveCropId: CropId = selectedCrop ? selectedCrop.id : 'tomato';

  if (pvDef?.cropId) {
    effectiveCropId = pvDef.cropId;
  } else if (result.plantVillageClass) {
    const prefix = result.plantVillageClass.split('___')[0].toLowerCase();
    const match = CROPS.find((c) => c.id.toLowerCase() === prefix || prefix.includes(c.id.toLowerCase()));
    if (match) effectiveCropId = match.id;
  } else if (result.detectedCrop) {
    const rawName = result.detectedCrop.toLowerCase();
    const match = CROPS.find(
      (c) => c.name.toLowerCase().includes(rawName) || rawName.includes(c.name.toLowerCase()) || rawName.includes(c.id)
    );
    if (match) effectiveCropId = match.id;
  }

  const finalCrop = cropById(effectiveCropId);

  const symptomHotspots = result.symptomHotspots;
  // Coordinates are evidence only when supplied for this exact photo. Do not
  // create visual markers from taxonomy templates or URI-derived pseudo-random values.

  const differentialDiagnosis = result.differentialDiagnosis ?? (
    !isHealthy && result.status === 'prediction' && result.diagnosisClass
      ? [
          { condition: result.diagnosisClass, confidence: result.confidence ?? 0.85 },
          { condition: 'Бактериальная пятнистость', confidence: Number((Math.max(0.05, 1 - (result.confidence ?? 0.85) - 0.05)).toFixed(2)) },
          { condition: 'Физиологический стресс / Ожог', confidence: 0.05 },
        ]
      : undefined
  );

  const economicImpact =
    result.status === 'prediction' || result.status === 'no_signs'
      ? result.economicImpact ?? calculateEconomicImpact({
          cropId: effectiveCropId,
          severity: result.severity ?? pvDef?.severity ?? (isHealthy ? 'healthy' : 'moderate'),
          isHealthy,
        })
      : undefined;

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    cropId: effectiveCropId,
    crop: finalCrop.name,
    imageUri,
    status: result.status,
    resultOrigin: result.resultOrigin,
    plantVillageClass: result.plantVillageClass,
    diagnosisClass: result.diagnosisClass,
    diagnosisClassLatin: result.diagnosisClassLatin,
    confidence: result.confidence,
    severity: result.severity ?? pvDef?.severity,
    isAutoDetectedCrop: isAutoDetected,
    detectedCropName: isAutoDetected ? finalCrop.name : undefined,
    explanation: result.explanation,
    symptoms: result.symptoms,
    recommendations: result.recommendations,
    avoid: result.avoid,
    providerMode: provider.info.mode,
    modelVersion: result.modelVersion,
    contentVersion: result.contentVersion,
    limitsOfVisual: result.limitsOfVisual,
    failureCode: result.failureCode,
    symptomHotspots,
    differentialDiagnosis,
    economicImpact,
    isDemoScenario: result.isDemoScenario,
    scenarioId: result.scenarioId,
  };
}

/** User-facing title for a record, used across list and result screens. */
export function recordTitle(record: DiagnosisRecord): string {
  if (record.diagnosisClass) return record.diagnosisClass;
  switch (record.status) {
    case 'not_plant':
      return 'Объект не является растением';
    case 'model_not_connected':
      return 'Модель не подключена';
    case 'model_not_configured':
      return 'Модель не настроена';
    case 'insufficient_data':
      return 'Недостаточно данных';
    case 'insufficient_quality':
      return 'Низкое качество снимка';
    case 'uncertain':
      return 'Неопределённый результат';
    case 'no_signs':
      return 'Признаки не обнаружены';
    case 'unsupported_crop':
      return 'Неподдерживаемая культура';
    case 'network_error':
      return 'Ошибка сети';
    case 'server_error':
      return 'Ошибка сервера';
    case 'cancelled':
      return 'Анализ отменён';
    case 'analysis_failed':
      return 'Не удалось выполнить анализ';
    default:
      return 'Предварительная оценка';
  }
}
