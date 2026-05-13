/** i18next namespace ids — keep in sync with locale bundle top-level keys. */
export const I18N_NAMESPACES = [
  'nav',
  'common',
  'hero',
  'home',
  'services',
  'gallery',
  'appointment',
  'care',
  'footer',
  'pageHome',
  'admin',
] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

export function sliceBundle<T extends Record<string, unknown>>(bundle: T): Record<I18nNamespace, object> {
  return Object.fromEntries(
    I18N_NAMESPACES.map((ns) => [ns, (bundle[ns] as object) ?? {}])
  ) as Record<I18nNamespace, object>;
}
