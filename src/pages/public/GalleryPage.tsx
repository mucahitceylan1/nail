// src/pages/public/GalleryPage.tsx
// Nail Lab. by İldem — Function-Integrated Gallery
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import SEO from '../../components/SEO';
import { useClientStore } from '../../store/useClientStore';
import { useSiteGalleryStore } from '../../store/useSiteGalleryStore';
import { useServiceStore } from '../../store/useServiceStore';
import { CATEGORY_LABELS } from '../../types';
import type { ServiceCategory, ClientPhoto } from '../../types';
import { pickLocalized } from '../../utils/localizedField';
import { useLocalizedPath } from '../../components/routing/localeHooks';

export default function GalleryPage() {
  const { t, i18n } = useTranslation('gallery');
  const { t: ts } = useTranslation('services');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const toLocalized = useLocalizedPath();
  const getPublicPhotos = useClientStore((s) => s.getPublicPhotos);
  const siteAssets = useSiteGalleryStore((s) => s.assets);
  const services = useServiceStore((s) => s.services);
  const publicPhotos = getPublicPhotos();

  const [section, setSection] = useState<'salon' | 'portfolio'>(() => (siteAssets.length > 0 ? 'salon' : 'portfolio'));
  const [salonLightbox, setSalonLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (section === 'salon' && siteAssets.length === 0 && publicPhotos.length > 0) setSection('portfolio');
  }, [section, siteAssets.length, publicPhotos.length]);

  useEffect(() => {
    if (salonLightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSalonLightbox(null);
      if (e.key === 'ArrowRight')
        setSalonLightbox((i) =>
          i === null || siteAssets.length === 0 ? i : Math.min(siteAssets.length - 1, i + 1)
        );
      if (e.key === 'ArrowLeft') setSalonLightbox((i) => (i === null ? i : Math.max(0, i - 1)));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [salonLightbox, siteAssets.length]);

  const [filterType, setFilterType] = useState<'all' | 'before' | 'after'>('all');
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | 'all'>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<ClientPhoto | null>(null);

  const filteredPhotos = useMemo(() => {
    let result = publicPhotos;
    if (filterType !== 'all') result = result.filter((p) => p.type === filterType);
    if (filterCategory !== 'all') {
      result = result.filter((p) => {
        const service = services.find((s) => s.id === p.serviceId);
        return service?.category === filterCategory;
      });
    }
    return result;
  }, [publicPhotos, filterType, filterCategory, services]);

  const categories = useMemo(() => {
    const cats = new Set<ServiceCategory>();
    publicPhotos.forEach((p) => {
      const service = services.find((s) => s.id === p.serviceId);
      if (service) cats.add(service.category);
    });
    return Array.from(cats);
  }, [publicPhotos, services]);

  const matchingPhoto = useMemo(() => {
    if (!lightboxPhoto) return null;
    const targetType = lightboxPhoto.type === 'before' ? 'after' : 'before';
    return publicPhotos.find(
      (p) => p.clientId === lightboxPhoto.clientId && p.type === targetType && p.serviceId === lightboxPhoto.serviceId
    );
  }, [lightboxPhoto, publicPhotos]);

  const handleBookLook = (serviceId?: string) => {
    if (serviceId) {
      navigate(toLocalized(`/appointment?service=${serviceId}`));
    } else {
      navigate(toLocalized('/appointment'));
    }
  };

  const categoryLabel = (cat: ServiceCategory) => {
    const key = `categories.${cat}`;
    const translated = (ts as (k: string) => string)(key);
    return translated !== key ? translated : CATEGORY_LABELS[cat];
  };

  const serviceTitle = (serviceId?: string) => {
    const service = serviceId ? services.find((s) => s.id === serviceId) : undefined;
    if (!service) return t('card_fallback');
    return pickLocalized(service.nameI18n, service.name, i18n.language);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '32px 0 64px' }}>
      <SEO
        title={`${t('page_title')} — ${tc('site_name_suffix')}`}
        description={t('description')}
        keywords={t('seo_keywords')}
        pathWithoutLocale="/gallery"
      />

      <div className="container-custom">
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>{t('page_title')}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{t('page_subtitle')}</p>
        </header>

        {siteAssets.length === 0 && publicPhotos.length === 0 ? (
          <EmptyState icon={<Image size={48} />} title={t('page_title')} description={t('empty')} />
        ) : (
          <>
        {(siteAssets.length > 0 || publicPhotos.length > 0) && (
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--color-surface-2)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <button
                type="button"
                disabled={siteAssets.length === 0}
                onClick={() => setSection('salon')}
                style={{
                  padding: '8px 24px',
                  background: section === 'salon' ? 'var(--color-text)' : 'transparent',
                  color: section === 'salon' ? 'var(--color-surface)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  cursor: siteAssets.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {t('tab_salon')}
              </button>
              <button
                type="button"
                disabled={publicPhotos.length === 0}
                onClick={() => setSection('portfolio')}
                style={{
                  padding: '8px 24px',
                  background: section === 'portfolio' ? 'var(--color-text)' : 'transparent',
                  color: section === 'portfolio' ? 'var(--color-surface)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  cursor: publicPhotos.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {t('tab_portfolio')}
              </button>
            </div>
          </div>
        )}

        {section === 'salon' ? (
          siteAssets.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              <AnimatePresence mode="popLayout">
                {siteAssets.map((asset, idx) => (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card"
                    style={{ padding: '0', overflow: 'hidden' }}
                  >
                    <div
                      style={{ height: '300px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                      onClick={() => setSalonLightbox(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSalonLightbox(idx);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <img
                        src={asset.imageUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt={asset.altText ?? t('page_title')}
                      />
                      {asset.altText && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '16px',
                            left: '16px',
                            background: 'rgba(0, 0, 0, 0.55)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            color: '#ffffff',
                            padding: '6px 14px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            letterSpacing: '0.03em',
                            borderRadius: '20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                          }}
                        >
                          {asset.altText}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px' }}>
                      <button
                        type="button"
                        onClick={() => handleBookLook(undefined)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-text)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-text)';
                          e.currentTarget.style.color = 'var(--color-surface)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--color-surface-2)';
                          e.currentTarget.style.color = 'var(--color-text)';
                        }}
                      >
                        <Calendar size={14} /> {t('salon_book')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState icon={<Image size={48} />} title={t('tab_salon')} description={t('salon_empty')} />
          )
        ) : (
          <>
            {publicPhotos.length > 0 && (
              <div style={{ marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--color-surface-2)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
                  {(['all', 'before', 'after'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFilterType(type)}
                      style={{
                        padding: '8px 24px',
                        background: filterType === type ? 'var(--color-text)' : 'transparent',
                        color: filterType === type ? 'var(--color-surface)' : 'var(--color-text-muted)',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {t(`filters.${type}`)}
                    </button>
                  ))}
                </div>
                {categories.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFilterCategory(cat)}
                        style={{
                          padding: '6px 16px',
                          background: filterCategory === cat ? 'var(--color-accent-soft)' : 'transparent',
                          color: filterCategory === cat ? 'var(--color-accent)' : 'var(--color-text-muted)',
                          border: `1px solid ${filterCategory === cat ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          borderRadius: '20px',
                          cursor: 'pointer',
                        }}
                      >
                        {categoryLabel(cat)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filteredPhotos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                <AnimatePresence mode="popLayout">
                  {filteredPhotos.map((photo) => {
                    const service = services.find((s) => s.id === photo.serviceId);
                    const title = service ? pickLocalized(service.nameI18n, service.name, i18n.language) : t('card_fallback');
                    return (
                      <motion.div
                        key={photo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="card"
                        style={{ padding: '0', overflow: 'hidden' }}
                      >
                        <div
                          style={{ height: '300px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                          onClick={() => setLightboxPhoto(photo)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setLightboxPhoto(photo);
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <img
                            src={photo.imageData}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            alt={title}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'rgba(255,255,255,0.9)',
                              color: '#000',
                              padding: '4px 12px',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              borderRadius: '4px',
                            }}
                          >
                            {t(`filters.${photo.type}`)}
                          </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                          <div style={{ marginBottom: '16px' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--color-accent)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              {service ? categoryLabel(service.category) : t('card_fallback')}
                            </span>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBookLook(photo.serviceId)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: 'var(--color-surface-2)',
                              color: 'var(--color-text)',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--color-text)';
                              e.currentTarget.style.color = 'var(--color-surface)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--color-surface-2)';
                              e.currentTarget.style.color = 'var(--color-text)';
                            }}
                          >
                            <Calendar size={14} /> {t('book_look')}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState icon={<Image size={48} />} title={tc('error')} description={t('empty')} />
            )}
          </>
        )}
          </>
        )}
      </div>

      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            className="gallery-lightbox-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              background: 'rgba(250, 250, 250, 0.98)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
            }}
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              type="button"
              className="gallery-lightbox-close"
              onClick={() => setLightboxPhoto(null)}
              style={{
                position: 'absolute',
                color: '#1A1A1A',
                background: 'var(--color-surface)',
                height: '48px',
                width: '48px',
                borderRadius: '50%',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <X size={24} strokeWidth={2} />
            </button>

            <div
              className="gallery-lightbox-strip"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <div style={{ background: 'var(--color-surface)', padding: '8px', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <img
                  src={lightboxPhoto.imageData}
                  style={{ borderRadius: '4px', display: 'block' }}
                  alt=""
                />
              </div>
              {matchingPhoto && (
                <div style={{ background: 'var(--color-surface)', padding: '8px', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                  <img
                    src={matchingPhoto.imageData}
                    style={{ borderRadius: '4px', display: 'block' }}
                    alt=""
                  />
                </div>
              )}
            </div>

            <motion.div
              className="gallery-lightbox-cta"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                textAlign: 'center',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                border: '1px solid var(--color-border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 'clamp(1.05rem, 4vw, 1.25rem)', fontWeight: 700, marginBottom: '8px' }}>
                {lightboxPhoto.serviceId ? serviceTitle(lightboxPhoto.serviceId) : t('lightbox_title')}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>{t('lightbox_cta')}</p>
              <button
                type="button"
                onClick={() => {
                  handleBookLook(lightboxPhoto.serviceId);
                  setLightboxPhoto(null);
                }}
                style={{
                  padding: '16px 48px',
                  background: 'var(--color-text)',
                  color: 'var(--color-surface)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {t('lightbox_book')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {salonLightbox !== null && siteAssets[salonLightbox] && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('tab_salon')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              background: 'rgba(250, 250, 250, 0.98)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
            }}
            onClick={() => setSalonLightbox(null)}
          >
            <button
              type="button"
              aria-label={tc('close')}
              onClick={() => setSalonLightbox(null)}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                color: '#1A1A1A',
                background: 'var(--color-surface)',
                height: '48px',
                width: '48px',
                borderRadius: '50%',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <X size={24} strokeWidth={2} />
            </button>
            <div onClick={(e) => e.stopPropagation()} style={{ padding: 24, textAlign: 'center' }}>
              <img
                src={siteAssets[salonLightbox].imageUrl}
                alt={siteAssets[salonLightbox].altText ?? t('page_title')}
                style={{ maxWidth: 'min(920px, 92vw)', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
              />
              {siteAssets[salonLightbox].altText && (
                <h3 style={{ marginTop: 24, fontSize: '1.5rem', fontWeight: 700 }}>
                  {siteAssets[salonLightbox].altText}
                </h3>
              )}
              <p style={{ marginTop: siteAssets[salonLightbox].altText ? 8 : 16, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {salonLightbox + 1} / {siteAssets.length}
              </p>
              <button
                type="button"
                onClick={() => {
                  handleBookLook(undefined);
                  setSalonLightbox(null);
                }}
                style={{
                  marginTop: 24,
                  padding: '16px 48px',
                  background: 'var(--color-text)',
                  color: 'var(--color-surface)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {t('salon_book')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
