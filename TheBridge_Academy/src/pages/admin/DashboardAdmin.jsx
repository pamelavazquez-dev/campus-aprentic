import { useContext, useState, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import ValoracionesTab from './ValoracionesTab';
import DirectorioTab from './DirectorioTab';
import Avatar from '../../components/ui/Avatar';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useUsuarios } from '../../hooks/useUsuarios';

export default function DashboardAdmin() {
  const { promociones, modulos, loading } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState('resumen');
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ alumnos: 0, profes: 0, admin: 0 });

  const { data: profesData } = useUsuarios('Instructor');
  const equipo = profesData?.docs || [];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [al, pr, ad] = await Promise.all([
          getCountFromServer(collection(db, 'alumnos')),
          getCountFromServer(collection(db, 'profesores')),
          getCountFromServer(collection(db, 'admin'))
        ]);
        setCounts({
          alumnos: al.data().count,
          profes: pr.data().count,
          admin: ad.data().count
        });
      } catch (error) {
        console.error("Error al obtener conteo de usuarios:", error);
      }
    };
    fetchCounts();
  }, []);

  const totalUsuarios = counts.alumnos + counts.profes + counts.admin;

  if (loading) return <div>Cargando panel...</div>;

  // Removed local getInitials as it is handled by Avatar component

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* SaaS Page Header & Sub-Nav */}
      <div style={{ margin: '-48px -48px 32px -48px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '32px 48px 0 48px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-strong)', letterSpacing: '-0.5px' }}>Dashboard</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>Resumen general de The Bridge Academy.</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div 
              onClick={() => setActiveTab('resumen')}
              style={{ padding: '12px 0', borderBottom: `2px solid ${activeTab === 'resumen' ? 'var(--brand-primary)' : 'transparent'}`, color: activeTab === 'resumen' ? 'var(--text-strong)' : 'var(--text-secondary)', fontWeight: activeTab === 'resumen' ? 700 : 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              Resumen General
            </div>
            <div 
              onClick={() => setActiveTab('valoraciones')}
              style={{ padding: '12px 0', borderBottom: `2px solid ${activeTab === 'valoraciones' ? 'var(--brand-primary)' : 'transparent'}`, color: activeTab === 'valoraciones' ? 'var(--text-strong)' : 'var(--text-secondary)', fontWeight: activeTab === 'valoraciones' ? 700 : 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              Valoraciones
            </div>
            <div 
              onClick={() => setActiveTab('directorio')}
              style={{ padding: '12px 0', borderBottom: `2px solid ${activeTab === 'directorio' ? 'var(--brand-primary)' : 'transparent'}`, color: activeTab === 'directorio' ? 'var(--text-strong)' : 'var(--text-secondary)', fontWeight: activeTab === 'directorio' ? 700 : 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              Directorio por Campus
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {activeTab === 'resumen' && (
          <>
        
        {/* Grid de Estadísticas (Premium Dark Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-2xl hover:border-brand-primary/30 flex flex-col cursor-pointer border border-white/10" onClick={() => navigate('/admin/usuarios')}>
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '8px', lineHeight: 1 }}>
              {totalUsuarios || '-'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#B9C0CA' }}>Usuarios Registrados</div>
            <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '14px' }}>
              <span>Gestionar Directorio</span>
              <span>&rarr;</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-2xl hover:border-brand-primary/30 flex flex-col cursor-pointer border border-white/10" onClick={() => navigate('/admin/campus')}>
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '8px', lineHeight: 1 }}>
              {promociones.length}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#B9C0CA' }}>Campus Activos</div>
            <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '14px' }}>
              <span>Ver Localizaciones</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-2xl hover:border-brand-primary/30 flex flex-col cursor-pointer border border-white/10" onClick={() => navigate('/admin/modulos')}>
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '8px', lineHeight: 1 }}>
              {modulos.length}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#B9C0CA' }}>Módulos Educativos</div>
            <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '14px' }}>
              <span>Administrar Contenido</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>

        {/* Lista de Profesores/Usuarios Estricta */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-strong)' }}>Directorio de Equipo Reciente</h3>
            <button className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" onClick={() => navigate('/admin/usuarios')}>Ver todos</button>
          </div>
          
          <div style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {/* Header de la lista */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr 1fr', gap: '16px', padding: '12px 24px', background: 'var(--gray50)', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Miembro</div>
              <div>Rol</div>
              <div>Campus</div>
              <div style={{ textAlign: 'right' }}>Status</div>
            </div>

            {equipo.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hay miembros en el equipo.
              </div>
            ) : (
              equipo.map((miembro, index) => (
                <div key={miembro.id || index} style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr 1fr', gap: '16px', padding: '16px 24px', alignItems: 'center', borderBottom: index < equipo.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray100)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  
                  {/* Columna 1: Info del Usuario */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <Avatar src={miembro.avatar} name={miembro.nombre || miembro.email || ''} size="md" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{miembro.nombre || 'Usuario Sin Nombre'}</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{miembro.email || 'Sin email'}</div>
                    </div>
                  </div>
                  
                  {/* Columna 2: Rol */}
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-strong)', background: 'var(--gray150)', padding: '4px 8px', borderRadius: '6px' }}>
                      {miembro.rol}
                    </span>
                  </div>

                  {/* Columna 3: Campus */}
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {miembro.campus || 'Global'}
                  </div>

                  {/* Columna 4: Status */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.15)' }}></div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>Activo</span>
                  </div>
                  
                </div>
              ))
            )}
          </div>
        </div>

          </>
        )}

        {activeTab === 'valoraciones' && <ValoracionesTab />}

        {activeTab === 'directorio' && <DirectorioTab />}

      </div>
    </div>
  );
}
