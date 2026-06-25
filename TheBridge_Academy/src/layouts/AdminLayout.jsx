import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import Avatar from '../components/ui/Avatar';
import ThemeToggle from '../components/ui/ThemeToggle';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function AdminLayout({ user }) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const menuItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/usuarios', label: 'Gestión Usuarios' },
    { path: '/admin/campus', label: 'Gestión Campus' },
    { path: '/admin/modulos', label: 'Gestión Módulos' },
    { path: '/admin/inscripciones', label: 'Inscripciones' }
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // Removed local getInitials as it is handled by Avatar component
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="flex flex-col min-h-screen w-full bg-transparent">
      {/* Top Navbar */}
      <header className="flex justify-between items-center bg-gradient-to-r from-[#0f172a] to-[#3e0c15] border-b border-white/10 px-12 h-[72px] sticky top-0 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-4 transition-transform duration-300 hover:scale-105">
          <Logo size="md" showText={false} />
          <div className="flex flex-col gap-0.5 ml-1">
            <span className="font-['Montserrat'] text-[15px] font-black text-white leading-none tracking-tight">The Bridge</span>
            <span className="font-['Montserrat'] text-[14px] font-black text-brand-primary leading-none tracking-tight">Academy</span>
          </div>
        </div>
        
        <nav className="flex items-center gap-8 h-full">
          {menuItems.map(item => (
            <NavLink 
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `flex items-center no-underline text-sm font-bold cursor-pointer h-full relative transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-brand-gradient after:rounded-t-[3px] after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'text-brand-primary after:scale-x-100 after:origin-bottom-left' : 'text-slate-300 hover:text-brand-primary after:scale-x-0 after:origin-bottom-right hover:after:scale-x-100 hover:after:origin-bottom-left'}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="flex items-center gap-3 bg-white/5 py-1.5 pr-4 pl-1.5 rounded-full border border-white/10">
            <Avatar src={user?.photoURL || user?.avatar} name={userName} size="sm" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white leading-[1.2]">{userName}</span>
              <span className="text-[11px] font-semibold text-[#B9C0CA]">Administrador</span>
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            title="Cerrar Sesión"
            className="bg-transparent border-none text-[#B9C0CA] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:text-brand-primary hover:bg-brand-primary/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto w-full box-border">
        <Outlet />
      </main>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        title="¿Cerrar Sesión?"
        message="Estás a punto de salir del panel de administración."
        confirmText="Salir"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
