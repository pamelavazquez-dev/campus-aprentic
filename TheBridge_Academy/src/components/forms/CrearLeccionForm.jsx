import { useEffect, useState } from 'react';
import { createLeccion } from '../../services/lecciones.service';
import { getAllModulos, updateModulo } from '../../services/modulos.service';
import { leccionSchema } from '../../schemas/app.schemas';
import { getFieldErrors } from '../../schemas/validation';

const INITIAL_FORM = {
  modulo_id: '',
  titulo: '',
  descripcion: '',
  contenido_url: '',
};

export default function CrearLeccionForm({ onClose, onCreated }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [modulos, setModulos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await getAllModulos();
        setModulos(data);
        setFormData((current) => ({ ...current, modulo_id: data[0]?.id || '' }));
      } catch (error) {
        console.error('Error cargando modulos', error);
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
      const leccionData = leccionSchema.parse({
        modulo_id: formData.modulo_id,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        contenido_url: formData.contenido_url,
        videos_url: [],
      });

      setLoading(true);
      const nuevaLeccion = await createLeccion(null, leccionData);

      const modulo = modulos.find((item) => item.id === formData.modulo_id);
      if (modulo) {
        const lecciones = Array.isArray(modulo.lecciones_Id) ? modulo.lecciones_Id : [];
        await updateModulo(modulo.id, {
          nombre: modulo.nombre,
          horas: modulo.horas,
          lecciones_Id: [...new Set([...lecciones, nuevaLeccion.id])],
          tipo: modulo.tipo,
        });
      }

      onCreated(nuevaLeccion);
      onClose();
    } catch (error) {
      if (error.issues) {
        setErrors(getFieldErrors(error));
        return;
      }

      console.error('Error creando leccion', error);
      alert('No se pudo crear la leccion. Revisa permisos de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-default flex justify-between items-center bg-gray150/50 rounded-t-2xl">
          <h3>Nueva Leccion</h3>
          <button type="button" className="bg-transparent text-[#94A3B8] border-none p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-white hover:text-brand-primary" onClick={onClose}>x</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Modulo</label>
            <select
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.modulo_id}
              onChange={(event) => updateField('modulo_id', event.target.value)}
            >
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>
              ))}
            </select>
            {errors.modulo_id && <span className="field-error">{errors.modulo_id}</span>}
          </div>

          <div className="input-group">
            <label>Titulo</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.titulo}
              onChange={(event) => updateField('titulo', event.target.value)}
              placeholder="Titulo de la leccion"
              required
            />
            {errors.titulo && <span className="field-error">{errors.titulo}</span>}
          </div>

          <div className="input-group">
            <label>Descripcion</label>
            <textarea
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8] min-h-[100px]"
              value={formData.descripcion}
              onChange={(event) => updateField('descripcion', event.target.value)}
              placeholder="Descripcion breve"
              required
            />
            {errors.descripcion && <span className="field-error">{errors.descripcion}</span>}
          </div>

          <div className="input-group">
            <label>URL de contenido</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
              value={formData.contenido_url}
              onChange={(event) => updateField('contenido_url', event.target.value)}
              placeholder="https://..."
            />
            {errors.contenido_url && <span className="field-error">{errors.contenido_url}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" onClick={onClose}>Cancelar</button>
            <button type="submit" className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Leccion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
