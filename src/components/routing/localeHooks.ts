import { useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, parseLocaleParam } from '../../i18n/constants';
import { withLocalePath } from '../../i18n/routing';

export function usePublicLocale() {
  const { lng } = useParams<{ lng: string }>();
  return parseLocaleParam(lng) ?? DEFAULT_LOCALE;
}

export function useLocalizedPath() {
  const locale = usePublicLocale();
  return (path: string) => {
    const p = path.startsWith('/') ? path : `/${path}`;
    return withLocalePath(locale, p);
  };
}
