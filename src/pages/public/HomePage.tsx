// src/pages/public/HomePage.tsx
// Nail Lab. by İldem — Elegant Split Design
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';
import { useClientStore } from '../../store/useClientStore';
import { useSiteGalleryStore } from '../../store/useSiteGalleryStore';
import { LocalizedLink } from '../../components/routing/LocalizedLink';
import { useLocalizedPath } from '../../components/routing/localeHooks';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation('pageHome');
  const toLocalized = useLocalizedPath();
  const getPublicPhotos = useClientStore((s) => s.getPublicPhotos);
  const siteAssets = useSiteGalleryStore((s) => s.assets);

  const recentResults = useMemo(() => {
    if (siteAssets.length > 0) {
      return siteAssets.slice(0, 4).map((a) => ({
        id: a.id,
        imageData: a.imageUrl,
        serviceId: undefined as string | undefined,
      }));
    }
    return getPublicPhotos()
      .filter((p) => p.type === 'after')
      .slice(0, 4)
      .map((p) => ({ id: p.id, imageData: p.imageData, serviceId: p.serviceId }));
  }, [siteAssets, getPublicPhotos]);

  const quickActions = [
    {
      title: t('qa_appointment_title'),
      desc: t('qa_appointment_desc'),
      link: '/appointment',
      highlight: true,
    },
    {
      title: t('qa_services_title'),
      desc: t('qa_services_desc'),
      link: '/services',
      highlight: false,
    },
    {
      title: t('qa_care_title'),
      desc: t('qa_care_desc'),
      link: '/care-guide',
      highlight: false,
    },
    {
      title: t('qa_gallery_title'),
      desc: t('qa_gallery_desc'),
      link: '/gallery',
      highlight: false,
    },
  ];

  const coreMarqueeItems = [
    t('marquee_1'),
    t('marquee_2'),
    t('marquee_3'),
    t('marquee_4'),
    t('marquee_5'),
  ];
  const marqueeItems = [...coreMarqueeItems, ...coreMarqueeItems, ...coreMarqueeItems, ...coreMarqueeItems];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO
        title={t('seo_title')}
        description={t('seo_description')}
        keywords={t('seo_keywords')}
        pathWithoutLocale="/"
      />

      <section className="hero-split">
        <div className="hero-split__left">
          <div
            className="hero-vertical-side"
            style={{
              position: 'absolute',
              left: '4vw',
              top: '58%',
              transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'left center',
              whiteSpace: 'nowrap',
              opacity: 0.4,
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            {t('hero_vertical')}
          </div>

          <div className="hero-split__inner" style={{ position: 'relative', zIndex: 1 }}>
            <h1 className="display-1" style={{ marginBottom: '32px', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
              {t('hero_h1_line1')}
              <br />
              <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>{t('hero_h1_line2')}</span>
            </h1>

            <p style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '40px', maxWidth: '400px', lineHeight: 1.6 }}>
              {t('hero_lead')}
            </p>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
              <LocalizedLink to="/appointment" className="btn-primary">
                {t('cta_appointment')}
              </LocalizedLink>
              <LocalizedLink to="/services" className="btn-ghost">
                {t('cta_services')}
              </LocalizedLink>
            </div>

            <div style={{ display: 'flex', gap: '48px', opacity: 0.8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '4px' }}>
                  500+
                </div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t('stat_clients_label')}
                </div>
              </div>
              <div>
                <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '4px' }}>
                  {t('stat_years_value')}
                </div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t('stat_years_label')}
                </div>
              </div>
              <div>
                <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '4px' }}>
                  {t('stat_location_name')}
                </div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t('stat_location_label')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: '1 1 0%',
            minWidth: 0,
            background: 'var(--color-surface-2)',
            position: 'relative',
            display: 'none',
            backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            isolation: 'isolate',
          }}
          className="hero-right"
        />
      </section>

      <style>{`
        .hero-split {
          display: flex;
          align-items: stretch;
          min-height: calc(100vh - var(--public-nav-total-height) - 80px);
          position: relative;
        }
        @supports (height: 100dvh) {
          .hero-split {
            min-height: calc(100dvh - var(--public-nav-total-height) - 80px);
          }
        }
        .hero-split__left {
          flex: 1 1 0%;
          min-width: 0;
          padding: clamp(28px, 6vw, 80px) 4vw 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          isolation: isolate;
        }
        .hero-split__inner {
          max-width: 600px;
          margin-left: auto;
          margin-right: 4vw;
          width: 100%;
        }
        @media (min-width: 900px) {
          .hero-right { display: block !important; }
        }
        @media (max-width: 899px) {
          .hero-split {
            flex-direction: column;
            min-height: auto;
          }
          .hero-split__left {
            padding-top: clamp(20px, 4vw, 32px);
            padding-bottom: 32px;
          }
          .hero-vertical-side {
            display: none !important;
          }
          .hero-split__inner {
            margin-left: 0;
            margin-right: 0;
            max-width: 100%;
          }
        }
      `}</style>

      <div className="marquee-container">
        <div className="marquee-content">
          {marqueeItems.map((item, i) => (
            <div key={i} className="marquee-item">
              {item}
              <span style={{ opacity: 0.5 }}>-</span>
            </div>
          ))}
        </div>
        <div className="marquee-content" aria-hidden="true">
          {marqueeItems.map((item, i) => (
            <div key={`dup-${i}`} className="marquee-item">
              {item}
              <span style={{ opacity: 0.5 }}>-</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container-custom" style={{ padding: '80px 4vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '80px' }}>
          {quickActions.map((action, idx) => (
            <LocalizedLink
              key={idx}
              to={action.link}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: action.highlight ? 'var(--color-text)' : 'transparent',
                color: action.highlight ? 'var(--color-surface)' : 'var(--color-text)',
                border: `1px solid ${action.highlight ? 'var(--color-text)' : 'var(--color-border)'}`,
                padding: '24px 20px',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: action.highlight ? 'var(--color-surface)' : 'var(--color-text)',
                      marginBottom: '4px',
                    }}
                  >
                    {action.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: action.highlight ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
                    }}
                  >
                    {action.desc}
                  </span>
                </div>
              </div>
              <ArrowRight
                size={24}
                strokeWidth={2}
                style={{ color: action.highlight ? 'var(--color-surface)' : 'var(--color-text)', opacity: 0.8 }}
              />
            </LocalizedLink>
          ))}
        </div>

        <div style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 className="font-display" style={{ fontSize: '2rem' }}>
              {t('portfolio_title')}
            </h2>
            <LocalizedLink
              to="/gallery"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                textDecoration: 'none',
              }}
            >
              {t('portfolio_view_all')}
            </LocalizedLink>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {recentResults.map((photo, i) => (
              <div key={photo.id ?? i} className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={photo.imageData}
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
                  alt={t('portfolio_alt')}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px',
                    background: 'linear-gradient(to top, rgba(107, 76, 58, 0.9), transparent)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      photo.serviceId
                        ? navigate(toLocalized(`/appointment?service=${photo.serviceId}`))
                        : navigate(toLocalized('/appointment'))
                    }
                    style={{
                      width: '100%',
                      background: 'var(--color-surface)',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: 'var(--color-text)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t('portfolio_cta')}
                  </button>
                </div>
              </div>
            ))}
            {recentResults.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '60px 0',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {t('portfolio_empty')}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
