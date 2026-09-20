import {
  PLANTVILLAGE_TAXONOMY,
  PLANTVILLAGE_CLASSES_LIST,
  PLANTVILLAGE_CROPS,
  findPlantVillageDef,
  getClassesForCrop,
} from '../src/data/plantvillage-taxonomy';
import {
  PLANTVILLAGE_IMAGES,
  getPlantVillageImage,
  getPlantVillageRemoteUrl,
} from '../src/data/plantvillage-images';
import { findProfileByDiagnosisClass } from '../src/data/knowledge-base';

describe('PlantVillage Benchmark Taxonomy & Knowledge Base (Track 3)', () => {
  it('contains exactly 38 classes matching the Penn State / Kaggle benchmark', () => {
    expect(Object.keys(PLANTVILLAGE_TAXONOMY).length).toBe(38);
    expect(PLANTVILLAGE_CLASSES_LIST.length).toBe(38);
  });

  it('has an authentic image asset and remote URL for all 38 classes (0 missing)', () => {
    expect(Object.keys(PLANTVILLAGE_IMAGES).length).toBe(38);

    for (const item of PLANTVILLAGE_CLASSES_LIST) {
      const img = getPlantVillageImage(item.key);
      expect(img).toBeDefined();

      const url = getPlantVillageRemoteUrl(item.key);
      expect(url).toBeDefined();
      expect(url).toContain('https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset');
    }
  });

  it('covers all 14 benchmark crops', () => {
    expect(PLANTVILLAGE_CROPS.length).toBe(14);

    const cropsWithClasses = new Set(PLANTVILLAGE_CLASSES_LIST.map((c) => c.cropId));
    for (const crop of PLANTVILLAGE_CROPS) {
      expect(cropsWithClasses.has(crop.cropId)).toBe(true);
      const classes = getClassesForCrop(crop.cropId);
      expect(classes.length).toBeGreaterThan(0);
    }
  });

  it('provides rich agronomic data, symptoms, and safety boundaries for every class', () => {
    for (const item of PLANTVILLAGE_CLASSES_LIST) {
      expect(item.key).toBeTruthy();
      expect(item.cropId).toBeTruthy();
      expect(item.cropNameRu).toBeTruthy();
      expect(item.conditionRu).toBeTruthy();
      expect(item.symptoms.length).toBeGreaterThan(0);
      expect(item.recommendations.length).toBeGreaterThan(0);
      expect(item.avoid.length).toBeGreaterThan(0);
      expect(['healthy', 'mild', 'moderate', 'severe']).toContain(item.severity);
    }
  });

  it('resolves PlantVillage class names via findPlantVillageDef', () => {
    const tomatoBlight = findPlantVillageDef('Tomato___Early_blight');
    expect(tomatoBlight).toBeDefined();
    expect(tomatoBlight?.cropId).toBe('tomato');
    expect(tomatoBlight?.isHealthy).toBe(false);

    const appleHealthy = findPlantVillageDef('Apple___healthy');
    expect(appleHealthy).toBeDefined();
    expect(appleHealthy?.cropId).toBe('apple');
    expect(appleHealthy?.isHealthy).toBe(true);

    const grapeBlackRot = findPlantVillageDef('Grape___Black_rot');
    expect(grapeBlackRot).toBeDefined();
    expect(grapeBlackRot?.latinName).toContain('Guignardia');
  });

  it('seamlessly integrates PlantVillage classes into findProfileByDiagnosisClass', () => {
    const cornProfile = findProfileByDiagnosisClass('Corn_(maize)___Common_rust_');
    expect(cornProfile).toBeDefined();
    expect(cornProfile?.label.toLowerCase()).toContain('кукуруз');
    expect(cornProfile?.label.toLowerCase()).toContain('ржавчин');
    expect(cornProfile?.limitsOfVisual).toBeDefined();
    expect(cornProfile?.sources.length).toBeGreaterThan(0);
  });
});
