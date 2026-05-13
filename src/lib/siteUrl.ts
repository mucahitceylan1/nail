/** Production origin without trailing slash. Uses VITE_SITE_URL when set, else browser origin. */
export function getPublicSiteOrigin(): string {
  const raw = import.meta.env.VITE_SITE_URL;
  const fromEnv = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
