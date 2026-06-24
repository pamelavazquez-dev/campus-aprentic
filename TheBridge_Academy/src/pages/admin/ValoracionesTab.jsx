import { useState, useEffect } from 'react';
import { getAllReviews } from '../../services/reviews.service';

export default function ValoracionesTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getAllReviews();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Cargando valoraciones...</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Resumen */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-2xl hover:border-brand-primary/30 border border-white/10 flex-1 flex flex-col items-center justify-center p-8 shadow-xl">
          <div style={{ fontSize: '64px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{averageRating}</div>
          <div style={{ fontSize: '24px', margin: '8px 0' }}>{'⭐'.repeat(Math.round(averageRating))}</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#B9C0CA' }}>Media Global de Satisfacción</div>
        </div>
        <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-2xl hover:border-brand-primary/30 border border-white/10 flex-1 flex flex-col items-center justify-center p-8 shadow-xl">
          <div style={{ fontSize: '64px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{reviews.length}</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#B9C0CA', marginTop: '16px' }}>Valoraciones Totales recibidas</div>
        </div>
      </div>

      {/* Lista de Reseñas */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: 'var(--text-strong)', fontWeight: 800 }}>Feedback Reciente</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {reviews.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)', gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '16px' }}>No hay valoraciones registradas aún.</p>
            </div>
          ) : (
            reviews.map((r, i) => (
              <div key={i} className="bg-surface backdrop-blur-lg border border-border-default rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--gray150)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                      U
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-strong)' }}>Alumno Anónimo</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(r.fecha).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', background: '#FFF9E6', padding: '4px 8px', borderRadius: '8px' }}>
                    {'⭐'.repeat(r.rating)}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-strong)', lineHeight: 1.5, background: 'var(--gray50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  "{r.comentario}"
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
