import { useState, useContext, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from '../components/Card';
import Input from '../components/Input';
import { createDoc, updateDoc } from '../services/base.service';
import { doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function UsuariosView() {
  const { usuarios, campuses, loading } = useContext(DataContext);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [usuario, setUsuario] = useState({ nombre: '', email: '', rol: 'Instructor', campus_id: '' });
  const [saving, setSaving] = useState(false);
  const [showMatricula, setShowMatricula] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { modulos } = useContext(DataContext);

  // Set default campus when campuses load
  useEffect(() => {
    if (campuses?.length > 0 && !usuario.campus_id) {
      setUsuario(u => ({ ...u, campus_id: campuses[0].id }));
    }
  }, [campuses]);

  // Helpers para generar iniciales
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSaveUser = async () => {
    setSaving(true);
    try {
      const newId = `USR-${Date.now()}`;
      
      let collectionName = 'alumnos';
      if (usuario.rol === 'Instructor') collectionName = 'profesores';
      if (usuario.rol === 'Administrador') collectionName = 'admin';

      await createDoc(collectionName, newId, {
        nombre: usuario.nombre,
        email: usuario.email,
        campus_id: doc(db, 'campus', usuario.campus_id),
        avatar: '',
        promociones_id: [],
        modulos_id: [],
        isActive: true
      });
      
      setStep(1);
      setUsuario({ nombre: '', email: '', rol: 'Instructor', campus_id: campuses[0]?.id || '' });
      setShowWizard(false);
    } catch (error) {
      console.error("Error al crear usuario", error);
      alert("Error al crear el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenMatricula = (u) => {
    setSelectedUser({ ...u, modulos_id: u.modulos_id || [] });
    setShowMatricula(true);
  };

  const handleSaveMatricula = async () => {
    setSaving(true);
    try {
      await updateDoc('alumnos', selectedUser.id, { modulos_id: selectedUser.modulos_id });
      setShowMatricula(false);
      setSelectedUser(null);
      // DataContext will auto-refresh if there is a listener, or we might need to rely on it
      alert("Matrícula actualizada.");
    } catch (e) {
      console.error(e);
      alert("Error actualizando matrícula.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando directorio...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl relative overflow-hidden border border-white/10" style={{ padding: '32px 48px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, margin: 0, color: 'white' }}>Directorio de Usuarios</h2>
          <p style={{ color: '#B9C0CA', margin: '8px 0 0 0', fontSize: '16px' }}>Gestiona todo el personal y alumnos.</p>
        </div>
        <button className="bg-white text-brand-primary py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ width: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} onClick={() => setShowWizard(true)}>
          + Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-surface backdrop-blur-md rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium text-lg m-0">No hay usuarios registrados en el sistema.</p>
          </div>
        ) : (
          usuarios.map((u, i) => (
            <div key={u.id || i} className="bg-surface backdrop-blur-lg border border-white/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col gap-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-[#3e0c15] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-[#B01626] flex items-center justify-center text-white font-black text-lg shadow-md transform group-hover:scale-105 transition-transform duration-300">
                    {getInitials(u.nombre || u.email)}
                  </div>
                  <div>
                    <h3 className="m-0 text-[17px] font-extrabold text-text-strong group-hover:text-brand-primary transition-colors line-clamp-1">{u.nombre || u.email || 'Sin Nombre'}</h3>
                    <p className="m-0 text-xs font-semibold text-slate-500 mt-1 line-clamp-1">{u.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100/80">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Rol en la plataforma</span>
                  <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[11px] font-black">{u.rol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Campus Asignado</span>
                  <span className="text-xs font-extrabold text-text-strong">{campuses.find(c => c.id === (u.campus_id?.id || u.campus_id))?.nombre || 'Global'}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-2">
                {u.rol === 'Alumno' && (
                  <button className="flex-1 bg-brand-gradient text-white py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" onClick={() => handleOpenMatricula(u)}>
                    Matricular
                  </button>
                )}
                <button className="flex-1 bg-white text-slate-600 border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer transition-all duration-300 hover:bg-slate-50 hover:text-brand-primary hover:border-brand-primary/30 inline-flex items-center justify-center gap-2">
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showWizard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="p-6 border-b border-border-default flex justify-between items-center bg-gray150/50 rounded-t-2xl">
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-strong)' }}>Alta de Usuario</h3>
              <button className="bg-transparent text-[#94A3B8] border-none p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-white hover:text-brand-primary" onClick={() => { setShowWizard(false); setStep(1); }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--gray300)', zIndex: 0 }}></div>
              {['Perfil', 'Asignación', 'Confirmar'].map((label, i) => {
                const s = i + 1;
                const isActive = step >= s;
                const isCurrent = step === s;
                return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, position: 'relative', top: '-10px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', 
                      background: isActive ? (isCurrent ? 'var(--brand-primary)' : 'white') : 'white', 
                      border: `2px solid ${isActive ? 'var(--brand-primary)' : 'var(--gray300)'}`,
                      color: isActive ? (isCurrent ? 'white' : 'var(--brand-primary)') : 'var(--text-secondary)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '14px'
                    }}>
                      {s}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: isActive ? 800 : 600, color: '#343943', whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                );
              })}
            </div>

            <Card>
              {step === 1 && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Paso 1: Perfil</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nombre Completo</label>
                    <Input value={usuario.nombre} onChange={e => setUsuario({...usuario, nombre: e.target.value})} placeholder="Ej: Laura Ruiz" />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email corporativo</label>
                    <Input value={usuario.email} onChange={e => setUsuario({...usuario, email: e.target.value})} placeholder="l.ruiz@academy.com" />
                  </div>
                  <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" onClick={() => setStep(2)}>
                    Continuar a Asignación
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Paso 2: Asignación</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Rol en la Plataforma</label>
                    <select className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]" value={usuario.rol} onChange={e => setUsuario({...usuario, rol: e.target.value})}>
                      <option>Instructor</option>
                      <option>Alumno</option>
                      <option>Administrador</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Campus Asignado</label>
                    <select className="w-full px-4 py-3 bg-white border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]" value={usuario.campus_id} onChange={e => setUsuario({...usuario, campus_id: e.target.value})}>
                      {campuses.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre || c.id}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="bg-[#FFE5E8] text-brand-primary py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:bg-brand-primary hover:text-white inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ width: '50%' }} onClick={() => setStep(1)}>Atrás</button>
                    <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ width: '50%' }} onClick={() => setStep(3)}>Revisar datos</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Paso 3: Confirmación</h3>
                  <div style={{ background: '#F5F6F8', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                    <p><strong>Nombre:</strong> {usuario.nombre || 'N/A'}</p>
                    <p><strong>Email:</strong> {usuario.email || 'N/A'}</p>
                    <p><strong>Rol:</strong> {usuario.rol}</p>
                    <p><strong>Campus:</strong> {campuses.find(c => c.id === usuario.campus_id)?.nombre || usuario.campus_id}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="bg-[#FFE5E8] text-brand-primary py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:bg-brand-primary hover:text-white inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ width: '50%' }} disabled={saving} onClick={() => setStep(2)}>Atrás</button>
                    <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ width: '50%' }} disabled={saving} onClick={handleSaveUser}>
                      {saving ? 'Guardando...' : 'Crear Usuario'}
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {showMatricula && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="p-6 border-b border-border-default flex justify-between items-center bg-gray150/50 rounded-t-2xl">
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-strong)' }}>Matricular Alumno</h3>
              <button className="bg-transparent text-[#94A3B8] border-none p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-white hover:text-brand-primary" onClick={() => setShowMatricula(false)}>✕</button>
            </div>
            <p>Selecciona los módulos a los que <strong>{selectedUser.nombre}</strong> tendrá acceso.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '24px 0', maxHeight: '300px', overflowY: 'auto' }}>
              {modulos.filter(m => m.activo !== false).map(m => {
                const isSelected = selectedUser.modulos_id.includes(m.id);
                return (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', background: isSelected ? 'var(--gray50)' : 'transparent' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={(e) => {
                        const newMods = e.target.checked 
                          ? [...selectedUser.modulos_id, m.id]
                          : selectedUser.modulos_id.filter(id => id !== m.id);
                        setSelectedUser({ ...selectedUser, modulos_id: newMods });
                      }}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{m.nombre}</span>
                  </label>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', padding: '24px' }}>
              <button className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" disabled={saving} onClick={() => setShowMatricula(false)}>Cancelar</button>
              <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" disabled={saving} onClick={handleSaveMatricula}>
                {saving ? 'Guardando...' : 'Guardar Matrícula'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
