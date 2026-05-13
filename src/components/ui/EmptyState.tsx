// src/components/ui/EmptyState.tsx
// Nail Lab. by İldem — UI Primitives
import { type ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-8) var(--sp-4)',
        textAlign: 'center',
        gap: 'var(--sp-2)',
      }}
    >
      <div style={{ color: 'var(--color-text-muted)', opacity: 0.5, marginBottom: 'var(--sp-1)' }}>
        {icon}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'var(--color-text)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            maxWidth: '360px',
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div style={{ marginTop: 'var(--sp-2)' }}>
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
