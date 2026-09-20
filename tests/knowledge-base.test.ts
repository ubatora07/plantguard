import {
  TOMATO_KNOWLEDGE_BASE,
  AGRONOMIC_SOURCES,
  CURRENT_CONTENT_VERSION,
  getConditionProfile,
} from '../src/data/knowledge-base';

describe('Tomato Knowledge Base & Agronomic Citations', () => {
  it('defines valid CURRENT_CONTENT_VERSION', () => {
    expect(CURRENT_CONTENT_VERSION).toBe('2026.1');
  });

  it('contains academic agronomic sources with verified URLs', () => {
    expect(AGRONOMIC_SOURCES.fao).toBeDefined();
    expect(AGRONOMIC_SOURCES.cornell).toBeDefined();
    expect(AGRONOMIC_SOURCES.uc_ipm).toBeDefined();
    expect(AGRONOMIC_SOURCES.eppo).toBeDefined();

    for (const [key, source] of Object.entries(AGRONOMIC_SOURCES)) {
      expect(source.id).toBeTruthy();
      expect(source.name).toBeTruthy();
      expect(source.organization).toBeTruthy();
      expect(source.url.startsWith('https://')).toBe(true);
      expect(source.accessDate).toBeDefined();
    }
  });

  it('provides comprehensive tomato condition profiles', () => {
    expect(TOMATO_KNOWLEDGE_BASE.length).toBeGreaterThanOrEqual(5);

    const requiredIds = [
      'tomato-healthy',
      'tomato-early-blight',
      'tomato-late-blight',
      'tomato-septoria',
      'tomato-uncertain',
      'corn-healthy',
      'corn-rust',
      'corn-blight',
    ];

    for (const reqId of requiredIds) {
      const profile = getConditionProfile(reqId);
      expect(profile).toBeDefined();
      expect(profile?.cropId).toBeDefined();
      expect(profile?.label).toBeTruthy();
      expect(profile?.description).toBeTruthy();
      expect(profile?.limitsOfVisual).toBeTruthy();
      expect(profile?.sources.length).toBeGreaterThan(0);
      expect(profile?.expertReview.status).toBe('reviewed');
      expect(profile?.contentVersion).toBe(CURRENT_CONTENT_VERSION);
    }
  });

  it('SAFETY: contains strictly non-chemical, cultural recommendations without dosages or brand names', () => {
    const dangerousKeywords = [
      'грамм',
      'дозировк',
      'актара',
      'скор',
      'ридомил',
      'фундазол',
      'байлетон',
      'топаз',
      '10 л',
      'мл/л',
    ];

    for (const profile of TOMATO_KNOWLEDGE_BASE) {
      for (const rec of profile.recommendations) {
        const lower = rec.toLowerCase();
        for (const badWord of dangerousKeywords) {
          expect(lower).not.toContain(badWord);
        }
      }
      expect(profile.avoid.length).toBeGreaterThan(0);
    }
  });

  it('getConditionProfile returns undefined for non-existent profiles', () => {
    expect(getConditionProfile('non-existent-crop-condition')).toBeUndefined();
  });

  it('findProfileByDiagnosisClass resolves by label and common names', () => {
    const { findProfileByDiagnosisClass } = require('../src/data/knowledge-base');
    expect(findProfileByDiagnosisClass('Ранняя пятнистость (Альтернариоз)')?.id).toBe('tomato-early-blight');
    expect(findProfileByDiagnosisClass('Ржавчина кукурузы')?.id).toBe('corn-rust');
    expect(findProfileByDiagnosisClass('Северный гельминтоспориоз (NCLB)')?.id).toBe('corn-blight');
    expect(findProfileByDiagnosisClass('Поздняя пятнистость картофеля (Фитофтороз)')?.id).toBe('potato-late-blight');
    expect(findProfileByDiagnosisClass('Парша яблони')?.id).toBe('apple-scab');
    expect(findProfileByDiagnosisClass('Чёрная гниль винограда')?.id).toBe('grape-black-rot');
    expect(findProfileByDiagnosisClass('Бактериальная пятнистость перца')?.id).toBe('pepper-bacterial-spot');
    expect(findProfileByDiagnosisClass('Неизвестная болезнь')).toBeUndefined();
  });

  it('verifies Potato, Apple, Grape, and Pepper condition profiles exist and follow safety standards', () => {
    const multiCropConditions = [
      'potato-healthy',
      'potato-early-blight',
      'potato-late-blight',
      'apple-healthy',
      'apple-scab',
      'apple-black-rot',
      'apple-cedar-rust',
      'grape-healthy',
      'grape-black-rot',
      'grape-esca',
      'grape-leaf-blight',
      'pepper-healthy',
      'pepper-bacterial-spot',
    ];

    for (const id of multiCropConditions) {
      const profile = getConditionProfile(id);
      expect(profile).toBeDefined();
      expect(profile?.label).toBeTruthy();
      expect(profile?.symptoms.length).toBeGreaterThanOrEqual(2);
      expect(profile?.recommendations.length).toBeGreaterThanOrEqual(2);
      expect(profile?.avoid.length).toBeGreaterThanOrEqual(1);
      expect(profile?.limitsOfVisual).toBeTruthy();
      expect(profile?.sources.length).toBeGreaterThanOrEqual(1);

      // Verify no chemicals
      for (const rec of profile!.recommendations) {
        expect(rec.toLowerCase()).not.toMatch(/актара|скор|ридомил|фундазол|мл\/л|дозировк/);
      }
    }
  });
});
