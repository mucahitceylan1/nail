// src/pages/admin/AppointmentsPage.tsx
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, X, Clock, Search, CheckCircle2 } from 'lucide-react';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useServiceStore } from '../../store/useServiceStore';
import { formatPrice, formatDate, formatPhone } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import type { Appointment } from '../../types';
import AdminAppointmentCalendar from './AdminAppointmentCalendar';
import CompleteAppointmentModal from '../../components/admin/CompleteAppointmentModal';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

const FILTER_OPTIONS: Appointment['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];

type AppointmentFilter = 'all' | Appointment['status'];
type BadgeColor = 'default' | 'success' | 'warning' | 'danger' | 'accent';

const STATUS_BADGE_COLORS: Record<Appointment['status'], BadgeColor> = {
  pending: 'warning',
  confirmed: 'accent',
  completed: 'success',
  cancelled: 'danger',
};

export default function AppointmentsPage() {
  const appointmentsSource = useAppointmentStore((s) => s.appointments);
  const updateStatus = useAppointmentStore((s) => s.updateStatus);
  const completeAppointment = useAppointmentStore((s) => s.completeAppointment);
  const services = useServiceStore((s) => s.services);

  const [tab, setTab] = useState<'calendar' | 'list'>('calendar');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AppointmentFilter>('all');

  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [collected, setCollected] = useState('');

  const filteredAppointments = useMemo(() => {
    return appointmentsSource
      .filter((a) => {
        const matchesSearch =
          a.clientName.toLowerCase().includes(search.toLowerCase()) || a.clientPhone.includes(search);
        const matchesFilter = filter === 'all' || a.status === filter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointmentsSource, search, filter]);

  const getServiceNames = (ids: string[]) =>
    ids
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    await updateStatus(id, status);
  };

  const openListComplete = (app: Appointment) => {
    setCompleteId(app.id);
    setCollected(String(app.listTotalPrice));
    setCompleteOpen(true);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="admin-content">
      <header style={{ marginBottom: '40px' }}>
        <span className="section-label">TÜM KAYITLAR</span>
        <h1 className="display-2 font-display">Randevu Yönetimi</h1>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['calendar', 'list'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: tab === t ? 'var(--color-text)' : 'transparent',
              color: tab === t ? 'var(--color-bg)' : 'var(--color-text)',
              border: `1px solid ${tab === t ? 'var(--color-text)' : 'var(--color-border)'}`,
              cursor: 'pointer',
            }}
          >
            {t === 'calendar' ? 'Takvim' : 'Liste'}
          </button>
        ))}
      </div>

      {tab === 'calendar' ? (
        <AdminAppointmentCalendar />
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}
              />
              <input
                type="text"
                placeholder="Müşteri adı veya telefon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  padding: '16px 16px 16px 48px',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', ...FILTER_OPTIONS] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: filter === f ? 'var(--color-text)' : 'transparent',
                    color: filter === f ? 'var(--color-bg)' : 'var(--color-text)',
                    border: `1px solid ${filter === f ? 'var(--color-text)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {f === 'all' ? 'Tümü' : STATUS_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {filteredAppointments.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Müşteri
                    </th>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Hizmet
                    </th>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Tarih & Saat
                    </th>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Liste
                    </th>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Durum
                    </th>
                    <th
                      style={{
                        padding: '16px',
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        textAlign: 'right',
                      }}
                    >
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--color-surface-2)', verticalAlign: 'middle' }}>
                      <td style={{ padding: '20px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{app.clientName}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>{formatPhone(app.clientPhone)}</div>
                      </td>
                      <td style={{ padding: '20px 16px' }}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getServiceNames(app.serviceIds)}
                        </div>
                      </td>
                      <td style={{ padding: '20px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} style={{ opacity: 0.5 }} />
                          <span>{app.timeSlot}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>{formatDate(app.date)}</div>
                      </td>
                      <td style={{ padding: '20px 16px', fontWeight: 600 }}>{formatPrice(app.listTotalPrice)}</td>
                      <td style={{ padding: '20px 16px' }}>
                        <Badge color={STATUS_BADGE_COLORS[app.status]}>{STATUS_LABELS[app.status]}</Badge>
                      </td>
                      <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {app.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="editorial"
                              onClick={() => handleStatusUpdate(app.id, 'confirmed')}
                              style={{ padding: '8px 12px' }}
                              title="Onayla"
                            >
                              <Check size={14} />
                            </Button>
                          )}
                          {(app.status === 'confirmed' || app.status === 'pending') && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => openListComplete(app)}
                              style={{ padding: '8px 12px' }}
                              title="Tamamla"
                            >
                              <CheckCircle2 size={14} />
                            </Button>
                          )}
                          {app.status !== 'cancelled' && app.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                              style={{ padding: '8px 12px' }}
                              title="İptal Et"
                            >
                              <X size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Calendar size={48} />}
              title="Randevu Bulunamadı"
              description="Arama kriterlerinize uygun randevu kaydı bulunmamaktadır."
            />
          )}
        </>
      )}

      <CompleteAppointmentModal
        isOpen={completeOpen && !!completeId}
        defaultAmount={Number(collected) || 0}
        onClose={() => { setCompleteOpen(false); setCompleteId(null); }}
        onSubmit={async (payload) => {
          if (!completeId) return;
          await completeAppointment(completeId, payload);
          setCompleteOpen(false);
          setCompleteId(null);
        }}
      />
    </motion.div>
  );
}
