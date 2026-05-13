import { isAppLocale } from '../i18n/constants';
import type { LocalizedStringMap } from '../types';

export function pickLocalized(
  map: LocalizedStringMap | undefined,
  fallback: string,
  locale: string
): string {
  const base = (locale.split('-')[0] || 'tr').toLowerCase();
  if (isAppLocale(base) && map?.[base]) return map[base]!;
  return fallback;
}
