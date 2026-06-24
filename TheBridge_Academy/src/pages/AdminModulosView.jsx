import { useEffect, useState } from 'react';
import CrearModuloForm from '../components/forms/CrearModuloForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import { getAllModulos } from '../services/modulos.service';
import { shortId } from '../utils/formatters';

const getTipoLabel = (tipo) => {
  if (tipo === 'fs') return 'FullStack';
  if (tipo === 'ciber') return 'Ciberseguridad';
  return 'Sin tipo';
};

const getModuloTipo = (modulo) => {
  if (modulo.tipo) return modulo.tipo;
  if (modulo.id?.startsWith('mod-fs')) return 'fs';
  if (modulo.id?.startsWith('mod-ciber')) return 'ciber';
  return '';
};

const isLegacyDuplicatedModule = (modulo) => modulo.id?.startsWith('mod-cib-');

const normalizeModulo = (modulo) => ({
  ...modulo,
  tipo: getModuloTipo(modulo),
});

export default function AdminModulosView() {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedModulo, setSelectedModulo] = useState(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);

      try {
        const data = await getAllModulos();
        setModulos(data
          .filter((modulo) => !isLegacyDuplicatedModule(modulo))
          .map(normalizeModulo)
          .sort((a, b) => a.nombre.localeCompare(b.nombre)));
      } catch (error) {
        console.error('Error obteniendo modulos', error);
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleModuloSaved = (modulo) => {
    const normalizedModulo = normalizeModulo(modulo);

    setModulos((current) => (
      current.some((item) => item.id === normalizedModulo.id)
        ? current.map((item) => (item.id === normalizedModulo.id ? normalizedModulo : item))
        : [...current, normalizedModulo].sort((a, b) => a.nombre.localeCompare(b.nombre))
    ));
  };

  const openCreateForm = () => {
    setSelectedModulo(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setSelectedModulo(null);
    setShowForm(false);
  };

  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'id', header: 'UID', render: (modulo) => <span className="uid-text">{shortId(modulo.id)}</span> },
    { key: 'tipo', header: 'Tipo', render: (modulo) => <Badge variant={modulo.tipo ? 'success' : 'neutral'}>{getTipoLabel(modulo.tipo)}</Badge> },
    { key: 'horas', header: 'Horas' },
    { key: 'lecciones', header: 'Lecciones', render: (modulo) => modulo.lecciones_Id?.length || 0 },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (modulo) => (
        <button
          type="button"
          className="bg-surface-solid border border-border-default text-text-secondary py-2 px-4 rounded-xl text-sm font-bold cursor-pointer transition-colors duration-300 hover:bg-brand-primary/10 hover:border-brand-primary/30 hover:text-brand-primary inline-flex items-center justify-center gap-2 shadow-sm"
          onClick={() => {
            setSelectedModulo(modulo);
            setShowForm(true);
          }}
        >
          Editar
        </button>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Admin"
        title="Gestion de Modulos"
        description="Creacion y mantenimiento de modulos por itinerario."
        actions={(
          <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" type="button" onClick={openCreateForm}>
            + Nuevo Modulo
          </button>
        )}
      />

      <DataTable
        columns={columns}
        rows={modulos}
        loading={loading}
        loadingMessage="Cargando modulos..."
        emptyMessage="No hay modulos registrados."
      />

      {showForm && (
        <CrearModuloForm
          modulo={selectedModulo}
          onClose={closeForm}
          onSaved={handleModuloSaved}
        />
      )}
    </section>
  );
}
