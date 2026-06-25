import toast from 'react-hot-toast';
import { useState } from 'react';
import { createModulo, updateModulo } from '../../services/modulos.service';
import { moduloSchema } from '../../schemas/app.schemas';
import { getFieldErrors } from '../../schemas/validation';

const INITIAL_FORM = {
  nombre: '',
  tipo: 'fs',
  horas: '',
};

const getInitialTipo = (modulo) => {
  if (modulo?.tipo) return modulo.tipo;
  if (modulo?.id?.startsWith('mod-ciber')) return 'ciber';
  if (modulo?.id?.startsWith('mod-fs')) return 'fs';
  return INITIAL_FORM.tipo;
};

export default function CrearModuloForm({ modulo = null, onClose, onSaved }) {
  const isEditing = Boolean(modulo?.id);
  const [formData, setFormData] = useState({
    nombre: modulo?.nombre || INITIAL_FORM.nombre,
    tipo: getInitialTipo(modulo),
    horas: modulo?.horas || INITIAL_FORM.horas,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    try {
      const moduloData = moduloSchema.parse({
        nombre: formData.nombre,
        tipo: formData.tipo,
        horas: formData.horas,
        lecciones_Id: modulo?.lecciones_Id || [],
      });

      setLoading(true);
      const savedModulo = isEditing
        ? await updateModulo(modulo.id, moduloData)
        : await createModulo(null, moduloData);

      onSaved(savedModulo);
      onClose();
    } catch (error) {
      if (error.issues) {
        setErrors(getFieldErrors(error));
        return;
      }

      console.error('Error guardando modulo', error.code || error.name, error.message, error);
      toast.error(`No se pudo guardar el modulo. ${error.code || error.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border border-border-default rounded-3xl w-full max-w-md shadow-2xl transform transition-all duration-400 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
          <h3 className="m-0 text-xl font-black text-text-strong">
            {isEditing ? 'Editar Módulo' : 'Nuevo Módulo'}
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
            <label className="text-sm font-bold text-text-strong">Nombre del Módulo</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.nombre}
              onChange={(event) => updateField('nombre', event.target.value)}
              placeholder="Ej. FS - Módulo 1: Frontend"
              required
            />
            {errors.nombre && <span className="text-xs font-bold text-red-500 mt-1">{errors.nombre}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Especialidad</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 cursor-pointer appearance-none"
                value={formData.tipo}
                onChange={(event) => updateField('tipo', event.target.value)}
              >
                <option value="fs">FullStack</option>
                <option value="ciber">Ciberseguridad</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
            {errors.tipo && <span className="text-xs font-bold text-red-500 mt-1">{errors.tipo}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Duración (Horas)</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              type="number"
              min="1"
              value={formData.horas}
              onChange={(event) => updateField('horas', event.target.value)}
              placeholder="Ej. 80"
              required
            />
            {errors.horas && <span className="text-xs font-bold text-red-500 mt-1">{errors.horas}</span>}
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
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
