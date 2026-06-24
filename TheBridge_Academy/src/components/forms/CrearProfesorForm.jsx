import { useEffect, useState } from 'react';
import { getAllCampus } from '../../services/campus.service';
import { createProfesor } from '../../services/profesores.service';
import { getAllPromociones } from '../../services/promociones.service';
import { profesorSchema } from '../../schemas/app.schemas';
import { getFieldErrors } from '../../schemas/validation';

const INITIAL_FORM = {
  nombre: '',
  email: '',
  campus_id: '',
  promocion_id: '',
};

export default function CrearProfesorForm({ onClose, onCreated }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [campus, setCampus] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const [campusData, promocionesData] = await Promise.all([
          getAllCampus(),
          getAllPromociones(),
        ]);

        setCampus(campusData);
        setPromociones(promocionesData);
        setFormData((current) => ({
          ...current,
          campus_id: campusData[0]?.id || '',
          promocion_id: promocionesData[0]?.id || '',
        }));
      } catch (error) {
        console.error('Error cargando datos del formulario de profesor', error);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    try {
      const profesorData = profesorSchema.parse({
        nombre: formData.nombre,
        email: formData.email,
        avatar: '',
        campus_id: formData.campus_id,
        promocion_id: formData.promocion_id ? [formData.promocion_id] : [],
        isActive: true,
      });

      setLoading(true);
      const nuevoProfesor = await createProfesor(null, profesorData);

      onCreated(nuevoProfesor);
      onClose();
    } catch (error) {
      if (error.issues) {
        setErrors(getFieldErrors(error));
        return;
      }

      console.error('Error creando profesor', error);
      alert('No se pudo crear el profesor. Revisa permisos de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-default flex justify-between items-center bg-gray150/50 rounded-t-2xl">
          <h3>Nuevo Profesor</h3>
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
              placeholder="profesor@aprentic.com"
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>Campus</label>
            <select
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.campus_id}
              onChange={(event) => updateField('campus_id', event.target.value)}
            >
              {campus.map((item) => (
                <option key={item.id} value={item.id}>{item.nombre}</option>
              ))}
            </select>
            {errors.campus_id && <span className="field-error">{errors.campus_id}</span>}
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
            {errors.promocion_id && <span className="field-error">{errors.promocion_id}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" onClick={onClose}>Cancelar</button>
            <button type="submit" className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Profesor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
