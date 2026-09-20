import { parseVisionResponse } from '../src/features/diagnosis/vision-response';
import { DiagnosisError } from '../src/types';

describe('vision-response', () => {
  const modelVersion = 'test-model';

  it('parses valid JSON successfully', () => {
    const raw = "```json\n" +
      "{\n" +
      "  \"status\": \"prediction\",\n" +
      "  \"diagnosisClass\": \"Фитофтороз\",\n" +
      "  \"confidence\": 0.9,\n" +
      "  \"severity\": \"severe\",\n" +
      "  \"explanation\": \"Объяснение\",\n" +
      "  \"symptoms\": [\"Симптом 1\"],\n" +
      "  \"recommendations\": [\"Рекомендация 1\"]\n" +
      "}\n" +
      "```";
    const result = parseVisionResponse(raw, modelVersion);
    expect(result.status).toBe('prediction');
    expect(result.diagnosisClass).toBe('Фитофтороз');
    expect(result.severity).toBe('severe');
    expect(result.symptoms).toEqual(['Симптом 1']);
  });

  it('handles not_plant and insufficient_data', () => {
    const notPlant = parseVisionResponse('{"status": "not_plant"}', modelVersion);
    expect(notPlant.status).toBe('not_plant');

    const insufficient = parseVisionResponse('{"status": "insufficient_data"}', modelVersion);
    expect(insufficient.status).toBe('insufficient_data');
  });

  it('handles missing optional fields by providing defaults', () => {
    const raw = '{"status": "no_signs"}';
    const result = parseVisionResponse(raw, modelVersion);
    expect(result.status).toBe('no_signs');
    expect(result.symptoms).toEqual([]);
    expect(result.recommendations).toEqual([]);
    expect(result.avoid).toEqual([]);
    expect(result.explanation).toBe('Объяснение не предоставлено');
  });

  it('throws DiagnosisError on invalid JSON', () => {
    expect(() => parseVisionResponse('not json at all', modelVersion)).toThrow(DiagnosisError);
  });

  it('throws DiagnosisError on unknown status', () => {
    expect(() => parseVisionResponse('{"status": "magic_cure"}', modelVersion)).toThrow(DiagnosisError);
  });

  it('parses, clamps, and validates XAI symptomHotspots', () => {
    const raw = JSON.stringify({
      status: 'prediction',
      diagnosisClass: 'Ранняя пятнистость',
      confidence: 0.88,
      symptomHotspots: [
        { label: 'Очаг некроза', x: 2, y: 99, type: 'necrosis', description: 'Концентрические кольца' },
        { label: 'Хлоротичный ореол', x: 50, y: 55, type: 'halo' },
      ],
    });
    const result = parseVisionResponse(raw, modelVersion);
    expect(result.symptomHotspots).toBeDefined();
    expect(result.symptomHotspots?.length).toBe(2);

    // Coordinates clamped to 5..95
    expect(result.symptomHotspots?.[0].x).toBe(5);
    expect(result.symptomHotspots?.[0].y).toBe(95);
    expect(result.symptomHotspots?.[0].type).toBe('necrosis');
    expect(result.symptomHotspots?.[0].description).toBe('Концентрические кольца');

    expect(result.symptomHotspots?.[1].x).toBe(50);
    expect(result.symptomHotspots?.[1].y).toBe(55);
    expect(result.symptomHotspots?.[1].type).toBe('halo');
  });

  it('does not invent hotspots when the model omitted image-specific coordinates', () => {
    const raw = JSON.stringify({
      status: 'prediction',
      plantVillageClass: 'Tomato___Late_blight',
      diagnosisClass: 'Фитофтороз томата',
      confidence: 0.92,
    });
    const result = parseVisionResponse(raw, modelVersion);
    expect(result.symptomHotspots).toBeUndefined();
  });
});
