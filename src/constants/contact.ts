/** Locality for structured data (aligned with footer). */
export const STUDIO_GEO = {
  addressLocality: 'Çanakkale',
  addressCountry: 'TR',
} as const;

/** Single source for public contact info (Footer, FAB, WhatsApp links). */
export const CONTACT = {
  /** E.164 digits only, no + */
  phoneDigits: '905413281617',
  /** Shown in UI */
  phoneDisplay: '+90 541 328 16 17',
  /** For tel: links */
  get telHref() {
    return `tel:+${this.phoneDigits}`;
  },
  instagramUrl: 'https://www.instagram.com/naillabyildem/',
  instagramHandle: '@naillabyildem',
} as const;
