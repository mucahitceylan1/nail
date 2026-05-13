// src/components/layout/AdminGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isSupabaseConfigured, isAdmin, session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner size={40} />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
