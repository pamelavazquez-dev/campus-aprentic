import { Navigate } from 'react-router-dom';
import { useRBAC } from '../hooks/useRBAC';

export default function ProtectedRoute({ requiredRole, children }) {
  const { user, loading, isAuthorized, fallbackRoute } = useRBAC();

  if (loading) return null; // Wait for auth to initialize
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !isAuthorized(requiredRole)) {
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
}
