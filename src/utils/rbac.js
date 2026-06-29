// 1. Diccionario centralizado de roles y permisos (Patrón Match)
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  ALUMNO: 'alumno'
};

export const RBAC_POLICY = {
  [ROLES.ADMIN]: {
    fallbackRoute: '/admin',
    canManageUsers: true,
    canEditModules: true,
    theme: { badge: '#E0E7FF', text: '#4338CA' }
  },
  [ROLES.INSTRUCTOR]: {
    fallbackRoute: '/instructor',
    canManageUsers: false,
    canEditModules: true,
    theme: { badge: '#FEF3C7', text: '#B45309' }
  },
  [ROLES.ALUMNO]: {
    fallbackRoute: '/alumno',
    canManageUsers: false,
    canEditModules: false,
    theme: { badge: '#D1FAE5', text: '#047857' }
  },
  default: {
    fallbackRoute: '/login',
    canManageUsers: false,
    canEditModules: false,
    theme: { badge: '#F3F4F6', text: '#374151' }
  }
};

export const matchRole = (role) => RBAC_POLICY[role] || RBAC_POLICY.default;
