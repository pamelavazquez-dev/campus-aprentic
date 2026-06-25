import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import Logo from '../components/Logo';
import Avatar from '../components/ui/Avatar';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function RoleLayoutShell({ user, menuItems, roleLabel, brandLabel }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userName = user?.displayName || user?.email?.split('@')[0] || roleLabel;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const linkClass = ({ isActive }) => (
    `flex items-center no-underline text-sm font-bold cursor-pointer min-h-12 md:h-full relative transition-colors duration-300 px-3 md:px-0 rounded-lg md:rounded-none after:content-[''] after:hidden md:after:block after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-brand-gradient after:rounded-t-[3px] after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] ${
      isActive
        ? 'text-brand-primary bg-white/5 md:bg-transparent after:scale-x-100 after:origin-bottom-left'
        : 'text-slate-300 hover:text-brand-primary hover:bg-white/5 md:hover:bg-transparent after:scale-x-0 after:origin-bottom-right hover:after:scale-x-100 hover:after:origin-bottom-left'
    }`
  );

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-transparent">
      <header className="sticky top-0 z-[100] w-full bg-gradient-to-r from-[#0f172a] to-[#3e0c15] border-b border-white/10 px-4 md:px-12 min-h-[72px] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex justify-between items-center h-[72px] gap-3">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Logo size="md" showText={false} />
            <div className="flex flex-col gap-0.5 ml-1 min-w-0">
              <span className="font-['Montserrat'] text-[14px] md:text-[15px] font-black text-white leading-none tracking-tight truncate">The Bridge</span>
              <span className="font-['Montserrat'] text-[13px] md:text-[14px] font-black text-brand-primary leading-none tracking-tight truncate">{brandLabel}</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 h-full">
            {menuItems.map(item => (
              <NavLink key={item.path} to={item.path} end={item.exact} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-3 bg-white/5 py-1.5 pr-4 pl-1.5 rounded-full border border-white/10">
              <Avatar src={user?.photoURL || user?.avatar} name={userName} size="sm" />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-white leading-[1.2]">{userName}</span>
                <span className="text-[11px] font-semibold text-[#B9C0CA]">{roleLabel}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesion"
              className="bg-transparent border-none text-[#B9C0CA] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:text-brand-primary hover:bg-brand-primary/10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                <line x1="12" y1="2" x2="12" y2="12"></line>
              </svg>
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-label="Abrir menu"
              className="bg-white/5 border border-white/10 text-white cursor-pointer flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 hover:text-brand-primary hover:bg-brand-primary/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
              {menuItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={linkClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 mt-1">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={user?.photoURL || user?.avatar} name={userName} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-white leading-[1.2] truncate">{userName}</span>
                    <span className="text-[11px] font-semibold text-[#B9C0CA]">{roleLabel}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-2 rounded-lg text-xs font-black">
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-6 md:p-12 w-full max-w-full box-border overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
