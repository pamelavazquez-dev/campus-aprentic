import { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import CrearPromocionForm from '../components/forms/CrearPromocionForm';

export default function PromocionesView() {
  const { promociones, loading } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);

  // handlePromocionCreated no es estrictamente necesario con onSnapshot, 
  // pero lo dejamos por si la UI lo invoca, aunque no actualizamos estado local
  const handlePromocionCreated = () => {
    setShowModal(false);
  };

  // En una app real los campus tendrían su propia tabla, aquí los extraemos de las promociones
  const campusUnicos = [...new Set(promociones.map(p => p.campus || 'Sede Central'))];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl relative overflow-hidden border border-white/10" style={{ padding: '32px 48px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', color: 'white' }}>Directorio de Campus</h2>
        <p style={{ margin: 0, color: '#B9C0CA', fontSize: '16px' }}>Administra las sedes físicas y sus promociones activas.</p>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>Cargando directorio...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {campusUnicos.length === 0 && <p>No hay sedes registradas.</p>}
          
          {campusUnicos.map((campus, index) => {
            const promosEnCampus = promociones.filter(p => (p.campus || 'Sede Central') === campus);
            
            return (
              <div key={index} style={{ background: '#FFE5E8', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--brand-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg className="icon" style={{ width: '40px', height: '40px', fill: 'white' }}><use href="/icons.svg#social-icon"></use></svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-strong)', margin: '0 0 4px 0' }}>{campus}</h3>
                      <p style={{ margin: 0, fontWeight: 900, color: 'var(--brand-primary)' }}>(Activa)</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 700, color: '#343943' }}>
                        Promociones activas: {promosEnCampus.length}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: '#FFD1D6', color: 'var(--brand-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                      Editar Sede
                    </button>
                    <button onClick={() => setShowModal(true)} style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                      + Añadir Promo
                    </button>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-strong)' }}>Promociones</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {promosEnCampus.map((promo, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-default)', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-strong)' }}>
                          {promo.nombre}
                        </div>
                        <button style={{ background: '#FFE5E8', color: '#a66b00', border: 'none', padding: '6px 16px', borderRadius: '12px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
                          Editar
                        </button>
                      </div>
                    ))}
                    {promosEnCampus.length === 0 && <p style={{ fontSize: '14px' }}>Sin promociones asignadas.</p>}
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
