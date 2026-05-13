// src/pages/admin/AdminAppointmentCalendar.tsx
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, CheckCircle2, X, User, Phone, Info } from 'lucide-react';
import {
  BOOKING_TIME_SLOTS,
  STAFF_ILDEM_ID,
  STAFF_TUGBA_ID,
  type Appointment,
  type AppointmentSource,
  type TimeSlot,
} from '../../types';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useServiceStore } from '../../store/useServiceStore';
import { useClientStore } from '../../store/useClientStore';
import { dbFindClientByPhone } from '../../api/supabase/ops';
import { isSupabaseConfigured } from '../../lib/supabase';
import { addCalendarDaysYmd, isStudioBookingDayYmd, startOfWeekMondayYmd } from '../../utils/studioTime';
import { formatDate, getToday, normalizePhoneDigits } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import CompleteAppointmentModal from '../../components/admin/CompleteAppointmentModal';

const STAFF_LABEL: Record<string, string> = {
  [STAFF_ILDEM_ID]: 'İldem',
  [STAFF_TUGBA_ID]: 'Tuğba',
};

const STATUS_MINI: Record<Appointment['status'], string> = {
  pending: 'Bekl.',
  confirmed: 'Onay',
  completed: 'OK',
  cancelled: 'X',
};

function apptFor(
  list: Appointment[],
  date: string,
  slot: TimeSlot,
  staffId: string
): Appointment | undefined {
  return list.find(
    (a) => a.date === date && a.timeSlot === slot && a.staffId === staffId && a.status !== 'cancelled'
  );
}

