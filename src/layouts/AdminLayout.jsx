import RoleLayoutShell from './RoleLayoutShell';

export default function AdminLayout({ user }) {
  const menuItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/usuarios', label: 'Gestion Usuarios' },
    { path: '/admin/campus', label: 'Gestion Campus' },
    { path: '/admin/modulos', label: 'Gestion Modulos' },
    { path: '/admin/solicitudes', label: 'Solicitudes' },
    { path: '/admin/inscripciones', label: 'Inscripciones' }
  ];

  return (
    <RoleLayoutShell
      user={user}
      menuItems={menuItems}
      roleLabel="Administrador"
      brandLabel="Academy"
    />
  );
}
