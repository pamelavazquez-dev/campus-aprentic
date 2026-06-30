import { useState, useContext, useEffect, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { useUsuarios } from '../hooks/useUsuarios';
import PageHeader from '../components/ui/PageHeader';
import { createDoc, updateDoc } from '../services/base.service';
import { doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Avatar from '../components/ui/Avatar';
import Select from '../components/ui/Select';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ui/ConfirmModal';
import { createAuthUserWithInitialPassword } from '../services/auth-admin.service';

export default function UsuariosView() {
  const { campuses, modulos } = useContext(DataContext);
  const [filterRol, setFilterRol] = useState('Alumno');
  const [filterCampus, setFilterCampus] = useState('');
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useUsuarios(filterRol, filterCampus);
  const usuarios = data?.pages.flatMap(page => page.docs) || [];
  const [searchName, setSearchName] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [step, setStep] = useState(1);
  const [usuario, setUsuario] = useState({ nombre: '', email: '', rol: 'Instructor', campus_id: '' });
  const [saving, setSaving] = useState(false);
  const [showMatricula, setShowMatricula] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const usuariosFiltrados = useMemo(() => {
    const search = searchName.trim().toLowerCase();
    if (!search) return usuarios;

    return usuarios.filter((userItem) => (
      (userItem.nombre || '').toLowerCase().includes(search)
    ));
  }, [searchName, usuarios]);

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
      const { uid, initialPassword } = await createAuthUserWithInitialPassword({
        nombre: usuario.nombre,
        email: usuario.email,
      });
      
      let collectionName = 'alumnos';
      if (usuario.rol === 'Instructor') collectionName = 'profesores';
      if (usuario.rol === 'Administrador') collectionName = 'admin';

      await createDoc(collectionName, uid, {
        nombre: usuario.nombre,
        email: usuario.email,
        campus_id: doc(db, 'campus', usuario.campus_id),
        avatar: '',
        promociones_id: [],
        modulos_id: [],
        isActive: true,
        initialPasswordChangeRequired: true,
      });
      
      setCreatedCredentials({
        email: usuario.email,
        password: initialPassword,
      });
      toast.success('Usuario creado correctamente.');
      setStep(1);
      setUsuario({ nombre: '', email: '', rol: 'Instructor', campus_id: campuses[0]?.id || '' });
      setShowWizard(false);
    } catch (error) {
      console.error("Error al crear usuario", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Ese email ya existe en Firebase Auth.');
      } else {
        toast.error(error.message || 'Error al crear el usuario.');
      }
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
      toast.success("Matrícula actualizada.");
    } catch (e) {
      console.error(e);
      toast.error("Error actualizando matrícula.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!userToToggle) return;
    setSaving(userToToggle.id);
    try {
      const collectionName = userToToggle._collection || 'alumnos';
      await updateDoc(collectionName, userToToggle.id, { isActive: !userToToggle.isActive });
      toast.success(`Usuario ${!userToToggle.isActive ? 'activado' : 'inactivado'} correctamente`);
      refetch(); // Ensure React Query fetches new state
    } catch (error) {
      console.error(error);
      toast.error('Error al cambiar el estado del usuario');
    } finally {
      setSaving(false);
      setUserToToggle(null);
    }
  };

  const handleOpenEdit = (u) => {
    setUsuario({
      id: u.id,
      nombre: u.nombre || '',
      email: u.email || '',
      rol: u.rol || 'Alumno',
      campus_id: u.campus_id?.id || u.campus_id || campuses[0]?.id || '',
      _collection: u._collection || 'alumnos'
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    try {
      // Use the _collection field to always write to the correct Firestore collection
      const collectionName = usuario._collection || 'alumnos';

      await updateDoc(collectionName, usuario.id, {
        nombre: usuario.nombre,
        campus_id: doc(db, 'campus', usuario.campus_id),
      });
      toast.success('Usuario actualizado correctamente');
      setShowEditModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      <span className="text-gray-500 font-bold tracking-wide">Cargando directorio...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="animate-fade-in">
        <PageHeader
          eyebrow="Admin"
          title="Directorio de Usuarios"
          description="Gestiona todo el personal, instructores y alumnos de la academia."
          actions={(
            <button className="bg-surface-solid text-brand-primary py-3 px-6 rounded-xl text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-[0_8px_16px_rgba(0,0,0,0.1)] inline-flex items-center justify-center gap-2 border-none cursor-pointer" type="button" onClick={() => setShowWizard(true)}>
              + Nuevo Usuario
            </button>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-8 bg-surface backdrop-blur-md border border-gray-200/60 rounded-2xl p-4 shadow-sm relative z-20">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Buscar por Nombre</label>
            <input
              className="w-full px-4 py-2.5 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-brand-primary/50"
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
              placeholder="Ej: Laura Ruiz"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Filtrar por Rol</label>
            <Select 
              value={filterRol} 
              onChange={setFilterRol} 
              options={[
                { value: 'Alumno', label: 'Alumno' },
                { value: 'Instructor', label: 'Instructor' },
                { value: 'Administrador', label: 'Administrador' }
              ]}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Filtrar por Campus</label>
            <Select 
              value={filterCampus} 
              onChange={setFilterCampus} 
              placeholder="Todos los campus"
              options={[
                { value: '', label: 'Todos los campus' },
                ...campuses.map(c => ({ value: c.id, label: c.nombre || c.id }))
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-6">
          {usuariosFiltrados.length === 0 ? (
            <div className="py-20 text-center bg-surface backdrop-blur-md rounded-3xl border border-gray-200/60 shadow-sm">
              <div className="w-16 h-16 bg-surface-solid rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-bold text-lg m-0">No hay usuarios que coincidan con la busqueda.</p>
            </div>
          ) : (
            <>
            {usuariosFiltrados.map((u, i) => (
              <div key={u.id || i} className="bg-surface backdrop-blur-xl border border-gray-200/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
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
                    <button 
                      className="bg-surface-solid text-gray-600 border border-border-default hover:border-brand-primary/50 hover:bg-surface py-2.5 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm"
                      onClick={() => handleOpenEdit(u)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-4 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 border shadow-sm ${u.isActive ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-500 hover:text-white hover:border-green-500' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500'}`}
                      onClick={() => setUserToToggle(u)}
                      disabled={saving === u.id}
                      title={u.isActive ? "Haz clic para inactivar al usuario" : "Haz clic para reactivar al usuario"}
                    >
                      <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {saving === u.id ? '...' : u.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {hasNextPage && (
              <div className="flex justify-center mt-6">
                <button 
                  className="bg-surface-solid border-2 border-gray-200 text-brand-primary py-3 px-8 rounded-xl text-sm font-bold transition-all hover:bg-brand-primary/5 hover:border-brand-primary/30 cursor-pointer shadow-sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Cargando más...' : 'Cargar más usuarios'}
                </button>
              </div>
            )}
            </>
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-300 ${isActive ? (isCurrent ? 'bg-brand-primary border-brand-primary text-white shadow-md' : 'bg-surface-solid border-brand-primary text-brand-primary') : 'bg-surface-solid border-gray-200 text-gray-400'}`}>
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
                    <input className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300" value={usuario.nombre} onChange={e => setUsuario({...usuario, nombre: e.target.value})} placeholder="Ej: Laura Ruiz" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-text-strong">Email corporativo</label>
                    <input className="w-full px-4 py-3 bg-surface-solid border border-gray-200 rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-gray-300" type="email" value={usuario.email} onChange={e => setUsuario({...usuario, email: e.target.value})} placeholder="l.ruiz@academy.com" />
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                    <button className="flex-1 bg-surface-solid border-2 border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 cursor-pointer shadow-sm" onClick={() => { setShowWizard(false); setStep(1); }}>Cancelar</button>
                    <button className="flex-1 bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer" onClick={() => setStep(2)}>
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5 animate-fadeSlideDown">
                  <div className="flex flex-col gap-2 relative z-50">
                    <label className="text-sm font-bold text-text-strong">Rol en la Plataforma</label>
                    <Select 
                      value={usuario.rol} 
                      onChange={val => setUsuario({...usuario, rol: val})}
                      options={[
                        { value: 'Alumno', label: 'Alumno' },
                        { value: 'Instructor', label: 'Instructor' },
                        { value: 'Administrador', label: 'Administrador' }
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative z-40">
                    <label className="text-sm font-bold text-text-strong">Campus (Opcional)</label>
                    <Select 
                      value={usuario.campus_id} 
                      onChange={val => setUsuario({...usuario, campus_id: val})}
                      placeholder="Seleccionar campus"
                      options={[
                        { value: '', label: 'Seleccionar campus' },
                        ...campuses.map(c => ({ value: c.id, label: c.nombre || c.id }))
                      ]}
                    />
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                    <button className="flex-1 bg-surface-solid border-2 border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 cursor-pointer shadow-sm" onClick={() => setStep(1)}>Atrás</button>
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
                    <button className="flex-1 bg-surface-solid border-2 border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 cursor-pointer shadow-sm" disabled={saving} onClick={() => setStep(2)}>Atrás</button>
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

      {createdCredentials && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border-default rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-border-default bg-gray-50/50">
              <h3 className="m-0 text-xl font-black text-text-strong">Usuario creado</h3>
              <p className="m-0 mt-2 text-sm font-semibold text-text-secondary">
                Entrega estas credenciales iniciales al usuario.
              </p>
            </div>
            <div className="p-8 flex flex-col gap-4">
              <div className="bg-surface-solid border border-border-default rounded-xl p-4">
                <span className="block text-xs font-black uppercase text-text-secondary mb-1">Email</span>
                <strong className="text-text-strong break-all">{createdCredentials.email}</strong>
              </div>
              <div className="bg-surface-solid border border-border-default rounded-xl p-4">
                <span className="block text-xs font-black uppercase text-text-secondary mb-1">Contraseña inicial</span>
                <strong className="text-brand-primary text-lg">{createdCredentials.password}</strong>
              </div>
              <p className="m-0 text-sm font-semibold text-text-secondary">
                Al iniciar sesión por primera vez, la plataforma le pedirá cambiar esta contraseña.
              </p>
              <button
                type="button"
                className="bg-brand-gradient text-white py-3 px-6 rounded-xl text-sm font-black transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer"
                onClick={() => setCreatedCredentials(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {showMatricula && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border-default rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-400 overflow-hidden">
            <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
              <h3 className="m-0 text-xl font-black text-text-strong">Matricular Alumno</h3>
              <button className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:bg-danger/10 hover:text-brand-primary transition-colors border-none cursor-pointer" onClick={() => setShowMatricula(false)}>✕</button>
            </div>
            
            <div className="p-8 flex flex-col gap-6">
              <p className="m-0 text-sm font-medium text-text-secondary">
                Selecciona los módulos a los que <strong className="text-brand-primary">{selectedUser.nombre || selectedUser.email}</strong> tendrá acceso.
              </p>
              
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 rounded-xl">
                {modulos.filter(m => m.activo !== false).map(m => {
                  const isSelected = selectedUser.modulos_id.includes(m.id);
                  return (
                    <label key={m.id} className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${isSelected ? 'bg-danger/5 border-brand-primary shadow-sm' : 'bg-surface-solid border-border-default hover:border-gray-300'}`}>
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
                          className={`w-5 h-5 rounded border-2 appearance-none cursor-pointer transition-colors ${isSelected ? 'bg-brand-primary border-brand-primary' : 'bg-surface-solid border-border-default'}`}
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

              <div className="flex gap-3 pt-4 border-t border-border-default">
                <button className="flex-1 bg-surface text-text-secondary py-3 rounded-xl text-sm font-bold transition-colors hover:bg-gray-200 border-none cursor-pointer" disabled={saving} onClick={() => setShowMatricula(false)}>
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

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="bg-surface border border-border-default rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-400 overflow-hidden">
            <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
              <h3 className="m-0 text-xl font-black text-text-strong">Editar Usuario</h3>
              <button className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:bg-danger/10 hover:text-brand-primary transition-colors border-none cursor-pointer" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="p-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-strong">Nombre Completo</label>
                <input className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" value={usuario.nombre} onChange={e => setUsuario({...usuario, nombre: e.target.value})} placeholder="Ej: Laura Ruiz" />
              </div>
              <div className="flex flex-col gap-2 relative z-40">
                <label className="text-sm font-bold text-text-strong">Email corporativo</label>
                <input className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none opacity-60 cursor-not-allowed" type="email" value={usuario.email} disabled title="El email no se puede editar" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-strong">Rol</label>
                <input className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none opacity-60 cursor-not-allowed" value={usuario.rol} disabled title="El rol no se puede cambiar. Inactiva el usuario y crea uno nuevo." />
              </div>
              <div className="flex flex-col gap-2 relative z-40">
                <label className="text-sm font-bold text-text-strong">Campus Asignado</label>
                <Select 
                  value={usuario.campus_id} 
                  onChange={val => setUsuario({...usuario, campus_id: val})}
                  placeholder="Seleccionar campus"
                  options={[
                    { value: '', label: 'Seleccionar campus' },
                    ...campuses.map(c => ({ value: c.id, label: c.nombre || c.id }))
                  ]}
                />
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border-default">
                <button className="flex-1 bg-surface-solid border-2 border-border-default text-text-secondary py-3 rounded-xl text-sm font-bold transition-all hover:bg-surface hover:text-text-strong cursor-pointer shadow-sm" onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button className="flex-1 bg-brand-gradient text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 border-none cursor-pointer disabled:opacity-50" disabled={saving} onClick={handleUpdateUser}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!userToToggle}
        title={userToToggle?.isActive ? "Inactivar Usuario" : "Activar Usuario"}
        message={userToToggle?.isActive 
          ? `¿Estás seguro de que deseas inactivar a ${userToToggle?.nombre || userToToggle?.email}? Perderá el acceso a la plataforma inmediatamente.`
          : `¿Estás seguro de que deseas reactivar a ${userToToggle?.nombre || userToToggle?.email}? Volverá a tener acceso a sus recursos.`
        }
        confirmText={userToToggle?.isActive ? "Sí, Inactivar" : "Sí, Activar"}
        cancelText="Cancelar"
        onConfirm={handleToggleUserStatus}
        onCancel={() => setUserToToggle(null)}
        isDanger={userToToggle?.isActive}
      />
    </div>
  );
}
