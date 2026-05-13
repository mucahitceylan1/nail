import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Camera,
  LogOut,
  ChevronLeft,
  ExternalLink,
  Scissors,
  Calendar,
  Menu,
  X,
  Rows3,
  Images,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_LINKS_BASE = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Randevular', icon: Calendar },
  { to: '/admin/timeline', labelKey: 'nav_timeline' as const, icon: Rows3 },
  { to: '/admin/site-gallery', labelKey: 'nav_site_gallery' as const, icon: Images },
  { to: '/admin/services', label: 'Hizmetler', icon: Scissors },
  { to: '/admin/clients', label: 'Müşteriler', icon: Users },
  { to: '/admin/finance', label: 'Finans', icon: Wallet },
  { to: '/admin/photos', label: 'Fotoğraflar', icon: Camera },
] as const;

type AdminNavIcon = (typeof ADMIN_LINKS_BASE)[number]['icon'];
type AdminNavLink = { to: string; label: string; icon: AdminNavIcon };

export default function AdminSidebar() {
  const { t } = useTranslation('admin');
  const ADMIN_LINKS = useMemo((): AdminNavLink[] => {
    return ADMIN_LINKS_BASE.map((item) => {
      if ('labelKey' in item) return { to: item.to, label: t(item.labelKey), icon: item.icon };
      return { to: item.to, label: item.label, icon: item.icon };
    });
  }, [t]);

  const MOBILE_PRIMARY_LINKS = useMemo(
    () =>
      ADMIN_LINKS.filter((l) =>
        ['/admin', '/admin/appointments', '/admin/services', '/admin/clients'].includes(l.to)
      ),
    [ADMIN_LINKS]
  );

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOutSupabase } = useAuth();

  const currentLabel = useMemo(
    () => ADMIN_LINKS.find((link) => location.pathname === link.to)?.label ?? 'Yönetim Paneli',
    [location.pathname, ADMIN_LINKS]
  );

  const handleLogout = async () => {
    await signOutSupabase();
    setMobileMenuOpen(false);
    navigate('/admin/login');
  };

  const sidebarWidth = collapsed ? '68px' : 'var(--sidebar-width)';

  return (
    <>
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-surface-2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="admin-sidebar"
      >
        <div
          style={{
            padding: collapsed ? '20px 14px' : '20px 20px',
            borderBottom: '1px solid var(--color-surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 'var(--navbar-height)',
          }}
        >
          {!collapsed && (
            <Link to="/admin" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: 'var(--color-accent)',
                }}
              >
                Nail Lab.
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.6875rem',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginTop: '2px',
                }}
              >
                Yönetim Paneli
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              color: 'var(--color-text-muted)',
              transition: 'all var(--duration-fast) var(--ease-out)',
              transform: collapsed ? 'rotate(180deg)' : 'none',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            padding: 'var(--sp-2) var(--sp-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {ADMIN_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '12px 20px' : '10px 14px',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  background: isActive ? 'var(--color-accent-soft)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={18} aria-hidden="true" />
                {!collapsed && link.label}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: 'var(--sp-2) var(--sp-1)',
            borderTop: '1px solid var(--color-surface-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <Link
            to="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px 20px' : '10px 14px',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              transition: 'all var(--duration-fast) var(--ease-out)',
              whiteSpace: 'nowrap',
            }}
          >
            <ExternalLink size={16} aria-hidden="true" />
            {!collapsed && 'Siteyi Görüntüle'}
          </Link>
          <button
            onClick={() => void handleLogout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px 20px' : '10px 14px',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              color: 'var(--color-danger)',
              width: '100%',
              textAlign: 'left',
              transition: 'all var(--duration-fast) var(--ease-out)',
              whiteSpace: 'nowrap',
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            {!collapsed && 'Çıkış Yap'}
          </button>
        </div>
      </motion.aside>

      <div className="admin-mobile-shell">
        <div className="admin-mobile-topbar">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Yönetim menüsünü aç"
            className="admin-mobile-icon-button"
          >
            <Menu size={18} />
          </button>
          <div className="admin-mobile-title-wrap">
            <span className="admin-mobile-brand">Nail Lab.</span>
            <span className="admin-mobile-title">{currentLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            aria-label="Çıkış yap"
            className="admin-mobile-icon-button"
          >
            <LogOut size={18} />
          </button>
        </div>

        <nav className="admin-mobile-tabbar" aria-label="Admin gezinme">
          {MOBILE_PRIMARY_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`admin-mobile-tab ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="admin-mobile-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-mobile-drawer-header">
                <div>
                  <span className="admin-mobile-brand">Nail Lab.</span>
                  <span className="admin-mobile-drawer-kicker">Yönetim Paneli</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Menuyu kapat"
                  className="admin-mobile-icon-button"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-mobile-drawer-links">
                {ADMIN_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`admin-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="admin-mobile-drawer-footer">
                <Link to="/" target="_blank" className="admin-mobile-drawer-link">
                  <ExternalLink size={18} aria-hidden="true" />
                  <span>Siteyi Görüntüle</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
