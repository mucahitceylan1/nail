// src/components/ui/Tabs.tsx
// Nail Lab. by İldem — UI Primitives
import { type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid var(--color-surface-2)',
          marginBottom: 'var(--sp-3)',
          position: 'relative',
        }}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative',
              padding: '10px 18px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color:
                activeTab === tab.id
                  ? 'var(--color-accent)'
                  : 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color var(--duration-fast) var(--ease-out)',
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--color-accent)',
                  borderRadius: '1px 1px 0 0',
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
              />
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel">{activeContent}</div>
    </div>
  );
}
