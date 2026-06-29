import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { getAllCampus } from '../../services/campus.service';
import { createProfesor } from '../../services/profesores.service';
import { getAllPromociones } from '../../services/promociones.service';
import { profesorSchema } from '../../schemas/app.schemas';
import { getFieldErrors } from '../../schemas/validation';
import Select from '../ui/Select';

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
      toast.error('No se pudo crear el profesor. Revisa permisos de Firestore.');
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
            Nuevo Profesor
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
            <label className="text-sm font-bold text-text-strong">Nombre del Profesor</label>
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
              placeholder="profesor@aprentic.com"
              required
            />
            {errors.email && <span className="text-xs font-bold text-red-500 mt-1">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Campus Base</label>
            <Select
              value={formData.campus_id}
              onChange={(value) => updateField('campus_id', value)}
              options={campus.map((item) => ({
                value: item.id,
                label: item.nombre,
              }))}
            />
            {errors.campus_id && <span className="text-xs font-bold text-red-500 mt-1">{errors.campus_id}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Promoción Principal</label>
            <Select
              value={formData.promocion_id}
              onChange={(value) => updateField('promocion_id', value)}
              options={promociones.map((promocion) => ({
                value: promocion.id,
                label: promocion.nombre,
              }))}
            />
            {errors.promocion_id && <span className="text-xs font-bold text-red-500 mt-1">{errors.promocion_id}</span>}
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
              {loading ? 'Guardando...' : 'Crear Profesor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
