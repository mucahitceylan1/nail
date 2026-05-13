// src/components/ui/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'editorial' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'editorial', size = 'md', icon, loading, children, ...props }, ref) => {
    const variants: Record<string, React.CSSProperties> = {
      primary: {
        background: 'var(--color-text)',
        color: 'var(--color-bg)',
        border: '1px solid var(--color-text)',
      },
      secondary: {
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      },
      outline: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: '1px solid transparent',
      },
      editorial: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: '1px solid var(--color-text)',
        borderRadius: '0',
      },
      danger: {
        background: '#dc2626',
        color: '#fff',
        border: '1px solid #dc2626',
      },
    };

    const currentVariant = variants[variant] || variants.editorial;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MotionButton = motion.button as any;

    return (
      <MotionButton
        ref={ref}
        className={className}
        whileHover={{ scale: 1.02, x: 2 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.15em',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          ...currentVariant,
          padding: size === 'sm' ? '12px 24px' : size === 'lg' ? '20px 48px' : '16px 32px',
          fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '0.9rem' : '0.8125rem',
          borderRadius: variant === 'editorial' ? '0' : '4px',
        }}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <div style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <>
            {children}
            {icon && <span style={{ display: 'flex' }}>{icon}</span>}
          </>
        )}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
