import { useState } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

export default function ForcePasswordChangeModal({ user, profile, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      try {
        await updatePassword(user, newPassword);
      } catch (err) {
        if (err.code === 'auth/requires-recent-login' && profile?.password) {
          const credential = EmailAuthProvider.credential(user.email, profile.password);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
        } else {
          throw err;
        }
      }

      // Actualizamos el perfil de Auth en lugar de Firestore para evitar errores de permisos.
      // Al poner el nombre en displayName, sabremos que ya ha completado este paso.
      await updateProfile(user, { displayName: profile.nombre });

      toast.success('Contraseña asegurada con éxito');
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Hubo un error al actualizar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-surface border border-border-default rounded-3xl w-full max-w-md shadow-2xl animate-fade-in relative overflow-hidden">
        
        {/* Decorator */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-gradient"></div>
        
        <div className="p-8 md:p-10 text-center flex flex-col gap-6">
          
          <div className="mx-auto w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>

          <div>
            <h2 className="text-2xl font-black text-text-strong m-0 mb-2">Actualiza tu contraseña</h2>
            <p className="text-text-secondary text-[15px] m-0">
              Por motivos de seguridad, es obligatorio cambiar la contraseña autogenerada antes de continuar.
            </p>
          </div>

          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-xl text-sm font-bold border border-danger/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Nueva Contraseña</label>
              <input 
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong font-semibold transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Confirmar Contraseña</label>
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong font-semibold transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Repite tu nueva contraseña"
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full bg-brand-gradient text-white border-none py-4 px-6 rounded-xl text-[15px] font-black cursor-pointer transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5 shadow-glow disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Guardar y Continuar'
              )}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}
