import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'ELEVE') return <Navigate to="/eleve" replace />;
  return <Navigate to="/parent" replace />;
}
