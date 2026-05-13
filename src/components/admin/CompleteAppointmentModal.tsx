// src/components/admin/CompleteAppointmentModal.tsx
// Shared "complete appointment" dialog used by both the calendar and the list view.
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  defaultAmount: number;
  onClose: () => void;
  onSubmit: (payload: { collectedAmount?: number; completionNotes?: string }) => Promise<void>;
}

import { useState, useEffect } from 'react';

export default function CompleteAppointmentModal({
  isOpen,
  defaultAmount,
  onClose,
  onSubmit,
}: CompleteAppointmentModalProps) {
  const [collected, setCollected] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCollected(String(defaultAmount));
      setNotes('');
      setBusy(false);
    }
  }, [isOpen, defaultAmount]);

  const handleSubmit = async () => {
    setBusy(true);
    try {
      const amt = collected.trim() === '' ? undefined : Number(collected.replace(',', '.'));
      await onSubmit({
        collectedAmount: Number.isFinite(amt as number) ? (amt as number) : undefined,
        completionNotes: notes.trim() || undefined,
      });
    } catch (e) {
      console.error(e);
      alert('İşlem tamamlanamadı.');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-appt-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <h3 id="complete-appt-title" className="font-display" style={{ marginBottom: 16 }}>
          Randevuyu tamamla
        </h3>
        <Input label="Tahsil edilen (TL)" value={collected} onChange={(e) => setCollected(e.target.value)} />
        <div style={{ marginTop: 12 }}>
          <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>
            Not
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Vazgeç
          </Button>
          <Button variant="primary" onClick={() => void handleSubmit()} loading={busy}>
            Tamamla ve kasaya yaz
          </Button>
        </div>
      </div>
    </div>
  );
}
