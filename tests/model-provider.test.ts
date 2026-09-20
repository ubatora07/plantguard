import { ModelProvider } from '../src/providers/model-provider';
import { DiagnosisError } from '../src/types';

describe('ModelProvider', () => {
  it('throws model_not_configured when baseUrl is omitted', async () => {
    const provider = new ModelProvider();
    expect(provider.info.available).toBe(false);

    await expect(
      provider.analyze({
        imageUri: 'file:///photo.jpg',
        cropId: 'tomato',
      })
    ).rejects.toThrow(DiagnosisError);

    try {
      await provider.analyze({
        imageUri: 'file:///photo.jpg',
        cropId: 'tomato',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(DiagnosisError);
      expect((err as DiagnosisError).code).toBe('model_not_configured');
    }
  });

  it('throws invalid_request if imageUri is empty', async () => {
    const provider = new ModelProvider({ baseUrl: 'https://api.plantguard.ai' });
    await expect(
      provider.analyze({
        imageUri: '',
        cropId: 'tomato',
      })
    ).rejects.toThrow(DiagnosisError);
  });

  it('sends request and parses valid model response correctly', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'prediction',
        predictedClass: 'Ранняя пятнистость',
        confidence: 0.89,
        explanation: 'Обнаружены концентрические пятна Alternaria',
        symptoms: ['Округлые тёмные пятна'],
        recommendations: ['Осмотрите соседние листья'],
        modelVersion: 'tomato-net-v2.1',
      }),
    });

    const provider = new ModelProvider({
      baseUrl: 'https://api.plantguard.ai',
      fetchImpl: mockFetch as unknown as typeof fetch,
    });

    const result = await provider.analyze({
      imageUri: 'file:///leaf.jpg',
      cropId: 'tomato',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.plantguard.ai/v1/diagnosis',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(result.status).toBe('prediction');
    expect(result.resultOrigin).toBe('model_prediction');
    expect(result.diagnosisClass).toBe('Ранняя пятнистость');
    expect(result.confidence).toBe(0.89);
    expect(result.modelVersion).toBe('tomato-net-v2.1');
    expect(result.contentVersion).toBe('2026.1');
    expect(result.limitsOfVisual).toBeDefined();
    expect(result.isDemoScenario).toBe(false);
  });

  it('correctly maps insufficient_data backend response to no_prediction result', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'insufficient_data',
        predictedClass: '',
        confidence: null,
        modelVersion: 'tomato-net-v2.1',
      }),
    });

    const provider = new ModelProvider({
      baseUrl: 'https://api.plantguard.ai',
      fetchImpl: mockFetch as unknown as typeof fetch,
    });

    const result = await provider.analyze({
      imageUri: 'file:///blurry_leaf.jpg',
      cropId: 'tomato',
    });

    expect(result.status).toBe('insufficient_data');
    expect(result.resultOrigin).toBe('no_prediction');
    expect(result.failureCode).toBe('insufficient_quality');
    expect(result.contentVersion).toBe('2026.1');
    expect(result.confidence).toBeUndefined();
  });

  it('handles backend 500 errors gracefully', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        error: { code: 'server_error', message: 'Internal error' },
      }),
    });

    const provider = new ModelProvider({
      baseUrl: 'https://api.plantguard.ai',
      fetchImpl: mockFetch as unknown as typeof fetch,
    });

    await expect(
      provider.analyze({
        imageUri: 'file:///leaf.jpg',
        cropId: 'tomato',
      })
    ).rejects.toThrow(DiagnosisError);
  });

});
