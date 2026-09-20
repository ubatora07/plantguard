import * as FileSystem from 'expo-file-system/legacy';
import {
  AnalyzeRequest,
  DiagnosisError,
  DiagnosisProvider,
  DiagnosisProviderInfo,
  DiagnosisResult,
} from '../types';

export class LocalMLProvider implements DiagnosisProvider {
  readonly info: DiagnosisProviderInfo = {
    id: 'local-plantvillage-ml',
    mode: 'ai',
    modelVersion: 'PlantVillage-MobileNetV3-Local',
    available: true,
  };

  private serverUrl: string;

  constructor(serverUrl: string = 'http://127.0.0.1:8000') {
    this.serverUrl = serverUrl;
  }

  async isServerOnline(): Promise<boolean> {
    try {
      const resp = await fetch(`${this.serverUrl}/health`, { method: 'GET' });
      return resp.ok;
    } catch {
      return false;
    }
  }

  async analyze(request: AnalyzeRequest): Promise<DiagnosisResult> {
    if (!request.imageUri) {
      throw new DiagnosisError('invalid_request', 'Отсутствует URI изображения');
    }

    try {
      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(request.imageUri, {
        encoding: 'base64',
      });

      const response = await fetch(`${this.serverUrl}/predict_base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: base64,
        }),
      });

      if (!response.ok) {
        throw new Error(`Сервер вернул статус: ${response.status}`);
      }

      const data = await response.json();

      return {
        status: data.status || 'prediction',
        resultOrigin: 'model_prediction',
        plantVillageClass: data.plantVillageClass,
        diagnosisClass: data.diagnosisClass,
        diagnosisClassLatin: data.diagnosisClassLatin,
        confidence: data.confidence,
        severity: data.severity || 'moderate',
        explanation: data.explanation || 'Распознано моделью PlantVillage CV',
        symptoms: data.symptoms || [],
        recommendations: data.recommendations || [],
        avoid: data.avoid || [],
        limitsOfVisual: data.limitsOfVisual,
        modelVersion: data.modelVersion || this.info.modelVersion,
        isDemoScenario: false,
      };
    } catch (e: any) {
      throw new DiagnosisError(
        'network',
        `Не удалось соединиться с локальным ML-сервером (${this.serverUrl}): ${e.message}`
      );
    }
  }
}
