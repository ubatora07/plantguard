import { OnDeviceVisionClassifier } from '../src/services/ai/on-device-classifier';

describe('OnDeviceVisionClassifier', () => {
  let classifier: OnDeviceVisionClassifier;

  beforeEach(() => {
    classifier = new OnDeviceVisionClassifier();
  });

  it('reports on-device vision provider info and availability', () => {
    expect(classifier.info.id).toBe('on-device-vision');
    expect(classifier.info.mode).toBe('ai');
    expect(classifier.info.available).toBe(true);
    expect(classifier.info.modelVersion).toContain('OnDevice-Vision');
  });

  it('performs dynamic analysis for tomato leaf', async () => {
    const result = await classifier.analyze({
      imageUri: 'file:///data/user/0/com.plantguardai.app/files/sample_leaf_31.jpg',
      cropId: 'tomato',
      language: 'ru',
    });

    expect(result.resultOrigin).toBe('model_prediction');
    expect(result.status === 'prediction' || result.status === 'no_signs').toBe(true);
    expect(result.plantVillageClass).toBeDefined();
    expect(result.diagnosisClass).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.explanation).toContain('On-Device Vision AI');
    expect(result.symptoms.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    if (result.status === 'prediction') {
      expect(result.symptomHotspots).toBeDefined();
      expect(result.symptomHotspots?.length).toBe(2);
      expect(result.symptomHotspots?.[0].label).toBeDefined();
      expect(result.symptomHotspots?.[0].x).toBeGreaterThan(0);
      expect(result.symptomHotspots?.[0].y).toBeGreaterThan(0);
    }
  });

  it('supports Kazakh and English languages', async () => {
    const resultKk = await classifier.analyze({
      imageUri: 'file:///sample_leaf_kk.jpg',
      cropId: 'potato',
      language: 'kk',
    });
    expect(resultKk.explanation).toContain('Локалды ЖИ-талдауы');

    const resultEn = await classifier.analyze({
      imageUri: 'file:///sample_leaf_en.jpg',
      cropId: 'apple',
      language: 'en',
    });
    expect(resultEn.explanation).toContain('On-Device Vision AI');
  });

  it('handles auto crop detection mode', async () => {
    const resultAuto = await classifier.analyze({
      imageUri: 'file:///sample_leaf_auto.jpg',
      cropId: 'auto',
      language: 'ru',
    });

    expect(resultAuto.diagnosisClass).toBeDefined();
  });

  it('rejects non-plant images (safety gate)', async () => {
    // Override extractFeatures to simulate non-plant features
    jest.spyOn(classifier as any, 'extractFeatures').mockResolvedValueOnce({
      isPlant: false,
      plantRatio: 0.02,
      skinRatio: 0.45,
      neutralRatio: 0.85,
      brightness: 45,
      contrastEnergy: 20,
      greenRatio: 0.01,
      chlorosisRatio: 0.01,
      necrosisRatio: 0,
      powderMildewRatio: 0,
      rustRatio: 0,
      peakHotspotX: 50,
      peakHotspotY: 50,
      secondaryHotspotX: 50,
      secondaryHotspotY: 50,
      hasLesions: false,
      lesionPixelCount: 0,
    });

    const result = await classifier.analyze({
      imageUri: 'file:///hand_on_keyboard.jpg',
      cropId: 'auto',
      language: 'ru',
    });

    expect(result.status).toBe('not_plant');
    expect(result.diagnosisClass).toBe('Объект не является растением');
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.symptomHotspots).toEqual([]);
  });

  it('accurately detects Colorado potato beetle pest with pest hotspots and bio-treatments', async () => {
    jest.spyOn(classifier as any, 'extractFeatures').mockResolvedValueOnce({
      isPlant: true,
      plantRatio: 0.60,
      skinRatio: 0.05,
      neutralRatio: 0.15,
      brightness: 52,
      contrastEnergy: 45,
      greenRatio: 0.55,
      chlorosisRatio: 0.05,
      necrosisRatio: 0.08,
      powderMildewRatio: 0,
      rustRatio: 0,
      peakHotspotX: 42,
      peakHotspotY: 48,
      secondaryHotspotX: 65,
      secondaryHotspotY: 60,
      hasLesions: true,
      lesionPixelCount: 25,
      pestDetected: 'colorado_beetle',
      pestConfidence: 0.94,
      weedDetected: false,
    });

    const result = await classifier.analyze({
      imageUri: 'file:///potato_beetle.jpg',
      cropId: 'auto',
      language: 'ru',
    });

    expect(result.status).toBe('prediction');
    expect(result.plantVillageClass).toBe('Potato___Colorado_potato_beetle');
    expect(result.diagnosisClass).toContain('Колорадский жук');
    expect(result.explanation).toContain('колорадского жука');
    expect(result.severity).toBe('severe');

    // Hotspot validation
    expect(result.symptomHotspots).toBeDefined();
    expect(result.symptomHotspots?.length).toBeGreaterThanOrEqual(1);
    const pestSpot = result.symptomHotspots?.find((s) => s.type === 'pest');
    expect(pestSpot).toBeDefined();
    expect(pestSpot?.label).toBe('Колорадский жук');
    expect(pestSpot?.x).toBe(42);
    expect(pestSpot?.y).toBe(48);

    // Biological recommendations
    expect(result.recommendations.some((r) => r.includes('Битоксибациллин') || r.includes('Фитоверм'))).toBe(true);
  });

  it('classifies agricultural weeds with agrotechnical suppression guidelines', async () => {
    const result = await classifier.analyze({
      imageUri: 'file:///bindweed.jpg',
      cropId: 'weed',
      language: 'ru',
    });

    expect(result.resultOrigin).toBe('model_prediction');
    expect(result.diagnosisClass).toBeDefined();
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.some((r) => r.includes('корневищ') || r.includes('прополка') || r.includes('плоскорез'))).toBe(true);
  });
});
