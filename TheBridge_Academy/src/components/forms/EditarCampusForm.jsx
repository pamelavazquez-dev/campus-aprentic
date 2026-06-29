import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { updateCampus } from '../../services/campus.service';

export default function EditarCampusForm({ onClose, onUpdated, initialData }) {
  const [formData, setFormData] = useState({
    nombre: '',
    sede: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        sede: initialData.sede || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCampus(initialData.id, formData);
      onUpdated({ ...initialData, ...formData });
      onClose();
    } catch (error) {
      console.error("Error al actualizar campus", error);
      toast.error("Error al actualizar la sede. Comprueba los permisos o el .env");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface border border-border-default rounded-3xl w-full max-w-md shadow-2xl transform transition-all duration-400 overflow-hidden">
        <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
          <h3 className="m-0 text-xl font-black text-text-strong">Editar Sede</h3>
          <button 
            type="button" 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-red-50 hover:text-brand-primary transition-colors border-none cursor-pointer" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Nombre de la Sede</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
              placeholder="Ej. Campus Madrid Central"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Ciudad / Ubicación</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.sede}
              onChange={e => setFormData({...formData, sede: e.target.value})}
              required
              placeholder="Ej. Madrid"
            />
          </div>

          <div className="flex gap-3 pt-4 mt-2 border-t border-border-default">
            <button 
              type="button" 
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold transition-colors hover:bg-gray-200 border-none cursor-pointer" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
