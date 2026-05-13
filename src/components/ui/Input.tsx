// src/components/ui/Input.tsx
// Nail Lab. by İldem — UI Primitives
import { type InputHTMLAttributes, type ReactNode, useState, useId } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = useId();

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8125rem',
          color: error ? 'var(--color-danger)' : 'var(--color-text-muted)',
          fontWeight: 500,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          background: 'var(--color-surface)',
          border: `1px solid ${
            error
              ? 'var(--color-danger)'
              : focused
              ? 'var(--color-accent)'
              : 'var(--color-surface-2)'
          }`,
          borderRadius: '4px',
          transition: 'border-color var(--duration-base) var(--ease-out)',
        }}
      >
        {icon && (
          <span style={{ color: 'var(--color-text-muted)', flexShrink: 0, display: 'flex' }}>
            {icon}
          </span>
        )}
        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            lineHeight: 1.5,
          }}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <span
          style={{
            fontSize: '0.75rem',
            color: error ? 'var(--color-danger)' : 'var(--color-text-muted)',
          }}
        >
          {error ?? helperText}
        </span>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, onBlur, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false);
  const inputId = useId();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8125rem',
          color: error ? 'var(--color-danger)' : 'var(--color-text-muted)',
          fontWeight: 500,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <textarea
        id={inputId}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={{
          padding: '12px 14px',
          background: 'var(--color-surface)',
          border: `1px solid ${
            error
              ? 'var(--color-danger)'
              : focused
              ? 'var(--color-accent)'
              : 'var(--color-surface-2)'
          }`,
          borderRadius: '4px',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          minHeight: '100px',
          resize: 'vertical',
          transition: 'border-color var(--duration-base) var(--ease-out)',
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
