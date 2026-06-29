export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel,
  isDanger = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-surface border border-border-default rounded-3xl w-full max-w-sm shadow-2xl transform transition-all duration-400 overflow-hidden text-center">
        <div className="p-8 pb-6 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDanger ? 'bg-red-100 text-red-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
            {isDanger ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
          </div>
          <h3 className="m-0 text-2xl font-black text-text-strong mb-2">{title}</h3>
          <p className="text-text-secondary text-sm m-0 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-0 border-t border-border-default">
          <button 
            type="button" 
            className="flex-1 bg-surface py-4 text-sm font-bold text-text-secondary transition-colors hover:bg-gray-50 border-none border-r border-border-default cursor-pointer" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`flex-1 py-4 text-sm font-black transition-colors border-none cursor-pointer ${isDanger ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-brand-gradient text-white hover:opacity-90'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
