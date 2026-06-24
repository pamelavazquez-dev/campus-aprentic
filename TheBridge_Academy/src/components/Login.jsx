import { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Logo from './Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('El usuario no existe o la contraseña es incorrecta.');
      } else {
        setError('Error de red o configuración de Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-solid p-6">
      <div className="bg-surface backdrop-blur-lg border border-border-default rounded-xl max-w-[420px] w-full p-12 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="xl" />
          </div>
          <p className="text-text-secondary text-[15px] m-0">Acceso a la plataforma educativa</p>
        </div>

        {error && <div className="text-danger bg-danger/10 p-3 rounded-md mb-6 text-sm border border-danger/20 text-center font-medium">{error}</div>}

      <form onSubmit={handleLogin} className="mb-6">
        <div className="mb-6 text-left">
          <label className="block mb-2 text-sm font-semibold text-text-primary">Email</label>
          <input 
            type="email" 
            className="w-full p-[14px] bg-surface-solid border border-border-default rounded-md text-text-strong text-sm font-semibold transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 focus:-translate-y-[1px]" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="usuario@demo.com"
          />
        </div>
        <div className="mb-6 text-left">
          <label className="block mb-2 text-sm font-semibold text-text-primary">Contraseña</label>
          <input 
            type="password" 
            className="w-full p-[14px] bg-surface-solid border border-border-default rounded-md text-text-strong text-sm font-semibold transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 focus:-translate-y-[1px]" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="w-full bg-brand-gradient text-white border-none py-[14px] px-6 rounded-md text-sm font-black cursor-pointer transition-all duration-300 flex justify-center items-center gap-2 shadow-glow relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0px_16px_32px_rgba(255,48,69,0.4)] active:translate-y-[1px] disabled:bg-gray300 disabled:shadow-none disabled:text-gray500 disabled:cursor-not-allowed disabled:transform-none" disabled={loading}>
          {loading ? 'Verificando...' : 'Iniciar Sesión'}
        </button>
      </form>


    </div>
    </div>
  );
}
