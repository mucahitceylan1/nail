// src/components/ui/ServiceDetailModal.tsx
// Nail Lab. by İldem — Procedural Detail Modal
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Microscope, Layers, Flame, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../../store/useClientStore';
import Button from './Button';
import type { Service } from '../../types';
import { formatPrice, formatDuration } from '../../utils/formatters';
import { pickLocalized } from '../../utils/localizedField';
import { useLocalizedPath } from '../routing/localeHooks';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  const { t, i18n } = useTranslation(['services', 'common']);
  const navigate = useNavigate();
  const toLocalized = useLocalizedPath();
  const getPublicPhotos = useClientStore((s) => s.getPublicPhotos);
  const allPublicPhotos = getPublicPhotos();

  if (!service) return null;

  const isRtl = i18n.language.startsWith('ar');
  const displayName = pickLocalized(service.nameI18n, service.name, i18n.language);
  const displayDescription = pickLocalized(service.descriptionI18n, service.description ?? '', i18n.language);
  const includedItems = t('services:included_items', { returnObjects: true }) as string[];
  
  // Filter relevant photos for this service category
  const relevantPhotos = allPublicPhotos
    .filter(p => p.serviceId === service.id || p.type === 'after') 
    .slice(0, 3);

  const steps = [
    { icon: <Microscope size={20} />, title: t('services:procedure.step1_title'), desc: t('services:procedure.step1_desc') },
    { icon: <ShieldCheck size={20} />, title: t('services:procedure.step2_title'), desc: t('services:procedure.step2_desc') },
    { icon: <Layers size={20} />, title: t('services:procedure.step3_title'), desc: t('services:procedure.step3_desc') },
    { icon: <Flame size={20} />, title: t('services:procedure.step4_title'), desc: t('services:procedure.step4_desc') }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(8,8,8,0.96)',
              backdropFilter: 'blur(24px)',
              zIndex: 2000,
            }}
          />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(12px, 3vmin, 24px)',
              pointerEvents: 'none',
            }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              pointerEvents: 'auto',
              width: 'min(95vw, 900px)',
              maxHeight: 'min(90vh, 900px)',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 50px 150px rgba(0,0,0,0.8)',
            }}
          >
            {/* Header Content */}
            <div style={{ padding: '48px 48px 40px', borderBottom: '1px solid var(--color-border)', position: 'relative' }}>
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '32px',
                  [isRtl ? 'left' : 'right']: '32px',
                  zIndex: 10,
                  width: '40px',
                  height: '40px',
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text)',
                  cursor: 'pointer'
                }}
              >
                <X size={20} strokeWidth={1} />
              </button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                   <span className="section-label" style={{ color: 'var(--color-accent)' }}>
                    {(t as (k: string) => string)(`services:categories.${service.category}`)}
                  </span>
                   <h2 className="display-2" style={{ marginTop: '8px' }}>{displayName}</h2>
                </div>
                <div style={{ display: 'flex', gap: '32px' }}>
                   <div>
                      <div className="section-label" style={{ marginBottom: '4px' }}>{t('services:duration')}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{formatDuration(service.duration)}</div>
                   </div>
                   <div>
                      <div className="section-label" style={{ marginBottom: '4px' }}>{t('services:price')}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-accent)' }}>{service.price > 0 ? formatPrice(service.price) : t('services:price_on_request')}</div>
                   </div>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '48px' }}>
              <div className="functional-grid" style={{ marginBottom: '64px' }}>
                <div style={{ gridColumn: 'span 8' }}>
                  <span className="section-label">{t('services:detail_title')}</span>
                  <p style={{ fontSize: '1rem', opacity: 0.7, lineHeight: 1.8 }}>
                    {displayDescription || t('services:no_description')}
                  </p>
                </div>
                <div style={{ gridColumn: 'span 4' }}>
                   <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', border: '1px solid var(--color-border)' }}>
                      <h4 className="section-label">{t('services:whats_included')}</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                         {includedItems.map((item, idx) => (
                           <li key={idx} style={{ fontSize: '0.8rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={12} style={{ color: 'var(--color-accent)' }} /> {item}
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>
              </div>

              {/* Lab Procedure Steps */}
              <div style={{ marginBottom: '64px' }}>
                 <span className="section-label" style={{ marginBottom: '32px' }}>{t('services:procedure.title')}</span>
                 <div className="functional-grid">
                    {steps.map((step, idx) => (
                      <div key={idx} style={{ gridColumn: 'span 3', position: 'relative' }}>
                         <div style={{ width: '40px', height: '40px', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--color-accent)' }}>
                            {step.icon}
                         </div>
                         <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h4>
                         <p style={{ fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.6 }}>{step.desc}</p>
                         {idx < 3 && (
                           <div style={{ position: 'absolute', top: '20px', [isRtl ? 'left' : 'right']: '-20px' }}>
                              <ChevronRight size={16} style={{ opacity: 0.2, transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                           </div>
                         )}
                      </div>
                    ))}
                 </div>
              </div>

              {/* Result Gallery (Filtered) */}
              {relevantPhotos.length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '48px' }}>
                   <span className="section-label" style={{ marginBottom: '32px' }}>{t('services:real_results')}</span>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      {relevantPhotos.map((photo, idx) => (
                        <div key={idx} style={{ aspectRatio: '1', overflow: 'hidden' }}>
                           <img src={photo.imageData} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) brightness(0.8)' }} alt="" />
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '32px 48px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
               <Button variant="ghost" onClick={onClose}>{t('common:close')}</Button>
               <Button variant="editorial" style={{ minWidth: '240px' }} onClick={() => {
                  navigate(toLocalized(`/appointment?service=${service.id}`));
                  onClose();
               }}>
                  {t('services:book')}
               </Button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
