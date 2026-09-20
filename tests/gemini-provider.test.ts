import { GEMINI_REQUEST_TIMEOUT_MS, GeminiProvider } from '../src/providers/gemini-provider';

describe('GeminiProvider timeout policy', () => {
  it('allows enough time for a mobile photo analysis before aborting', () => {
    expect(GEMINI_REQUEST_TIMEOUT_MS).toBe(25_000);
  });

  it('uses the low-latency multimodal Flash-Lite model by default', () => {
    expect(new GeminiProvider('test-key').info.modelVersion).toBe('gemini-3.5-flash-lite');
  });
});
