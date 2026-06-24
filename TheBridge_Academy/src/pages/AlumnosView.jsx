import { useState, useContext, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import PageHeader from '../components/ui/PageHeader';
import { createDoc, updateDoc } from '../services/base.service';
import { doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Avatar from '../components/ui/Avatar';

export default function UsuariosView() {
  const { usuarios, campuses, loading } = useContext(DataContext);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [usuario, setUsuario] = useState({ nombre: '', email: '', rol: 'Instructor', campus_id: '' });
  const [saving, setSaving] = useState(false);
  const [showMatricula, setShowMatricula] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { modulos } = useContext(DataContext);

  const [filterRol, setFilterRol] = useState('');
  const [filterCampus, setFilterCampus] = useState('');

  // Set default campus when campuses load
  useEffect(() => {
    if (campuses?.length > 0 && !usuario.campus_id) {
      setUsuario(u => ({ ...u, campus_id: campuses[0].id }));
    }
  }, [campuses]);

  // Removed local getInitials as it is handled by Avatar component

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      <span className="text-gray-500 font-bold tracking-wide">Cargando directorio...</span>
    </div>
  );

  const filteredUsuarios = usuarios.filter(u => {
    const matchRol = filterRol ? u.rol === filterRol : true;
    const campusId = u.campus_id?.id || u.campus_id;
    const matchCampus = filterCampus ? campusId === filterCampus : true;
    return matchRol && matchCampus;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="animate-fade-in">
        <PageHeader
          eyebrow="Admin"
          title="Directorio de Usuarios"
          description="Gestiona todo el personal, instructores y alumnos de la academia."
          actions={(
            <button className="bg-white text-brand-primary py-3 px-6 rounded-xl text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-[0_8px_16px_rgba(0,0,0,0.1)] inline-flex items-center justify-center gap-2 border-none cursor-pointer" type="button" onClick={() => setShowWizard(true)}>
              + Nuevo Usuario
            </button>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-8 bg-white/50 backdrop-blur-md border border-gray-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Filtrar por Rol</label>
            <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 cursor-pointer" value={filterRol} onChange={e => setFilterRol(e.target.value)}>
              <option value="">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Instructor">Instructor</option>
              <option value="Alumno">Alumno</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Filtrar por Campus</label>
            <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 cursor-pointer" value={filterCampus} onChange={e => setFilterCampus(e.target.value)}>
              <option value="">Todos los campus</option>
              {campuses.map(c => (
                <option key={c.id} value={c.id}>{c.nombre || c.id}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-6">
          {filteredUsuarios.length === 0 ? (
            <div className="py-20 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-gray-200/60 shadow-sm">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-bold text-lg m-0">No hay usuarios registrados en el sistema.</p>
            </div>
          ) : (
            filteredUsuarios.map((u, i) => (
              <div key={u.id || i} className="bg-white/70 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <Avatar src={u.avatar} name={u.nombre || u.email} size="2xl" rounded="rounded-2xl" className="shadow-lg shadow-brand-primary/20 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300" />

                <div className="flex-1 flex flex-col gap-1 w-full text-center md:text-left">
                  <h3 className="m-0 text-xl font-black text-text-strong group-hover:text-brand-primary transition-colors">{u.nombre || u.email || 'Sin Nombre'}</h3>
                  <p className="m-0 text-sm font-semibold text-gray-500">{u.email}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                    <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">{u.rol}</span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                       <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       {campuses.find(c => c.id === (u.campus_id?.id || u.campus_id))?.nombre || 'Global'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col lg:flex-row items-center gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-6 justify-center">
                  {u.rol === 'Alumno' && (
                    <div className="flex flex-col items-center mr-2 hidden md:flex">
                       <span className="text-2xl font-black text-text-strong">{u.modulos_id?.length || 0}</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Módulos</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {u.rol === 'Alumno' && (
                      <button className="bg-brand-primary/5 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white py-2.5 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm" onClick={() => handleOpenMatricula(u)}>
                        Matricular
                      </button>
                    )}
                    <button className="bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-2.5 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm">
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border-default rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-400 overflow-hidden">
            <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
              <h3 className="m-0 text-xl font-black text-text-strong">Alta de Usuario</h3>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-red-50 hover:text-brand-primary transition-colors border-none cursor-pointer" onClick={() => { setShowWizard(false); setStep(1); }}>✕</button>
            </div>
            
            <div className="px-8 pt-6 pb-2 relative">
              <div className="absolute top-[42px] left-12 right-12 h-0.5 bg-gray-200 z-0"></div>
              <div className="flex justify-between relative z-10">
                {['Perfil', 'Asignación', 'Confirmar'].map((label, i) => {
                  const s = i + 1;
                  const isActive = step >= s;
                  const isCurrent = step === s;
                  return (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-300 ${isActive ? (isCurrent ? 'bg-brand-primary border-brand-primary text-white shadow-md' : 'bg-white border-brand-primary text-brand-primary') : 'bg-white border-gray-200 text-gray-400'}`}>
                        {s}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isActive ? 'text-text-strong' : 'text-gray-400'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8">
              {step === 1 && (
                <div className="flex flex-col gap-5 animate-fadeSlideDown">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-text-strong">Nombre Completo</label>
                    <input className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300" value={usuario.nombre} onChange={e => setUsuario({...usuario, nombre: e.target.value})} placeholder="Ej: Laura Ruiz" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-text-strong">Email corporativo</label>
                    <input className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300" type="email" value={usuario.email} onChange={e => setUsuario({...usuario, email: e.target.value})} placeholder="l.ruiz@academy.com" />
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                    <button className="flex-1 bg-white border-2 border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 cursor-pointer shadow-sm" onClick={() => { setShowWizard(false); setStep(1); }}>Cancelar</button>
                    <button className="flex-1 bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer" onClick={() => setStep(2)}>
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5 animate-fadeSlideDown">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-text-strong">Rol en la Plataforma</label>
                    <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 cursor-pointer" value={usuario.rol} onChange={e => setUsuario({...usuario, rol: e.target.value})}>
                      <option>Instructor</option>
                      <option>Alumno</option>
                      <option>Administrador</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-text-strong">Campus Asignado</label>
                    <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300 cursor-pointer" value={usuario.campus_id} onChange={e => setUsuario({...usuario, campus_id: e.target.value})}>
                      {campuses.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre || c.id}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                    <button className="flex-1 bg-white border-2 border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 cursor-pointer shadow-sm" onClick={() => setStep(1)}>Atrás</button>
                    <button className="flex-1 bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer" onClick={() => setStep(3)}>Siguiente</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-5 animate-fadeSlideDown">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Nombre</span>
                      <span className="text-sm font-black text-text-strong">{usuario.nombre || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                      <span className="text-sm font-black text-text-strong">{usuario.email || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Rol</span>
                      <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-[11px] font-black">{usuario.rol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase">Campus</span>
                      <span className="text-sm font-black text-text-strong">{campuses.find(c => c.id === usuario.campus_id)?.nombre || usuario.campus_id}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button className="flex-1 bg-white border-2 border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 cursor-pointer shadow-sm" disabled={saving} onClick={() => setStep(2)}>Atrás</button>
                    <button className="flex-[2] bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer disabled:opacity-50" disabled={saving} onClick={handleSaveUser}>
                      {saving ? 'Guardando...' : 'Confirmar y Crear'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showMatricula && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border-default rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-400 overflow-hidden">
            <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
              <h3 className="m-0 text-xl font-black text-text-strong">Matricular Alumno</h3>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-red-50 hover:text-brand-primary transition-colors border-none cursor-pointer" onClick={() => setShowMatricula(false)}>✕</button>
            </div>
            
            <div className="p-8 flex flex-col gap-6">
              <p className="m-0 text-sm font-medium text-gray-500">
                Selecciona los módulos a los que <strong className="text-brand-primary">{selectedUser.nombre || selectedUser.email}</strong> tendrá acceso.
              </p>
              
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 rounded-xl">
                {modulos.filter(m => m.activo !== false).map(m => {
                  const isSelected = selectedUser.modulos_id.includes(m.id);
                  return (
                    <label key={m.id} className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${isSelected ? 'bg-red-50/50 border-brand-primary shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => {
                            const newMods = e.target.checked 
                              ? [...selectedUser.modulos_id, m.id]
                              : selectedUser.modulos_id.filter(id => id !== m.id);
                            setSelectedUser({ ...selectedUser, modulos_id: newMods });
                          }}
                          className={`w-5 h-5 rounded border-2 appearance-none cursor-pointer transition-colors ${isSelected ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'}`}
                        />
                        {isSelected && (
                          <svg className="absolute w-3 h-3 text-white left-1 top-1 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-brand-primary' : 'text-text-strong'}`}>{m.nombre}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold transition-colors hover:bg-gray-200 border-none cursor-pointer" disabled={saving} onClick={() => setShowMatricula(false)}>
                  Cancelar
                </button>
                <button className="flex-[2] bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer disabled:opacity-50" disabled={saving} onClick={handleSaveMatricula}>
                  {saving ? 'Guardando...' : 'Guardar Matrícula'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
