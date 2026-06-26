import { useContext, useState, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import ValoracionesTab from './ValoracionesTab';
import DirectorioTab from './DirectorioTab';
import Avatar from '../../components/ui/Avatar';
import { collection, getCountFromServer, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function DashboardAdmin() {
  const { promociones, modulos, loading } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState('resumen');
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ alumnos: 0, profes: 0, admin: 0 });
  const [equipo, setEquipo] = useState([]);
  const [loadingEquipo, setLoadingEquipo] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch counts
        const [alCount, prCount, adCount] = await Promise.all([
          getCountFromServer(collection(db, 'alumnos')),
          getCountFromServer(collection(db, 'profesores')),
          getCountFromServer(collection(db, 'admin'))
        ]);
        setCounts({
          alumnos: alCount.data().count,
          profes: prCount.data().count,
          admin: adCount.data().count
        });

        // Fetch recientes (2 de cada)
        const [alSnap, prSnap, adSnap] = await Promise.all([
          getDocs(query(collection(db, 'alumnos'), limit(2))),
          getDocs(query(collection(db, 'profesores'), limit(2))),
          getDocs(query(collection(db, 'admin'), limit(2)))
        ]);

        const formatUser = (doc, rol) => ({ id: doc.id, ...doc.data(), rol });
        
        const recientes = [
          ...adSnap.docs.map(d => formatUser(d, 'Administrador')),
          ...prSnap.docs.map(d => formatUser(d, 'Instructor')),
          ...alSnap.docs.map(d => formatUser(d, 'Alumno'))
        ];
        
        setEquipo(recientes);
      } catch (error) {
        console.error("Error al cargar datos del panel:", error);
      } finally {
        setLoadingEquipo(false);
      }
    };
    fetchData();
  }, []);

  const totalUsuarios = counts.alumnos + counts.profes + counts.admin;

  if (loading) return <div>Cargando panel...</div>;

  // Removed local getInitials as it is handled by Avatar component

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* SaaS Page Header & Sub-Nav */}
      <div className="admin-dashboard-header" style={{ margin: '-48px -48px 32px -48px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="admin-dashboard-header-inner" style={{ padding: '32px 48px 0 48px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-strong)', letterSpacing: '-0.5px' }}>Dashboard</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>Resumen general de The Bridge Academy.</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="admin-dashboard-tabs" style={{ display: 'flex', gap: '24px' }}>
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
        <div className="admin-dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="bg-gradient-to-br from-surface to-brand-primary/5 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-md hover:border-brand-primary/30 flex flex-col cursor-pointer border border-border-default" onClick={() => navigate('/admin/usuarios')}>
            <div className="text-5xl font-black text-text-strong mb-2 leading-none">
              {totalUsuarios || '-'}
            </div>
            <div className="text-base font-bold text-text-secondary">Usuarios Registrados</div>
            <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '14px' }}>
              <span>Gestionar Directorio</span>
              <span>&rarr;</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-surface to-brand-primary/5 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-md hover:border-brand-primary/30 flex flex-col cursor-pointer border border-border-default" onClick={() => navigate('/admin/campus')}>
            <div className="text-5xl font-black text-text-strong mb-2 leading-none">
              {promociones.length}
            </div>
            <div className="text-base font-bold text-text-secondary">Campus Activos</div>
            <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '14px' }}>
              <span>Ver Localizaciones</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-surface to-brand-primary/5 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-md hover:border-brand-primary/30 flex flex-col cursor-pointer border border-border-default" onClick={() => navigate('/admin/modulos')}>
            <div className="text-5xl font-black text-text-strong mb-2 leading-none">
              {modulos.length}
            </div>
            <div className="text-base font-bold text-text-secondary">Módulos Educativos</div>
            <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '14px' }}>
              <span>Administrar Contenido</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>

        {/* Lista de Usuarios Recientes Estricta */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-strong)' }}>Muestra de Usuarios Recientes</h3>
            <button className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" onClick={() => navigate('/admin/usuarios')}>Ver todos</button>
          </div>
          
          <div className="admin-recent-users" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {/* Header de la lista */}
            <div className="admin-recent-users-head" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr 1fr', gap: '16px', padding: '12px 24px', background: 'var(--gray50)', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Miembro</div>
              <div>Rol</div>
              <div>Campus</div>
              <div style={{ textAlign: 'right' }}>Status</div>
            </div>

            {loadingEquipo ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Cargando muestra de usuarios...
              </div>
            ) : equipo.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hay usuarios registrados.
              </div>
            ) : (
              equipo.map((miembro, index) => (
                <div key={miembro.id || index} className="admin-recent-user-row" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr 1fr', gap: '16px', padding: '16px 24px', alignItems: 'center', borderBottom: index < equipo.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray100)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  
                  {/* Columna 1: Info del Usuario */}
                  <div className="admin-recent-user-member" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <Avatar src={miembro.avatar} name={miembro.nombre || miembro.email || ''} size="md" />
                    <div className="admin-recent-user-text" style={{ minWidth: 0 }}>
                      <div className="admin-recent-user-name" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{miembro.nombre || 'Usuario Sin Nombre'}</div>
                      <div className="admin-recent-user-email" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{miembro.email || 'Sin email'}</div>
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
