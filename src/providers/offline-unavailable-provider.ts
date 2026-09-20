import type { AnalyzeRequest, DiagnosisProvider, DiagnosisProviderInfo, DiagnosisResult } from '../types';

/**
 * Placeholder until an evaluated on-device model is bundled. It deliberately
 * returns no diagnosis rather than turning colour heuristics into a disease.
 */
export class OfflineUnavailableProvider implements DiagnosisProvider {
  readonly info: DiagnosisProviderInfo = {
    id: 'offline-model-unavailable',
    mode: 'ai',
    available: false,
    availabilityNote: 'Проверенная офлайн-модель ещё не установлена',
  };

  async analyze(_request: AnalyzeRequest): Promise<DiagnosisResult> {
    return {
      status: 'insufficient_data',
      resultOrigin: 'no_prediction',
      explanation: 'Офлайн-распознавание отключено: в приложении нет валидированной модели заболеваний.',
      symptoms: [],
      recommendations: [
        'Подключитесь к интернету для анализа проверенной моделью',
        'Не используйте диагноз по цвету листа или шаблонным признакам',
      ],
      avoid: ['Не применяйте обработку растений по неподтверждённому диагнозу'],
      limitsOfVisual: 'Для офлайн-диагностики требуется обученная и проверенная на полевых фото модель.',
      failureCode: 'offline_model_unavailable',
      isDemoScenario: false,
    };
  }
}
