import type {
  AnalyzeRequest,
  DiagnosisErrorCode,
  DiagnosisProvider,
  DiagnosisProviderInfo,
  DiagnosisResult,
  DiagnosisStatus,
} from '../types';
import { cropById } from '../config';
import { CURRENT_CONTENT_VERSION } from '../data/knowledge-base';
import { DiagnosisError } from '../types';

/**
 * Real model provider — a prepared contract for the future backend
 * (see SPEC/ARCHITECTURE.md and MODEL_CONTRACT in src/config.ts).
 *
 * When no endpoint is configured the provider throws a typed
 * `model_not_configured` error — never a fake success. The image is only sent
 * to the network after the user explicitly presses "Анализировать" in AI mode.
 */

export interface ModelProviderOptions {
  baseUrl?: string;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
  /** Injectable fetch for tests. */
  fetchImpl?: typeof fetch;
}

interface BackendDiagnosisResponse {
  requestId?: unknown;
  predictedClass?: unknown;
  confidence?: unknown;
  modelVersion?: unknown;
  explanation?: unknown;
  symptoms?: unknown;
  recommendations?: unknown;
  status?: unknown;
  limitsOfVisual?: unknown;
}


export class ModelProvider implements DiagnosisProvider {
  private readonly baseUrl?: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ModelProviderOptions = {}) {
    this.baseUrl = options.baseUrl?.trim().replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? 4500;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  get info(): DiagnosisProviderInfo {
    const available = Boolean(this.baseUrl);
    return {
      id: 'model',
      mode: 'ai',
      available,
      availabilityNote: available
        ? undefined
        : 'Требуется подключение к серверу с моделью',
    };
  }

  async analyze(request: AnalyzeRequest): Promise<DiagnosisResult> {
    if (!this.baseUrl) {
      throw new DiagnosisError(
        'model_not_configured',
        'Модель не подключена. Задайте адрес сервера в конфигурации приложения.',
      );
    }
    if (!request.imageUri) {
      throw new DiagnosisError('invalid_request', 'Для анализа нужно фото растения');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    // Chain the caller's signal so "cancel" in the UI also aborts the request.
    const onAbort = () => controller.abort();
    request.signal?.addEventListener('abort', onAbort, { once: true });

    try {
      const form = new FormData();
      form.append('image', {
        uri: request.imageUri,
        name: 'leaf.jpg',
        type: 'image/jpeg',
      } as unknown as Blob);
      form.append('crop', request.cropId);

      let response: Response;
      try {
        response = await this.fetchImpl(`${this.baseUrl}/v1/diagnosis`, {
          method: 'POST',
          body: form,
          signal: controller.signal,
        });
      } catch {
        if (controller.signal.aborted) {
          throw new DiagnosisError(
            'timeout',
            'Анализ занял слишком много времени. Попробуйте ещё раз.',
          );
        }
        throw new DiagnosisError(
          'network',
          'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.',
        );
      }

      if (!response.ok) {
        throw new DiagnosisError(
          'server',
          `Сервер вернул ошибку (${response.status}). Попробуйте позже.`,
        );
      }

      let payload: BackendDiagnosisResponse;
      try {
        payload = (await response.json()) as BackendDiagnosisResponse;
      } catch {
        throw new DiagnosisError(
          'invalid_response',
          'Сервер вернул некорректный ответ. Попробуйте позже.',
        );
      }

      return this.mapResponse(payload);
    } finally {
      clearTimeout(timer);
      request.signal?.removeEventListener('abort', onAbort);
    }
  }

  /** Validates and maps the backend payload. Never invents a confidence value. */
  private mapResponse(payload: BackendDiagnosisResponse): DiagnosisResult {
    const confidence = this.parseConfidence(payload.confidence);

    if (typeof payload.predictedClass !== 'string' || payload.predictedClass.length === 0) {
      // A backend may honestly report it cannot classify — map to insufficient data.
      if (payload.status === 'insufficient_data') {
        return {
          status: 'insufficient_data',
          resultOrigin: 'no_prediction',
          failureCode: 'insufficient_quality',
          explanation: 'Модель не смогла надёжно распознать это фото.',
          symptoms: [],
          recommendations: [
            'Сделайте новый снимок с лучшим фокусом и освещением',
            'Покажите лист крупным планом',
          ],
          avoid: ['Не делайте поспешных выводов по одному снимку'],
          isDemoScenario: false,
          modelVersion: this.versionFrom(payload),
          contentVersion: CURRENT_CONTENT_VERSION,
          limitsOfVisual: 'Качество снимка или ракурс не позволяют провести достоверный анализ.',
        };
      }
      throw new DiagnosisError(
        'invalid_response',
        'Сервер вернул некорректный ответ. Попробуйте позже.',
      );
    }

    if (confidence !== undefined && (confidence < 0 || confidence > 1)) {
      throw new DiagnosisError('invalid_response', 'Сервер вернул некорректный ответ.');
    }

    const explanation =
      typeof payload.explanation === 'string' && payload.explanation.length > 0
        ? payload.explanation
        : 'Модель вернула предварительную оценку по фотографии.';

    const limitsOfVisual =
      typeof payload.limitsOfVisual === 'string' && payload.limitsOfVisual.length > 0
        ? payload.limitsOfVisual
        : 'Предварительная визуальная оценка по фотографии не заменяет лабораторную диагностику (микроскопию или ПЦР).';

    return {
      status: 'prediction',
      resultOrigin: 'model_prediction',
      diagnosisClass: payload.predictedClass as string,
      confidence,
      explanation,
      symptoms: this.parseStringList(payload.symptoms),
      recommendations: this.parseStringList(payload.recommendations),
      avoid: ['Не применяйте средства обработки без консультации специалиста'],
      isDemoScenario: false,
      modelVersion: this.versionFrom(payload),
      contentVersion: CURRENT_CONTENT_VERSION,
      limitsOfVisual,
    };

  }

  private parseConfidence(value: unknown): number | undefined {
    if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
    return value;
  }

  private parseStringList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }

  private versionFrom(payload: BackendDiagnosisResponse): string | undefined {
    return typeof payload.modelVersion === 'string' && payload.modelVersion.length > 0
      ? payload.modelVersion
      : undefined;
  }
}

/** Map an internal error code to a UI status when composing a failed record. */
export function statusForErrorCode(code: DiagnosisErrorCode): DiagnosisStatus {
  if (code === 'model_not_configured') return 'model_not_connected';
  return 'analysis_failed';
}

export function cropNameFor(cropId: AnalyzeRequest['cropId']): string {
  return cropById(cropId).name;
}
