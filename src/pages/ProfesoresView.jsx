import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import CrearProfesorForm from '../components/forms/CrearProfesorForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import { getAllProfesores, updateProfesorEstado } from '../services/profesores.service';
import { getAllPromociones } from '../services/promociones.service';
import { formatList, shortId } from '../utils/formatters';

export default function ProfesoresView() {
  const [profesores, setProfesores] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [savingProfesorId, setSavingProfesorId] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);

      try {
        const [profesoresData, promocionesData] = await Promise.all([
          getAllProfesores(),
          getAllPromociones(),
        ]);

        setProfesores(profesoresData);
        setPromociones(promocionesData);
      } catch (error) {
        console.error('Error obteniendo profesores', error);
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const promocionNamesById = promociones.reduce((acc, promocion) => ({
    ...acc,
    [promocion.id]: promocion.nombre,
  }), {});

  const formatPromociones = (promocionesId) => {
    if (!Array.isArray(promocionesId) || promocionesId.length === 0) return 'Sin promocion';

    return promocionesId
      .map((promocionId) => promocionNamesById[promocionId] || promocionId)
      .join(', ');
  };

  const handleProfesorCreated = (profesor) => {
    setProfesores((current) => [...current, profesor]);
  };

  const handleToggleProfesorStatus = async (profesor) => {
    setSavingProfesorId(profesor.id);

    try {
      const updatedStatus = await updateProfesorEstado(profesor.id, !profesor.isActive);

      setProfesores((current) => current.map((item) => (
        item.id === profesor.id ? { ...item, isActive: updatedStatus.isActive } : item
      )));
    } catch (error) {
      console.error('Error actualizando estado del profesor', error.code || error.name, error.message, error);
      toast.error(`No se pudo cambiar el estado del profesor. ${error.code || error.message || ''}`);
    } finally {
      setSavingProfesorId('');
    }
  };

  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'id', header: 'UID', render: (profesor) => <span className="uid-text">{shortId(profesor.id)}</span> },
    { key: 'email', header: 'Email' },
    { key: 'campus', header: 'Campus', render: (profesor) => formatList(profesor.campus_id, 'Sin campus') },
    { key: 'promociones', header: 'Promociones', render: (profesor) => formatPromociones(profesor.promocion_id) },
    { key: 'estado', header: 'Estado', render: (profesor) => <Badge variant={profesor.isActive ? 'success' : 'neutral'}>{profesor.isActive ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (profesor) => (
        <button
          type="button"
          className={`py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 inline-flex items-center justify-center gap-2 border-none ${profesor.isActive ? 'bg-[#FFE5E8] text-brand-primary hover:bg-brand-primary hover:text-white' : 'bg-transparent text-[#64748B] hover:bg-black/5 hover:text-brand-primary'}`}
          onClick={() => handleToggleProfesorStatus(profesor)}
          disabled={savingProfesorId === profesor.id}
        >
          {savingProfesorId === profesor.id
            ? 'Guardando...'
            : profesor.isActive ? 'Inactivar' : 'Activar'}
        </button>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Admin"
        title="Gestion de Profesores"
        description="Alta, consulta y asignacion de profesores por campus y promocion."
        actions={(
          <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" type="button" onClick={() => setShowForm(true)}>
            + Nuevo Profesor
          </button>
        )}
      />

      <DataTable
        columns={columns}
        rows={profesores}
        loading={loading}
        loadingMessage="Cargando profesores..."
        emptyMessage="No hay profesores registrados."
      />

      {showForm && (
        <CrearProfesorForm
          onClose={() => setShowForm(false)}
          onCreated={handleProfesorCreated}
        />
      )}
    </section>
  );
}