export default function AdminAppointmentCalendar() {
  const appointments = useAppointmentStore((s) => s.appointments);
  const addAppointment = useAppointmentStore((s) => s.addAppointment);
  const updateStatus = useAppointmentStore((s) => s.updateStatus);
  const completeAppointment = useAppointmentStore((s) => s.completeAppointment);
  const isSlotTaken = useAppointmentStore((s) => s.isSlotTaken);
  const services = useServiceStore((s) => s.services);
  const addClient = useClientStore((s) => s.addClient);
  const searchClients = useClientStore((s) => s.searchClients);

  const [weekStart, setWeekStart] = useState(() => startOfWeekMondayYmd(getToday()));

  const weekDays = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 7; i++) out.push(addCalendarDaysYmd(weekStart, i));
    return out;
  }, [weekStart]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createCtx, setCreateCtx] = useState<{
    date: string;
    slot: TimeSlot;
    staffId: string;
  } | null>(null);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cSvc, setCSvc] = useState<string[]>([]);
  const [cSource, setCSource] = useState<AppointmentSource>('admin');
  const [cOverlap, setCOverlap] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState('');

  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [collected, setCollected] = useState('');
  const [cNotes, setCNotes] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsAppt, setDetailsAppt] = useState<Appointment | null>(null);

  const openCreate = (date: string, slot: TimeSlot, staffId: string) => {
    setCreateCtx({ date, slot, staffId });
    setCName('');
    setCPhone('');
    setCSvc([]);
    setCSource('admin');
    setCOverlap(false);
    setCreateBusy(false);
    setCreateError('');
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!createCtx || !cName.trim() || cSvc.length === 0) {
      setCreateError('Ad ve en az bir hizmet zorunludur.');
      return;
    }
    if (!cPhone.trim() || cPhone.trim().length < 10) {
      setCreateError('Geçerli bir telefon numarası girin (min 10 hane).');
      return;
    }
    setCreateBusy(true);
    setCreateError('');
    let clientId: string;
    if (isSupabaseConfigured()) {
      const ex = await dbFindClientByPhone(cPhone);
      clientId = ex ? ex.id : (await addClient({ name: cName.trim(), phone: cPhone.trim() })).id;
    } else {
      const norm = normalizePhoneDigits(cPhone);
      const ex = searchClients(cPhone).find((c) => normalizePhoneDigits(c.phone) === norm);
      clientId = ex ? ex.id : (await addClient({ name: cName.trim(), phone: cPhone.trim() })).id;
    }
    const objs = services.filter((s) => cSvc.includes(s.id));
    const listTotal = objs.reduce((s, x) => s + x.price, 0);
    try {
      await addAppointment({
        clientId,
        clientName: cName.trim(),
        clientPhone: cPhone.trim(),
        serviceIds: cSvc,
        date: createCtx.date,
        timeSlot: createCtx.slot,
        status: 'confirmed',
        totalPrice: listTotal,
        listTotalPrice: listTotal,
        staffId: createCtx.staffId,
        source: cSource,
        allowOverlap: cOverlap,
      });
      setCreateOpen(false);
      setCreateCtx(null);
    } catch (e) {
      console.error(e);
      setCreateError(e instanceof Error ? e.message : 'Randevu oluşturulamadı.');
    } finally {
      setCreateBusy(false);
    }
  };

  const openComplete = (id: string, defaultAmt: number) => {
    setCompleteId(id);
    setCollected(String(defaultAmt));
    setCNotes('');
    setCompleteOpen(true);
  };

  const submitComplete = async () => {
    if (!completeId) return;
    const amt = collected.trim() === '' ? undefined : Number(collected.replace(',', '.'));
    await completeAppointment(completeId, {
      collectedAmount: Number.isFinite(amt as number) ? (amt as number) : undefined,
      completionNotes: cNotes.trim() || undefined,
    });
    setCompleteOpen(false);
    setCompleteId(null);
  };

  const renderSlotCell = (date: string, slot: TimeSlot, staffId: string) => {
      const closed = !isStudioBookingDayYmd(date);
      const a = apptFor(appointments, date, slot, staffId);
      const taken = isSlotTaken(date, slot, staffId);
      if (closed) {
        return (
          <div
            key={`${date}-${slot}-${staffId}`}
            style={{
              minHeight: 44,
              background: 'var(--color-surface-2)',
              borderRadius: 6,
              opacity: 0.35,
            }}
          />
        );
      }
      if (a) {
        const isPending = a.status === 'pending';
        const isConfirmed = a.status === 'confirmed';
        
        return (
          <div
            key={a.id}
            onClick={() => { setDetailsAppt(a); setDetailsOpen(true); }}
            style={{
              padding: '6px 8px',
              borderRadius: '8px',
              border: `1px solid ${isPending ? 'var(--color-warning)' : isConfirmed ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: isPending ? 'rgba(224, 184, 112, 0.08)' : isConfirmed ? 'rgba(166, 124, 82, 0.05)' : 'var(--color-surface)',
              fontSize: '0.75rem',
              lineHeight: 1.3,
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {a.clientName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6rem', opacity: 0.7 }}>
               <Badge color={a.status === 'pending' ? 'warning' : a.status === 'confirmed' ? 'accent' : 'default'}>
                {STATUS_MINI[a.status]}
              </Badge>
              <span>{STAFF_LABEL[a.staffId]}</span>
            </div>
          </div>
        );
      }
      return (
        <button
          key={`${date}-${slot}-${staffId}`}
          type="button"
          disabled={taken}
          onClick={() => openCreate(date, slot, staffId)}
          style={{
            minHeight: 44,
            border: '1px dashed var(--color-border)',
            borderRadius: 6,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: taken ? 0.25 : 1,
          }}
        >
          <Plus size={16} />
        </button>
      );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <Button variant="ghost" onClick={() => setWeekStart((w) => addCalendarDaysYmd(w, -7))}>
          <ChevronLeft size={18} /> Hafta
        </Button>
        <span className="section-label" style={{ margin: 0 }}>
          {formatDate(weekStart)} — {formatDate(addCalendarDaysYmd(weekStart, 6))}
        </span>
        <Button variant="ghost" onClick={() => setWeekStart((w) => addCalendarDaysYmd(w, 7))}>
          Hafta <ChevronRight size={18} />
        </Button>
      </div>

      {weekDays.map((day) => (
        <div
          key={day}
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            alignItems: 'stretch',
            opacity: !isStudioBookingDayYmd(day) ? 0.45 : 1,
          }}
        >
          <div style={{ width: 100, flexShrink: 0, fontWeight: 700, fontSize: '0.8rem', paddingTop: 8 }}>
            {formatDate(day)}
          </div>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, minWidth: BOOKING_TIME_SLOTS.length * 88 }}>
              {BOOKING_TIME_SLOTS.map((slot) => (
                <div key={`${day}-${slot}`} style={{ width: 80, flexShrink: 0 }}>
                  <div style={{ fontSize: '0.65rem', textAlign: 'center', marginBottom: 4, color: 'var(--color-text-muted)' }}>
                    {slot}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div title="İldem">{renderSlotCell(day, slot, STAFF_ILDEM_ID)}</div>
                    <div title="Tuğba">{renderSlotCell(day, slot, STAFF_TUGBA_ID)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {createOpen && createCtx && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 440, width: '100%', padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display" style={{ marginBottom: 16 }}>
              Hızlı randevu · {STAFF_LABEL[createCtx.staffId]} · {createCtx.slot}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Ad soyad" value={cName} onChange={(e) => setCName(e.target.value)} />
              <Input label="Telefon" value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
              <div>
                <span className="section-label" style={{ marginBottom: 8, display: 'block' }}>
                  Hizmetler
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {services
                    .filter((s) => s.isActive)
                    .map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setCSvc((p) => (p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id]))
                        }
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          border: cSvc.includes(s.id) ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                          borderRadius: 6,
                          background: cSvc.includes(s.id) ? 'var(--color-accent-soft)' : 'transparent',
                        }}
                      >
                        {s.name}
                      </button>
                    ))}
                </div>
              </div>
              <label style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                Kaynak
                <select
                  value={cSource}
                  onChange={(e) => setCSource(e.target.value as AppointmentSource)}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid var(--color-border)' }}
                >
                  <option value="admin">Salon (admin)</option>
                  <option value="phone">Telefon</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="web">Web</option>
                </select>
              </label>
              <label style={{ fontSize: '0.8rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={cOverlap} onChange={(e) => setCOverlap(e.target.checked)} />
                Çift rezervasyon / istisna (aynı slot)
              </label>
              {createError && (
                <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', margin: 0 }}>{createError}</p>
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={createBusy}>
                  Vazgeç
                </Button>
                <Button variant="primary" onClick={() => void submitCreate()} loading={createBusy}>
                  Kaydet
                </Button>
              </div>
            </div>
          </div>
        </div>
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

      {detailsOpen && detailsAppt && (
        <div
          role="dialog"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 20
          }}
          onClick={() => setDetailsOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 480, width: '100%', padding: 24, position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setDetailsOpen(false)}
              style={{ position: 'absolute', right: 16, top: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            <h2 className="font-display" style={{ fontSize: '1.5rem', marginBottom: 20 }}>Randevu Detayı</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="var(--color-accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{detailsAppt.clientName}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={14} /> {detailsAppt.clientPhone}
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, background: 'var(--color-bg)', borderRadius: 8, fontSize: '0.9rem' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Tarih:</span>
                  <span>{formatDate(detailsAppt.date)} · {detailsAppt.timeSlot}</span>
                </div>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Uzman:</span>
                  <span>{STAFF_LABEL[detailsAppt.staffId]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Hizmetler:</span>
                  <span style={{ textAlign: 'right' }}>
                    {services.filter(s => detailsAppt.serviceIds.includes(s.id)).map(s => s.name).join(', ')}
                  </span>
                </div>
              </div>

              {detailsAppt.notes && (
                <div>
                  <div className="section-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={14} /> Notlar
                  </div>
                  <div style={{ 
                    padding: 12, background: 'rgba(224, 184, 112, 0.1)', border: '1px solid var(--color-warning)', 
                    borderRadius: 6, fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 
                  }}>
                    {detailsAppt.notes}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {detailsAppt.status === 'pending' && (
                  <>
                    <Button 
                      variant="primary" 
                      style={{ flex: 1, background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                      onClick={() => { updateStatus(detailsAppt.id, 'confirmed'); setDetailsOpen(false); }}
                    >
                      ONAYLA
                    </Button>
                    <Button 
                      variant="outline" 
                      style={{ flex: 1, color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                      onClick={() => { updateStatus(detailsAppt.id, 'cancelled'); setDetailsOpen(false); }}
                    >
                      İPTAL ET
                    </Button>
                  </>
                )}
                {detailsAppt.status !== 'completed' && (
                  <Button 
                    variant={detailsAppt.status === 'confirmed' ? 'primary' : 'ghost'}
                    style={{ flex: detailsAppt.status === 'confirmed' ? 2 : 1 }}
                    onClick={() => { 
                      setDetailsOpen(false);
                      openComplete(detailsAppt.id, detailsAppt.listTotalPrice); 
                    }}
                  >
                    BİTİR / TAHSİLAT
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
