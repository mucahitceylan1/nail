// src/components/ui/Spinner.tsx
// Nail Lab. by İldem — UI Primitives

interface SpinnerProps {
  size?: number;
}

export default function Spinner({ size = 32 }: SpinnerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-4)',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        style={{ animation: 'spinnerRotate 1s linear infinite' }}
      >
        <circle
          cx="16"
          cy="16"
          r="13"
          stroke="var(--color-surface-2)"
          strokeWidth="3"
        />
        <path
          d="M16 3 A13 13 0 0 1 29 16"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <style>{`
          @keyframes spinnerRotate {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}
