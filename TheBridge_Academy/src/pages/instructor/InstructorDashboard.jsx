import { useState, useEffect } from 'react';
import { getAllModulos } from '../../services/modulos.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext, useMemo } from 'react';
import { DataContext } from '../../context/DataContext';
import { filterModulesByTracks, getProfesorTracks, getUniqueModulesByName } from '../../utils/academicFilters';

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
      <div style={{ margin: '-48px -48px 32px -48px', background: 'var(--surface-solid)', borderBottom: '1px solid var(--border)' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {modulos.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)', gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '16px' }}>No tienes módulos asignados aún.</p>
            </div>
          ) : (
            modulos.map(mod => (
              <div key={mod.id} className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-2xl hover:border-brand-primary/30 border border-white/10 p-6 flex flex-col gap-4 cursor-pointer" onClick={() => navigate('/instructor/wizard')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 48, 69, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'white' }}>{mod.nombre || mod.titulo || 'Sin título'}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--brand-primary)', fontWeight: 600 }}>ID: {mod.id ? mod.id.toString().substring(0, 6) : 'N/A'}</span>
                  </div>
                </div>
                
                <p style={{ margin: 0, color: '#B9C0CA', fontSize: '14px', lineHeight: 1.5, flexGrow: 1 }}>
                  {mod.descripcion || (mod.horas ? `Duración: ${mod.horas} horas` : 'Sin descripción disponible para este módulo.')}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#B9C0CA', fontSize: '13px', fontWeight: 500 }}>Última act. hoy</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '13px', fontWeight: 600 }}>
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
