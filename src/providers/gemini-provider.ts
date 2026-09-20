// SDK 57 throws at runtime for the deprecated top-level readAsStringAsync API.
// The legacy module is the supported compatibility path for reading file:// URIs.
import * as FileSystem from 'expo-file-system/legacy';
import {
  AnalyzeRequest,
  DiagnosisError,
  DiagnosisProvider,
  DiagnosisProviderInfo,
  DiagnosisResult,
} from '../types';
import { appConfig, aiKeys, cropById } from '../config';
import { getDiagnosisProtocol } from '../features/diagnosis/vision-protocol';
import { parseVisionResponse } from '../features/diagnosis/vision-response';

/** Mobile uploads and multimodal inference commonly exceed a few seconds. */
export const GEMINI_REQUEST_TIMEOUT_MS = 25_000;

export class GeminiProvider implements DiagnosisProvider {
  info: DiagnosisProviderInfo = {
    id: 'gemini',
    mode: 'ai',
    modelVersion: 'gemini-3.5-flash-lite',
    available: appConfig.aiBackends.gemini,
  };

  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || aiKeys.google;
    this.model = model || 'gemini-3.5-flash-lite';
    this.info.modelVersion = this.model;
    this.info.available = Boolean(this.apiKey);
  }

  async analyze(request: AnalyzeRequest): Promise<DiagnosisResult> {
    const key = this.apiKey || aiKeys.google;
    if (!key) {
      throw new DiagnosisError('model_not_configured', 'API ключ Gemini не настроен');
    }

    if (!request.imageUri) {
      throw new DiagnosisError('invalid_file', 'Изображение не предоставлено');
    }

    let base64 = '';
    let mimeType = 'image/jpeg';
    try {
      if (request.imageUri.startsWith('data:')) {
        const parts = request.imageUri.split(',');
        base64 = parts[1] || '';
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
      } else {
        base64 = await FileSystem.readAsStringAsync(request.imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (request.imageUri.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        }
      }
    } catch {
      throw new DiagnosisError('invalid_file', 'Не удалось прочитать файл изображения');
    }

    if (!base64.trim()) {
      throw new DiagnosisError('invalid_file', 'Файл изображения пустой или недоступен для чтения');
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), GEMINI_REQUEST_TIMEOUT_MS);

    const signal = request.signal
      ? ((): AbortSignal => {
          const joined = new AbortController();
          request.signal.addEventListener('abort', () => joined.abort());
          abortController.signal.addEventListener('abort', () => joined.abort());
          return joined.signal;
        })()
      : abortController.signal;

    try {
      const isAuto = request.cropId === 'auto';
      const crop = cropById(request.cropId);
      const lang = request.language || 'ru';
      let analysisQuery = isAuto
        ? 'Пожалуйста, сначала автоматически определи культуру (вид сельскохозяйственного растения) по этой фотографии, а затем проведи фитосанитарную экспресс-диагностику его здоровья. Укажи определенную культуру в поле detectedCrop и plantVillageClass.'
        : `Пожалуйста, проанализируй это растение. Культура, выбранная пользователем: ${crop.name}. Обрати внимание на характерные для нее болезни.`;

      if (lang === 'kk') {
        analysisQuery = isAuto
          ? 'Алдымен фотосурет бойынша ауылшаруашылық дақылын (өсімдік түрін) автоматты түрде анықтаңыз, содан кейін оның фитосанитарлық жағдайын бағалаңыз. Анықталған дақылды detectedCrop өрісіне жазыңыз. Жауапты тек қазақ тілінде қайтарыңыз.'
          : `Бұл өсімдікті талдаңыз. Пайдаланушы таңдаған дақыл: ${crop.name}. Тән аурулар мен зиянкестерге назар аударыңыз. Жауапты тек қазақ тілінде қайтарыңыз.`;
      } else if (lang === 'en') {
        analysisQuery = isAuto
          ? 'Please first automatically identify the agricultural crop (plant species) from the photo, and then analyze its phytosanitary health. Specify the identified crop in detectedCrop and plantVillageClass. Please respond strictly in English.'
          : `Please analyze this plant. Crop selected by user: ${crop.name}. Pay attention to its characteristic diseases. Please respond strictly in English.`;
      }

      const diagnosisProtocol = getDiagnosisProtocol(lang);

      const payload = {
        system_instruction: {
          parts: [{ text: diagnosisProtocol }],
        },
        contents: [
          {
            parts: [
              { text: analysisQuery },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2,
        },
      };

      const effectiveModel = this.model;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new DiagnosisError('invalid_response', 'Модель вернула пустой ответ');
      }

      return parseVisionResponse(text, effectiveModel);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new DiagnosisError('timeout', 'Время ожидания ответа истекло');
      }
      if (error instanceof DiagnosisError) {
        throw error;
      }
      throw new DiagnosisError('network', error.message || 'Ошибка сети при обращении к Gemini');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
