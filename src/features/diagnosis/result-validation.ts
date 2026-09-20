import { findProfileByDiagnosisClass } from '../../data/knowledge-base';
import { PLANTVILLAGE_TAXONOMY } from '../../data/plantvillage-taxonomy';
import type { CropSelection, DiagnosisResult } from '../../types';

const RETAKE_RECOMMENDATIONS = [
  'Сделайте несколько резких фото листа с обеих сторон',
  'Снимите растение целиком и крупно участок с признаками при рассеянном дневном свете',
  'При быстром распространении симптомов обратитесь к агроному или в лабораторию',
];

function uncertainResult(result: DiagnosisResult, status: 'uncertain' | 'insufficient_data', reason: string): DiagnosisResult {
  return {
    ...result,
    status,
    resultOrigin: 'no_prediction',
    plantVillageClass: undefined,
    diagnosisClass: undefined,
    diagnosisClassLatin: undefined,
    confidence: undefined,
    severity: undefined,
    symptoms: [],
    symptomHotspots: [],
    differentialDiagnosis: undefined,
    explanation: reason,
    recommendations: RETAKE_RECOMMENDATIONS,
    avoid: ['Не применяйте пестициды и не удаляйте растение только по этому результату'],
    limitsOfVisual: 'Одного фото недостаточно для достоверного различения болезней, вредителей и физиологического стресса.',
    failureCode: status === 'insufficient_data' ? 'low_confidence' : 'unverified_or_conflicting_class',
  };
}

/** Applies taxonomy, crop-consistency, and confidence gates to a live-model answer. */
export function validateModelResult(result: DiagnosisResult, selectedCrop: CropSelection): DiagnosisResult {
  if (result.status === 'not_plant' || result.status === 'insufficient_data') return result;

  const classKey = result.plantVillageClass || result.diagnosisClass || '';
  const taxonomyDef = result.plantVillageClass ? PLANTVILLAGE_TAXONOMY[result.plantVillageClass] : undefined;
  const profile = findProfileByDiagnosisClass(classKey);

  if (!profile) return uncertainResult(result, 'uncertain', 'Модель назвала состояние, которого нет в проверенной базе PlantGuard; результат не показан как диагноз.');
  if (selectedCrop !== 'auto' && profile.cropId !== selectedCrop) return uncertainResult(result, 'uncertain', 'Ответ модели не совпадает с выбранной культурой. Проверьте культуру и повторите съёмку.');

  const confidence = result.confidence;
  if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) return uncertainResult(result, 'uncertain', 'Модель не вернула корректную оценку уверенности, поэтому диагноз не подтверждён.');
  if (confidence < 0.6) return uncertainResult(result, 'insufficient_data', 'Уверенность модели слишком низкая для показа диагноза.');
  if (confidence < 0.85) return uncertainResult(result, 'uncertain', 'Признаки неоднозначны; результат требует повторных фото и проверки специалистом.');
  if (result.status === 'no_signs' && !(taxonomyDef?.isHealthy || profile.id.includes('healthy'))) return uncertainResult(result, 'uncertain', 'Статус «без признаков» не согласован с классом состояния.');
  if (result.status === 'prediction' && (taxonomyDef?.isHealthy || profile.id.includes('healthy'))) return { ...result, status: 'no_signs', severity: 'healthy' };

  return {
    ...result,
    diagnosisClass: profile.label,
    diagnosisClassLatin: profile.latinName || result.diagnosisClassLatin,
    symptoms: profile.symptoms,
    recommendations: profile.recommendations,
    avoid: profile.avoid,
    limitsOfVisual: profile.limitsOfVisual,
    contentVersion: profile.contentVersion,
  };
}
