// src/App.tsx
// Nail Lab. by İldem — Application Root
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Spinner from './components/ui/Spinner';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminGuard from './components/layout/AdminGuard';
import { AuthProvider } from './contexts/AuthProvider';
import LocaleLayout from './components/routing/LocaleLayout';
import { DEFAULT_LOCALE } from './i18n/constants';

// Public pages (eager load)
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import AppointmentPage from './pages/public/AppointmentPage';
import GalleryPage from './pages/public/GalleryPage';
import CareGuidePage from './pages/public/CareGuidePage';

// Admin pages (lazy load)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ClientsPage = lazy(() => import('./pages/admin/ClientsPage'));
const FinancePage = lazy(() => import('./pages/admin/FinancePage'));
const PhotosPage = lazy(() => import('./pages/admin/PhotosPage'));
const ServicesAdminPage = lazy(() => import('./pages/admin/ServicesAdminPage'));
const AppointmentsPage = lazy(() => import('./pages/admin/AppointmentsPage'));
const AdminTimelinePage = lazy(() => import('./pages/admin/AdminTimelinePage'));
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage'));

function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Spinner size={40} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function PublicCatchAll() {
  const { lng } = useParams<{ lng: string }>();
  return <Navigate to={`/${lng ?? DEFAULT_LOCALE}`} replace />;
}

const LEGACY_PUBLIC = ['services', 'appointment', 'gallery', 'care-guide'] as const;

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />
            {LEGACY_PUBLIC.map((seg) => (
              <Route
                key={seg}
                path={`/${seg}`}
                element={<Navigate to={`/${DEFAULT_LOCALE}/${seg}`} replace />}
              />
            ))}

            <Route path="/admin/login" element={<LazyWrapper><AdminLoginPage /></LazyWrapper>} />

            <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route path="/admin" element={<LazyWrapper><DashboardPage /></LazyWrapper>} />
              <Route path="/admin/appointments" element={<LazyWrapper><AppointmentsPage /></LazyWrapper>} />
              <Route path="/admin/timeline" element={<LazyWrapper><AdminTimelinePage /></LazyWrapper>} />
              <Route path="/admin/site-gallery" element={<LazyWrapper><AdminGalleryPage /></LazyWrapper>} />
              <Route path="/admin/clients" element={<LazyWrapper><ClientsPage /></LazyWrapper>} />
              <Route path="/admin/finance" element={<LazyWrapper><FinancePage /></LazyWrapper>} />
              <Route path="/admin/photos" element={<LazyWrapper><PhotosPage /></LazyWrapper>} />
              <Route path="/admin/services" element={<LazyWrapper><ServicesAdminPage /></LazyWrapper>} />
            </Route>

            <Route path="/:lng" element={<LocaleLayout />}>
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="appointment" element={<AppointmentPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="care-guide" element={<CareGuidePage />} />
                <Route path="*" element={<PublicCatchAll />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
