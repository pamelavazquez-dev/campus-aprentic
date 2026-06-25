import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { createLeccion } from '../../services/lecciones.service';
import { getAllModulos, updateModulo } from '../../services/modulos.service';
import { leccionSchema } from '../../schemas/app.schemas';
import { getFieldErrors } from '../../schemas/validation';
import { extractTextFromPDF } from '../../utils/pdfExtractor';

const INITIAL_FORM = {
  modulo_id: '',
  titulo: '',
  descripcion: '',
  contenido_url: '',
  contenido_markdown: '',
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

  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecciona un archivo PDF válido.');
      return;
    }

    setLoading(true);
    toast.loading('Extrayendo texto del PDF...', { id: 'pdf-extract' });
    
    try {
      const markdown = await extractTextFromPDF(file);
      
      // Validar 800 KB (aprox 800,000 bytes). Un carácter en utf-8 suele ser 1 byte, pero por seguridad comprobamos la longitud.
      const sizeInKB = new Blob([markdown]).size / 1024;
      if (sizeInKB > 800) {
        toast.error(`El texto extraído pesa más de 800 KB (${Math.round(sizeInKB)} KB). Demasiado texto.`, { id: 'pdf-extract' });
        setLoading(false);
        return;
      }

      setFormData(curr => ({ ...curr, contenido_markdown: markdown }));
      toast.success('PDF importado como Markdown correctamente.', { id: 'pdf-extract' });
    } catch (error) {
      console.error('Error extrayendo PDF:', error);
      toast.error('Error al procesar el PDF. Revisa la consola.', { id: 'pdf-extract' });
    } finally {
      setLoading(false);
      // Reset input
      event.target.value = '';
    }
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
        contenido_markdown: formData.contenido_markdown,
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
      toast.error('No se pudo crear la leccion. Revisa permisos de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border border-border-default rounded-3xl w-full max-w-md shadow-2xl transform transition-all duration-400 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center shrink-0">
          <h3 className="m-0 text-xl font-black text-text-strong">Nueva Lección</h3>
          <button 
            type="button" 
            className="w-8 h-8 rounded-full bg-surface-solid flex items-center justify-center text-text-secondary hover:bg-danger/10 hover:text-brand-primary transition-colors border-none cursor-pointer" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-y-auto">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Módulo Asignado</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 cursor-pointer appearance-none"
                value={formData.modulo_id}
                onChange={(event) => updateField('modulo_id', event.target.value)}
              >
                {modulos.map((modulo) => (
                  <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
            {errors.modulo_id && <span className="text-xs font-bold text-red-500 mt-1">{errors.modulo_id}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Título de la Lección</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.titulo}
              onChange={(event) => updateField('titulo', event.target.value)}
              placeholder="Ej. Introducción a React"
              required
            />
            {errors.titulo && <span className="text-xs font-bold text-red-500 mt-1">{errors.titulo}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Descripción</label>
            <textarea
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 min-h-[100px] resize-none"
              value={formData.descripcion}
              onChange={(event) => updateField('descripcion', event.target.value)}
              placeholder="Breve resumen de lo que se verá..."
              required
            />
            {errors.descripcion && <span className="text-xs font-bold text-red-500 mt-1">{errors.descripcion}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-strong">Enlace de la Clase (URL)</label>
            <input
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300"
              value={formData.contenido_url}
              onChange={(event) => updateField('contenido_url', event.target.value)}
              placeholder="https://..."
            />
            {errors.contenido_url && <span className="text-xs font-bold text-red-500 mt-1">{errors.contenido_url}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-text-strong">Contenido Markdown</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handlePDFUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Importar texto de PDF"
                />
                <button 
                  type="button" 
                  className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold transition-colors pointer-events-none flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 18H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2h-1"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline></svg>
                  Importar de PDF
                </button>
              </div>
            </div>
            <textarea
              className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 min-h-[150px] font-mono custom-scrollbar"
              value={formData.contenido_markdown}
              onChange={(event) => updateField('contenido_markdown', event.target.value)}
              placeholder="# Título Principal\n\nEl texto de tu lección aquí..."
            />
            {errors.contenido_markdown && <span className="text-xs font-bold text-red-500 mt-1">{errors.contenido_markdown}</span>}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 mt-2 border-t border-border-default shrink-0">
            <button 
              type="button" 
              className="flex-1 bg-surface-solid border-2 border-border-default text-text-secondary py-3 rounded-xl text-sm font-bold transition-all hover:bg-surface hover:text-text-strong cursor-pointer shadow-sm" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Lección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
