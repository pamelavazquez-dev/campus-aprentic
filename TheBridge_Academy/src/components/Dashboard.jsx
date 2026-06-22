import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { getAllPromociones } from '../services/promociones.service';

export default function Dashboard({ user }) {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllPromociones();
        setPromociones(data);
      } catch (error) {
        console.error("Error obteniendo promociones", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <svg className="icon" style={{ width: '40px', height: '40px' }} role="presentation">
            <use href="/icons.svg#discord-icon"></use>
          </svg>
          <div>
            <h2 style={{ marginBottom: 0 }}>AprenTIC Dashboard</h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Admin: {user.email}</p>
          </div>
        </div>
        <button onClick={() => signOut(auth)} className="btn-danger">
          Cerrar Sesión
        </button>
      </header>

      <h3 style={{ marginBottom: '1.5rem' }}>Cursos Activos</h3>
      
      {loading ? (
        <p>Conectando con Firebase Firestore...</p>
      ) : (
        <div className="grid">
          {promociones.map(promo => (
            <div key={promo.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{promo.nombre}</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <svg className="icon" style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '5px' }}>
                  <use href="/icons.svg#social-icon"></use>
                </svg>
                {promo.campus} | 📅 {new Date(promo.fechaInicio).toLocaleDateString()}
              </p>
              <div style={{ display: 'inline-block', padding: '6px 14px', background: 'var(--brand-soft, #FFE5E8)', border: '1px solid var(--brand-primary)', borderRadius: 'var(--radius-pill, 999px)', fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: '700' }}>
                {promo.estado ? promo.estado.toUpperCase() : 'ACTIVO'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
