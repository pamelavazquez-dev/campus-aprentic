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
    estado: 'activa'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        campus: initialData.campus_id || 'Madrid',
        fechaInicio: initialData.fechaInicio || '',
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-solid rounded-2xl p-10 w-full max-w-[500px] shadow-xl transform transition-all duration-400">
        <div className="flex justify-between items-center mb-8">
          <h3 className="m-0 text-text-strong font-black text-2xl">{isEditing ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
          <button className="bg-gray150 text-text-strong border-none cursor-pointer p-2 rounded-full w-8 h-8 flex justify-center items-center transition-all duration-300 hover:bg-[#FFE5E8] hover:text-brand-primary hover:rotate-90" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 text-left">
            <label>Nombre del Curso</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
              placeholder="Ej. Bootcamp FullStack Web"
            />
          </div>
          
          <div className="mb-6 text-left">
            <label>Sede (Campus)</label>
            <select 
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
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
          </div>

          <div className="mb-6 text-left">
            <label>Fecha de Inicio</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.fechaInicio}
              onChange={e => setFormData({...formData, fechaInicio: e.target.value})}
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="bg-transparent text-danger border border-danger/30 py-3 px-6 rounded-lg text-sm font-black cursor-pointer transition-all duration-300 hover:bg-[#FFE5E8] hover:border-danger hover:-translate-y-0.5" onClick={onClose} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer disabled:bg-gray300 disabled:shadow-none disabled:text-gray500 disabled:cursor-not-allowed disabled:transform-none" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Promoción')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
