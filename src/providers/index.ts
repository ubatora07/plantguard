import { appConfig } from '../config';
import { getEffectiveAiConfig } from '../features/settings/SettingsContext';
import type { DiagnosisProvider, ProviderMode } from '../types';
import { DemoProvider } from './demo-provider';
import { ModelProvider } from './model-provider';
import { AutoAiProvider } from './auto-ai-provider';
import { OpenAiProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { OpenRouterProvider } from './openrouter-provider';
import { OfflineUnavailableProvider } from './offline-unavailable-provider';

import { OnDeviceVisionClassifier } from '../services/ai/on-device-classifier';

/**
 * Provider factory — the single place where the active diagnosis provider is
 * chosen from configuration. Screens never construct providers directly.
 */
export function createProvider(mode: ProviderMode = 'ai'): DiagnosisProvider {
  const config = getEffectiveAiConfig();
  if (config.preferredProvider === 'offline') {
    return new OfflineUnavailableProvider();
  }
  // A colour-heuristic fallback would fabricate a disease label if the cloud
  // model is unavailable. Surface the real provider error instead.
  return new AutoAiProvider({ ...config, fallbackToOnDevice: false });
}

export {
  DemoProvider,
  ModelProvider,
  AutoAiProvider,
  OpenAiProvider,
  GeminiProvider,
  OpenRouterProvider,
  OfflineUnavailableProvider,
  OnDeviceVisionClassifier,
};
