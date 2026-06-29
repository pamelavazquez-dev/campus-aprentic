import { useEffect, useMemo, useState } from 'react';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import { getAllAlumnos, updateAlumno } from '../services/alumnos.service';
import { getAllModulos } from '../services/modulos.service';
import { getAllPromociones } from '../services/promociones.service';

const hasPromotion = (alumno, promocionId) => (
  Array.isArray(alumno.promociones_id)
    ? alumno.promociones_id.includes(promocionId)
    : alumno.promociones_id === promocionId
);

const getPromotionTrack = (promocion) => {
  const nombre = promocion?.nombre?.toLowerCase() || '';

  if (nombre.includes('ciber')) return 'ciber';
  if (nombre.includes('fullstack') || nombre.includes('fs')) return 'fs';

  return '';
};

const moduleBelongsToTrack = (modulo, track) => {
  if (!track) return true;

  if (modulo.tipo) return modulo.tipo === track;
  if (track === 'ciber') return modulo.id?.startsWith('mod-ciber');
  if (track === 'fs') return modulo.id?.startsWith('mod-fs');

  return true;
};

const normalizeModuleName = (nombre) => (
  nombre
    ?.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim() || ''
);

const getUniqueModulesByName = (modulos) => {
  const seen = new Set();

  return modulos.filter((modulo) => {
    const moduleName = normalizeModuleName(modulo.nombre);

    if (!moduleName || seen.has(moduleName)) return false;

    seen.add(moduleName);
    return true;
  });
};

const filterModuleIdsByTrack = (moduleIds, modulos, track) => {
  const allowedModuleIds = modulos
    .filter((modulo) => moduleBelongsToTrack(modulo, track))
    .map((modulo) => modulo.id);

  return moduleIds.filter((moduleId) => allowedModuleIds.includes(moduleId));
};

export default function ModulosView() {
  const [alumnos, setAlumnos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [selectedPromocionId, setSelectedPromocionId] = useState('');
  const [selectedModulos, setSelectedModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);

      try {
        const [alumnosData, modulosData, promocionesData] = await Promise.all([
          getAllAlumnos(),
          getAllModulos(),
          getAllPromociones(),
        ]);

        const firstPromocion = promocionesData[0];
        const alumnosPromocion = firstPromocion
          ? alumnosData.filter((alumno) => hasPromotion(alumno, firstPromocion.id))
          : [];

        setAlumnos(alumnosData);
        setModulos(modulosData);
        setPromociones(promocionesData);
        setSelectedPromocionId(firstPromocion?.id || '');
        setSelectedModulos(filterModuleIdsByTrack(
          alumnosPromocion[0]?.modulos_id || [],
          modulosData,
          getPromotionTrack(firstPromocion)
        ));
      } catch (error) {
        console.error('Error cargando modulos, alumnos y promociones', error);
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const selectedPromocion = useMemo(
    () => promociones.find((promocion) => promocion.id === selectedPromocionId),
    [promociones, selectedPromocionId]
  );

  const alumnosPromocion = useMemo(
    () => alumnos.filter((alumno) => hasPromotion(alumno, selectedPromocionId)),
    [alumnos, selectedPromocionId]
  );

  const selectedTrack = useMemo(
    () => getPromotionTrack(selectedPromocion),
    [selectedPromocion]
  );

  const modulosPromocion = useMemo(
    () => getUniqueModulesByName(
      modulos.filter((modulo) => moduleBelongsToTrack(modulo, selectedTrack))
    ),
    [modulos, selectedTrack]
  );

  const selectedModulosPromocion = useMemo(
    () => selectedModulos.filter((moduleId) => (
      modulosPromocion.some((modulo) => modulo.id === moduleId)
    )),
    [modulosPromocion, selectedModulos]
  );

  const handlePromocionChange = (promocionId) => {
    const promocion = promociones.find((promo) => promo.id === promocionId);
    const alumnosNuevaPromocion = alumnos.filter((alumno) => hasPromotion(alumno, promocionId));
    const track = getPromotionTrack(promocion);

    setSelectedPromocionId(promocionId);
    setSelectedModulos(filterModuleIdsByTrack(
      alumnosNuevaPromocion[0]?.modulos_id || [],
      modulos,
      track
    ));
    setMessage('');
  };

  const toggleModulo = (moduloId) => {
    setSelectedModulos((current) => (
      current.includes(moduloId)
        ? current.filter((id) => id !== moduloId)
        : [...current, moduloId]
    ));
  };

  const handleSave = async () => {
    if (!selectedPromocionId || alumnosPromocion.length === 0) return;

    setSaving(true);
    setMessage('');

    try {
      await Promise.all(alumnosPromocion.map((alumno) => updateAlumno(alumno.id, {
        ...alumno,
        modulos_id: selectedModulosPromocion,
      })));

      setAlumnos((current) => current.map((alumno) => (
        hasPromotion(alumno, selectedPromocionId)
          ? { ...alumno, modulos_id: selectedModulosPromocion }
          : alumno
      )));

      setMessage(`Modulos actualizados para ${alumnosPromocion.length} alumnos de ${selectedPromocion?.nombre}.`);
    } catch (error) {
      console.error('Error desbloqueando modulos por promocion', error);
      setMessage('No se pudieron actualizar los modulos de la promocion.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'nombre', header: 'Modulo' },
    { key: 'horas', header: 'Horas' },
    {
      key: 'estado',
      header: 'Estado',
      render: (modulo) => (
        selectedModulos.includes(modulo.id)
          ? <Badge variant="success">Desbloqueado</Badge>
          : <Badge>Bloqueado</Badge>
      ),
    },
    {
      key: 'accion',
      header: 'Accion',
      render: (modulo) => (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={selectedModulos.includes(modulo.id)}
            onChange={() => toggleModulo(modulo.id)}
          />
          <span>{selectedModulos.includes(modulo.id) ? 'Quitar acceso' : 'Dar acceso'}</span>
        </label>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Profesor"
        title="Desbloquear Modulo"
        description="Gestion de acceso a modulos por promocion."
        actions={(
          <button
            className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer mt-4"
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedPromocionId || alumnosPromocion.length === 0}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        )}
      />

      <div className="control-panel">
        <div className="input-group">
          <label>Promocion</label>
          <select
            className="glass-input"
            value={selectedPromocionId}
            onChange={(event) => handlePromocionChange(event.target.value)}
            disabled={loading}
          >
            {promociones.map((promocion) => (
              <option key={promocion.id} value={promocion.id}>{promocion.nombre}</option>
            ))}
          </select>
        </div>
        {selectedPromocion && (
          <p>
            {alumnosPromocion.length} alumnos afectados - {selectedModulosPromocion.length} modulos desbloqueados
          </p>
        )}
      </div>

      {message && <div className="notice-card">{message}</div>}

      <DataTable
        columns={columns}
        rows={modulosPromocion}
        loading={loading}
        loadingMessage="Cargando modulos..."
        emptyMessage="No hay modulos registrados."
      />
    </section>
  );
}
