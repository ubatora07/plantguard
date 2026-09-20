import { AnalyzeRequest, DiagnosisProvider, DiagnosisProviderInfo, DiagnosisResult } from '../types';
import { GeminiProvider } from './gemini-provider';
import { OpenRouterProvider } from './openrouter-provider';
import { OpenAiProvider } from './openai-provider';
import { metrics } from '../utils/metrics';

export interface AutoAiProviderConfig {
  preferredProvider?: 'auto' | 'gemini' | 'openrouter' | 'openai' | 'offline';
  geminiKey?: string;
  openRouterKey?: string;
  openAiKey?: string;
  openRouterModel?: string;
  openAiModel?: string;
  fallbackToOnDevice?: boolean;
}

export class AutoAiProvider implements DiagnosisProvider {
  info: DiagnosisProviderInfo = {
    id: 'auto-ai',
    mode: 'ai',
    modelVersion: 'auto',
    available: true,
  };

  private providers: DiagnosisProvider[] = [];
  private fallbackToOnDevice: boolean;

  constructor(config?: AutoAiProviderConfig) {
    this.fallbackToOnDevice = Boolean(config?.fallbackToOnDevice);
    const gemini = new GeminiProvider(config?.geminiKey);
    const openRouter = new OpenRouterProvider(config?.openRouterKey, config?.openRouterModel);
    const openAi = new OpenAiProvider(config?.openAiKey, config?.openAiModel);

    const pref = config?.preferredProvider || 'auto';

    if (pref === 'offline') {
      // Offline on-device preference
      this.providers = [];
    } else if (pref === 'gemini') {
      if (gemini.info.available) this.providers.push(gemini);
    } else if (pref === 'openrouter') {
      if (openRouter.info.available) this.providers.push(openRouter);
    } else if (pref === 'openai') {
      if (openAi.info.available) this.providers.push(openAi);
    } else {
      // Auto: priority Gemini -> OpenRouter -> OpenAI
      if (gemini.info.available) this.providers.push(gemini);
      if (openRouter.info.available) this.providers.push(openRouter);
      if (openAi.info.available) this.providers.push(openAi);
    }
  }

  async analyze(request: AnalyzeRequest): Promise<DiagnosisResult> {
    if (this.providers.length === 0) {
      throw new Error('Выбранный AI-провайдер не настроен. Добавьте действующий API-ключ или выберите другого провайдера.');
    }

    const errors: string[] = [];
    for (const provider of this.providers) {
      const startTime = performance.now();
      try {
        const result = await provider.analyze(request);
        const duration = performance.now() - startTime;
        metrics.log('analyze_' + provider.info.id, duration);

        result.modelVersion = provider.info.modelVersion;
        return result;
      } catch (err: any) {
        errors.push('[' + provider.info.id + ']: ' + (err.message || 'unknown error'));
      }
    }

    throw new Error('Все AI провайдеры завершились с ошибкой: ' + errors.join('; '));
  }
}
