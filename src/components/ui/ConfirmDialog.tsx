// src/components/ui/ConfirmDialog.tsx
// Nail Lab. by İldem — UI Primitives
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Onayla',
  cancelLabel = 'İptal',
  variant = 'danger',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          marginBottom: 'var(--sp-3)',
        }}
      >
        {message}
      </p>
      <div
        style={{
          display: 'flex',
          gap: 'var(--sp-1)',
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="ghost" size="sm" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant={variant} size="sm" onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
