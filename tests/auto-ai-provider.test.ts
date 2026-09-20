import { AutoAiProvider } from '../src/providers/auto-ai-provider';
import { GeminiProvider } from '../src/providers/gemini-provider';
import { OpenRouterProvider } from '../src/providers/openrouter-provider';
import { appConfig } from '../src/config';
import { DiagnosisResult } from '../src/types';

jest.mock('../src/providers/gemini-provider');
jest.mock('../src/providers/openrouter-provider');

describe('AutoAiProvider', () => {
  let geminiAnalyzeMock: jest.Mock;
  let openRouterAnalyzeMock: jest.Mock;
  
  beforeEach(() => {
    jest.useFakeTimers();
    geminiAnalyzeMock = jest.fn();
    openRouterAnalyzeMock = jest.fn();

    (GeminiProvider as jest.Mock).mockImplementation(() => ({
      info: { id: 'gemini', available: true, modelVersion: 'gemini-test' },
      analyze: geminiAnalyzeMock,
    }));

    (OpenRouterProvider as jest.Mock).mockImplementation(() => ({
      info: { id: 'openrouter', available: true, modelVersion: 'openrouter-test' },
      analyze: openRouterAnalyzeMock,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('calls OpenRouter if Gemini fails with a client error instantly', async () => {
    geminiAnalyzeMock.mockRejectedValue(new Error('status: 400 Bad Request')); // Should not retry on 4xx
    openRouterAnalyzeMock.mockResolvedValue({ status: 'prediction', modelVersion: 'openrouter-test' } as DiagnosisResult);

    const provider = new AutoAiProvider();
    const result = await provider.analyze({ imageUri: 'test', cropId: 'tomato' });

    expect(geminiAnalyzeMock).toHaveBeenCalledTimes(1);
    expect(openRouterAnalyzeMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('prediction');
    expect(result.modelVersion).toBe('openrouter-test');
  });

  it('falls back immediately after a transient Gemini error instead of waiting to retry', async () => {
    geminiAnalyzeMock
      .mockRejectedValueOnce(new Error('status: 500'));
    openRouterAnalyzeMock.mockResolvedValue({ status: 'prediction', modelVersion: 'openrouter-test' } as DiagnosisResult);

    const provider = new AutoAiProvider();
    const result = await provider.analyze({ imageUri: 'test', cropId: 'tomato' });

    expect(geminiAnalyzeMock).toHaveBeenCalledTimes(1);
    expect(openRouterAnalyzeMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('prediction');
  });

  it('returns Gemini response if successful', async () => {
    geminiAnalyzeMock.mockResolvedValue({ status: 'prediction', modelVersion: 'gemini-test' } as DiagnosisResult);
    openRouterAnalyzeMock.mockResolvedValue({ status: 'prediction', modelVersion: 'openrouter-test' } as DiagnosisResult);

    const provider = new AutoAiProvider();
    const result = await provider.analyze({ imageUri: 'test', cropId: 'tomato' });

    expect(geminiAnalyzeMock).toHaveBeenCalledTimes(1);
    expect(openRouterAnalyzeMock).not.toHaveBeenCalled();
    expect(result.status).toBe('prediction');
    expect(result.modelVersion).toBe('gemini-test');
  });

  it('throws error if all providers fail', async () => {
    geminiAnalyzeMock.mockRejectedValue(new Error('status: 400'));
    openRouterAnalyzeMock.mockRejectedValue(new Error('status: 400'));

    const provider = new AutoAiProvider();
    
    await expect(provider.analyze({ imageUri: 'test', cropId: 'tomato' })).rejects.toThrow(/Все AI провайдеры завершились с ошибкой/);
  });

  it('never substitutes a colour-heuristic diagnosis when the selected Gemini provider has no key', async () => {
    (GeminiProvider as jest.Mock).mockImplementation(() => ({
      info: { id: 'gemini', available: false },
      analyze: geminiAnalyzeMock,
    }));
    (OpenRouterProvider as jest.Mock).mockImplementation(() => ({
      info: { id: 'openrouter', available: false },
      analyze: openRouterAnalyzeMock,
    }));

    const provider = new AutoAiProvider({ preferredProvider: 'gemini', geminiKey: '' });
    await expect(provider.analyze({ imageUri: 'test', cropId: 'tomato' })).rejects.toThrow(/не настроен|завершились с ошибкой/i);
  });

  it('does not fall through to OpenRouter when Gemini was explicitly selected', async () => {
    geminiAnalyzeMock.mockRejectedValue(new Error('HTTP error! status: 402'));
    openRouterAnalyzeMock.mockResolvedValue({ status: 'prediction' } as DiagnosisResult);

    const provider = new AutoAiProvider({ preferredProvider: 'gemini', geminiKey: 'gemini-key', openRouterKey: 'router-key' });
    await expect(provider.analyze({ imageUri: 'test', cropId: 'tomato' })).rejects.toThrow(/gemini/i);
    expect(openRouterAnalyzeMock).not.toHaveBeenCalled();
  });
});
