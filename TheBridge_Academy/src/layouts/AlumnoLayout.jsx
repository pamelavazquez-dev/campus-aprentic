import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, limit, getDocs, onSnapshot } from 'firebase/firestore';
import Logo from '../components/Logo';
import Avatar from '../components/ui/Avatar';
import ThemeToggle from '../components/ui/ThemeToggle';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function AlumnoLayout({ user }) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(true);

  const menuItems = [
    { path: '/alumno', label: 'Mis Módulos', exact: true },
    { path: '/alumno/notas', label: 'Mis Notas' }
  ];

  useEffect(() => {
    let unsubscribe = null;

    async function setupAccessListener() {
      if (!user) return;
      try {
        let currentAlumno = null;
        const alumnoDoc = await getDoc(doc(db, 'alumnos', user.uid));
        if (alumnoDoc.exists()) {
          currentAlumno = { id: alumnoDoc.id, ...alumnoDoc.data() };
        } else if (user.email) {
          const q = query(collection(db, 'alumnos'), where('email', '==', user.email), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            currentAlumno = { id: snap.docs[0].id, ...snap.docs[0].data() };
          }
        }

        const rawPromo = currentAlumno?.promociones_id || currentAlumno?.promocion_id;
        const promocionesArray = Array.isArray(rawPromo) 
          ? rawPromo 
          : (rawPromo ? [rawPromo] : []);

        if (currentAlumno && promocionesArray.length > 0) {
          const promoId = promocionesArray[0];
          
          unsubscribe = onSnapshot(doc(db, 'promociones', promoId), (docSnap) => {
            if (docSnap.exists()) {
              const promoData = docSnap.data();
              if (promoData.estado === 'completada' && promoData.fechaFin) {
                setAccessDenied(true);
              } else {
                setAccessDenied(false);
              }
            }
            setLoadingAccess(false);
          }, (err) => {
            console.error("Error listening to promo:", err);
            setLoadingAccess(false);
          });
        } else {
          setLoadingAccess(false);
        }
      } catch (error) {
        console.error("Error setup access listener", error);
        setLoadingAccess(false);
      }
    }
    setupAccessListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Alumno';


  return (
    <div className="flex flex-col min-h-screen w-full bg-transparent">
      <header className="flex justify-between items-center bg-gradient-to-r from-[#0f172a] to-[#3e0c15] border-b border-white/10 px-12 h-[72px] sticky top-0 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-4 transition-transform duration-300 hover:scale-105">
          <Logo size="md" showText={false} />
          <div className="flex flex-col gap-0.5 ml-1">
            <span className="font-['Montserrat'] text-[15px] font-black text-white leading-none tracking-tight">The Bridge</span>
            <span className="font-['Montserrat'] text-[14px] font-black text-brand-primary leading-none tracking-tight">Student</span>
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
              <span className="text-[11px] font-semibold text-[#B9C0CA]">Alumno</span>
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

      <main className="flex-1 p-12 overflow-y-auto w-full box-border relative">
        {loadingAccess ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray200 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary text-sm">Verificando acceso...</p>
            </div>
          </div>
        ) : accessDenied ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto bg-surface-solid border border-border-default p-12 rounded-3xl shadow-lg mt-12">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-text-strong mb-4">Acceso Restringido</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Tu promoción ha finalizado y ya no tienes acceso activo a la plataforma. 
              Si crees que esto es un error, por favor contacta con tu instructor o coordinador.
            </p>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-brand-gradient text-white border-none py-3 px-8 rounded-xl font-bold cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        title="¿Cerrar Sesión?"
        message="Estás a punto de salir de The Bridge Academy. Tendrás que volver a iniciar sesión para acceder."
        confirmText="Salir"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
