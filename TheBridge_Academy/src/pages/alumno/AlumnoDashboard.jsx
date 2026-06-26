import { useState, useEffect, useMemo } from 'react';
import { getAllModulos } from '../../services/modulos.service';
import { getAllLecciones } from '../../services/lecciones.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AlumnoDashboard() {
  const [modulos, setModulos] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alumnoActual, setAlumnoActual] = useState(null);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [mods, lecs] = await Promise.all([getAllModulos(), getAllLecciones()]);
        setModulos(mods.filter(m => {
          const studentPromos = profile?.promociones_id || [];
          if (m.promociones_activas && m.promociones_activas.length > 0) {
            return m.promociones_activas.some(p => studentPromos.includes(p));
          }
          return m.activo !== false;
        }));
        setLecciones(lecs);
        setAlumnoActual(profile);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [profile]);


  const modulosAsignados = useMemo(() => {
    if (!alumnoActual || !alumnoActual.modulos_id) return [];
    return modulos.filter(m => alumnoActual.modulos_id.includes(m.id));
  }, [modulos, alumnoActual]);

  // Contar lecciones por módulo
  const getLeccionCount = (moduloId) => {
    return lecciones.filter(l => {
      const modId = typeof l.modulo_id === 'string' ? l.modulo_id : (l.modulo_id?.id || '');
      return modId === moduloId;
    }).length;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--gray200)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div style={{ margin: '-48px -48px 32px -48px', background: 'var(--surface-solid)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '32px 48px 32px 48px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-strong)', letterSpacing: '-0.5px' }}>Panel de Alumno</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>Continúa tu aprendizaje en The Bridge Academy.</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'var(--gray100)', borderRadius: '10px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📚</span>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-strong)' }}>{modulosAsignados.length}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Módulos</div>
                </div>
              </div>
              <div style={{ background: 'var(--gray100)', borderRadius: '10px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📄</span>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-strong)' }}>{lecciones.length}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lecciones</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--text-strong)', fontWeight: 800 }}>Tus Módulos Activos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {modulosAsignados.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Aún no tienes módulos asignados.</p>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Cuando un instructor active un módulo para ti, aparecerá aquí.</p>
              </div>
            ) : (
              modulosAsignados.map(mod => {
                const numLecciones = getLeccionCount(mod.id);
                return (
                  <div
                    key={mod.id}
                    className="bg-gradient-to-br from-surface to-brand-primary/5 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-md hover:border-brand-primary/30 flex flex-col cursor-pointer border border-border-default"
                    onClick={() => navigate(`/alumno/visor/${mod.id}`)}
                    style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s ease', padding: '24px' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gray100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-strong)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 className="text-text-strong" style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, lineHeight: 1.2 }}>
                          {mod.nombre || 'Sin título'}
                        </h4>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {numLecciones} {numLecciones === 1 ? 'lección' : 'lecciones'} · {mod.horas || 0}h
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '24px', flexGrow: 1, lineHeight: 1.5 }}>
                      {mod.descripcion || `Módulo formativo con ${numLecciones} lecciones disponibles.`}
                    </div>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '14px' }}>
                      <span>Continuar Aprendiendo</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
