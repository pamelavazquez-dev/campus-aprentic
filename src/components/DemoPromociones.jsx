import { useState, useEffect } from 'react';
import { getAllPromociones } from '../services/promociones.service';

export default function DemoPromociones() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllPromociones();
        setPromociones(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error de conexión con Firebase. Mostrando datos simulados para la demo.");
        // Fallback a datos simulados
        setPromociones([
          { id: '1', nombre: 'Bootcamp FullStack', fechaInicio: '2026-09-01', campus: 'Sevilla' },
          { id: '2', nombre: 'Data Science PT', fechaInicio: '2026-10-15', campus: 'Madrid' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Cargando promociones desde Firebase...</p>;
  if (error) return <div style={{color: 'red', padding: '1rem', border: '1px solid red', borderRadius: '4px'}}>{error}</div>;

  return (
    <div style={{ textAlign: 'left', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px', marginTop: '20px' }}>
      <h2>📚 Demo: Cursos (Promociones) en Base de Datos</h2>
      
      {promociones.length === 0 ? (
        <p>Conexión exitosa, pero no hay promociones en la colección.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {promociones.map(promo => (
            <li key={promo.id} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #333', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#646cff' }}>
                {promo.nombre || `Promoción ID: ${promo.id}`}
              </h3>
              <pre style={{ fontSize: '12px', overflowX: 'auto', color: '#aaa' }}>
                {JSON.stringify(promo, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
