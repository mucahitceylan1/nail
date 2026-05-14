// src/components/seo/SEO.tsx
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ title, description, image, url }: SEOProps) {
  const { t } = useTranslation('common');
  
  const siteName = "Nail Lab. by İldem";
  const defaultTitle = t('site_title', { defaultValue: 'Nail Lab. by İldem — Premium Nail Studio' });
  const defaultDescription = t('site_description', { defaultValue: 'Çanakkale Premium Nail Studio. Kalıcı oje, protez tırnak, manikür, pedikür ve lüks bakım hizmetleri.' });
  const siteUrl = url || window.location.href;
  const siteImage = image || '/hero-nail-art.png';

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={siteImage} />
    </Helmet>
  );
}
