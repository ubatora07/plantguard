import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { appConfig } from '../../config';
import { AppLanguage, setAppLanguage, i18n } from '../../i18n';
import type { ProviderMode } from '../../types';

const MODE_KEY = 'plantguard.settings.mode.v1';
const LANG_KEY = 'plantguard.settings.language.v2';
const PROVIDER_KEY = 'plantguard.settings.active_provider.v1';
const KEYS_KEY = 'plantguard.settings.api_keys.v1';

export type ActiveAiProvider = 'auto' | 'gemini' | 'openrouter' | 'openai' | 'offline';

export interface CustomApiKeys {
  gemini: string;
  openRouter: string;
  openAi: string;
}

const DEFAULT_KEYS: CustomApiKeys = {
  gemini: '',
  openRouter: '',
  openAi: '',
};

let currentAiConfig = {
  preferredProvider: 'auto' as ActiveAiProvider,
  geminiKey: '',
  openRouterKey: '',
  openAiKey: '',
};

export function getEffectiveAiConfig() {
  return currentAiConfig;
}

interface SettingsState {
  /** Currently selected analysis mode (always 'ai' in production). */
  mode: ProviderMode;
  /** True when a real model endpoint or keys are configured. */
  aiConfigured: boolean;
  setMode: (mode: ProviderMode) => Promise<void>;
  /** Active UI & AI language. */
  language: AppLanguage;
  /** Changes active language and persists preference. */
  setLanguage: (lang: AppLanguage) => Promise<void>;
  /** Active selected AI Provider. */
  activeProvider: ActiveAiProvider;
  /** Update active AI Provider. */
  setActiveProvider: (provider: ActiveAiProvider) => Promise<void>;
  /** Custom user-provided API keys. */
  customKeys: CustomApiKeys;
  /** Save custom API keys. */
  setCustomKeys: (keys: Partial<CustomApiKeys>) => Promise<void>;
  /** True until the persisted selection has been loaded. */
  ready: boolean;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ProviderMode>('ai');
  const [language, setLanguageState] = useState<AppLanguage>(
    (i18n.locale as AppLanguage) || 'ru'
  );
  const [activeProvider, setActiveProviderState] = useState<ActiveAiProvider>('auto');
  const [customKeys, setCustomKeysState] = useState<CustomApiKeys>(DEFAULT_KEYS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedMode, storedLang, storedProvider, storedKeysJson] = await Promise.all([
          AsyncStorage.getItem(MODE_KEY),
          AsyncStorage.getItem(LANG_KEY),
          AsyncStorage.getItem(PROVIDER_KEY),
          AsyncStorage.getItem(KEYS_KEY),
        ]);
        if (cancelled) return;

        setModeState('ai');

        if (storedLang === 'ru' || storedLang === 'kk' || storedLang === 'en') {
          setLanguageState(storedLang);
          setAppLanguage(storedLang);
        }

        if (
          storedProvider === 'auto' ||
          storedProvider === 'gemini' ||
          storedProvider === 'openrouter' ||
          storedProvider === 'openai' ||
          storedProvider === 'offline'
        ) {
          setActiveProviderState(storedProvider);
          currentAiConfig.preferredProvider = storedProvider;
        }

        if (storedKeysJson) {
          try {
            const parsed = JSON.parse(storedKeysJson);
            const merged = { ...DEFAULT_KEYS, ...parsed };
            setCustomKeysState(merged);
            currentAiConfig.geminiKey = merged.gemini || '';
            currentAiConfig.openRouterKey = merged.openRouter || '';
            currentAiConfig.openAiKey = merged.openAi || '';
          } catch {
            // Ignored
          }
        }
      } catch {
        // Defaults apply when storage is unavailable.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback(async (next: ProviderMode) => {
    setModeState(next);
    try {
      await AsyncStorage.setItem(MODE_KEY, next);
    } catch {
      // Ignore write errors
    }
  }, []);

  const setLanguage = useCallback(async (nextLang: AppLanguage) => {
    setLanguageState(nextLang);
    setAppLanguage(nextLang);
    try {
      await AsyncStorage.setItem(LANG_KEY, nextLang);
    } catch {
      // Selection stays active for the session even if persistence fails.
    }
  }, []);

  const setActiveProvider = useCallback(async (nextProvider: ActiveAiProvider) => {
    setActiveProviderState(nextProvider);
    currentAiConfig.preferredProvider = nextProvider;
    try {
      await AsyncStorage.setItem(PROVIDER_KEY, nextProvider);
    } catch {
      // Ignored
    }
  }, []);

  const setCustomKeys = useCallback(async (partialKeys: Partial<CustomApiKeys>) => {
    setCustomKeysState((prev) => {
      const updated = { ...prev, ...partialKeys };
      currentAiConfig.geminiKey = updated.gemini || '';
      currentAiConfig.openRouterKey = updated.openRouter || '';
      currentAiConfig.openAiKey = updated.openAi || '';
      AsyncStorage.setItem(KEYS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        mode,
        aiConfigured: appConfig.aiConfigured || Boolean(customKeys.gemini || customKeys.openRouter || customKeys.openAi),
        setMode,
        language,
        setLanguage,
        activeProvider,
        setActiveProvider,
        customKeys,
        setCustomKeys,
        ready,
      }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsState {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
