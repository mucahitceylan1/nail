/** Supported public locales — URL segment and i18n language code. */
export const SUPPORTED_LOCALES = ['tr', 'en', 'ru', 'ar'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'tr';

export const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export function isAppLocale(value: string | undefined): value is AppLocale {
  return value !== undefined && LOCALE_SET.has(value);
}

export function parseLocaleParam(param: string | undefined): AppLocale | null {
  if (!param) return null;
  const base = param.split('-')[0]?.toLowerCase();
  return isAppLocale(base) ? base : null;
}

/** BCP 47 for hreflang */
export const HREFLANG_MAP: Record<AppLocale, string> = {
  tr: 'tr',
  en: 'en',
  ru: 'ru',
  ar: 'ar',
};
