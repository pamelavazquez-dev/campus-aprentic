import { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import CrearPromocionForm from '../components/forms/CrearPromocionForm';

export default function PromocionesView() {
  const { promociones, campuses, loading } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);

  const handlePromocionCreated = () => {
    setShowModal(false);
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
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Activa</span>
                        <span className="text-text-secondary text-sm font-semibold">
                          {promosEnCampus.length} promociones asignadas
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      Editar Sede
                    </button>
                    <button 
                      onClick={() => setShowModal(true)} 
                      className="px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-primary text-white hover:bg-red-600 transition-colors shadow-sm"
                    >
                      + Añadir Promoción
                    </button>
                  </div>
                </div>

                {/* Lista de Promociones */}
                <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                  <h4 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-4">Promociones Activas</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {promosEnCampus.map((promo) => (
                      <div key={promo.id} className="bg-white border border-border-default p-4 rounded-xl flex items-center justify-between group hover:border-brand-primary/30 transition-colors shadow-sm">
                        <div>
                          <div className="font-bold text-text-strong">{promo.nombre}</div>
                          <div className="text-xs text-text-secondary font-medium mt-0.5">
                            ID: {promo.id.substring(0, 8)}...
                          </div>
                        </div>
                        <button className="text-brand-primary bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                      </div>
                    ))}
                    
                    {promosEnCampus.length === 0 && (
                      <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-sm text-text-secondary font-medium">Esta sede no tiene promociones activas.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CrearPromocionForm 
          onClose={() => setShowModal(false)} 
          onCreated={handlePromocionCreated} 
        />
      )}
    </div>
  );
}
