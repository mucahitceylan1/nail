import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, HREFLANG_MAP, SUPPORTED_LOCALES, parseLocaleParam } from '../i18n/constants';
import { stripLocaleFromPathname, withLocalePath } from '../i18n/routing';
import { getPublicSiteOrigin } from '../lib/siteUrl';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  /** Canonical path without locale (e.g. `/services`). Defaults from current URL. */
  pathWithoutLocale?: string;
}

export default function SEO({
  title = 'Nail Lab. by İldem — Premium Nail Studio',
  description = 'Kalıcı oje, protez tırnak, manikür, pedikür ve daha fazlası için premium tırnak stüdyosu.',
  keywords = 'tırnak, nail art, protez tırnak, manikür, pedikür, kalıcı oje, nail salon',
  image = '/hero-nail-art.png',
  pathWithoutLocale,
}: SEOProps) {
  const siteUrl = getPublicSiteOrigin();
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const { lng } = useParams<{ lng: string }>();
  const location = useLocation();
  const currentLocale = parseLocaleParam(lng) ?? DEFAULT_LOCALE;
  const basePath =
    pathWithoutLocale ?? stripLocaleFromPathname(location.pathname);
  const canonicalPath = withLocalePath(currentLocale, basePath);
  const canonical = `${siteUrl}${canonicalPath}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {SUPPORTED_LOCALES.map((loc) => (
        <link
          key={loc}
          rel="alternate"
          hrefLang={HREFLANG_MAP[loc]}
          href={`${siteUrl}${withLocalePath(loc, basePath)}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${siteUrl}${withLocalePath(DEFAULT_LOCALE, basePath)}`}
      />
      <meta property="og:locale" content={HREFLANG_MAP[currentLocale]} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Nail Lab. by İldem" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonical} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
    </Helmet>
  );
}
