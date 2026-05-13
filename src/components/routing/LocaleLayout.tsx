import { useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, isAppLocale, parseLocaleParam } from '../../i18n/constants';
import { withLocalePath } from '../../i18n/routing';

/**
 * Syncs URL `:lng` with i18n, validates locale segment, sets `dir` / `lang` on `<html>`.
 */
export default function LocaleLayout() {
  const { lng } = useParams<{ lng: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const locale = parseLocaleParam(lng);

  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const first = segments[0];
    if (!isAppLocale(first)) {
      const tail =
        segments.length > 1 ? `/${segments.slice(1).join('/')}` : '/';
      navigate(withLocalePath(DEFAULT_LOCALE, tail) + location.search, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!locale) return;
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  useEffect(() => {
    if (!locale) return;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  if (!locale) return null;

  return <Outlet />;
}
