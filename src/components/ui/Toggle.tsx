// src/components/ui/Toggle.tsx
// Nail Lab. by İldem — UI Primitives
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export default function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          background: checked ? 'var(--color-accent)' : 'var(--color-surface-2)',
          border: `1px solid ${checked ? 'var(--color-accent)' : 'var(--color-surface-2)'}`,
          padding: 0,
          cursor: 'pointer',
          transition: 'background var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)',
        }}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: checked ? '#0A0A0A' : 'var(--color-text-muted)',
            position: 'absolute',
            top: '2px',
          }}
        />
      </button>
      {label && (
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}
