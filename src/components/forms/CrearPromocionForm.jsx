import toast from 'react-hot-toast';
import { useState, useEffect, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { createPromocion, updatePromocion } from '../../services/promociones.service';

export default function CrearPromocionForm({ onClose, onCreated, initialData = null }) {
  const { campuses } = useContext(DataContext);
  const [formData, setFormData] = useState({
    nombre: '',
    campus: 'Madrid',
    fechaInicio: '',
    fechaFin: '',
    estado: 'activa'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        campus: initialData.campus_id || 'Madrid',
        fechaInicio: initialData.fechaInicio || '',
        fechaFin: initialData.fechaFin || '',
        estado: initialData.estado || 'activa'
      });
    }
  }, [initialData]);

  const isEditing = !!(initialData && initialData.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Usamos el propio nombre o un ID genérico como ID de documento,
      // pero Firebase recomienda dejar que genere el ID automáticamente si le pasamos null o no lo especificamos.
      // Nuestro servicio createDoc espera (collection, id, data). Si id no se usa o es null, setDoc fallaría, 
      // así que usaremos Date.now().toString() como ID simple para el MVP.
      if (isEditing) {
        await updatePromocion(initialData.id, formData);
        onCreated({ id: initialData.id, ...formData });
      } else {
        const newId = `PROMO-${Date.now()}`;
        const nuevaPromo = await createPromocion(newId, formData);
        onCreated(nuevaPromo);
      }
      onClose();
    } catch (error) {
      console.error("Error al crear promoción", error);
      toast.error("Error al guardar en base de datos. Comprueba los permisos o el .env");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface border border-border-default rounded-3xl w-full max-w-md shadow-2xl transform transition-all duration-400 overflow-hidden">
        <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
          <h3 className="m-0 text-xl font-black text-text-strong">{isEditing ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
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
            <label className="text-sm font-bold text-text-strong">Nombre de Promoción</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
              placeholder="Ej. Bootcamp FullStack Web"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Sede (Campus)</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 cursor-pointer appearance-none"
                value={formData.campus}
                onChange={e => setFormData({...formData, campus: e.target.value})}
              >
                <option value="" disabled>Selecciona una sede</option>
                {campuses && campuses.map(camp => (
                  <option key={camp.id} value={camp.id}>
                    {camp.nombre || camp.id}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Fecha de Inicio</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.fechaInicio}
              onChange={e => setFormData({...formData, fechaInicio: e.target.value})}
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Fecha de Fin (Opcional)</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.fechaFin}
              onChange={e => setFormData({...formData, fechaFin: e.target.value})}
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
              {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Promoción')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
