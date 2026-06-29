import toast from 'react-hot-toast';
import { useState, useEffect, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DataContext } from '../../context/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import { getAllNotas, getNotasByModuloId, createNota, updateNota } from '../../services/notas.service';
import { getAllProyectos, getProyectosByModuloId } from '../../services/proyectos.service';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { filterModulesByTracks, getProfesorTracks, getUniqueModulesByName } from '../../utils/academicFilters';

export default function CalificacionesView() {
  const { modulos, promociones, loading } = useContext(DataContext);
  const { profile } = useAuth();
  const [notas, setNotas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loadingNotas, setLoadingNotas] = useState(true);
  const [selectedModulo, setSelectedModulo] = useState('');
  const [filtroRevision, setFiltroRevision] = useState('todos');
  const [notaForm, setNotaForm] = useState({ id: null, alumnoId: '', valor: '', comentario: '' });
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const profesorTracks = useMemo(
    () => getProfesorTracks(profile, promociones),
    [profile, promociones]
  );

  const modulosProfesor = useMemo(
    () => getUniqueModulesByName(filterModulesByTracks(modulos, profesorTracks)),
    [modulos, profesorTracks]
  );

  useEffect(() => {
    if (!selectedModulo && modulosProfesor.length > 0) {
      setSelectedModulo(modulosProfesor[0].id);
      return;
    }

    if (selectedModulo && modulosProfesor.length > 0 && !modulosProfesor.some((modulo) => modulo.id === selectedModulo)) {
      setSelectedModulo(modulosProfesor[0].id);
    }
  }, [modulosProfesor, selectedModulo]);

  const { data: alumnosDelModulo = [], isLoading: loadingAlumnos } = useQuery({
    queryKey: ['alumnos', 'modulo', selectedModulo],
    queryFn: async () => {
      if (!selectedModulo) return [];
      const q = query(
        collection(db, 'alumnos'), 
        where('modulos_id', 'array-contains', selectedModulo)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!selectedModulo,
  });

  const fetchNotas = async () => {
    if (!selectedModulo) {
      setNotas([]);
      setProyectos([]);
      setLoadingNotas(false);
      return;
    }
    
    setLoadingNotas(true);
    try {
      const [notasData, proyectosData] = await Promise.all([
        getNotasByModuloId(selectedModulo),
        getProyectosByModuloId(selectedModulo)
      ]);
      setNotas(notasData);
      setProyectos(proyectosData);
    } catch (error) {
      console.error("Error cargando notas y entregas:", error);
    } finally {
      setLoadingNotas(false);
    }
  };

  useEffect(() => {
    fetchNotas();
  }, [selectedModulo]);

  useEffect(() => {
    if (!showModal) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showModal]);


  const getEntregaAlumno = (alumnoId) => (
    proyectos.find(proyecto => (
      proyecto.alumnoId === alumnoId &&
      proyecto.moduloId === selectedModulo
    ))
  );

  const getNotaAlumno = (alumnoId) => (
    notas.find(n => n.alumnoId === alumnoId && n.proyectoId === selectedModulo)
  );

  const alumnosFiltrados = alumnosDelModulo.filter((alumno) => {
    const entregaAlumno = getEntregaAlumno(alumno.id);
    const existingNota = getNotaAlumno(alumno.id);

    if (filtroRevision === 'pendientes') return entregaAlumno && !existingNota;
    if (filtroRevision === 'sin-entrega') return !entregaAlumno;
    if (filtroRevision === 'evaluados') return Boolean(existingNota);

    return true;
  });

  const filterOptions = [
    { id: 'todos', label: 'Todos', count: alumnosDelModulo.length },
    {
      id: 'pendientes',
      label: 'Pendientes de revisar',
      count: alumnosDelModulo.filter(alumno => getEntregaAlumno(alumno.id) && !getNotaAlumno(alumno.id)).length
    },
    {
      id: 'sin-entrega',
      label: 'Sin entrega',
      count: alumnosDelModulo.filter(alumno => !getEntregaAlumno(alumno.id)).length
    },
    {
      id: 'evaluados',
      label: 'Evaluados',
      count: alumnosDelModulo.filter(alumno => getNotaAlumno(alumno.id)).length
    },
  ];

  const handleOpenGrade = (alumno) => {
    // Buscar si ya tiene nota para este módulo (usando moduloId en lugar de proyectoId)
    const existingNota = getNotaAlumno(alumno.id);
    
    setNotaForm({
      id: existingNota?.id || null,
      alumnoId: alumno.id,
      valor: existingNota?.valor || '',
      comentario: existingNota?.comentario || ''
    });
    setShowModal(true);
  };

  const handleSaveNota = async () => {
    setSaving(true);
    try {
      const data = {
        proyectoId: selectedModulo,
        alumnoId: notaForm.alumnoId,
        profesorId: 'current-instructor', // This should technically come from auth context
        valor: Number(notaForm.valor),
        comentario: notaForm.comentario,
        creadoEn: new Date(),
        actualizadoEn: new Date()
      };

      if (notaForm.id) {
        await updateNota(notaForm.id, data);
      } else {
        const newId = `NOT-${Date.now()}`;
        await createNota(newId, data);
      }
      
      await fetchNotas();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar la nota");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingNotas) return <div>Cargando calificaciones...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader 
        title="Evaluaciones y Notas"
        description="Califica el desempeño de tus alumnos por módulo."
      />

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Seleccionar Módulo
        </label>
        <select
          className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
          value={selectedModulo}
          onChange={e => { setSelectedModulo(e.target.value); setFiltroRevision('todos'); }}
          style={{ fontSize: '15px', fontWeight: 600, padding: '12px 16px', width: '100%', maxWidth: '400px' }}
        >
          <option value="">-- Elige un módulo --</option>
          {modulosProfesor.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      {selectedModulo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-strong)' }}>
              Alumnos Matriculados ({alumnosFiltrados.length}/{alumnosDelModulo.length})
            </h3>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {filterOptions.map(option => {
                const isActive = filtroRevision === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFiltroRevision(option.id)}
                    className={`border rounded-lg px-3 py-2 text-xs font-black cursor-pointer transition-all duration-200 ${isActive ? 'bg-brand-primary text-white border-brand-primary shadow-glow' : 'bg-surface-solid text-text-secondary border-border-default hover:text-brand-primary hover:border-brand-primary'}`}
                  >
                    {option.label} ({option.count})
                  </button>
                );
              })}
            </div>
          </div>

          {loadingAlumnos ? (
            <p style={{ color: 'var(--text-secondary)' }}>Cargando alumnos matriculados...</p>
          ) : alumnosDelModulo.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No hay alumnos matriculados en este módulo.</p>
          ) : alumnosFiltrados.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No hay alumnos que coincidan con este filtro.</p>
          ) : (
            alumnosFiltrados.map(alumno => {
              const existingNota = getNotaAlumno(alumno.id);
              const entregaAlumno = getEntregaAlumno(alumno.id);
              
              return (
                <div key={alumno.id} className="bg-surface backdrop-blur-lg border border-border-default rounded-xl p-8 shadow-sm transition-all duration-400 hover:-translate-y-[6px] hover:shadow-md" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-strong)' }}>{alumno.nombre || alumno.email}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{alumno.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      {existingNota ? (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: 900, color: existingNota.valor >= 5 ? '#10B981' : '#EF4444' }}>
                            {existingNota.valor}/10
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Evaluado</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B' }}>Sin calificar</div>
                      )}
                      <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => handleOpenGrade(alumno)}>
                        {existingNota ? 'Modificar Nota' : 'Evaluar'}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--gray100)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {entregaAlumno ? (
                      <>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-strong)' }}>
                            Entrega: {entregaAlumno.titulo || 'Proyecto entregado'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {entregaAlumno.entregadoEn ? new Date(entregaAlumno.entregadoEn).toLocaleDateString() : 'Fecha no disponible'}
                          </div>
                        </div>
                        <a
                          href={entregaAlumno.archivoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-primary font-black text-sm no-underline hover:underline"
                        >
                          Ver proyecto
                        </a>
                      </>
                    ) : (
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Sin entrega registrada para este modulo.
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in overflow-hidden" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-surface border border-border-default rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-400 overflow-hidden">
            <div className="p-6 border-b border-border-default flex justify-between items-center bg-gray150/50 rounded-t-3xl">
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-strong)' }}>Calificar Alumno</h3>
              <button className="bg-transparent text-[#94A3B8] border-none p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-surface-solid hover:text-brand-primary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Calificación (0-10)</label>
                <input 
                  type="number" 
                  min="0" max="10" step="0.1"
                  className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]" 
                  style={{ width: '100%', padding: '12px' }}
                  value={notaForm.valor} 
                  onChange={e => setNotaForm({...notaForm, valor: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Comentario / Feedback</label>
                <textarea 
                  className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]" 
                  style={{ width: '100%', padding: '12px', minHeight: '100px', resize: 'vertical' }}
                  value={notaForm.comentario} 
                  onChange={e => setNotaForm({...notaForm, comentario: e.target.value})}
                  placeholder="Buen trabajo en..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', padding: '24px' }}>
              <button className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" disabled={saving} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" disabled={saving || notaForm.valor === ''} onClick={handleSaveNota}>
                {saving ? 'Guardando...' : 'Guardar Calificación'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
