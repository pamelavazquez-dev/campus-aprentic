import { useContext, useMemo } from 'react';
import { DataContext } from '../../context/DataContext';

export default function DirectorioTab() {
  const { usuarios, campuses, promociones, loading } = useContext(DataContext);

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Cargando directorio...</div>;

  const groupedByCampus = useMemo(() => {
    const groups = {};
    
    // Inicializar grupos por cada campus en la base de datos
    campuses.forEach(c => {
      groups[c.id] = {
        campusInfo: c,
        usuarios: []
      };
    });
    
    // Grupo fallback para los que no tengan campus asigando o no exista
    groups['unassigned'] = {
      campusInfo: { id: 'unassigned', nombre: 'Global / Sin Asignar' },
      usuarios: []
    };

    usuarios.forEach(u => {
      let cId = 'unassigned';
      
      // 1. Si tiene campus_id explícito (Profesores/Admins)
      if (u.campus_id) {
        cId = typeof u.campus_id === 'string' ? u.campus_id : (u.campus_id.id || 'unassigned');
      } 
      // 2. Si es Alumno, resolver su campus a través de su promoción
      else if (u.rol === 'Alumno' && u.promociones_id && u.promociones_id.length > 0) {
        // Extraer el ID real de la promoción (puede ser string o referencia)
        let pid = u.promociones_id[0];
        if (typeof pid === 'object') {
           pid = pid.id || (pid.path ? pid.path.split('/').pop() : '');
        }
        
        const promo = promociones.find(p => p.id === pid);
        if (promo && promo.campus_id) {
           cId = typeof promo.campus_id === 'string' ? promo.campus_id : (promo.campus_id.id || 'unassigned');
        }
      }
      
      if (groups[cId]) {
        groups[cId].usuarios.push(u);
      } else {
        groups['unassigned'].usuarios.push(u);
      }
    });

    return Object.values(groups).filter(g => g.usuarios.length > 0 || g.campusInfo.id !== 'unassigned');
  }, [usuarios, campuses, promociones]);

  // Helpers
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {groupedByCampus.map(group => (
        <div key={group.campusInfo.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--text-strong)', letterSpacing: '-0.5px' }}>
              {group.campusInfo.nombre || group.campusInfo.id}
            </h3>
            <span style={{ background: 'var(--gray150)', color: 'var(--text-secondary)', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold' }}>
              {group.usuarios.length} Miembros
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {group.usuarios.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '15px' }}>No hay usuarios en esta sede.</p>
              </div>
            ) : (
              group.usuarios.map((u, i) => (
                <div key={u.id || i} className="bg-surface backdrop-blur-lg border border-border-default rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
                  <div style={{ width: '48px', height: '48px', flexShrink: 0, background: 'linear-gradient(135deg, var(--brand-primary) 0%, #1e3a8a 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    {getInitials(u.nombre || u.email)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.nombre || 'Sin Nombre'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.email}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: u.rol === 'Instructor' ? '#B45309' : (u.rol === 'Administrador' ? '#4338CA' : '#047857'), background: u.rol === 'Instructor' ? '#FEF3C7' : (u.rol === 'Administrador' ? '#E0E7FF' : '#D1FAE5'), padding: '4px 8px', borderRadius: '6px' }}>
                      {u.rol}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
