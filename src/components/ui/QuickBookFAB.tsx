// src/components/ui/QuickBookFAB.tsx — Contact / social actions, expands upward
import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { stripLocaleFromPathname } from '../../i18n/routing';
import { CONTACT } from '../../constants/contact';
import { getWhatsAppChatUrl } from '../../utils/whatsapp';
import { InstagramIcon, WhatsAppIcon } from '../icons/ContactBrandIcons';

export default function QuickBookFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { t, i18n } = useTranslation('common');
  const isRtl = i18n.language === 'ar';
  const side = isRtl ? 'left' : 'right';

  useEffect(() => {
    const handleScroll = () => {
      const path = stripLocaleFromPathname(location.pathname);
      const shouldShow = window.scrollY > 300 && path !== '/appointment';
      setIsVisible(shouldShow);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const waUrl = getWhatsAppChatUrl();

  const actionBtn: CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(107, 76, 58, 0.12)',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={rootRef}
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          style={{
            position: 'fixed',
            bottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
            ...(side === 'right'
              ? { right: 'calc(40px + env(safe-area-inset-right, 0px))', left: 'auto' as const }
              : { left: 'calc(40px + env(safe-area-inset-left, 0px))', right: 'auto' as const }),
            zIndex: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: isRtl ? 'flex-start' : 'flex-end',
            gap: '10px',
          }}
        >
          <AnimatePresence>
            {open && (
              <>
                <motion.a
                  key="ig"
                  href={CONTACT.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Instagram"
                  style={{ ...actionBtn, textDecoration: 'none' }}
                >
                  <InstagramIcon size={22} />
                </motion.a>
                <motion.a
                  key="tel"
                  href={CONTACT.telHref}
                  initial={{ opacity: 0, y: 16, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.03 }}
                  aria-label={CONTACT.phoneDisplay}
                  style={{ ...actionBtn, textDecoration: 'none' }}
                >
                  <Phone size={22} strokeWidth={1.75} />
                </motion.a>
                <motion.a
                  key="wa"
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.06 }}
                  aria-label="WhatsApp"
                  style={{ ...actionBtn, textDecoration: 'none' }}
                >
                  <WhatsAppIcon size={22} />
                </motion.a>
              </>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            aria-expanded={open}
            aria-label={open ? t('fab_close') : t('fab_open_contact')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen((v) => !v)}
            style={{
              width: '56px',
              height: '56px',
              background: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-bg)',
              cursor: 'pointer',
              position: 'relative',
              border: '1px solid var(--color-text)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {open ? <X size={24} strokeWidth={1.5} /> : <MessageCircle size={24} strokeWidth={1.5} />}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
