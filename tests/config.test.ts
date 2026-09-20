import { isModelConfigured, effectiveMode, aiBackends } from '../src/config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('reports configured if at least one API key is present', () => {
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY = 'test';
    const config = require('../src/config');
    expect(config.isModelConfigured()).toBe(true);
    expect(config.aiBackends.gemini).toBe(true);
  });

  it('silently falls back to demo if ai is requested but not configured', () => {
    process.env.EXPO_PUBLIC_DIAGNOSIS_MODE = 'ai';
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY = '';
    process.env.EXPO_PUBLIC_OPENROUTER_API_KEY = '';
    process.env.EXPO_PUBLIC_API_BASE_URL = '';
    const config = require('../src/config');
    expect(config.effectiveMode()).toBe('demo');
  });

  it('cropById returns AUTO_CROP for auto', () => {
    const { cropById, AUTO_CROP } = require('../src/config');
    const auto = cropById('auto');
    expect(auto.name).toBe('AI автоопределение');
    expect(auto.emoji).toBe('✨');
  });
});
