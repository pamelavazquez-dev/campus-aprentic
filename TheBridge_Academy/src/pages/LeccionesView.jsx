import { useEffect, useState } from 'react';
import CrearLeccionForm from '../components/forms/CrearLeccionForm';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import { getAllLecciones } from '../services/lecciones.service';
import { formatValue } from '../utils/formatters';

export default function LeccionesView() {
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);

      try {
        const data = await getAllLecciones();
        setLecciones(data);
      } catch (error) {
        console.error('Error cargando lecciones', error);
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const columns = [
    { key: 'titulo', header: 'Titulo', render: (leccion) => formatValue(leccion.titulo) },
    { key: 'modulo_id', header: 'Modulo', render: (leccion) => formatValue(leccion.modulo_id, 'Sin modulo') },
    { key: 'descripcion', header: 'Descripcion', render: (leccion) => formatValue(leccion.descripcion, 'Sin descripcion') },
    { key: 'contenido_url', header: 'Contenido', render: (leccion) => formatValue(leccion.contenido_url, 'Sin enlace') },
  ];

  const handleLeccionCreated = (leccion) => {
    setLecciones((current) => [...current, leccion]);
  };

  return (
    <section>
      <PageHeader
        eyebrow="Profesor"
        title="Agregar Leccion"
        description="Creacion de lecciones asociadas a modulos existentes."
        actions={(
          <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" type="button" onClick={() => setShowForm(true)}>
            + Nueva Leccion
          </button>
        )}
      />

      <DataTable
        columns={columns}
        rows={lecciones}
        loading={loading}
        loadingMessage="Cargando lecciones..."
        emptyMessage="No hay lecciones registradas."
      />

      {showForm && (
        <CrearLeccionForm
          onClose={() => setShowForm(false)}
          onCreated={handleLeccionCreated}
        />
      )}
    </section>
  );
}
