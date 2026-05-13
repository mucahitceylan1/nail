import { Helmet } from 'react-helmet-async';
import { CONTACT, STUDIO_GEO } from '../constants/contact';
import { getPublicSiteOrigin } from '../lib/siteUrl';

/** JSON-LD for local / brand discovery (one graph per public shell). */
export default function StructuredDataLocalBusiness() {
  const origin = getPublicSiteOrigin();
  if (!origin) return null;

  const payload = {
    '@context': 'https://schema.org',
    '@type': ['BeautySalon', 'NailSalon'],
    name: 'Nail Lab. by İldem',
    url: origin,
    image: `${origin}/og-image.png`,
    telephone: `+${CONTACT.phoneDigits}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: STUDIO_GEO.addressLocality,
      addressCountry: STUDIO_GEO.addressCountry,
    },
    sameAs: [CONTACT.instagramUrl],
  };

  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
      />
    </Helmet>
  );
}
