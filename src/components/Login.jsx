import { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Logo from './Logo';
import ThemeToggle from './ui/ThemeToggle';
import FormularioSolicitud from './forms/FormularioSolicitud';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSolicitud, setShowSolicitud] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Contraseña obligatoria');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('El usuario no existe o la contraseña es incorrecta.');
      } else {
        setError('Error al conectar con la plataforma.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-aurora-shell min-h-screen flex items-center justify-center relative overflow-hidden bg-canvas">
      <div className="login-aurora-bg" aria-hidden="true">
        <span className="login-aurora-ribbon login-aurora-ribbon-primary"></span>
        <span className="login-aurora-ribbon login-aurora-ribbon-secondary"></span>
        <span className="login-aurora-ribbon login-aurora-ribbon-accent"></span>
        <span className="login-aurora-grid"></span>
      </div>

      {/* Theme Toggle Navbar */}
      <div className="login-theme-toggle absolute top-6 right-6 z-20">
        <ThemeToggle variant="adaptive" />
      </div>

      <div 
        className={`login-auth-card bg-surface backdrop-blur-lg border border-border-default rounded-3xl w-[92%] ${showSolicitud ? 'max-w-[680px]' : 'max-w-[500px]'} shadow-2xl relative z-10 transform-gpu overflow-hidden flex flex-col transition-all duration-500`}
        style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)', minHeight: '680px' }}
      >
        
        <div className="p-8 sm:p-10 flex flex-col flex-1 relative">
          <div className="text-center mb-8 flex flex-col items-center shrink-0">
            <a 
              href="https://thebridge.tech/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex justify-center transform hover:scale-105 transition-transform duration-500 cursor-pointer"
            >
              <Logo size="xl" />
            </a>
          </div>

          <div className="relative flex-1 w-full">
            
            {/* View 1: Login */}
            <div 
              className="absolute inset-0 w-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ 
                opacity: showSolicitud ? 0 : 1, 
                transform: showSolicitud ? 'translateX(-30px)' : 'translateX(0)',
                pointerEvents: showSolicitud ? 'none' : 'auto',
                visibility: showSolicitud ? 'hidden' : 'visible'
              }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-text-strong mb-2 tracking-tight">Bienvenido de nuevo</h2>
                <p className="text-text-secondary text-[15px] font-medium">Accede a tu plataforma educativa</p>
              </div>

              {error && (
                <div className="flex items-center gap-3 text-danger bg-danger/10 p-4 rounded-xl mb-6 text-sm border border-danger/20 font-semibold shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} noValidate className="space-y-5 flex-1">
                <div className="space-y-2 text-left group">
                  <label className="block text-sm font-bold text-text-strong group-focus-within:text-brand-primary transition-colors">Correo electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary dark:text-brand-primary group-focus-within:text-brand-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="m2 4 10 8 10-8"></path></svg>
                    </div>
                    <input 
                      type="email" 
                      className="w-full pl-11 pr-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 focus:-translate-y-[2px] shadow-sm" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="usuario@thebridge.tech"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-left group">
                  <label className="block text-sm font-bold text-text-strong group-focus-within:text-brand-primary transition-colors">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary dark:text-brand-primary group-focus-within:text-brand-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full pl-11 pr-12 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 focus:-translate-y-[2px] shadow-sm" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary dark:text-brand-primary hover:text-brand-primary transition-colors focus:outline-none cursor-pointer"
                      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-brand-gradient text-white border-none py-4 px-6 rounded-xl text-[15px] font-black cursor-pointer transition-all duration-300 flex justify-center items-center gap-3 shadow-glow relative overflow-hidden group hover:shadow-[0px_16px_32px_rgba(255,48,69,0.35)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed" 
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Verificando...
                        </>
                      ) : (
                        <>
                          Iniciar Sesión
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center border-t border-border-default pt-6">
                <p className="text-text-secondary text-sm font-medium">
                  ¿Aún no tienes cuenta? <button type="button" onClick={() => setShowSolicitud(true)} className="text-brand-primary hover:text-brand-primary-dark font-bold cursor-pointer transition-colors bg-transparent border-none">Solicitar acceso</button>
                </p>
              </div>
            </div>

            {/* View 2: Formulario Solicitud */}
            <div 
              className="absolute inset-0 w-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ 
                opacity: showSolicitud ? 1 : 0, 
                transform: showSolicitud ? 'translateX(0)' : 'translateX(30px)',
                pointerEvents: showSolicitud ? 'auto' : 'none',
                visibility: showSolicitud ? 'visible' : 'hidden'
              }}
            >
              <FormularioSolicitud onBack={() => setShowSolicitud(false)} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
