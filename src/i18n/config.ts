import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import tr from './locales/tr.json';
import en from './locales/en.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import { DEFAULT_LOCALE, isAppLocale } from './constants';
import { I18N_NAMESPACES, sliceBundle } from './namespaces';

function initialLanguageFromPath(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const m = window.location.pathname.match(/^\/(tr|en|ru|ar)(\/|$)/);
  const code = m?.[1];
  return isAppLocale(code) ? code : DEFAULT_LOCALE;
}

void i18n.use(initReactI18next).init({
  resources: {
    tr: sliceBundle(tr as Record<string, unknown>),
    en: sliceBundle(en as Record<string, unknown>),
    ru: sliceBundle(ru as Record<string, unknown>),
    ar: sliceBundle(ar as Record<string, unknown>),
  },
  lng: initialLanguageFromPath(),
  fallbackLng: DEFAULT_LOCALE,
  ns: [...I18N_NAMESPACES],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  /** Colon separates namespace; dot separates nested keys */
  nsSeparator: ':',
  keySeparator: '.',
});

export default i18n;
