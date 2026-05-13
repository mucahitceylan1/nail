// src/components/layout/Footer.tsx
// Nail Lab. by İldem — Layout
import { useTranslation } from 'react-i18next';
import { Phone, MapPin } from 'lucide-react';
import { CONTACT } from '../../constants/contact';
import { getStudioWallCalendarParts } from '../../utils/studioTime';
import { LocalizedLink } from '../routing/LocalizedLink';

export default function Footer() {
  const { t } = useTranslation('footer');
  const year = getStudioWallCalendarParts().year;

  const links = [
    { to: '/services', labelKey: 'link_services' as const },
    { to: '/appointment', labelKey: 'link_appointment' as const },
    { to: '/gallery', labelKey: 'link_gallery' as const },
    { to: '/care-guide', labelKey: 'link_care' as const },
  ];

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        paddingTop: 'var(--sp-8)',
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 'calc(var(--sp-5) + var(--safe-bottom))',
        marginTop: 'var(--sp-10)',
        background:
          'linear-gradient(180deg, rgba(201, 169, 110, 0.04) 0%, transparent 120px)',
      }}
    >
      <div className="container-custom">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--sp-6)',
            marginBottom: 'var(--sp-6)',
          }}
        >
          <div>
            <div style={{ marginBottom: 'var(--sp-2)' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: 'var(--color-accent)',
                }}
              >
                Nail Lab.
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  marginLeft: '6px',
                }}
              >
                by İldem
              </span>
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
                maxWidth: '280px',
              }}
            >
              {t('tagline')}
            </p>
          </div>

          <div>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--sp-2)',
              }}
            >
              {t('pages_heading')}
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {links.map((link) => (
                <LocalizedLink
                  key={link.to}
                  to={link.to}
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    transition: 'color var(--duration-fast) var(--ease-out)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                  }}
                >
                  {t(link.labelKey)}
                </LocalizedLink>
              ))}
            </div>
          </div>

          <div>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--sp-2)',
              }}
            >
              {t('contact_heading')}
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <Phone size={14} aria-hidden="true" />
                <a href={CONTACT.telHref} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {CONTACT.phoneDisplay}
                </a>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <MapPin size={14} aria-hidden="true" />
                <span>{t('address_display')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <a
                  href={CONTACT.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}
                >
                  {CONTACT.instagramHandle}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: 'var(--sp-4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              opacity: 0.6,
              textAlign: 'center',
              margin: 0,
            }}
          >
            {t('copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
