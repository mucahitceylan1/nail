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

      <section className="hero-premium">
        <div className="hero-premium__bg">
          <motion.img 
            src="/hero-nail-art.png" 
            alt="Nail Lab Luxury" 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <div className="hero-premium__overlay" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)' }}></div>
          
          {/* Animated Background Orbs (More subtle) */}
          <div className="hero-orbs">
            <motion.div 
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="orb orb-1" 
            />
          </div>
        </div>

        <div className="hero-premium__content">
          <motion.div 
            initial={{ y: 40, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="premium-display-h1">
              {t('hero_h1_line1')}
              <span className="premium-italic">{t('hero_h1_line2')}</span>
            </h1>

            <p className="premium-lead-text">
              {t('hero_lead')}
            </p>

            <div className="hero-cta-group">
              <LocalizedLink to="/appointment" className="btn-luxury-v3">
                {t('cta_appointment')}
              </LocalizedLink>
              <LocalizedLink to="/services" className="btn-luxury-outline-v3">
                {t('cta_services')}
              </LocalizedLink>
            </div>

            <div className="premium-stats-grid">
              <div className="premium-stat-item">
                <span className="stat-val">500+</span>
                <span className="stat-lbl">{t('stat_clients_label')}</span>
              </div>
              <div className="premium-stat-item">
                <span className="stat-val">{t('stat_years_value')}</span>
                <span className="stat-lbl">{t('stat_years_label')}</span>
              </div>
              <div className="premium-stat-item">
                <span className="stat-val">{t('stat_location_name')}</span>
                <span className="stat-lbl">{t('stat_location_label')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .hero-premium {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
        }
        .hero-premium__bg {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 0;
        }
        .hero-premium__bg img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .hero-premium__overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
          z-index: 1;
        }
        .hero-premium__content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 60px 8vw 40px;
          z-index: 2;
          background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        .premium-display-h1 {
          color: #FFF;
          font-size: 3.2rem;
          line-height: 1;
          margin-bottom: 20px;
          font-weight: 800;
          text-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .premium-italic {
          font-family: var(--font-display);
          font-style: italic;
          color: var(--color-accent);
          display: block;
        }
        .premium-lead-text {
          color: rgba(255,255,255,0.9);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 450px;
          font-weight: 400;
        }
        .hero-cta-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 40px;
        }
        .btn-luxury-v3 {
          background: #FFF;
          color: #000;
          padding: 20px;
          border-radius: 100px;
          font-weight: 800;
          text-align: center;
          text-decoration: none;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          transition: all 0.3s ease;
        }
        .btn-luxury-outline-v3 {
          background: rgba(255, 255, 255, 0.1);
          color: #FFF;
          padding: 20px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.4);
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .premium-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .premium-stat-item {
          text-align: center;
        }
        .stat-val {
          color: #FFF;
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-style: italic;
          line-height: 1;
        }
        .stat-lbl {
          color: rgba(255,255,255,0.6);
          font-size: 0.55rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          margin-top: 4px;
        }
        .premium-stat-item {
          text-align: center;
        }
        .premium-stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-val {
          color: #FFF;
          font-family: var(--font-display);
          font-size: 2rem;
          font-style: italic;
          line-height: 1;
        }
        .stat-lbl {
          color: rgba(255,255,255,0.6);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .hero-premium {
            min-height: 90vh;
            padding-top: 120px;
            align-items: flex-end;
          }
          .hero-glass-card {
            padding: 32px 24px;
            border-radius: 24px;
            background: rgba(107, 76, 58, 0.4); /* Deeper for mobile readability */
          }
          .hero-cta-group {
            flex-direction: column;
          }
          .btn-luxury, .btn-luxury-outline {
            text-align: center;
          }
          .premium-stats-grid {
            gap: 20px;
            justify-content: space-between;
          }
          .stat-val { font-size: 1.5rem; }
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
