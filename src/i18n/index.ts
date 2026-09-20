import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from './en.json';
import ru from './ru.json';
import kk from './kk.json';

export type AppLanguage = 'ru' | 'kk' | 'en';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeName: string;
  flag?: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'ru', label: 'Русский', nativeName: 'Русский' },
  { code: 'kk', label: 'Казахский', nativeName: 'Қазақша' },
  { code: 'en', label: 'Английский', nativeName: 'English' },
];

const translations = {
  en,
  ru,
  kk,
};

const i18n = new I18n(translations);

const locales = Localization.getLocales();
const deviceCode = locales && locales.length > 0 && locales[0].languageCode ? locales[0].languageCode : 'ru';
const initialLocale: AppLanguage = deviceCode === 'kk' ? 'kk' : 'ru';

i18n.locale = initialLocale;
i18n.enableFallback = true;
i18n.defaultLocale = 'ru';

export function setAppLanguage(lang: AppLanguage) {
  i18n.locale = lang;
}

export { i18n };
export default i18n;
