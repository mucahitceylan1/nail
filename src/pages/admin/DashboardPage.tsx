// src/pages/admin/DashboardPage.tsx
// Nail Lab. by İldem — Functional Command Center
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, TrendingUp, CheckCircle2, Plus, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useClientStore } from '../../store/useClientStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useServiceStore } from '../../store/useServiceStore';
import { formatPrice, formatDateShort, getToday } from '../../utils/formatters';
import type { Appointment } from '../../types';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const STATUS_LABELS: Record<Appointment['status'], string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

const STATUS_COLORS: Record<Appointment['status'], 'warning' | 'accent' | 'success' | 'danger'> = {
  pending: 'warning',
  confirmed: 'accent',
  completed: 'success',
  cancelled: 'danger',
};

const NEXT_STATUS: Partial<Record<Appointment['status'], Appointment['status']>> = {
  pending: 'confirmed',
  confirmed: 'completed',
};

export default function DashboardPage() {
  const getTodayRevenue = useAppointmentStore((s) => s.getTodayRevenue);
  const getWeekRevenue = useAppointmentStore((s) => s.getWeekRevenue);
  const getMonthRevenue = useAppointmentStore((s) => s.getMonthRevenue);
  const getUpcomingAppointments = useAppointmentStore((s) => s.getUpcomingAppointments);
  const updateStatus = useAppointmentStore((s) => s.updateStatus);

  const todayRevenue = getTodayRevenue();
  const weekRevenue = getWeekRevenue();
  const monthRevenue = getMonthRevenue();
  const upcomingAppointments = getUpcomingAppointments(7);
  const todayYmd = getToday();
  const clients = useClientStore((s) => s.clients);
  const transactions = useFinanceStore((s) => s.transactions);
  const services = useServiceStore((s) => s.services);

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions]
  );

  const getServiceNames = (serviceIds: string[]): string =>
    serviceIds.map((id) => services.find((s) => s.id === id)?.name ?? 'Bilinmeyen').join(', ');

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="admin-content">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span className="section-label">Genel Bakış</span>
          <h1 className="display-2 font-display">Kontrol Paneli</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/finance">
             <Button variant="ghost" icon={<Plus size={16} />}>Gelir/Gider Ekle</Button>
          </Link>
          <Link to="/admin/photos">
             <Button variant="primary" icon={<Camera size={16} />}>Fotoğraf Yönetimi</Button>
          </Link>
        </div>
      </header>

      {/* Primary Metrics (Ciro) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <div className="metric-card" style={{ position: 'relative' }}>
          <span className="section-label" style={{ fontSize: '0.6rem', marginBottom: '8px' }}>Bugünkü Ciro</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{formatPrice(todayRevenue)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{upcomingAppointments.filter((a) => a.date === todayYmd).length} randevu</div>
        </div>
        <div className="metric-card" style={{ position: 'relative' }}>
          <span className="section-label" style={{ fontSize: '0.6rem', marginBottom: '8px' }}>Haftalık Ciro</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{formatPrice(weekRevenue)}</div>
          <TrendingUp size={16} style={{ position: 'absolute', right: '16px', bottom: '16px', color: 'var(--color-success)' }} />
        </div>
        <div className="metric-card" style={{ position: 'relative' }}>
          <span className="section-label" style={{ fontSize: '0.6rem', marginBottom: '8px' }}>Aylık Ciro</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{formatPrice(monthRevenue)}</div>
          <Calendar size={16} style={{ position: 'absolute', right: '16px', bottom: '16px', color: 'var(--color-accent)' }} />
        </div>
        <div className="metric-card" style={{ position: 'relative' }}>
          <span className="section-label" style={{ fontSize: '0.6rem', marginBottom: '8px' }}>Toplam Müşteri</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{clients.length}</div>
          <Users size={16} style={{ position: 'absolute', right: '16px', bottom: '16px', opacity: 0.3 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* Appointments Section */}
        <section className="premium-card" style={{ padding: 0, marginBottom: '24px' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Yaklaşan Randevular</h2>
            <Badge color="accent">{upcomingAppointments.length}</Badge>
          </div>
          
          <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '12px' }}>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appt) => (
                <motion.div 
                  key={appt.id} 
                  whileHover={{ x: 4 }}
                  style={{ 
                    display: 'flex', gap: '16px', padding: '16px', borderRadius: '12px',
                    background: 'var(--color-bg)', marginBottom: '12px', border: '1px solid var(--color-border)',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '10px', background: 'var(--color-surface)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--color-border)', flexShrink: 0
                  }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '0.95rem' }}>{appt.timeSlot.split(':')[0]}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-accent)', fontWeight: 700 }}>:{appt.timeSlot.split(':')[1]}</div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {appt.clientName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {formatDateShort(appt.date)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> {getServiceNames(appt.serviceIds)}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatPrice(appt.totalPrice)}</div>
                    <Badge color={STATUS_COLORS[appt.status]}>{STATUS_LABELS[appt.status]}</Badge>
                    {NEXT_STATUS[appt.status] && (
                        <button 
                          onClick={() => void updateStatus(appt.id, NEXT_STATUS[appt.status]!)}
                          style={{ 
                            background: 'var(--color-accent)', color: 'white', border: 'none', 
                            padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800 
                          }}
                        >
                          {appt.status === 'pending' ? 'ONAYLA' : 'TAMAMLA'}
                        </button>
                     )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={{ padding: '60px' }}>
                <EmptyState icon={<Calendar size={32} />} title="Randevu Yok" description="Önümüzdeki 7 gün için bekleyen randevu bulunmuyor." />
              </div>
            )}
          </div>
        </section>

        {/* Recent Transactions Section */}
        <section className="premium-card" style={{ padding: 0 }}>
           <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Son Finansal Kayıtlar</h2>
          </div>
          <div style={{ padding: '16px' }}>
            {recentTransactions.map(t => (
              <motion.div 
                key={t.id} 
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '12px 16px', borderRadius: '8px', marginBottom: '8px',
                  border: '1px solid var(--color-border)', fontSize: '0.85rem' 
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: t.type === 'income' ? 'rgba(77, 141, 111, 0.1)' : 'rgba(195, 91, 77, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <TrendingUp size={14} color={t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.description}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{formatDateShort(t.date)} · {t.category}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {t.type === 'income' ? '+' : '-'}{formatPrice(t.amount)}
                </div>
              </motion.div>
            ))}
            {recentTransactions.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>İşlem kaydı bulunmuyor.</div>
            )}
          </div>
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <Link to="/admin/finance" className="section-label" style={{ marginBottom: 0, textDecoration: 'none' }}>TÜMÜNÜ GÖR</Link>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
