import * as FileSystem from 'expo-file-system/legacy';
import {
  AnalyzeRequest,
  DiagnosisError,
  DiagnosisProvider,
  DiagnosisProviderInfo,
  DiagnosisResult,
} from '../types';
import { cropById } from '../config';
import { getDiagnosisProtocol } from '../features/diagnosis/vision-protocol';
import { parseVisionResponse } from '../features/diagnosis/vision-response';

export class OpenAiProvider implements DiagnosisProvider {
  info: DiagnosisProviderInfo = {
    id: 'openai',
    mode: 'ai',
    modelVersion: 'gpt-4o-mini',
    available: true,
  };

  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim() || '';
    this.model = model || process.env.EXPO_PUBLIC_OPENAI_MODEL?.trim() || 'gpt-4o-mini';
    this.info.modelVersion = this.model;
    this.info.available = Boolean(this.apiKey);
  }

  async analyze(request: AnalyzeRequest): Promise<DiagnosisResult> {
    const key = this.apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim() || '';
    if (!key) {
      throw new DiagnosisError('model_not_configured', 'API ключ OpenAI не настроен');
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
    const timeoutId = setTimeout(() => abortController.abort(), 6000);

    const signal = request.signal
      ? ((): AbortSignal => {
          const joined = new AbortController();
          request.signal.addEventListener('abort', () => joined.abort());
          abortController.signal.addEventListener('abort', () => joined.abort());
          return joined.signal;
        })()
      : abortController.signal;

    try {
      const url = 'https://api.openai.com/v1/chat/completions';
      const isAuto = request.cropId === 'auto';
      const crop = cropById(request.cropId);
      const lang = request.language || 'ru';

      let analysisQuery = isAuto
        ? 'Пожалуйста, сначала автоматически определи культуру (вид сельскохозяйственного растения) по этой фотографии, а затем проведи фитосанитарную экспресс-диагностику его здоровья. Укажи определенную культуру в поле detectedCrop и plantVillageClass.'
        : `Пожалуйста, проанализируй это растение. Культура, выбранная пользователем: ${crop.name}. Обрати внимание на характерные для нее болезни.`;

      if (lang === 'kk') {
        analysisQuery = isAuto
          ? 'Алдымен фотосурет бойынша ауылшаруашылық дақылын (өсімдік түрін) автоматты түрде анықтаңыз, содан кейін оның фитосанитарлық жағдайын бағалаңыз. Анықталған дақылды detectedCrop өрісіне жазыңыз. Жауапты МІНДЕТТІ ТҮРДЕ ҚАЗАҚ ТІЛІНДЕ қайтар.'
          : `Бұл өсімдікті талдаңыз. Пайдаланушы таңдаған дақыл: ${crop.name}. Тән ауруларға назар аударыңыз. Жауапты МІНДЕТТІ ТҮРДЕ ҚАЗАҚ ТІЛІНДЕ қайтар.`;
      } else if (lang === 'en') {
        analysisQuery = isAuto
          ? 'Please first automatically identify the agricultural crop (plant species) from the photo, and then analyze its phytosanitary health. Specify the identified crop in detectedCrop and plantVillageClass. Respond strictly in English.'
          : `Please analyze this plant leaf. Crop selected by user: ${crop.name}. Identify any disease symptoms. Respond strictly in English.`;
      }

      const diagnosisProtocol = getDiagnosisProtocol(lang);

      const payload = {
        model: this.model,
        messages: [
          { role: 'system', content: diagnosisProtocol },
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisQuery },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.15,
        max_tokens: 1500,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Пустой ответ от OpenAI Vision API');
      }

      return parseVisionResponse(content, this.model);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new DiagnosisError('timeout', 'Превышено время ожидания ответа от OpenAI');
      }
      throw err;
    }
  }
}
