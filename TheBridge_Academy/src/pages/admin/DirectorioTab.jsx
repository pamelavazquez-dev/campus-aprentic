import { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';

export default function DirectorioTab() {
  const { campuses, loading } = useContext(DataContext);
  const navigate = useNavigate();

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Cargando sedes...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--brand-primary)', color: 'var(--text-secondary)' }}>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-strong)' }}>Directorio Unificado Activo</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>
          La plataforma ahora utiliza paginación dinámica en la nube para gestionar miles de usuarios sin latencia.
          Para consultar a los alumnos y equipo por sede, dirígete al <strong>Directorio de Usuarios</strong> principal y utiliza los filtros de búsqueda avanzados.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {campuses.map(campus => (
          <div key={campus.id} className="bg-surface backdrop-blur-lg border border-border-default rounded-xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col gap-4" onClick={() => navigate('/admin/usuarios')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gray100)', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                📍
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--text-strong)' }}>
                  {campus.nombre || campus.id}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sede Académica</span>
              </div>
            </div>
            
            <button className="bg-surface-solid border border-border-default text-text-strong py-2 px-4 rounded-lg text-sm font-bold mt-2" onClick={(e) => { e.stopPropagation(); navigate('/admin/usuarios'); }}>
              Explorar Directorio &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
