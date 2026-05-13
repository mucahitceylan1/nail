// src/components/layout/Navbar.tsx
// Nail Lab. by İldem — Functional App Navbar
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppLocale } from '../../i18n/constants';
import { replaceLocaleInPathname, stripLocaleFromPathname } from '../../i18n/routing';
import { LocalizedLink } from '../routing/LocalizedLink';

const LANGUAGES = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'ar', label: 'AR' },
];

function normalizeLang(code: string) {
  const base = code.split('-')[0]?.toLowerCase() ?? 'tr';
  return LANGUAGES.some((l) => l.code === base) ? base : 'tr';
}

function LanguageDropdown({
  onPick,
  compact,
  menuAlign = 'start',
}: {
  onPick?: () => void;
  compact?: boolean;
  /** 'end' = align dropdown to trigger’s right (navbar far-right). */
  menuAlign?: 'start' | 'end';
}) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const currentCode = normalizeLang(i18n.language);
  const current = LANGUAGES.find((l) => l.code === currentCode) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code);
    navigate(
      replaceLocaleInPathname(location.pathname, code as AppLocale) + location.search,
      { replace: true }
    );
    setOpen(false);
    onPick?.();
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: compact ? '0.8rem' : '0.7rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          padding: compact ? '10px 14px' : '6px 12px',
          borderRadius: 'var(--radius-sm)',
          minWidth: compact ? undefined : '52px',
          justifyContent: 'center',
        }}
      >
        {current.label}
        <ChevronDown size={compact ? 16 : 14} style={{ opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              ...(menuAlign === 'end'
                ? { right: 0, left: 'auto', minWidth: 'max(100%, 120px)' }
                : { left: 0, right: 0, minWidth: '100%' }),
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 12px 28px rgba(107, 76, 58, 0.12)',
              zIndex: 60,
              overflow: 'hidden',
            }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={lang.code === currentCode}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: compact ? '12px 16px' : '10px 14px',
                  fontSize: compact ? '0.85rem' : '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  background: lang.code === currentCode ? 'var(--color-accent-soft)' : 'transparent',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation(['nav']);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: t('nav:menu_home') },
    { to: '/services', label: t('nav:menu_services') },
    { to: '/gallery', label: t('nav:menu_gallery') },
    { to: '/care-guide', label: t('nav:menu_care') },
  ];

  const isHome = stripLocaleFromPathname(location.pathname) === '/';

  return (
    <>
      <nav
        className="public-site-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: scrolled || mobileOpen 
            ? 'rgba(255, 255, 255, 0.85)' 
            : isHome ? 'transparent' : 'rgba(255, 255, 255, 0.85)',
          WebkitBackdropFilter: scrolled || mobileOpen ? 'saturate(1.2) blur(20px)' : 'none',
          backdropFilter: scrolled || mobileOpen ? 'saturate(1.2) blur(20px)' : 'none',
          borderBottom: scrolled || mobileOpen ? '1px solid rgba(0,0,0,0.05)' : 'none',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          columnGap: 'clamp(12px, 2vw, 24px)',
          paddingLeft: '4vw',
          paddingRight: '4vw',
          height: '80px',
          zIndex: 100,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Brand */}
        <LocalizedLink
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifySelf: 'start',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              color: scrolled || mobileOpen || !isHome ? 'var(--color-text)' : '#FFF',
              letterSpacing: '0.01em',
              lineHeight: 1,
              fontWeight: 800,
              transition: 'color 0.4s ease',
            }}
          >
            Nail Lab.
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: scrolled || mobileOpen || !isHome ? 'var(--color-accent)' : 'rgba(255,255,255,0.8)',
              marginTop: '4px',
              fontWeight: 700,
              transition: 'color 0.4s ease',
            }}
          >
            by İldem
          </span>
        </LocalizedLink>

        {/* Desktop Links */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {navLinks.map((link) => {
            const pathOnly = stripLocaleFromPathname(location.pathname);
            const active = pathOnly === link.to || (link.to === '/' && pathOnly === '/');
            return (
              <LocalizedLink
                key={link.to}
                to={link.to}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: active 
                    ? 'var(--color-accent)' 
                    : (scrolled || mobileOpen || !isHome ? 'var(--color-text)' : 'rgba(255,255,255,0.9)'),
                  textDecoration: 'none',
                  transition: 'color 0.4s ease',
                  padding: '8px 0',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {link.label}
              </LocalizedLink>
            );
          })}
        </div>

        {/* Actions + mobile toggle (same grid cell: end-aligned) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifySelf: 'end',
            gap: '24px',
            minWidth: 0,
          }}
        >
          <div className="desktop-nav" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <LocalizedLink 
              to="/appointment" 
              className={scrolled || mobileOpen || !isHome ? "btn-ghost" : "btn-luxury-outline"}
              style={{ padding: '8px 24px', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              {t('nav:menu_book')}
            </LocalizedLink>
            <LanguageDropdown menuAlign="end" />
          </div>
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ 
              color: scrolled || mobileOpen || !isHome ? 'var(--color-text)' : '#FFF', 
              background: scrolled || mobileOpen || !isHome ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '12px',
              transition: 'all 0.4s ease',
              backdropFilter: 'blur(10px)',
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* spacer to prevent content from hiding under fixed navbar */}
      <div className="public-site-nav-spacer" aria-hidden="true" />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu-panel public-site-mobile-menu-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              background: 'color-mix(in srgb, var(--color-surface) 92%, transparent)',
              WebkitBackdropFilter: 'blur(10px)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid var(--color-border)',
              zIndex: 49,
              padding: '24px 4vw',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {navLinks.map((link) => {
                const pathOnly = stripLocaleFromPathname(location.pathname);
                const active = pathOnly === link.to || (link.to === '/' && pathOnly === '/');
                return (
                  <LocalizedLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: active ? 'var(--color-accent)' : 'var(--color-text)',
                      textDecoration: 'none',
                      padding: '12px',
                      background: active ? 'var(--color-accent-soft)' : 'transparent',
                      borderRadius: '8px',
                    }}
                  >
                    {link.label}
                  </LocalizedLink>
                );
              })}
            </div>

            <div style={{ margin: '24px 0 16px' }}>
              <LanguageDropdown compact onPick={() => setMobileOpen(false)} />
            </div>

            <LocalizedLink to="/appointment" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="btn-ghost" style={{ width: '100%', padding: '16px' }}>
                {t('nav:menu_book')}
              </div>
            </LocalizedLink>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 992px) { .desktop-nav { display: flex !important; } .mobile-toggle { display: none !important; } }
        @media (max-width: 991px) { .desktop-nav { display: none !important; } .mobile-toggle { display: flex; align-items: center; justify-content: center; } }
        @media (prefers-reduced-motion: reduce) {
          nav, .mobile-menu-panel {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
        }
      `}</style>
    </>
  );
}
