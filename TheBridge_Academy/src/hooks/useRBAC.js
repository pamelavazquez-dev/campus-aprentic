// Custom Hook para inyectar políticas de forma DRY
import { useAuth } from './useAuth';
import { matchRole } from '../utils/rbac';

export const useRBAC = () => {
  const { user, role, loading } = useAuth();
  const policy = matchRole(role);

  return {
    user,
    role,
    loading,
    isAuthorized: (requiredRole) => role === requiredRole,
    ...policy
  };
};
