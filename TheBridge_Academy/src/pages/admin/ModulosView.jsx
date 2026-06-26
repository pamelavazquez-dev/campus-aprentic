import { useContext, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import { deleteModulo, updateModulo } from '../../services/modulos.service';
import { useNavigate } from 'react-router-dom';

export default function ModulosView() {
  const { modulos, equipo, loading } = useContext(DataContext);
  const navigate = useNavigate();
  const [asignando, setAsignando] = useState(null); // moduloId being assigned
  const [mensaje, setMensaje] = useState('');

  // Solo instructores para asignar
  const profesores = equipo.filter(u => u.rol === 'Instructor');

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este módulo permanentemente?')) {
      try {
        await deleteModulo(id);
      } catch (error) {
        console.error("Error eliminando módulo", error);
      }
    }
  };

  const handleAsignar = async (moduloId, profesorId) => {
    try {
      const mod = modulos.find(m => m.id === moduloId);
      if (!mod) return;
      await updateModulo(moduloId, {
        nombre: mod.nombre,
        horas: mod.horas,
        lecciones_Id: mod.lecciones_Id || [],
        profesor_id: profesorId,
        activo: mod.activo !== undefined ? mod.activo : true
      });
      setMensaje(`Profesor asignado correctamente al módulo "${mod.nombre}".`);
      setAsignando(null);
      setTimeout(() => setMensaje(''), 3000);
    } catch (e) {
      console.error('Error asignando profesor:', e);
      setMensaje('Error al asignar el profesor.');
    }
  };

  const getProfesorNombre = (profId) => {
    if (!profId) return '— Sin asignar';
    const prof = profesores.find(p => p.id === profId);
    return prof ? prof.nombre || prof.email : profId.substring(0, 10) + '...';
  };

  return (
    <div className="admin-modulos-view animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="admin-page-hero admin-modulos-hero bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl relative overflow-hidden border border-white/10" style={{ padding: '32px 48px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', color: 'white' }}>Gestión de Módulos</h2>
          <p style={{ margin: 0, color: '#B9C0CA' }}>Control global de todos los cursos, asignación de profesores y temarios.</p>
        </div>
        <button className="bg-surface-solid text-brand-primary py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ width: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} onClick={() => navigate('/admin/modulos/nuevo')}>
          + Nuevo Módulo
        </button>
      </div>

      {/* Mensaje feedback */}
      {mensaje && (
        <div style={{
          padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
          animation: 'fadeSlideDown 0.3s ease', marginBottom: '16px',
          background: mensaje.includes('Error') ? '#FEE2E2' : '#D1FAE5',
          color: mensaje.includes('Error') ? '#991B1B' : '#065F46',
          border: `1px solid ${mensaje.includes('Error') ? '#FECACA' : '#A7F3D0'}`
        }}>
          {mensaje.includes('Error') ? '✕' : '✓'} {mensaje}
        </div>
      )}

      <div className="admin-modulos-table w-full overflow-x-auto bg-surface-solid rounded-xl shadow-sm border border-border-default">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Cargando módulos...</div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="px-6 py-4 bg-gray150 font-bold text-[#64748B] text-xs uppercase tracking-wider border-b border-border-default">Nombre del Módulo</th>
                <th className="px-6 py-4 bg-gray150 font-bold text-[#64748B] text-xs uppercase tracking-wider border-b border-border-default">Horas</th>
                <th className="px-6 py-4 bg-gray150 font-bold text-[#64748B] text-xs uppercase tracking-wider border-b border-border-default">Lecciones</th>
                <th className="px-6 py-4 bg-gray150 font-bold text-[#64748B] text-xs uppercase tracking-wider border-b border-border-default">Profesor Asignado</th>
                <th className="px-6 py-4 bg-gray150 font-bold text-[#64748B] text-xs uppercase tracking-wider border-b border-border-default">Estado</th>
                <th className="px-6 py-4 bg-gray150 font-bold text-[#64748B] text-xs uppercase tracking-wider border-b border-border-default" style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modulos.length === 0 ? (
                <tr className="transition-colors duration-200 hover:bg-gray150">
                  <td className="px-6 py-4 border-b border-border-default text-sm text-[#334155]" colSpan="6" style={{ textAlign: 'center' }}>No hay módulos registrados.</td>
                </tr>
              ) : (
                modulos.map(mod => (
                  <tr key={mod.id} className="transition-colors duration-200 hover:bg-gray150">
                    <td className="px-6 py-4 border-b border-border-default text-sm text-[#334155]" style={{ fontWeight: 800 }}>{mod.nombre || 'Sin nombre'}</td>
                    <td className="px-6 py-4 border-b border-border-default text-sm text-[#334155]">{mod.horas || 'N/A'}</td>
                    <td className="px-6 py-4 border-b border-border-default text-sm text-[#334155]">{mod.lecciones_Id ? mod.lecciones_Id.length : 0}</td>
                    <td className="px-6 py-4 border-b border-border-default text-sm text-[#334155]">
                      {asignando === mod.id ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                            defaultValue={mod.profesor_id || ''}
                            onChange={e => handleAsignar(mod.id, e.target.value)}
                            style={{ padding: '6px 10px', fontSize: '13px', minWidth: '180px' }}
                          >
                            <option value="">Sin asignar</option>
                            {profesores.map(p => (
                              <option key={p.id} value={p.id}>{p.nombre || p.email}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => setAsignando(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '16px' }}
                          >✕</button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setAsignando(mod.id)}
                          style={{
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--gray100)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{
                            fontSize: '13px', fontWeight: 600,
                            color: mod.profesor_id ? 'var(--text-strong)' : 'var(--text-secondary)'
                          }}>
                            {getProfesorNombre(mod.profesor_id)}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 border-b border-border-default text-sm text-[#334155]">
                      <span style={{
                        fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px',
                        background: mod.activo !== false ? '#D1FAE5' : '#FEE2E2',
                        color: mod.activo !== false ? '#065F46' : '#991B1B'
                      }}>
                        {mod.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-border-default text-sm text-[#334155]">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="bg-gray150 text-ink py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:bg-[#FFE5E8] hover:text-brand-primary inline-flex items-center justify-center gap-2 border-none cursor-pointer"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => navigate(`/admin/modulos/ver/${mod.id}`)}
                        >
                          Visualizar
                        </button>
                        <button
                          className="bg-[#FFE5E8] text-brand-primary py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:bg-brand-primary hover:text-white inline-flex items-center justify-center gap-2 border-none cursor-pointer"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleDelete(mod.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-modulos-mobile-list">
        {loading ? (
          <div className="bg-surface border border-border-default rounded-xl p-6 text-center">Cargando módulos...</div>
        ) : modulos.length === 0 ? (
          <div className="bg-surface border border-border-default rounded-xl p-6 text-center">No hay módulos registrados.</div>
        ) : (
          modulos.map(mod => (
            <article key={mod.id} className="admin-modulo-card bg-surface backdrop-blur-lg border border-border-default rounded-xl shadow-sm">
              <div className="admin-modulo-card-header">
                <div>
                  <h3>{mod.nombre || 'Sin nombre'}</h3>
                  <p>{mod.horas || 'N/A'} horas · {mod.lecciones_Id ? mod.lecciones_Id.length : 0} lecciones</p>
                </div>
                <span className={mod.activo !== false ? 'is-active' : 'is-inactive'}>
                  {mod.activo !== false ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="admin-modulo-card-section">
                <span>Profesor asignado</span>
                {asignando === mod.id ? (
                  <div className="admin-modulo-card-assign">
                    <select
                      className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                      defaultValue={mod.profesor_id || ''}
                      onChange={e => handleAsignar(mod.id, e.target.value)}
                    >
                      <option value="">Sin asignar</option>
                      {profesores.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre || p.email}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setAsignando(null)}>Cancelar</button>
                  </div>
                ) : (
                  <button type="button" className="admin-modulo-profesor-button" onClick={() => setAsignando(mod.id)}>
                    {getProfesorNombre(mod.profesor_id)}
                  </button>
                )}
              </div>

              <div className="admin-modulo-card-actions">
                <button type="button" onClick={() => navigate(`/admin/modulos/ver/${mod.id}`)}>Visualizar</button>
                <button type="button" onClick={() => handleDelete(mod.id)}>Eliminar</button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
