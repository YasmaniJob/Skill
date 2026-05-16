import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

/**
 * Bloquea rutas que solo tienen sentido en el contexto de una IE.
 * El super_admin no tiene ie_id, por lo que se redirige al dashboard.
 */
const IEOnlyRoute = () => {
  const { esSuperAdmin, loading } = useAuth();

  if (loading) return null;

  if (esSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default IEOnlyRoute;
