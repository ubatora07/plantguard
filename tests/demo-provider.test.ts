import { DemoProvider } from '../src/providers/demo-provider';
import { DiagnosisError } from '../src/types';

describe('DemoProvider', () => {
  let provider: DemoProvider;

  beforeEach(() => {
    provider = new DemoProvider();
  });

  it('reports demo info and availability', () => {
    expect(provider.info.id).toBe('demo');
    expect(provider.info.mode).toBe('demo');
    expect(provider.info.available).toBe(true);
    expect(provider.info.modelVersion).toBeDefined();
  });

  it('lists bundled scenarios', () => {
    const scenarios = provider.listScenarios();
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios.some((s) => s.id === 'tomato-healthy-demo')).toBe(true);
    expect(scenarios.some((s) => s.id === 'tomato-early-blight-demo')).toBe(true);
  });

  it('returns valid diagnosis for tomato-early-blight-demo scenario', async () => {
    const result = await provider.analyze({
      imageUri: 'file:///leaf.jpg',
      cropId: 'tomato',
      scenarioId: 'tomato-early-blight-demo',
    });

    expect(result.status).toBe('prediction');
    expect(result.resultOrigin).toBe('demo_sample');
    expect(result.isDemoScenario).toBe(true);
    expect(result.diagnosisClass).toBe('Возможная ранняя пятнистость');
    expect(result.diagnosisClassLatin).toBe('Alternaria solani');
    expect(result.confidence).toBe(0.88);
    expect(result.contentVersion).toBe('2026.1');
    expect(result.limitsOfVisual).toBeDefined();
    expect(result.symptoms.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.symptomHotspots).toBeDefined();
    expect(result.symptomHotspots?.length).toBe(3);
    expect(result.symptomHotspots?.[0].label).toContain('Очаг некроза');
  });

  it('returns no_signs for tomato-healthy-demo scenario', async () => {
    const result = await provider.analyze({
      imageUri: 'file:///leaf.jpg',
      cropId: 'tomato',
      scenarioId: 'tomato-healthy-demo',
    });

    expect(result.status).toBe('no_signs');
    expect(result.resultOrigin).toBe('demo_sample');
    expect(result.isDemoScenario).toBe(true);
    expect(result.diagnosisClass).toBe('Здоровый лист');
    expect(result.confidence).toBe(0.96);
    expect(result.contentVersion).toBe('2026.1');
    expect(result.limitsOfVisual).toBeDefined();
    expect(result.symptomHotspots).toEqual([]);
  });

  it('returns insufficient_data for tomato-uncertain-demo scenario', async () => {
    const result = await provider.analyze({
      imageUri: 'file:///leaf.jpg',
      cropId: 'tomato',
      scenarioId: 'tomato-uncertain-demo',
    });

    expect(result.status).toBe('insufficient_data');
    expect(result.resultOrigin).toBe('demo_sample');
    expect(result.isDemoScenario).toBe(true);
    expect(result.confidence).toBeUndefined();
    expect(result.contentVersion).toBe('2026.1');
  });

  it('HONESTY: returns model_not_connected for arbitrary user photo without scenarioId', async () => {
    const result = await provider.analyze({
      imageUri: 'file:///my_custom_user_photo.jpg',
      cropId: 'tomato',
    });

    expect(result.status).toBe('model_not_connected');
    expect(result.resultOrigin).toBe('no_prediction');
    expect(result.failureCode).toBe('model_not_connected');
    expect(result.isDemoScenario).toBe(false);
    expect(result.diagnosisClass).toBeUndefined();
    expect(result.diagnosisClassLatin).toBeUndefined();
    expect(result.confidence).toBeUndefined();
    expect(result.symptoms).toEqual([]);
    expect(result.explanation).toContain('Реальная модель распознавания ещё не подключена');
    expect(result.contentVersion).toBe('2026.1');
  });


  it('throws DiagnosisError on unknown scenario id', async () => {
    await expect(
      provider.analyze({
        imageUri: 'file:///leaf.jpg',
        cropId: 'tomato',
        scenarioId: 'unknown-scenario-xyz',
      })
    ).rejects.toThrow(DiagnosisError);
  });
});
