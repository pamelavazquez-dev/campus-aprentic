import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { createAlumno, updateAlumno } from '../../services/alumnos.service';
import { getAllPromociones } from '../../services/promociones.service';
import { alumnoSchema } from '../../schemas/app.schemas';
import { getFieldErrors } from '../../schemas/validation';

const INITIAL_FORM = {
  nombre: '',
  email: '',
  promocion_id: '',
};

const getFirstPromotionId = (alumno) => (
  Array.isArray(alumno?.promociones_id)
    ? alumno.promociones_id[0] || ''
    : alumno?.promociones_id || ''
);

export default function CrearAlumnoForm({ alumno = null, onClose, onSaved }) {
  const isEditing = Boolean(alumno?.id);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [promociones, setPromociones] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await getAllPromociones();
        setPromociones(data);
        setFormData({
          nombre: alumno?.nombre || '',
          email: alumno?.email || '',
          promocion_id: getFirstPromotionId(alumno) || data[0]?.id || '',
        });
      } catch (error) {
        console.error('Error cargando promociones', error);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [alumno]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    try {
      const promocion = promociones.find((item) => item.id === formData.promocion_id);
      const currentPromotionId = getFirstPromotionId(alumno);
      const shouldKeepModulos = isEditing && currentPromotionId === formData.promocion_id;
      const alumnoData = alumnoSchema.parse({
        nombre: formData.nombre,
        email: formData.email,
        avatar: alumno?.avatar || '',
        promociones_id: formData.promocion_id ? [formData.promocion_id] : [],
        modulos_id: shouldKeepModulos ? alumno.modulos_id || [] : promocion?.modulos_id || [],
      });

      setLoading(true);
      const savedAlumno = isEditing
        ? await updateAlumno(alumno.id, alumnoData)
        : await createAlumno(null, alumnoData);

      onSaved(savedAlumno);
      onClose();
    } catch (error) {
      if (error.issues) {
        setErrors(getFieldErrors(error));
        return;
      }

      console.error('Error guardando alumno', error.code || error.name, error.message, error);
      toast.error(`No se pudo guardar el alumno. ${error.code || error.message || 'Revisa permisos de Firestore.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface border border-border-default rounded-3xl w-full max-w-md shadow-2xl transform transition-all duration-400 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
          <h3 className="m-0 text-xl font-black text-text-strong">
            {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
          </h3>
          <button 
            type="button" 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-red-50 hover:text-brand-primary transition-colors border-none cursor-pointer" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Nombre del Alumno</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.nombre}
              onChange={(event) => updateField('nombre', event.target.value)}
              placeholder="Nombre y apellidos"
              required
            />
            {errors.nombre && <span className="text-xs font-bold text-red-500 mt-1">{errors.nombre}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Correo Electrónico</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              type="email"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="alumno@aprentic.com"
              required
            />
            {errors.email && <span className="text-xs font-bold text-red-500 mt-1">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Promoción Asignada</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 cursor-pointer appearance-none"
                value={formData.promocion_id}
                onChange={(event) => updateField('promocion_id', event.target.value)}
              >
                {promociones.map((promocion) => (
                  <option key={promocion.id} value={promocion.id}>{promocion.nombre}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
            {errors.promociones_id && <span className="text-xs font-bold text-red-500 mt-1">{errors.promociones_id}</span>}
          </div>

          {/* Footer */}
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
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
