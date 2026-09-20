import { validateModelResult } from '../src/features/diagnosis/result-validation';
import type { DiagnosisResult } from '../src/types';

const baseResult: DiagnosisResult = {
  status: 'prediction',
  resultOrigin: 'model_prediction',
  plantVillageClass: 'Tomato___Early_blight',
  diagnosisClass: 'Ранняя пятнистость (Альтернариоз)',
  confidence: 0.91,
  explanation: 'Visible concentric leaf spots are consistent with this condition.',
  symptoms: ['Концентрические пятна'],
  recommendations: ['Осмотрите соседние растения'],
  avoid: ['Не ставьте окончательный диагноз по одному фото'],
  isDemoScenario: false,
};

describe('validateModelResult', () => {
  it('keeps a high-confidence PlantVillage class that matches the selected crop', () => {
    expect(validateModelResult(baseResult, 'tomato').status).toBe('prediction');
  });

  it('rejects a class that conflicts with the user-selected crop', () => {
    const result = validateModelResult({ ...baseResult, plantVillageClass: 'Potato___Late_blight' }, 'tomato');
    expect(result.status).toBe('uncertain');
    expect(result.diagnosisClass).toBeUndefined();
    expect(result.confidence).toBeUndefined();
  });

  it('does not turn a low-confidence guess into a diagnosis', () => {
    const result = validateModelResult({ ...baseResult, confidence: 0.4 }, 'tomato');
    expect(result.status).toBe('insufficient_data');
    expect(result.diagnosisClass).toBeUndefined();
  });

  it('rejects an unknown condition instead of displaying unverified advice', () => {
    const result = validateModelResult({ ...baseResult, plantVillageClass: undefined, diagnosisClass: 'Неизвестная болезнь' }, 'tomato');
    expect(result.status).toBe('uncertain');
    expect(result.recommendations).toContain('Сделайте несколько резких фото листа с обеих сторон');
  });
});
