import { useState, useEffect } from 'react';
import { getAllPromociones } from '../services/promociones.service';
import CrearPromocionForm from '../components/forms/CrearPromocionForm';

export default function PromocionesView() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPromociones();
      setPromociones(data);
    } catch (error) {
      console.error("Error obteniendo promociones", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromocionCreated = (nuevaPromo) => {
    // Añadimos la nueva promo a la tabla localmente o recargamos todo
    setPromociones(prev => [...prev, nuevaPromo]);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Gestión de Promociones</h2>
          <p style={{ margin: 0 }}>Listado y control de todos los cursos (Bootcamps) activos.</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
          + Nueva Promoción
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Cargando base de datos...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Campus</th>
                <th>Fecha Inicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {promociones.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No hay promociones registradas.</td>
                </tr>
              ) : (
                promociones.map(promo => (
                  <tr key={promo.id}>
                    <td style={{ fontWeight: 600 }}>{promo.id.substring(0, 15)}</td>
                    <td>{promo.nombre}</td>
                    <td>{promo.campus}</td>
                    <td>{promo.formatoFechaCorta}</td>
                    <td>
                      <span style={{ 
                        background: 'var(--brand-soft)', 
                        color: 'var(--brand-primary)', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {promo.estado ? promo.estado.toUpperCase() : 'ACTIVO'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <CrearPromocionForm 
          onClose={() => setShowModal(false)} 
          onCreated={handlePromocionCreated} 
        />
      )}
    </div>
  );
}
