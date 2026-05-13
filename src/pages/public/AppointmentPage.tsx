// src/pages/public/AppointmentPage.tsx
// Nail Lab. by İldem — Functional Luxury Appointment Flow
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Phone, User, Clock, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import SEO from '../../components/SEO';
import { LocalizedLink } from '../../components/routing/LocalizedLink';
import { dbFindClientByPhone } from '../../api/supabase/ops';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useServiceStore } from '../../store/useServiceStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useClientStore } from '../../store/useClientStore';
import { BOOKING_TIME_SLOTS, STAFF_ILDEM_ID, STAFF_TUGBA_ID, type TimeSlot } from '../../types';
import {
  formatPrice,
  formatDuration,
  formatDate,
  getToday,
  getDaysInMonth,
  getMonthName,
  normalizePhoneDigits,
} from '../../utils/formatters';
import { pickLocalized } from '../../utils/localizedField';
import { getStudioWallCalendarParts, isStudioBookingDayYmd, compareStudioYmd, weekdayMonday0FirstOfMonth, isStudioMonthAtMinimum, isStudioMonthAtOrPastMaximum } from '../../utils/studioTime';
import { ensureStudioAppointmentBookable, checkStudioAppointmentBooking } from '../../utils/appointmentRules';

const getContactSchema = (t: TFunction<'appointment'>) =>
  z.object({
    name: z.string().min(2, t('form.name_error')),
    phone: z.string().min(10, t('form.phone_error')),
    notes: z.string().optional(),
  });
