import { OpenAiProvider } from '../src/providers/openai-provider';
import { AutoAiProvider } from '../src/providers/auto-ai-provider';
import { GeminiProvider } from '../src/providers/gemini-provider';
import { OpenRouterProvider } from '../src/providers/openrouter-provider';
import { getEffectiveAiConfig } from '../src/features/settings/SettingsContext';

jest.mock('../src/providers/gemini-provider');
jest.mock('../src/providers/openrouter-provider');

describe('Custom API Keys & Multi-Provider configuration', () => {
  it('instantiates OpenAiProvider with custom key and configuration', () => {
    const provider = new OpenAiProvider('test-custom-openai-key', 'gpt-4o');
    expect(provider.info.id).toBe('openai');
    expect(provider.info.available).toBe(true);
    expect(provider.info.modelVersion).toContain('gpt-4o');
  });

  it('marks OpenAiProvider unavailable when no key is supplied', () => {
    const provider = new OpenAiProvider('', 'gpt-4o');
    expect(provider.info.available).toBe(false);
  });

  it('AutoAiProvider prioritizes user configured provider', async () => {
    const geminiMock = jest.fn().mockResolvedValue({ status: 'prediction', modelVersion: 'gemini-custom' });
    const openRouterMock = jest.fn().mockResolvedValue({ status: 'prediction', modelVersion: 'openrouter-custom' });

    (GeminiProvider as jest.Mock).mockImplementation(() => ({
      info: { id: 'gemini', available: true, modelVersion: 'gemini-custom' },
      analyze: geminiMock,
    }));

    (OpenRouterProvider as jest.Mock).mockImplementation(() => ({
      info: { id: 'openrouter', available: true, modelVersion: 'openrouter-custom' },
      analyze: openRouterMock,
    }));

    // Test with preferredProvider = 'openrouter'
    const provider = new AutoAiProvider({
      preferredProvider: 'openrouter',
      openRouterKey: 'custom-or-key',
    });

    const result = await provider.analyze({ imageUri: 'test', cropId: 'tomato' });
    expect(openRouterMock).toHaveBeenCalledTimes(1);
    expect(result.modelVersion).toBe('openrouter-custom');
  });

  it('provides getEffectiveAiConfig defaults', () => {
    const config = getEffectiveAiConfig();
    expect(config).toBeDefined();
    expect(typeof config.preferredProvider).toBe('string');
  });
});
