import { forwardRef } from 'react';
import { Link, useParams, type LinkProps } from 'react-router-dom';
import { DEFAULT_LOCALE, parseLocaleParam } from '../../i18n/constants';
import { withLocalePath } from '../../i18n/routing';

export const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(function LocalizedLink(
  { to, ...rest },
  ref
) {
  const { lng } = useParams<{ lng: string }>();
  const locale = parseLocaleParam(lng) ?? DEFAULT_LOCALE;

  if (typeof to === 'string' && !to.startsWith('http')) {
    const path = to.startsWith('/') ? to : `/${to}`;
    return <Link ref={ref} to={withLocalePath(locale, path)} {...rest} />;
  }

  return <Link ref={ref} to={to} {...rest} />;
});
