import { useState, useEffect } from 'react';
import { getAllInscripciones, updateInscripcion } from '../../services/inscripciones.service';
import PageHeader from '../../components/ui/PageHeader';

export default function InscripcionesView() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInscripciones = async () => {
    try {
      const data = await getAllInscripciones();
      setInscripciones(data);
    } catch (error) {
      console.error("Error cargando inscripciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const handleAceptar = async (inscripcion) => {
    try {
      await updateInscripcion(inscripcion.id, {
        ...inscripcion,
        aceptada: true
      });
      fetchInscripciones();
    } catch (error) {
      console.error("Error al aceptar inscripción:", error);
    }
  };

  if (loading) return <div>Cargando inscripciones...</div>;

  return (
    <div className="admin-inscripciones-view animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader 
        title="Inscripciones Recibidas"
        description="Gestiona las solicitudes de alumnos a los campus."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {inscripciones.length === 0 ? (
          <p>No hay inscripciones pendientes.</p>
        ) : (
          inscripciones.map((insc, i) => (
            <div key={insc.id || i} className="admin-inscripcion-card bg-surface backdrop-blur-lg border border-border-default rounded-xl p-8 shadow-sm transition-all duration-400 hover:-translate-y-[6px] hover:shadow-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="admin-inscripcion-user" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--gray100)', border: '2px solid var(--border-default)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', fontWeight: 'bold' }}>
                  {insc.nombre ? insc.nombre[0].toUpperCase() : 'U'}
                </div>
                <div className="admin-inscripcion-text">
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-strong)' }}>{insc.nombre} {insc.apellidos}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{insc.email} | DNI: {insc.dni}</div>
                </div>
              </div>
              <div className="admin-inscripcion-actions" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    background: insc.aceptada ? '#D1FAE5' : '#FEF3C7', 
                    color: insc.aceptada ? '#065F46' : '#92400E', 
                    padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' 
                  }}>
                    {insc.aceptada ? 'Aceptada' : 'Pendiente'}
                  </span>
                </div>
                {!insc.aceptada && (
                  <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleAceptar(insc)}>
                    Aceptar
                  </button>
                )}
                {insc.aceptada && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '6px 12px' }}>
                    Usuario gestionado
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
