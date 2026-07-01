import { useState, useEffect } from 'react';
import { getAllModulos } from '../../services/modulos.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext, useMemo } from 'react';
import { DataContext } from '../../context/DataContext';
import { filterModulesByTracks, getProfesorTracks, getUniqueModulesByName } from '../../utils/academicFilters';

const moduleCardIcons = [
  [
    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
    'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'
  ],
  [
    'M12 20h9',
    'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'
  ],
  [
    'M16 18l6-6-6-6',
    'M8 6l-6 6 6 6',
    'M13 4l-2 16'
  ],
  [
    'M3 4h18v14H3z',
    'M8 20h8',
    'M12 18v2'
  ],
  [
    'M12 3l8 4-8 4-8-4 8-4z',
    'M4 11l8 4 8-4',
    'M4 15l8 4 8-4'
  ],
  [
    'M12 2v20',
    'M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6'
  ]
];

const getModuleCardIcon = (index) => moduleCardIcons[index % moduleCardIcons.length];

export default function InstructorDashboard() {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { promociones } = useContext(DataContext);
  const profesorTracks = useMemo(
    () => getProfesorTracks(profile, promociones),
    [profile, promociones]
  );

  useEffect(() => {
    async function fetchModulos() {
      try {
        const mods = await getAllModulos();
        setModulos(getUniqueModulesByName(filterModulesByTracks(mods, profesorTracks)));
      } catch (error) {
        console.error("Error al cargar modulos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchModulos();
  }, [profesorTracks.join('|')]);

  if (loading) return <div>Cargando tus módulos...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* SaaS Page Header */}
      <div className="instructor-page-hero" style={{ margin: '-48px -48px 32px -48px', background: 'var(--surface-solid)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '48px 48px 0 48px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px 0', color: 'var(--text-strong)', letterSpacing: '-0.5px' }}>
                Panel de Instructor
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>
                Gestiona tus módulos y contenidos formativos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ width: '100%', margin: '0 auto' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--text-strong)', fontWeight: 800 }}>Tus Módulos Asignados</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
          {modulos.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)', gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '16px' }}>No tienes módulos asignados aún.</p>
            </div>
          ) : (
            modulos.map((mod, index) => (
              <div key={mod.id} className="bg-gradient-to-br from-surface to-brand-primary/5 rounded-2xl relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-md hover:border-brand-primary/30 border border-border-default p-6 flex flex-col gap-4 cursor-pointer" onClick={() => navigate('/instructor/wizard')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 48, 69, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {getModuleCardIcon(index).map((path) => (
                        <path key={path} d={path}></path>
                      ))}
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-text-strong" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{mod.nombre || mod.titulo || 'Sin título'}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--brand-primary)', fontWeight: 600 }}>ID: {mod.id ? mod.id.toString().substring(0, 6) : 'N/A'}</span>
                  </div>
                </div>
                
                <p className="text-text-secondary" style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, flexGrow: 1 }}>
                  {mod.descripcion || (mod.horas ? `Duración: ${mod.horas} horas` : 'Sin descripción disponible para este módulo.')}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
                  <span className="text-text-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Última act. hoy</span>
                  <div className="text-text-strong" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                    Editar <span style={{ color: 'var(--brand-primary)' }}>&rarr;</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
