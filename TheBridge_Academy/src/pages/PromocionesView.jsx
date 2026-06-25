import { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import CrearPromocionForm from '../components/forms/CrearPromocionForm';
import EditarCampusForm from '../components/forms/EditarCampusForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import { deletePromocion, updatePromocion } from '../services/promociones.service';
import toast from 'react-hot-toast';

export default function PromocionesView() {
  const { promociones, campuses, loading } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);
  const [promoToEdit, setPromoToEdit] = useState(null);
  const [campusToEdit, setCampusToEdit] = useState(null);
  const [selectedCampusForModal, setSelectedCampusForModal] = useState(null);
  const [promoToDeactivate, setPromoToDeactivate] = useState(null);

  const handlePromocionCreated = () => {
    setShowModal(false);
    setPromoToEdit(null);
  };

  const handleEdit = (promo) => {
    setPromoToEdit(promo);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta promoción de forma permanente?")) {
      try {
        await deletePromocion(id);
        toast.success("Promoción eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar promoción:", error);
        toast.error("Hubo un error al eliminar la promoción");
      }
    }
  };

  const handleToggleEstadoClick = (promo) => {
    if (promo.estado === 'activa') {
      setPromoToDeactivate(promo);
    } else {
      executeToggleEstado(promo);
    }
  };

  const executeToggleEstado = async (promo) => {
    const nuevoEstado = promo.estado === 'completada' ? 'activa' : 'completada';
    try {
      await updatePromocion(promo.id, { ...promo, estado: nuevoEstado });
      toast.success(`Promoción ${nuevoEstado === 'completada' ? 'desactivada' : 'activada'} correctamente`);
      setPromoToDeactivate(null);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error al actualizar el estado de la promoción");
    }
  };

  // Helper para sacar el ID seguro del campus desde la promoción
  const getCampusId = (promo) => {
    let cid = promo.campus_id;
    if (!cid) return 'unassigned';
    if (typeof cid === 'object') {
       return cid.id || (cid.path ? cid.path.split('/').pop() : 'unassigned');
    }
    return String(cid);
  };

  return (
    <div className="animate-fade-in flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-surface to-brand-primary/10 rounded-3xl p-8 lg:p-10 border border-border-default shadow-sm relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl lg:text-4xl font-black text-text-strong tracking-tight mb-2">Directorio de Campus</h2>
          <p className="text-text-secondary text-lg font-medium max-w-2xl">
            Administra las sedes físicas, especialidades y sus promociones activas.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <h2 className="animate-pulse text-xl font-bold text-text-secondary">Cargando sedes...</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {campuses.length === 0 && (
            <div className="bg-surface border border-border-default rounded-2xl p-12 text-center">
              <p className="text-text-secondary font-medium">No hay sedes registradas en la base de datos.</p>
            </div>
          )}
          
          {campuses.map((campus) => {
            const promosEnCampus = promociones.filter(p => getCampusId(p) === campus.id);
            
            return (
              <div key={campus.id} className="bg-surface border border-border-default rounded-2xl p-6 lg:p-8 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary/60 flex items-center justify-center shadow-lg text-white font-black text-2xl">
                      {campus.sede ? campus.sede.charAt(0) : 'S'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-text-strong leading-tight">
                        {campus.nombre || 'Campus sin nombre'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-text-secondary text-sm font-semibold">
                          {promosEnCampus.length} promociones asignadas
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setCampusToEdit(campus)}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-solid border border-border-default text-text-secondary hover:bg-surface hover:text-text-strong transition-colors shadow-sm"
                    >
                      Editar Sede
                    </button>
                    <button 
                      onClick={() => { setPromoToEdit({ campus_id: campus.id }); setShowModal(true); }} 
                      className="px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-primary text-white hover:bg-red-600 transition-colors shadow-sm"
                    >
                      + Añadir Promoción
                    </button>
                  </div>
                </div>

                {/* Botón para abrir vista de Promociones */}
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setSelectedCampusForModal(campus)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <span>Gestionar Promociones</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">{promosEnCampus.length}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CrearPromocionForm 
          onClose={() => { setShowModal(false); setPromoToEdit(null); }} 
          onCreated={handlePromocionCreated}
          initialData={promoToEdit}
        />
      )}

      {campusToEdit && (
        <EditarCampusForm 
          onClose={() => setCampusToEdit(null)}
          onUpdated={() => {
            // Ideally, we'd update the specific campus in context, but setting it to null closes modal.
            // DataContext might have a refresh function, but for now we rely on the realtime listener or manually reload.
            // If the listener in DataContext is active, it updates automatically.
            setCampusToEdit(null);
            toast.success("Sede actualizada correctamente");
          }}
          initialData={campusToEdit}
        />
      )}

      {selectedCampusForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border-default rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transform transition-all duration-400">
            <div className="px-8 py-6 border-b border-border-default bg-surface-solid flex justify-between items-center">
              <div>
                <h3 className="m-0 text-text-strong font-black text-2xl mb-1">
                  Promociones - {selectedCampusForModal.nombre || 'Sede'}
                </h3>
                <p className="text-text-secondary text-sm font-medium">
                  Gestiona las promociones específicas de esta sede.
                </p>
              </div>
              <button 
                className="bg-gray150 text-text-strong border-none cursor-pointer p-2 rounded-full w-10 h-10 flex justify-center items-center transition-all duration-300 hover:bg-[#FFE5E8] hover:text-brand-primary hover:rotate-90" 
                onClick={() => setSelectedCampusForModal(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-surface">
              {(() => {
                const promosEnCampus = promociones.filter(p => getCampusId(p) === selectedCampusForModal.id);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {promosEnCampus.map((promo) => (
                      <div key={promo.id} className={`bg-surface-solid border border-border-default p-5 rounded-2xl flex flex-col group hover:border-brand-primary/30 transition-all duration-300 shadow-sm hover:shadow-md ${promo.estado === 'completada' ? 'opacity-60 grayscale-[30%]' : ''}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-black text-text-strong text-lg mb-1">{promo.nombre}</div>
                            <div className="text-xs text-text-secondary font-medium">
                              ID: {promo.id.substring(0, 8)}...
                            </div>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${promo.estado === 'completada' ? 'bg-gray200 text-text-secondary' : 'bg-green-100 text-green-700'}`}>
                            {promo.estado === 'completada' ? 'Inactiva' : 'Activa'}
                          </span>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-border-default flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleToggleEstadoClick(promo)}
                            className={`${promo.estado === 'completada' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'} p-2 rounded-xl transition-colors cursor-pointer border-none flex-1 flex justify-center`}
                            title={promo.estado === 'completada' ? "Reactivar Promoción" : "Desactivar Promoción"}
                          >
                            {promo.estado === 'completada' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            )}
                          </button>
                          <button 
                            onClick={() => handleEdit(promo)}
                            className="text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 p-2 rounded-xl transition-colors cursor-pointer border-none flex-1 flex justify-center"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(promo.id)}
                            className="text-danger bg-danger/10 hover:bg-danger/20 p-2 rounded-xl transition-colors cursor-pointer border-none flex-1 flex justify-center"
                            title="Eliminar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {promosEnCampus.length === 0 && (
                      <div className="col-span-full py-16 text-center border-2 border-dashed border-border-default rounded-2xl bg-surface-solid/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </div>
                        <h4 className="text-lg font-bold text-text-strong mb-1">Sin promociones</h4>
                        <p className="text-sm text-text-secondary font-medium max-w-sm mx-auto">Esta sede aún no tiene promociones activas. Puedes añadir una desde el panel principal.</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!promoToDeactivate}
        title="¿Desactivar Promoción?"
        message={`Estás a punto de marcar la promoción "${promoToDeactivate?.nombre}" como completada/inactiva. Si tiene fecha de fin guardada, los alumnos perderán el acceso a la plataforma de esta promoción.`}
        confirmText="Desactivar"
        onConfirm={() => executeToggleEstado(promoToDeactivate)}
        onCancel={() => setPromoToDeactivate(null)}
        isDanger={true}
      />
    </div>
  );
}
