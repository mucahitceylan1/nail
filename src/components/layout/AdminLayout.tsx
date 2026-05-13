// src/components/layout/AdminLayout.tsx
// Nail Lab. by İldem — Layout
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminSidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
