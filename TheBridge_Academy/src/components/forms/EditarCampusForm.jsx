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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-solid rounded-2xl p-10 w-full max-w-[500px] shadow-xl transform transition-all duration-400">
        <div className="flex justify-between items-center mb-8">
          <h3 className="m-0 text-text-strong font-black text-2xl">Editar Sede</h3>
          <button className="bg-gray150 text-text-strong border-none cursor-pointer p-2 rounded-full w-8 h-8 flex justify-center items-center transition-all duration-300 hover:bg-[#FFE5E8] hover:text-brand-primary hover:rotate-90" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 text-left">
            <label>Nombre de la Sede</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
              placeholder="Ej. Campus Madrid Central"
            />
          </div>
          
          <div className="mb-6 text-left">
            <label>Ciudad / Ubicación</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.sede}
              onChange={e => setFormData({...formData, sede: e.target.value})}
              required
              placeholder="Ej. Madrid"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="bg-transparent text-danger border border-danger/30 py-3 px-6 rounded-lg text-sm font-black cursor-pointer transition-all duration-300 hover:bg-[#FFE5E8] hover:border-danger hover:-translate-y-0.5" onClick={onClose} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer disabled:bg-gray300 disabled:shadow-none disabled:text-gray500 disabled:cursor-not-allowed disabled:transform-none" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
