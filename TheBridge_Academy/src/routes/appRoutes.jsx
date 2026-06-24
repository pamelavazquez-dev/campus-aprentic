import PromocionesView from '../pages/PromocionesView';
import AlumnosView from '../pages/AlumnosView';
import ProfesoresView from '../pages/ProfesoresView';
import AdminModulosView from '../pages/AdminModulosView';
import ProfesorDashboard from '../pages/ProfesorDashboard';
import LeccionesView from '../pages/LeccionesView';
import ModulosView from '../pages/ModulosView';
import AlumnoDashboard from '../pages/AlumnoDashboard';

export const ROLE_LABELS = {
  admin: 'Admin',
  profesor: 'Profesor',
  alumno: 'Alumno',
};

export const APP_ROUTES = {
  admin: [
    { id: 'promociones', path: '/admin/promociones', label: 'Promociones', Component: PromocionesView },
    { id: 'modulos-admin', path: '/admin/modulos', label: 'Modulos', Component: AdminModulosView },
    { id: 'alumnos', path: '/admin/alumnos', label: 'Alumnos', Component: AlumnosView },
    { id: 'profesores', path: '/admin/profesores', label: 'Profesores', Component: ProfesoresView },
  ],
  profesor: [
    { id: 'dashboard-profesor', path: '/profesor/dashboard', label: 'Dashboard', Component: ProfesorDashboard },
    { id: 'lecciones', path: '/profesor/lecciones', label: 'Agregar leccion', Component: LeccionesView },
    { id: 'modulos', path: '/profesor/modulos', label: 'Desbloquear modulo', Component: ModulosView },
  ],
  alumno: [
    { id: 'campus', path: '/alumno/campus', label: 'Mi campus', Component: AlumnoDashboard },
  ],
};

export function getInitialRoute(role) {
  return APP_ROUTES[role]?.[0]?.id || null;
}

export function getRouteById(role, routeId) {
  return APP_ROUTES[role]?.find((route) => route.id === routeId) || null;
}

export function getInitialPath(role) {
  const routeId = getInitialRoute(role);
  return getRouteById(role, routeId)?.path || '/login';
}
