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

export class OpenRouterProvider implements DiagnosisProvider {
  info: DiagnosisProviderInfo = {
    id: 'openrouter',
    mode: 'ai',
    modelVersion: aiKeys.openRouterModel,
    available: appConfig.aiBackends.openRouter,
  };

  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || aiKeys.openRouter;
    this.model = model || aiKeys.openRouterModel;
    this.info.modelVersion = this.model;
    this.info.available = Boolean(this.apiKey);
  }

  async analyze(request: AnalyzeRequest): Promise<DiagnosisResult> {
    const key = this.apiKey || aiKeys.openRouter;
    if (!key) {
      throw new DiagnosisError('model_not_configured', 'API ключ OpenRouter не настроен');
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
    const timeoutId = setTimeout(() => abortController.abort(), 25000);

    const signal = request.signal
      ? ((): AbortSignal => {
          const joined = new AbortController();
          request.signal.addEventListener('abort', () => joined.abort());
          abortController.signal.addEventListener('abort', () => joined.abort());
          return joined.signal;
        })()
      : abortController.signal;

    try {
      const url = 'https://openrouter.ai/api/v1/chat/completions';
      
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

      let effectiveModel = this.model || 'openrouter/free';
      const payload: any = {
        model: effectiveModel,
        messages: [
          {
            role: "system",
            content: diagnosisProtocol,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisQuery,
              },
              {
                type: "image_url",
                image_url: {
                  url: 'data:' + mimeType + ';base64,' + base64
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.15,
        max_tokens: 1500,
      };

      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key,
          'HTTP-Referer': 'https://plantguard.ai',
          'X-Title': 'PlantGuard AI',
        },
        body: JSON.stringify(payload),
        signal,
      });

      // If the model failed due to insufficient credits (HTTP 402) or invalid model ID (HTTP 400),
      // seamlessly fallback to the free vision router 'openrouter/free'
      if (!response.ok && (response.status === 402 || response.status === 400) && effectiveModel !== 'openrouter/free') {
        console.warn(`[OpenRouterProvider] Model ${effectiveModel} failed with HTTP ${response.status}. Retrying with free router openrouter/free...`);
        effectiveModel = 'openrouter/free';
        payload.model = effectiveModel;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key,
            'HTTP-Referer': 'https://plantguard.ai',
            'X-Title': 'PlantGuard AI',
          },
          body: JSON.stringify(payload),
          signal,
        });
      }

      if (!response.ok) {
        let errMessage = '';
        try {
          const errBody = await response.json();
          errMessage = errBody?.error?.message || '';
        } catch {}

        if (response.status === 402) {
          throw new DiagnosisError(
            'model_not_configured',
            `OpenRouter: исчерпан баланс платных токенов (HTTP 402). ${errMessage ? `Детали: ${errMessage}. ` : ''}Пополните баланс на openrouter.ai/settings/credits или выберите бесплатную модель openrouter/free.`
          );
        }

        throw new Error(`OpenRouter HTTP ${response.status}${errMessage ? `: ${errMessage}` : ''}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      
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
      throw new DiagnosisError('network', error.message || 'Ошибка сети при обращении к OpenRouter');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
