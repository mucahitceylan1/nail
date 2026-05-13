import type { AppLocale } from './constants';
import { DEFAULT_LOCALE, isAppLocale } from './constants';

/** Path without locale prefix, always starts with `/` (e.g. `/`, `/services`). */
export function stripLocaleFromPathname(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return '/';
  if (isAppLocale(parts[0])) {
    const rest = parts.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

/** `/tr` + `/services` → `/tr/services`; preserves query in `path` if passed as `/appointment?x=1` */
export function withLocalePath(locale: AppLocale, path: string): string {
  const q = path.indexOf('?');
  const pathname = q >= 0 ? path.slice(0, q) : path;
  const search = q >= 0 ? path.slice(q) : '';
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const tail = normalized === '/' ? '' : normalized;
  return `/${locale}${tail}${search}`;
}

export function replaceLocaleInPathname(pathname: string, newLocale: AppLocale): string {
  const search = pathname.includes('?') ? pathname.slice(pathname.indexOf('?')) : '';
  const pathOnly = pathname.split('?')[0] ?? pathname;
  const rest = stripLocaleFromPathname(pathOnly);
  return withLocalePath(newLocale, rest) + (search || '');
}

export function redirectPathForUnknownLocale(pathname: string): string {
  const rest = stripLocaleFromPathname(pathname);
  return withLocalePath(DEFAULT_LOCALE, rest === '/' ? '/' : rest);
}
