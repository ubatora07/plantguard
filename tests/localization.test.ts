import { i18n, setAppLanguage } from '../src/i18n';
import { getDiagnosisProtocol } from '../src/features/diagnosis/vision-protocol';

describe('Localization & Phytosanitary Protocol Specifications', () => {
  afterEach(() => {
    setAppLanguage('ru');
  });

  test('i18n translates tabs and profile keys across ru, kk, and en', () => {
    setAppLanguage('ru');
    expect(i18n.t('tabs.home')).toBe('Главная');
    expect(i18n.t('profile.language')).toBe('Язык');
    expect(i18n.t('crops.names.tomato')).toBe('Томат');

    setAppLanguage('kk');
    expect(i18n.t('tabs.home')).toBe('Басты');
    expect(i18n.t('profile.language')).toBe('Тіл');
    expect(i18n.t('crops.names.tomato')).toBe('Қызанақ');

    setAppLanguage('en');
    expect(i18n.t('tabs.home')).toBe('Home');
    expect(i18n.t('profile.language')).toBe('Language');
    expect(i18n.t('crops.names.tomato')).toBe('Tomato');
  });

  test('all 14 PlantVillage crop names exist in ru, kk, and en', () => {
    const crops = [
      'apple', 'blueberry', 'cherry', 'corn', 'grape', 'orange', 'peach',
      'pepper', 'potato', 'raspberry', 'soybean', 'squash', 'strawberry', 'tomato',
    ];

    ['ru', 'kk', 'en'].forEach((lang) => {
      setAppLanguage(lang as any);
      crops.forEach((c) => {
        const translated = i18n.t(`crops.names.${c}` as any);
        expect(translated).toBeTruthy();
        expect(typeof translated).toBe('string');
        expect(translated.length).toBeGreaterThan(0);
      });
    });
  });

  test('getDiagnosisProtocol adapts to the selected language', () => {
    const protocolKk = getDiagnosisProtocol('kk');
    expect(protocolKk).toContain('ҚАЗАҚ ТІЛІНДЕ қайтар!');
    expect(protocolKk).toContain('JSON');

    const protocolEn = getDiagnosisProtocol('en');
    expect(protocolEn).toContain('STRICTLY in ENGLISH');
    expect(protocolEn).toContain('JSON');

    const protocolRu = getDiagnosisProtocol('ru');
    expect(protocolRu).toContain('СТРОГО на РУССКОМ ЯЗЫКЕ');
    expect(protocolRu).toContain('JSON');
  });
});
