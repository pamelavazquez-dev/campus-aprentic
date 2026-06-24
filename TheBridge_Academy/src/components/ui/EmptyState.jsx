import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function EmptyState({ title, text, showLogout = false }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full p-4">
      <div className="bg-surface backdrop-blur-lg border border-border-default rounded-3xl p-10 text-center shadow-xl max-w-md w-full animate-fade-in">
        <h2 className="text-2xl font-extrabold text-text-strong mb-4">{title}</h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{text}</p>
        {showLogout && (
          <button type="button" onClick={() => signOut(auth)} className="bg-[#FFE5E8] text-brand-primary py-3 px-6 rounded-xl text-sm font-black transition-all duration-300 hover:bg-brand-primary hover:text-white border-none cursor-pointer w-full shadow-sm hover:shadow-md hover:-translate-y-0.5">
            Cerrar Sesión
          </button>
        )}
      </div>
    </div>
  );
}
