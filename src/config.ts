import Constants from 'expo-constants';
import type { Crop, CropId, ProviderMode } from './types';

/** The 14 official crops of the PlantVillage benchmark dataset (1:1 with spMohanty/PlantVillage-Dataset). */
export const CROPS: Crop[] = [
  { id: 'apple', name: 'Яблоня' },
  { id: 'blueberry', name: 'Голубика' },
  { id: 'cherry', name: 'Вишня / Черешня' },
  { id: 'corn', name: 'Кукуруза' },
  { id: 'grape', name: 'Виноград' },
  { id: 'orange', name: 'Цитрус / Апельсин' },
  { id: 'peach', name: 'Персик' },
  { id: 'pepper', name: 'Перец сладкий' },
  { id: 'potato', name: 'Картофель' },
  { id: 'raspberry', name: 'Малина' },
  { id: 'soybean', name: 'Соя' },
  { id: 'squash', name: 'Тыква / Кабачок' },
  { id: 'strawberry', name: 'Клубника' },
  { id: 'tomato', name: 'Томат' },
  { id: 'weed', name: 'Сорняки / Дикоросы' },
];

export const AUTO_CROP: Crop = {
  id: 'tomato', // fallback base id
  name: 'AI автоопределение',
  emoji: '✨',
};

export function cropById(id: CropId | 'auto' | string): Crop {
  if (id === 'auto') {
    return {
      id: 'tomato',
      name: 'AI автоопределение',
      emoji: '✨',
    };
  }
  const crop = CROPS.find((c) => c.id === id);
  return crop ?? CROPS[0];
}

function readEnvMode(): ProviderMode {
  const raw = process.env.EXPO_PUBLIC_DIAGNOSIS_MODE;
  return raw === 'ai' ? 'ai' : 'demo';
}

function readEnvBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL;
  return typeof raw === 'string' ? raw.trim().replace(/\/+$/, '') : '';
}

/**
 * Static runtime configuration. No secrets are ever stored in the client —
 * only a base URL and the preferred mode (see .env.example).
 */
const configuredMode = readEnvMode();
const configuredBaseUrl = readEnvBaseUrl();
const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY?.trim() || '';
const openRouterApiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim() || '';
const openRouterModel = process.env.EXPO_PUBLIC_OPENROUTER_MODEL?.trim() || 'openrouter/free'; // fallback to free vision router if not set

export const aiBackends = {
  gemini: Boolean(googleApiKey),
  openRouter: Boolean(openRouterApiKey),
};

/** The model backend counts as configured only when a base URL or an API key is present. */
export const isModelConfigured = (): boolean => 
  configuredBaseUrl.length > 0 || googleApiKey.length > 0 || openRouterApiKey.length > 0;

export const aiKeys = {
  google: googleApiKey,
  openRouter: openRouterApiKey,
  openRouterModel: openRouterModel,
};

/**
 * The effective mode. "ai" silently degrades to "demo" when no endpoint/key is
 * configured — the app must never fake AI availability.
 */
export const effectiveMode = (): ProviderMode =>
  configuredMode === 'ai' && isModelConfigured() ? 'ai' : 'demo';

export const appConfig = {
  /** Preferred mode from env ("ai" without a URL still reports the raw value for Settings). */
  configuredMode,
  apiBaseUrl: configuredBaseUrl,
  aiConfigured: isModelConfigured(),
  aiBackends,
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
} as const;

/** Public contract description for the future backend (see SPEC/ARCHITECTURE.md). */
export const MODEL_CONTRACT = {
  endpoint: '/v1/diagnosis',
  method: 'POST',
  request: 'multipart/form-data: image file + optional crop field',
  response:
    '{ requestId, predictedClass, confidence?, modelVersion, explanation, symptoms, recommendations, disclaimer }',
  errors: ['invalid_file', 'unsupported_crop', 'model_unavailable', 'timeout'],
} as const;
