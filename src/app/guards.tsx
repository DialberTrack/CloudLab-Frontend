import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { paths } from '@/shared/config/routes';
import { Loading } from '@/shared/ui/Loading';

/** Solo usuarios autenticados. */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Restaurando sesión..." />;
  return user ? <Outlet /> : <Navigate to={paths.login} replace />;
}

/** Solo administradores. */
export function AdminRoute() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Outlet /> : <Navigate to={paths.dashboard} replace />;
}

/** Solo visitantes (p. ej. el login): los autenticados van al inicio. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Restaurando sesión..." />;
  return user ? <Navigate to={paths.dashboard} replace /> : <Outlet />;
}
