import { useState } from 'react';
import { updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../../config/firebase';
import { updateDoc } from '../../services/base.service';
import { useAuth } from '../../hooks/useAuth';

const collectionByRole = {
  admin: 'admin',
  instructor: 'profesores',
  alumno: 'alumnos',
};

export default function ForcePasswordChangeModal() {
  const { role, profile, refreshAuthProfile } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const collectionName = collectionByRole[role];
    if (!collectionName || !profile?.id || !auth.currentUser) {
      setError('No se pudo identificar tu perfil. Vuelve a iniciar sesión.');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(auth.currentUser, password);
      localStorage.setItem(`initialPasswordChanged_${auth.currentUser.uid}`, 'true');

      try {
        await updateDoc(collectionName, profile.id, { initialPasswordChangeRequired: false });
        await refreshAuthProfile();
      } catch (profileError) {
        console.warn('No se pudo actualizar el perfil tras cambiar la contraseña:', profileError);
      }

      toast.success('Contraseña actualizada correctamente.');
      setCompleted(true);
    } catch (updateError) {
      console.error(updateError);
      if (updateError.code === 'auth/requires-recent-login') {
        setError('Por seguridad, vuelve a iniciar sesión con tu contraseña inicial y cambia la contraseña de nuevo.');
      } else {
        setError('No se pudo actualizar la contraseña.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (completed) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-border-default rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-border-default bg-gray-50/50">
          <h3 className="m-0 text-xl font-black text-text-strong">Cambia tu contraseña</h3>
          <p className="m-0 mt-2 text-sm font-semibold text-text-secondary">
            Estás usando una contraseña temporal. Crea una nueva para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-3 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Nueva contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Repite la contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-brand-gradient text-white py-3 px-6 rounded-xl text-sm font-black transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
