import { DiagnosisResult, DiagnosisStatus, DiagnosisError, SymptomHotspot } from '../../types';

export interface RawVisionResponse {
  status: 'prediction' | 'no_signs' | 'insufficient_data' | 'not_plant';
  plantVillageClass?: string | null;
  detectedCrop?: string | null;
  diagnosisClass?: string;
  diagnosisClassLatin?: string | null;
  confidence?: number;
  severity?: 'healthy' | 'mild' | 'moderate' | 'severe';
  explanation?: string;
  symptoms?: string[];
  recommendations?: string[];
  avoid?: string[];
  limitsOfVisual?: string;
  symptomHotspots?: {
    label?: string;
    x?: number;
    y?: number;
    type?: string;
    description?: string;
    radius?: number;
  }[];
  differentialDiagnosis?: { condition: string; confidence: number }[];
}

export function parseVisionResponse(rawText: string, modelVersion: string): Omit<DiagnosisResult, 'scenarioId'> {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '');
  }
  cleaned = cleaned.trim();

  let parsed: RawVisionResponse;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new DiagnosisError('invalid_response', 'Модель вернула невалидный JSON');
  }

  const validStatuses = ['prediction', 'no_signs', 'insufficient_data', 'not_plant'];
  if (!validStatuses.includes(parsed.status)) {
    throw new DiagnosisError('invalid_response', 'Неизвестный статус: ' + parsed.status);
  }

  // Keep only coordinates returned for this specific photograph. Taxonomy
  // illustrations are useful reference material, but are not image evidence.
  let hotspots: SymptomHotspot[] | undefined = undefined;

  if (Array.isArray(parsed.symptomHotspots) && parsed.symptomHotspots.length > 0) {
    hotspots = parsed.symptomHotspots
      .filter((h) => typeof h === 'object' && h !== null)
      .map((h, index) => {
        const xVal = typeof h.x === 'number' && !Number.isNaN(h.x) ? Math.max(5, Math.min(95, Math.round(h.x))) : 50;
        const yVal = typeof h.y === 'number' && !Number.isNaN(h.y) ? Math.max(5, Math.min(95, Math.round(h.y))) : 50;
        const validTypes = ['necrosis', 'halo', 'pustule', 'mildew', 'lesion', 'pest'] as const;
        const type = validTypes.includes(h.type as any) ? (h.type as any) : 'lesion';
        return {
          label: typeof h.label === 'string' && h.label.trim() ? h.label.trim() : `Очаг симптома #${index + 1}`,
          x: xVal,
          y: yVal,
          type,
          description: typeof h.description === 'string' ? h.description.trim() : undefined,
          radius: typeof h.radius === 'number' ? Math.max(5, Math.min(30, Math.round(h.radius))) : undefined,
        };
      });
  }

  return {
    status: parsed.status as DiagnosisStatus,
    resultOrigin: 'model_prediction',
    plantVillageClass: parsed.plantVillageClass || undefined,
    detectedCrop: parsed.detectedCrop || undefined,
    isAutoDetectedCrop: Boolean(parsed.detectedCrop),
    diagnosisClass: parsed.diagnosisClass,
    diagnosisClassLatin: parsed.diagnosisClassLatin || undefined,
    confidence: parsed.confidence,
    severity: parsed.severity,
    explanation: parsed.explanation || 'Объяснение не предоставлено',
    symptoms: parsed.symptoms || [],
    recommendations: parsed.recommendations || [],
    avoid: parsed.avoid || [],
    limitsOfVisual: parsed.limitsOfVisual,
    symptomHotspots: hotspots,
    differentialDiagnosis: Array.isArray(parsed.differentialDiagnosis) ? parsed.differentialDiagnosis : undefined,
    modelVersion,
    isDemoScenario: false,
  };
}
