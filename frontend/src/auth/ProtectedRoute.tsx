import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Role } from '../types';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Chargement...</div>;
  if (!user) {
    const pageAdmin = location.pathname.startsWith('/admin');
    return <Navigate to={pageAdmin ? '/administrateur' : '/login'} replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
