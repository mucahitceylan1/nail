// src/pages/admin/AdminTimelinePage.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addCalendarDaysYmd, isStudioBookingDayYmd, startOfWeekMondayYmd } from '../../utils/studioTime';
import { formatDate, formatPrice, formatPhone, getToday } from '../../utils/formatters';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useServiceStore } from '../../store/useServiceStore';
import { useClientStore } from '../../store/useClientStore';
import type { Appointment, ClientPhoto } from '../../types';
import Button from '../../components/ui/Button';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AdminTimelinePage() {
  const { t, i18n } = useTranslation('admin');
  const appointments = useAppointmentStore((s) => s.appointments);
  const clients = useClientStore((s) => s.clients);
  const allPhotos = useMemo(() => clients.flatMap((c) => c.photos), [clients]);
  const services = useServiceStore((s) => s.services);

  const [weekStart, setWeekStart] = useState(() => startOfWeekMondayYmd(getToday()));

  const weekDays = useMemo(() => {
    const d: string[] = [];
    for (let i = 0; i < 7; i++) d.push(addCalendarDaysYmd(weekStart, i));
    return d;
  }, [weekStart]);

  const monthLabel = useMemo(() => {
    const [y, m] = weekStart.split('-').map(Number);
    const lang = i18n.resolvedLanguage ?? 'tr';
    const localeTag = lang === 'tr' ? 'tr-TR' : lang === 'ar' ? 'ar' : lang === 'ru' ? 'ru-RU' : 'en-US';
    return new Intl.DateTimeFormat(localeTag, { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
  }, [weekStart, i18n.resolvedLanguage]);

  const [lightbox, setLightbox] = useState<{
    appointment: Appointment;
    photos: ClientPhoto[];
    index: number;
  } | null>(null);

  const photosForAppointment = useCallback(
    (id: string) => allPhotos.filter((p) => p.appointmentId === id),
    [allPhotos]
  );

  const openLightbox = (a: Appointment) => {
    const ph = photosForAppointment(a.id);
    if (ph.length === 0) return;
    setLightbox({ appointment: a, photos: ph, index: 0 });
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight')
        setLightbox((lb) =>
          lb ? { ...lb, index: Math.min(lb.photos.length - 1, lb.index + 1) } : lb
        );
      if (e.key === 'ArrowLeft')
        setLightbox((lb) => (lb ? { ...lb, index: Math.max(0, lb.index - 1) } : lb));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const dialog = document.getElementById('timeline-lightbox-dialog');
    if (!dialog) return;
    const focusables = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener('keydown', onTab);
    return () => dialog.removeEventListener('keydown', onTab);
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const t = window.setTimeout(() => {
      document.getElementById('timeline-lightbox-img')?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [lightbox]);

  const apptsForDay = (ymd: string) =>
    appointments
      .filter((a) => a.date === ymd && a.status !== 'cancelled')
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const clientEmail = (clientId: string) => clients.find((c) => c.id === clientId)?.email;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="admin-content">
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="section-label">{t('timeline_kicker')}</span>
          <h1 className="display-2 font-display">{t('timeline_title')}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="ghost" onClick={() => setWeekStart((w) => {
            const [y, m] = w.split('-').map(Number);
            const prevMonth = new Date(y, m - 2, 1);
            return startOfWeekMondayYmd(`${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-01`);
          })}>
            <ChevronLeft size={18} />
          </Button>
          <span style={{ fontWeight: 700, minWidth: 160, textAlign: 'center' }}>{monthLabel}</span>
          <Button variant="ghost" onClick={() => setWeekStart((w) => {
            const [y, m] = w.split('-').map(Number);
            const nextMonth = new Date(y, m, 1);
            return startOfWeekMondayYmd(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`);
          })}>
            <ChevronRight size={18} />
          </Button>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => setWeekStart((w) => addCalendarDaysYmd(w, -7))}>
          <ChevronLeft size={18} /> {t('timeline_week_prev')}
        </Button>
        <Button variant="ghost" onClick={() => setWeekStart((w) => addCalendarDaysYmd(w, 7))}>
          {t('timeline_week_next')} <ChevronRight size={18} />
        </Button>
      </div>

      {weekDays.map((day) => {
        const list = apptsForDay(day);
        const open = isStudioBookingDayYmd(day);
        return (
          <div key={day} style={{ marginBottom: 20, opacity: open ? 1 : 0.4 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.85rem' }}>{formatDate(day)}</div>
            <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
              <div style={{ display: 'flex', gap: 12, minHeight: 120 }}>
                {list.length === 0 && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{t('timeline_no_records')}</span>}
                {list.map((a) => {
                  const ph = photosForAppointment(a.id);
                  const thumb = ph[0]?.imageData;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      disabled={ph.length === 0}
                      onClick={() => openLightbox(a)}
                      style={{
                        flex: '0 0 100px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: 'var(--color-surface-2)',
                        cursor: ph.length ? 'pointer' : 'not-allowed',
                        padding: 0,
                      }}
                    >
                      {thumb ? (
                        <img src={thumb} alt="" style={{ width: '100%', height: 72, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          {t('timeline_no_photo')}
                        </div>
                      )}
                      <div style={{ padding: 6, fontSize: '0.65rem', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700 }}>{a.clientName.split(' ')[0]}</div>
                        <div style={{ opacity: 0.7 }}>{a.timeSlot}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {lightbox && (
        <div
          id="timeline-lightbox-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={t('timeline_lightbox_aria')}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setLightbox(null)}
        >
          <div
            style={{ display: 'flex', gap: 24, maxWidth: 960, width: '100%', alignItems: 'flex-start' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <img
                id="timeline-lightbox-img"
                tabIndex={0}
                src={lightbox.photos[lightbox.index]?.imageData}
                alt={`${lightbox.appointment.clientName} — fotoğraf ${lightbox.index + 1}`}
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <Button variant="ghost" onClick={() => setLightbox((lb) => (lb ? { ...lb, index: Math.max(0, lb.index - 1) } : lb))}>
                  {t('timeline_prev')}
                </Button>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {lightbox.index + 1} / {lightbox.photos.length}
                </span>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setLightbox((lb) =>
                      lb ? { ...lb, index: Math.min(lb.photos.length - 1, lb.index + 1) } : lb
                    )
                  }
                >
                  {t('timeline_next')}
                </Button>
              </div>
            </div>
            <aside
              className="card"
              style={{ width: 280, flexShrink: 0, padding: 20, position: 'relative' }}
              aria-label={t('timeline_card_aria')}
            >
              <button
                type="button"
                onClick={() => setLightbox(null)}
                style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                aria-label={t('timeline_close')}
              >
                ×
              </button>
              <h3 className="font-display" style={{ fontSize: '1.1rem', marginBottom: 12 }}>
                {lightbox.appointment.clientName}
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: 8 }}>{formatPhone(lightbox.appointment.clientPhone)}</p>
              {clientEmail(lightbox.appointment.clientId) && (
                <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 12 }}>{clientEmail(lightbox.appointment.clientId)}</p>
              )}
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                {lightbox.appointment.serviceIds
                  .map((id) => services.find((s) => s.id === id)?.name)
                  .filter(Boolean)
                  .join(', ')}
              </p>
              <div style={{ marginTop: 16 }}>
                <span className="section-label" style={{ margin: '0 0 6px 0', display: 'block' }}>
                  {t('timeline_price_heading')}
                </span>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                  {t('timeline_price_list')}: {formatPrice(lightbox.appointment.listTotalPrice)}
                  <br />
                  {t('timeline_price_collected')}: {formatPrice(lightbox.appointment.collectedAmount ?? lightbox.appointment.listTotalPrice)}
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </motion.div>
  );
}
