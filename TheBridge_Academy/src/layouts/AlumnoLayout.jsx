import RoleLayoutShell from './RoleLayoutShell';

export default function AlumnoLayout({ user }) {
  const menuItems = [
    { path: '/alumno', label: 'Mis Modulos', exact: true },
    { path: '/alumno/notas', label: 'Mis Notas' }
  ];

  return (
    <RoleLayoutShell
      user={user}
      menuItems={menuItems}
      roleLabel="Alumno"
      brandLabel="Student"
    />
  );
}
