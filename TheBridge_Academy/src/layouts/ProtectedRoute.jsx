import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, role, requiredRole, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y no coincide, redirigimos a una ruta segura
  if (requiredRole && role !== requiredRole) {
    // Redirigir según su rol real
    switch (role) {
      case 'admin': return <Navigate to="/admin" replace />;
      case 'instructor': return <Navigate to="/instructor" replace />;
      case 'alumno': return <Navigate to="/alumno" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return children;
}
