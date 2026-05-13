// src/components/ui/Badge.tsx
// Nail Lab. by İldem — UI Primitives

type BadgeColor = 'default' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, { bg: string; text: string }> = {
  default: { bg: 'var(--color-surface-2)', text: 'var(--color-text-muted)' },
  success: { bg: 'rgba(94, 189, 142, 0.15)', text: 'var(--color-success)' },
  warning: { bg: 'rgba(224, 184, 112, 0.15)', text: 'var(--color-warning)' },
  danger: { bg: 'rgba(224, 112, 112, 0.15)', text: 'var(--color-danger)' },
  accent: { bg: 'var(--color-accent-soft)', text: 'var(--color-accent)' },
};

export default function Badge({ children, color = 'default' }: BadgeProps) {
  const colors = colorMap[color];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        backgroundColor: colors.bg,
        color: colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
