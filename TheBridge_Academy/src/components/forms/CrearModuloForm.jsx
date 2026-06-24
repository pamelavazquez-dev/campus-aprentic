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
      alert(`No se pudo guardar el modulo. ${error.code || error.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-default flex justify-between items-center bg-gray150/50 rounded-t-2xl">
          <h3>{isEditing ? 'Editar Modulo' : 'Nuevo Modulo'}</h3>
          <button type="button" className="bg-transparent text-[#94A3B8] border-none p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-white hover:text-brand-primary" onClick={onClose}>x</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.nombre}
              onChange={(event) => updateField('nombre', event.target.value)}
              placeholder="Ej. FS - Modulo 1: Frontend"
              required
            />
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>

          <div className="input-group">
            <label>Tipo</label>
            <select
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.tipo}
              onChange={(event) => updateField('tipo', event.target.value)}
            >
              <option value="fs">FullStack</option>
              <option value="ciber">Ciberseguridad</option>
            </select>
            {errors.tipo && <span className="field-error">{errors.tipo}</span>}
          </div>

          <div className="input-group">
            <label>Horas</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              type="number"
              min="1"
              value={formData.horas}
              onChange={(event) => updateField('horas', event.target.value)}
              placeholder="80"
              required
            />
            {errors.horas && <span className="field-error">{errors.horas}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" onClick={onClose}>Cancelar</button>
            <button type="submit" className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Modulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
