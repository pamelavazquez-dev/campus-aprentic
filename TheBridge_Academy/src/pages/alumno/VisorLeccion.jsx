import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModuloById } from '../../services/modulos.service';
import { getAllLecciones } from '../../services/lecciones.service';
import { useRBAC } from '../../hooks/useRBAC';

export default function VisorLeccion() {
  const { id: moduloId } = useParams();
  const navigate = useNavigate();
  const [modulo, setModulo] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [selectedLeccion, setSelectedLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completadas, setCompletadas] = useState({});
  const { canEditModules } = useRBAC();

  useEffect(() => {
    async function fetchData() {
      try {
        const [mod, allLecs] = await Promise.all([
          moduloId ? getModuloById(moduloId) : null,
          getAllLecciones()
        ]);
        setModulo(mod);
        // Filtrar lecciones de este módulo
        const filtered = allLecs.filter(l => {
          const modId = typeof l.modulo_id === 'string' ? l.modulo_id : (l.modulo_id?.id || '');
          return modId === moduloId;
        });
        setLecciones(filtered);
        if (filtered.length > 0) setSelectedLeccion(filtered[0]);
      } catch (e) {
        console.error('Error cargando visor:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [moduloId]);

  const handleCompletar = (lecId) => {
    setCompletadas(prev => ({ ...prev, [lecId]: true }));
  };

  const backUrl = canEditModules ? '/admin/modulos' : '/alumno';
  const backText = canEditModules ? '← Volver a Gestión de Módulos' : '← Volver a Mis Módulos';

  const completadasCount = Object.keys(completadas).length;
  const progreso = lecciones.length > 0 ? Math.round((completadasCount / lecciones.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--gray200)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Cargando lecciones...</p>
        </div>
      </div>
    );
  }

  if (!modulo) {
    return (
      <div style={{ textAlign: 'center', padding: '64px' }}>
        <h3 style={{ color: 'var(--text-strong)' }}>Módulo no encontrado</h3>
        <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" onClick={() => navigate(backUrl)} style={{ width: 'auto', padding: '10px 24px', marginTop: '16px' }}>
          {backText}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', margin: '-48px', minHeight: 'calc(100vh - 64px)' }}>
      
      {/* Header del módulo */}
      <div style={{ background: 'var(--surface-solid)', borderBottom: '1px solid var(--border)', padding: '20px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate(backUrl)}
              style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '14px', padding: '4px 0' }}
            >
              {backText}
            </button>
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--text-strong)' }}>
              {modulo.nombre}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {completadasCount}/{lecciones.length} completadas
            </span>
            <div style={{ width: '120px', height: '6px', background: 'var(--gray200)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progreso}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand-primary), #FF6B7A)', transition: 'width 0.5s ease', borderRadius: '3px' }}></div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: progreso === 100 ? '#10B981' : 'var(--brand-primary)' }}>
              {progreso}%
            </span>
          </div>
        </div>
      </div>

      {/* Layout principal: Sidebar + Contenido */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Sidebar de lecciones */}
        <div style={{
          width: '320px', flexShrink: 0,
          background: 'var(--surface-solid)', borderRight: '1px solid var(--border)',
          overflowY: 'auto', padding: '16px 0'
        }}>
          <div style={{ padding: '0 16px 12px 16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Contenido del módulo
            </span>
          </div>

          {lecciones.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No hay lecciones disponibles.
            </div>
          ) : (
            lecciones.map((lec, index) => {
              const isSelected = selectedLeccion?.id === lec.id;
              const isComplete = completadas[lec.id];
              return (
                <div
                  key={lec.id}
                  onClick={() => setSelectedLeccion(lec)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', cursor: 'pointer',
                    background: isSelected ? 'var(--gray100)' : 'transparent',
                    borderLeft: `3px solid ${isSelected ? 'var(--brand-primary)' : 'transparent'}`,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--gray50)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '28px', height: '28px', flexShrink: 0, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800,
                    background: isComplete ? '#10B981' : (isSelected ? 'var(--brand-primary)' : 'var(--gray200)'),
                    color: (isComplete || isSelected) ? 'white' : 'var(--text-secondary)'
                  }}>
                    {isComplete ? '✓' : index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? 'var(--text-strong)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {lec.titulo}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel de contenido de la lección */}
        <div style={{ flex: 1, padding: '32px 48px', overflowY: 'auto', background: '#F8FAFC' }}>
          {selectedLeccion ? (
            <div style={{ maxWidth: '800px', animation: 'fadeSlideDown 0.3s ease' }}>
              {/* Título y meta */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {completadas[selectedLeccion.id] && (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '6px' }}>
                      ✓ Completada
                    </span>
                  )}
                </div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 900, color: 'var(--text-strong)', letterSpacing: '-0.5px' }}>
                  {selectedLeccion.titulo}
                </h2>
                <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedLeccion.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Material */}
              {selectedLeccion.contenido_url && (
                <div style={{ marginBottom: '24px', background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    📎 Material de la lección
                  </div>
                  <div style={{ background: 'var(--gray50)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#DBEAFE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-strong)' }}>Documento del temario</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedLeccion.contenido_url}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vídeos */}
              {selectedLeccion.videos_url && selectedLeccion.videos_url.length > 0 && (
                <div style={{ marginBottom: '24px', background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    🎬 Vídeos de la lección
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedLeccion.videos_url.map((v, i) => (
                      <div key={i} style={{ background: 'var(--gray50)', borderRadius: '8px', padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#FEE2E2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>▶</div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-all' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sin contenido */}
              {!selectedLeccion.contenido_url && (!selectedLeccion.videos_url || selectedLeccion.videos_url.length === 0) && (
                <div style={{ marginBottom: '24px', background: 'var(--surface-solid)', border: '1px dashed var(--border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                  <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Contenido pendiente</p>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>El instructor aún no ha añadido material a esta lección.</p>
                </div>
              )}

              {/* Botón marcar como completada */}
              {!canEditModules && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  {completadas[selectedLeccion.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: '14px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Lección completada
                    </div>
                  ) : (
                    <button
                      className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer"
                      onClick={() => handleCompletar(selectedLeccion.id)}
                      style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Marcar como completada
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>Selecciona una lección del panel izquierdo para comenzar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
