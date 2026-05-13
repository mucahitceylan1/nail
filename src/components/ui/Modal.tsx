// src/components/ui/Modal.tsx
// Nail Lab. by İldem — UI Primitives
import { type ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.15 },
  },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '520px',
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap: focus the modal content
      setTimeout(() => contentRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--sp-3)',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            key="modal-content"
            ref={contentRef}
            tabIndex={-1}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth,
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-surface-2)',
              borderRadius: '4px',
              outline: 'none',
            }}
          >
            {title && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px 16px',
                  borderBottom: '1px solid var(--color-surface-2)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.125rem',
                    fontWeight: 500,
                  }}
                >
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  aria-label="Kapat"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    color: 'var(--color-text-muted)',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text)';
                    e.currentTarget.style.background = 'var(--color-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div style={{ padding: '20px 24px 24px' }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