type ContactFormValues = z.infer<ReturnType<typeof getContactSchema>>;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AppointmentPage() {
  const [searchParams] = useSearchParams();
  const preSelectedService = searchParams.get('service');

  const { t, i18n } = useTranslation('appointment');
  const { t: tc } = useTranslation('common');
  const services = useServiceStore((s) => s.services);
  const addAppointment = useAppointmentStore((s) => s.addAppointment);
  const isSlotTaken = useAppointmentStore((s) => s.isSlotTaken);
  const addClient = useClientStore((s) => s.addClient);
  const searchClients = useClientStore((s) => s.searchClients);

  const [step, setStep] = useState(1);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>(preSelectedService ? [preSelectedService] : []);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | ''>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services]);
  const selectedServiceObjects = useMemo(
    () => activeServices.filter((s) => selectedServices.includes(s.id)),
    [activeServices, selectedServices]
  );
  const totalPrice = useMemo(() => selectedServiceObjects.reduce((sum, s) => sum + s.price, 0), [selectedServiceObjects]);

  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(getContactSchema(t)),
    defaultValues: { name: '', phone: '', notes: '' },
  });

  const today = getToday();
  const [calView, setCalView] = useState(() => {
    const s = getStudioWallCalendarParts();
    return { year: s.year, month0: s.month0 };
  });
  const { year: calYear, month0: calMonth } = calView;

  const weekdays = useMemo(() => {
    const w = t('weekdays', { returnObjects: true });
    return Array.isArray(w) ? (w as string[]) : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }, [t]);

  useEffect(() => {
    if (preSelectedService) setSelectedServices([preSelectedService]);
  }, [preSelectedService]);

  const serviceLabel = (s: (typeof services)[0]) => pickLocalized(s.nameI18n, s.name, i18n.language);

  const toggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleNext = () => {
    if (step === 1 && selectedServices.length === 0) return;
    if (step === 2 && !selectedSpecialist) return;
    if (step === 3 && (!selectedDate || !selectedSlot)) return;
    if (step === 3) {
      const v = checkStudioAppointmentBooking(selectedDate, selectedSlot);
      if (v) {
        const msg =
          v === 'past'
            ? t('booking_viol_past')
            : v === 'sunday'
              ? t('booking_viol_sunday')
              : v === 'slot'
                ? t('booking_viol_slot')
                : t('booking_viol_invalid_date');
        alert(msg);
        return;
      }
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onFinalSubmit = async (data: ContactFormValues) => {
    try {
      setSubmitting(true);
      ensureStudioAppointmentBookable(selectedDate, selectedSlot as TimeSlot);
      let clientId: string;
      if (isSupabaseConfigured()) {
        const existing = await dbFindClientByPhone(data.phone);
        clientId = existing ? existing.id : (await addClient({ name: data.name, phone: data.phone, notes: '' })).id;
      } else {
        const norm = normalizePhoneDigits(data.phone);
        const existing = searchClients(data.phone).find((c) => normalizePhoneDigits(c.phone) === norm);
        clientId = existing ? existing.id : (await addClient({ name: data.name, phone: data.phone, notes: '' })).id;
      }

      const specialistLine = t('specialist_note', { name: selectedSpecialist });

      const staffId = selectedSpecialist === 'Tuğba' ? STAFF_TUGBA_ID : STAFF_ILDEM_ID;

      await addAppointment({
        clientId,
        clientName: data.name,
        clientPhone: data.phone,
        serviceIds: selectedServices,
        date: selectedDate,
        timeSlot: selectedSlot as TimeSlot,
        status: 'pending',
        totalPrice,
        listTotalPrice: totalPrice,
        staffId,
        source: 'web',
        notes: data.notes ? `${data.notes}\n\n${specialistLine}` : specialistLine,
      });
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.startsWith('BOOKING:')) {
        const code = e.message.slice('BOOKING:'.length);
        const msg =
          code === 'past'
            ? t('booking_viol_past')
            : code === 'sunday'
              ? t('booking_viol_sunday')
              : code === 'slot'
                ? t('booking_viol_slot')
                : t('booking_viol_invalid_date');
        alert(msg);
      } else {
        alert(tc('appointment_failed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const adjustedFirstDay = weekdayMonday0FirstOfMonth(calYear, calMonth);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, adjustedFirstDay]);

  const selectionSummary = selectedServiceObjects.map((s) => serviceLabel(s)).join(', ');

  if (showSuccess) {
    return (
      <div className="container-custom" style={{ textAlign: 'center', marginTop: '120px' }}>
        <SEO
          title={`${t('summary.reserved')} — ${tc('site_name_suffix')}`}
          keywords={t('seo_keywords')}
          pathWithoutLocale="/appointment"
        />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'var(--color-accent-soft)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
            }}
          >
            <Check size={32} color="var(--color-accent)" />
          </div>
          <h1 className="font-display" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
            {t('summary.reserved')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '48px' }}>{t('summary.success_msg')}</p>

          <div className="card" style={{ maxWidth: '500px', margin: '0 auto 48px', textAlign: 'left' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
              <span className="section-label" style={{ marginBottom: '8px' }}>
                {t('summary.date')}
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {formatDate(selectedDate)} · {selectedSlot}
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <span className="section-label" style={{ marginBottom: '8px' }}>
                {t('summary.selection')}
              </span>
              <div style={{ color: 'var(--color-text-muted)' }}>{selectionSummary}</div>
            </div>
          </div>

          <LocalizedLink to="/">
            <Button variant="primary">{t('summary.return')}</Button>
          </LocalizedLink>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ padding: '64px 0 100px' }}>
      <SEO
        title={`${t('title')} — ${tc('site_name_suffix')}`}
        description={t('meta_description')}
        keywords={t('seo_keywords')}
        pathWithoutLocale="/appointment"
      />

      <div className="container-custom" style={{ maxWidth: '1000px' }}>
        <header style={{ marginBottom: '64px' }}>
          <span className="section-label">{t('step_progress', { current: step, total: 4 })}</span>
          <h1 className="display-2 font-display">{t('title')}</h1>

          <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '2px',
                  background: i <= step ? 'var(--color-accent)' : 'var(--color-border)',
                  transition: 'all 0.4s',
                }}
              />
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="initial" animate="animate" exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {activeServices.map((s) => (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleService(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') toggleService(s.id);
                    }}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      borderColor: selectedServices.includes(s.id) ? 'var(--color-accent)' : 'var(--color-border)',
                      background: selectedServices.includes(s.id) ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{serviceLabel(s)}</h3>
                      {selectedServices.includes(s.id) && <Check size={18} color="var(--color-accent)" />}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {formatDuration(s.duration)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={14} /> {formatPrice(s.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="initial" animate="animate" exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                {['İldem', 'Tuğba'].map((spec) => (
                  <div
                    key={spec}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSpecialist(spec)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedSpecialist(spec);
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '40px 32px',
                      textAlign: 'center',
                      border: `1px solid ${selectedSpecialist === spec ? 'var(--color-text)' : 'var(--color-border)'}`,
                      background: selectedSpecialist === spec ? 'var(--color-text)' : 'transparent',
                      color: selectedSpecialist === spec ? 'var(--color-surface)' : 'var(--color-text)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <h3 className="font-display" style={{ fontSize: '2rem', marginBottom: '12px' }}>
                      {spec}
                    </h3>
                    <p style={{ fontSize: '0.85rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {t('specialist_role')}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3cal" variants={fadeUp} initial="initial" animate="animate" exit={{ opacity: 0 }}>
              <div className="appt-two-col-grid">
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <button
                      type="button"
                      disabled={isStudioMonthAtMinimum(calYear, calMonth)}
                      onClick={() =>
                        setCalView((c) =>
                          c.month0 === 0 ? { year: c.year - 1, month0: 11 } : { year: c.year, month0: c.month0 - 1 }
                        )
                      }
                      className="btn-ghost"
                      style={{
                        padding: '8px',
                        opacity: isStudioMonthAtMinimum(calYear, calMonth) ? 0.35 : 1,
                        cursor: isStudioMonthAtMinimum(calYear, calMonth) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {getMonthName(calMonth)} {calYear}
                    </span>
                    <button
                      type="button"
                      disabled={isStudioMonthAtOrPastMaximum(calYear, calMonth)}
                      onClick={() =>
                        setCalView((c) =>
                          c.month0 === 11 ? { year: c.year + 1, month0: 0 } : { year: c.year, month0: c.month0 + 1 }
                        )
                      }
                      className="btn-ghost"
                      style={{
                        padding: '8px',
                        opacity: isStudioMonthAtOrPastMaximum(calYear, calMonth) ? 0.35 : 1,
                        cursor: isStudioMonthAtOrPastMaximum(calYear, calMonth) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '16px', textAlign: 'center' }}>
                    {t('studio_timezone_note')}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                    {weekdays.map((d, idx) => (
                      <span key={`${d}-${idx}`} style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                        {d}
                      </span>
                    ))}
                    {calendarDays.map((d, i) => {
                      if (d === null) return <div key={`e-${i}`} />;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const isPast = compareStudioYmd(dateStr, today) < 0;
                      const closed = !isStudioBookingDayYmd(dateStr);
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isPast || closed}
                          onClick={() => setSelectedDate(dateStr)}
                          style={{
                            height: '44px',
                            background: isSelected ? 'var(--color-text)' : 'transparent',
                            color: isSelected ? 'var(--color-surface)' : isPast || closed ? 'rgba(0,0,0,0.2)' : 'var(--color-text)',
                            fontWeight: isSelected ? 700 : 400,
                            border: 'none',
                            cursor: isPast || closed ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            opacity: isPast || closed ? 0.25 : 1,
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="section-label">{t('available_times')}</span>
                  <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                    {BOOKING_TIME_SLOTS.map((slot) => {
                      const staffId = selectedSpecialist === 'Tuğba' ? STAFF_TUGBA_ID : STAFF_ILDEM_ID;
                      const taken = Boolean(selectedDate) && isSlotTaken(selectedDate, slot, staffId);
                      return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!selectedDate || taken}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '24px',
                          background: selectedSlot === slot ? 'var(--color-text)' : 'var(--color-surface)',
                          border: `1px solid ${selectedSlot === slot ? 'var(--color-text)' : 'var(--color-border)'}`,
                          color: selectedSlot === slot ? 'var(--color-bg)' : 'var(--color-text)',
                          fontWeight: 700,
                          cursor: !selectedDate || taken ? 'not-allowed' : 'pointer',
                          letterSpacing: '0.05em',
                          opacity: taken ? 0.35 : 1,
                        }}
                      >
                        {slot}{taken ? ` · ${t('slot_taken')}` : ''}
                      </button>
                    );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="initial" animate="animate" exit={{ opacity: 0 }}>
              <div className="appt-two-col-grid">
                <form id="contact-form" onSubmit={handleSubmit(onFinalSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <Input label={t('form.name')} icon={<User size={18} />} {...register('name')} error={errors.name?.message} />
                  <Input label={t('form.phone')} icon={<Phone size={18} />} {...register('phone')} error={errors.phone?.message} />
                  <Textarea
                    label={t('form.notes')}
                    {...register('notes')}
                    placeholder={t('form.notes_placeholder', { name: selectedSpecialist || 'uzmanımız' })}
                  />
                </form>

                <div className="card" style={{ height: 'fit-content' }}>
                  <span className="section-label">{t('summary.title')}</span>
                  <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{t('summary.datetime_label')}</span>
                      <span>
                        {selectedSlot} · {formatDate(selectedDate)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{t('summary.selection')}</span>
                      <span style={{ textAlign: 'right', fontWeight: 500 }}>{selectionSummary}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{t('summary.specialist_label')}</span>
                      <span style={{ textAlign: 'right', fontWeight: 500 }}>{selectedSpecialist}</span>
                    </div>
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                      }}
                    >
                      <span>{t('summary.total')}</span>
                      <span style={{ color: 'var(--color-accent)' }}>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="appt-footer-nav" style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--color-border)' }}>
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              {tc('back')}
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            onClick={step === 4 ? undefined : handleNext}
            loading={submitting}
            type={step === 4 ? 'submit' : 'button'}
            form={step === 4 ? 'contact-form' : undefined}
            disabled={
              (step === 1 && selectedServices.length === 0) ||
              (step === 2 && !selectedSpecialist) ||
              (step === 3 && (!selectedDate || !selectedSlot)) ||
              (step === 4 && submitting)
            }
          >
            {step === 4 ? t('form.submit') : t('continue_step')}
          </Button>
        </footer>
      </div>
    </div>
  );
}
