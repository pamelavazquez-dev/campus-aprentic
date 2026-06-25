import RoleLayoutShell from './RoleLayoutShell';

export default function InstructorLayout({ user }) {
  const menuItems = [
    { path: '/instructor', label: 'Dashboard', exact: true },
    { path: '/instructor/wizard', label: 'Modulos/Lecciones' },
    { path: '/instructor/notas', label: 'Notas Alumnos' }
  ];

  return (
    <RoleLayoutShell
      user={user}
      menuItems={menuItems}
      roleLabel="Instructor"
      brandLabel="Instructor"
    />
  );
}
