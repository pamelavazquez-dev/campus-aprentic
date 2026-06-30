import { useState, useEffect, useContext } from 'react';
import { getAllInscripciones, updateInscripcion, deleteInscripcion } from '../../services/inscripciones.service';
import { createDoc } from '../../services/base.service';
import { doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createAuthUser, generateDefaultPassword } from '../../utils/auth.utils';
import { DataContext } from '../../context/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Select from '../../components/ui/Select';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export default function SolicitudesView() {
  const { campuses, promociones } = useContext(DataContext);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inscripcionToDelete, setInscripcionToDelete] = useState(null);
  const [selectedInscripcion, setSelectedInscripcion] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 20;

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const fetchInscripciones = async () => {
    try {
      const data = await getAllInscripciones();
      const sorted = data.sort((a, b) => {
        if (!a.creadoEn) return 1;
        if (!b.creadoEn) return -1;
        return new Date(b.creadoEn) - new Date(a.creadoEn);
      });
      setInscripciones(sorted);
    } catch (error) {
      console.error("Error cargando inscripciones:", error);
      toast.error('Error al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const handleStatusChange = async (insc, isAccepted) => {
    try {
      await updateInscripcion(insc.id, { ...insc, aceptada: isAccepted });
      
      if (isAccepted) {
        const generatedPassword = generateDefaultPassword(insc.nombre || '', insc.apellidos || '');

        let authUid = null;
        try {
          authUid = await createAuthUser(insc.email, generatedPassword);
        } catch (authError) {
          console.error("Error creating auth user:", authError);
        }

        const newId = authUid || `USR-${Date.now()}`;

        await createDoc('alumnos', newId, {
          nombre: `${insc.nombre || ''} ${insc.apellidos || ''}`.trim(),
          email: insc.email,
          campus_id: insc.campus_id ? doc(db, 'campus', typeof insc.campus_id === 'string' ? insc.campus_id : insc.campus_id.id) : null,
          promociones_id: insc.promocion_id ? [typeof insc.promocion_id === 'string' ? insc.promocion_id : insc.promocion_id.id] : [],
          avatar: '',
          modulos_id: [],
          password: generatedPassword,
          isActive: true
        });
      }

      toast.success(isAccepted ? 'Solicitud aprobada y alumno creado correctamente' : 'Estado actualizado correctamente');
      setInscripciones(prev => prev.map(s => s.id === insc.id ? { ...s, aceptada: isAccepted } : s));
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDelete = async () => {
    if (!inscripcionToDelete) return;
    try {
      await deleteInscripcion(inscripcionToDelete.id);
      toast.success('Inscripción eliminada de forma segura');
      setInscripciones(prev => prev.filter(s => s.id !== inscripcionToDelete.id));
    } catch (error) {
      toast.error('Error al eliminar la inscripción');
    } finally {
      setInscripcionToDelete(null);
    }
  };

  const filteredInscripciones = inscripciones.filter(insc => {
    const searchString = `${insc.nombre || ''} ${insc.apellidos || ''} ${insc.email || ''} ${insc.dni || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      
    const matchesStatus = !insc.aceptada; // ONLY PENDING

    return matchesSearch && matchesStatus;
  });

  const visibleInscripciones = filteredInscripciones.slice(0, page * limit);
  const hasMore = visibleInscripciones.length < filteredInscripciones.length;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="animate-fade-in">
        <PageHeader 
          eyebrow="Admin"
          title="Solicitudes Pendientes"
          description="Gestiona las solicitudes de acceso al campus pendientes de revisión."
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nombre, email o DNI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-white/60 backdrop-blur-xl focus:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-gray-700 placeholder-gray-400 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
            <span className="text-gray-500 font-bold tracking-wide">Cargando solicitudes...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-5 mt-8">
            {visibleInscripciones.length === 0 ? (
              <div className="py-20 text-center bg-surface backdrop-blur-md rounded-3xl border border-gray-200/60 shadow-sm">
                <div className="w-16 h-16 bg-surface-solid rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-bold text-lg m-0">
                  {inscripciones.length === 0 ? "No hay solicitudes pendientes en el sistema." : "No se encontraron solicitudes con estos filtros."}
                </p>
              </div>
            ) : (
              visibleInscripciones.map((insc, i) => (
                <div 
                  key={insc.id || i} 
                  style={{ zIndex: visibleInscripciones.length - i }}
                  className="bg-surface backdrop-blur-xl border border-gray-200/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col lg:flex-row items-center gap-6 relative group cursor-pointer"
                  onClick={() => setSelectedInscripcion(insc)}
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-3xl"></div>
                  
                  <div className="shrink-0 hidden sm:block">
                    <Avatar name={insc.nombre || insc.email} size="2xl" rounded="rounded-2xl" className="shadow-lg shadow-brand-primary/20 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300" />
                  </div>

                  <div className="flex-1 flex flex-col gap-2 w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="m-0 text-xl font-black text-text-strong group-hover:text-brand-primary transition-colors">
                        {insc.nombre} {insc.apellidos}
                      </h3>
                      <span className={`self-center sm:self-auto px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${insc.aceptada ? 'bg-green-100 text-green-700' : 'bg-brand-primary/10 text-brand-primary'}`}>
                        {insc.aceptada ? 'Aceptada' : 'Pendiente'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {insc.email}
                      </span>
                      {insc.dni && (
                        <>
                          <span className="text-gray-300 hidden sm:inline">•</span>
                          <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                            {insc.dni}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {insc.observaciones && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mt-1 border border-gray-100 italic text-left">
                        {insc.observaciones}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 justify-center" onClick={(e) => e.stopPropagation()}>
                    <div className="w-32 shrink-0">
                      <Select 
                        value={insc.aceptada ? 'aprobada' : 'pendiente'}
                        onChange={(value) => handleStatusChange(insc, value === 'aprobada')}
                        options={[
                          { value: 'pendiente', label: 'Pendiente' },
                          { value: 'aprobada', label: 'Aprobada' }
                        ]}
                      />
                    </div>
                    
                    <button 
                      onClick={() => setInscripcionToDelete(insc)}
                      className="p-2.5 text-danger hover:bg-danger/10 rounded-xl transition-colors border border-transparent cursor-pointer"
                      title="Eliminar inscripción"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}

            {hasMore && (
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  className="bg-surface-solid border-2 border-gray-200 text-brand-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all cursor-pointer shadow-sm"
                >
                  Cargar más resultados
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedInscripcion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedInscripcion(null); }}>
          <div className="bg-surface border border-border-default rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-400 overflow-hidden relative">
            <div className="px-8 py-6 border-b border-border-default bg-gray-50/50 flex justify-between items-center">
              <h3 className="m-0 text-xl font-black text-text-strong">Detalles de la Solicitud</h3>
              <button className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:bg-danger/10 hover:text-brand-primary transition-colors border-none cursor-pointer" onClick={() => setSelectedInscripcion(null)}>✕</button>
            </div>
            <div className="p-8 flex flex-col gap-5">
              <div className="flex items-center gap-4 mb-2">
                <Avatar name={selectedInscripcion.nombre || selectedInscripcion.email} size="xl" rounded="rounded-2xl" />
                <div>
                  <h4 className="m-0 text-lg font-black text-text-strong">{selectedInscripcion.nombre} {selectedInscripcion.apellidos}</h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedInscripcion.aceptada ? 'bg-green-100 text-green-700' : 'bg-brand-primary/10 text-brand-primary'}`}>
                    {selectedInscripcion.aceptada ? 'Aceptada' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                  <span className="text-sm font-black text-text-strong">{selectedInscripcion.email || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">DNI/NIE</span>
                  <span className="text-sm font-black text-text-strong">{selectedInscripcion.dni || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Campus</span>
                  <span className="text-sm font-black text-text-strong">{campuses?.find(c => c.id === selectedInscripcion.campus_id || c.id === selectedInscripcion.campus_id?.id)?.nombre || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase">Promoción</span>
                  <span className="text-sm font-black text-text-strong">{promociones?.find(p => p.id === selectedInscripcion.promocion_id || p.id === selectedInscripcion.promocion_id?.id)?.nombre || '-'}</span>
                </div>
              </div>
              
              {selectedInscripcion.observaciones && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Motivo y Mensaje</span>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl m-0 border border-gray-100">
                    {selectedInscripcion.observaciones}
                  </p>
                </div>
              )}
              
              {selectedInscripcion.creadoEn && (
                <div className="text-center mt-2">
                  <span className="text-xs font-medium text-gray-400">
                    Solicitud recibida el {new Date(selectedInscripcion.creadoEn).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!inscripcionToDelete}
        title="Eliminar Inscripción"
        message={`¿Estás seguro de que deseas eliminar la solicitud de ${inscripcionToDelete?.nombre || inscripcionToDelete?.email}? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setInscripcionToDelete(null)}
        isDanger={true}
      />
    </div>
  );
}
