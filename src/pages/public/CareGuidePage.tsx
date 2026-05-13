// src/pages/public/CareGuidePage.tsx
// Nail Lab. by İldem — Functional Aftercare Guide
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';
import { getWhatsAppChatUrl } from '../../utils/whatsapp';

type CareItem = { label: string; desc: string };

const SECTION_KEYS = ['prosthetic', 'nailart', 'health'] as const;

export default function CareGuidePage() {
  const { t } = useTranslation('care');
  const { t: tc } = useTranslation('common');
  const { t: tn } = useTranslation('nav');

  const sections = useMemo(() => {
    return SECTION_KEYS.map((key) => {
      const raw = t(`${key}.items`, { returnObjects: true });
      const items = Array.isArray(raw) ? (raw as CareItem[]) : [];
      return {
        title: t(`${key}.title`),
        items,
      };
    });
  }, [t]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '32px 0 64px' }}>
      <SEO
        title={`${tn('care_guide')} — ${tc('site_name_suffix')}`}
        description={t('description')}
        keywords={t('seo_keywords')}
        pathWithoutLocale="/care-guide"
      />

      <div className="container-custom">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>{t('title')}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{t('description')}</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {sections.map((section, idx) => (
              <div key={idx} className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{section.title}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  {section.items.map((item, i) => (
                    <div key={i}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text)' }}>{item.label}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: 'sticky', top: 'var(--public-nav-total-height)' }}>
            <div className="card" style={{ padding: '32px', background: 'var(--color-surface-2)', border: 'none', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-accent)', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>{t('warning_title')}</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>{t('warning_body')}</p>
              <a
                href={getWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '16px',
                  background: 'var(--color-text)',
                  color: 'var(--color-surface)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {t('consult_whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
