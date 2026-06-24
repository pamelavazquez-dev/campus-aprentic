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
      alert(`No se pudo guardar el alumno. ${error.code || error.message || 'Revisa permisos de Firestore.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-default flex justify-between items-center bg-gray150/50 rounded-t-2xl">
          <h3>{isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}</h3>
          <button type="button" className="bg-transparent text-[#94A3B8] border-none p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-white hover:text-brand-primary" onClick={onClose}>x</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.nombre}
              onChange={(event) => updateField('nombre', event.target.value)}
              placeholder="Nombre y apellidos"
              required
            />
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              type="email"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="alumno@aprentic.com"
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>Promocion</label>
            <select
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.promocion_id}
              onChange={(event) => updateField('promocion_id', event.target.value)}
            >
              {promociones.map((promocion) => (
                <option key={promocion.id} value={promocion.id}>{promocion.nombre}</option>
              ))}
            </select>
            {errors.promociones_id && <span className="field-error">{errors.promociones_id}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" onClick={onClose}>Cancelar</button>
            <button type="submit" className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
