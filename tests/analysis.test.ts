import {
  validateSelectedAsset,
  recordTitle,
  generateId,
} from '../src/features/diagnosis/analysis';
import { formatConfidence, formatRecordDate } from '../src/utils/format';
import type { DiagnosisRecord } from '../src/types';

jest.mock('../src/utils/image-processing', () => ({
  prepareImageForAnalysis: jest.fn().mockResolvedValue('file:///prepared.jpg'),
}));

describe('Analysis helpers & formatting', () => {
  it('generateId produces non-empty unique strings', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  describe('validateSelectedAsset', () => {
    it('validates a proper image URI', () => {
      const result = validateSelectedAsset({
        uri: 'file:///path/to/leaf.jpg',
        type: 'image/jpeg',
        width: 800,
        height: 600,
      });
      expect(result.ok).toBe(true);
    });

    it('rejects empty assets', () => {
      expect(validateSelectedAsset(null).ok).toBe(false);
      expect(validateSelectedAsset({ uri: '' }).ok).toBe(false);
    });

    it('rejects non-image mime types', () => {
      const result = validateSelectedAsset({
        uri: 'file:///path/doc.pdf',
        type: 'application/pdf',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('type');
      }
    });

    it('rejects tiny images below 64px dimension threshold', () => {
      const result = validateSelectedAsset({
        uri: 'file:///icon.png',
        type: 'image/png',
        width: 32,
        height: 32,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('dimensions');
      }
    });
  });

  describe('recordTitle', () => {
    it('returns diagnosisClass if available', () => {
      const record = { diagnosisClass: 'Ранняя пятнистость' } as DiagnosisRecord;
      expect(recordTitle(record)).toBe('Ранняя пятнистость');
    });

    it('returns proper fallback titles based on status', () => {
      expect(recordTitle({ status: 'model_not_connected' } as DiagnosisRecord)).toBe(
        'Модель не подключена'
      );
      expect(recordTitle({ status: 'no_signs' } as DiagnosisRecord)).toBe(
        'Признаки не обнаружены'
      );
      expect(recordTitle({ status: 'insufficient_data' } as DiagnosisRecord)).toBe(
        'Недостаточно данных'
      );
      expect(recordTitle({ status: 'not_plant' } as DiagnosisRecord)).toBe(
        'Объект не является растением'
      );
      expect(recordTitle({ status: 'insufficient_quality' } as DiagnosisRecord)).toBe(
        'Низкое качество снимка'
      );
    });
  });

  describe('format helpers', () => {
    it('formats confidence percentage', () => {
      expect(formatConfidence(0.874)).toBe('87%');
      expect(formatConfidence(1)).toBe('100%');
      expect(formatConfidence(0)).toBe('0%');
    });

    it('formats record date in Russian', () => {
      const formatted = formatRecordDate('2025-06-12T14:32:00.000Z');
      expect(formatted).toContain('2025');
      expect(formatted).toContain('июня');
    });
  });

  describe('analyzeAndCompose auto crop resolution', () => {
    it('automatically identifies crop from PlantVillage class when cropId is auto', async () => {
      const { analyzeAndCompose } = require('../src/features/diagnosis/analysis');
      const mockProvider = {
        info: { id: 'mock', mode: 'demo' as const, available: true },
        analyze: jest.fn().mockResolvedValue({
          status: 'prediction',
          resultOrigin: 'model_prediction',
          plantVillageClass: 'Potato___Late_blight',
          diagnosisClass: 'Фитофтороз картофеля',
          confidence: 0.92,
          explanation: 'Тестовый фитофтороз картофеля',
          symptoms: ['Пятна'],
          recommendations: ['Удалить'],
          avoid: ['Не поливать'],
          isDemoScenario: false,
        }),
      };

      const record = await analyzeAndCompose({
        provider: mockProvider,
        imageUri: 'file:///test-leaf.jpg',
        cropId: 'auto',
      });

      expect(record.cropId).toBe('potato');
      expect(record.crop).toBe('Картофель');
      expect(record.isAutoDetectedCrop).toBe(true);
      expect(record.diagnosisClass).toBe('Фитофтороз картофеля');
    });
  });

  it('does not recompress a photo already prepared by the process screen', async () => {
    const { analyzeAndCompose } = require('../src/features/diagnosis/analysis');
    const { prepareImageForAnalysis } = require('../src/utils/image-processing');
    const provider = {
      info: { id: 'mock-ai', mode: 'ai' as const, available: true },
      analyze: jest.fn().mockResolvedValue({
        status: 'no_signs',
        resultOrigin: 'model_prediction',
        explanation: 'No visible symptoms.',
        symptoms: [],
        recommendations: [],
        avoid: [],
        isDemoScenario: false,
      }),
    };

    await analyzeAndCompose({
      provider,
      imageUri: 'file:///already-prepared.jpg',
      cropId: 'tomato',
      imageAlreadyPrepared: true,
    });

    expect(prepareImageForAnalysis).not.toHaveBeenCalled();
    expect(provider.analyze).toHaveBeenCalledWith(expect.objectContaining({
      imageUri: 'file:///already-prepared.jpg',
    }));
  });
});
