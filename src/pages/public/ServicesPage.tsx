// src/pages/public/ServicesPage.tsx
// Nail Lab. by İldem — Functional Service Catalog
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Info, Clock, CheckCircle2 } from 'lucide-react';
import SEO from '../../components/SEO';
import ServiceDetailModal from '../../components/ui/ServiceDetailModal';
import { useServiceStore } from '../../store/useServiceStore';
import { CATEGORY_LABELS } from '../../types';
import type { Service } from '../../types';
import { formatPrice, formatDuration } from '../../utils/formatters';
import { pickLocalized } from '../../utils/localizedField';
import { useLocalizedPath } from '../../components/routing/localeHooks';

export default function ServicesPage() {
  const { t, i18n } = useTranslation('services');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const toLocalized = useLocalizedPath();
  const services = useServiceStore((s) => s.services);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services]);

  const categoryLabel = (cat: Service['category']) => {
    const key = `categories.${cat}`;
    const translated = (t as (k: string) => string)(key);
    return translated !== key ? translated : CATEGORY_LABELS[cat];
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '32px 0 64px' }}>
      <SEO
        title={`${t('list_page_title')} — ${tc('site_name_suffix')}`}
        description={t('list_page_subtitle')}
        keywords={t('seo_keywords')}
        pathWithoutLocale="/services"
      />

      <div className="container-custom">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>{t('list_page_title')}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{t('list_page_subtitle')}</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '80px' }}>
          <AnimatePresence mode="popLayout">
            {activeServices.map((s) => {
              const title = pickLocalized(s.nameI18n, s.name, i18n.language);
              const desc = s.description
                ? pickLocalized(s.descriptionI18n, s.description, i18n.language)
                : undefined;
              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="card"
                  style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-accent)' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{title}</h3>
                      </div>

                      {desc && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                          {desc}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {formatDuration(s.duration)}
                        </span>
                        <span style={{ padding: '2px 8px', background: 'var(--color-surface-2)', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {categoryLabel(s.category)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '140px' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                        {formatPrice(s.price)}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedService(s)}
                          style={{
                            padding: '8px',
                            background: 'var(--color-surface-2)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={tc('details')}
                        >
                          <Info size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(toLocalized(`/appointment?service=${s.id}`))}
                          style={{
                            flex: 1,
                            padding: '8px 16px',
                            background: 'var(--color-text)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-surface)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <Calendar size={14} /> {t('select_service')}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <ServiceDetailModal service={selectedService} isOpen={!!selectedService} onClose={() => setSelectedService(null)} />
    </motion.div>
  );
}
