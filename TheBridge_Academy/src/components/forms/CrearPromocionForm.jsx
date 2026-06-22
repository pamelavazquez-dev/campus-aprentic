import { useState } from 'react';
import { createPromocion } from '../../services/promociones.service';

export default function CrearPromocionForm({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    campus: 'Madrid',
    fechaInicio: '',
    estado: 'activa'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Usamos el propio nombre o un ID genérico como ID de documento,
      // pero Firebase recomienda dejar que genere el ID automáticamente si le pasamos null o no lo especificamos.
      // Nuestro servicio createDoc espera (collection, id, data). Si id no se usa o es null, setDoc fallaría, 
      // así que usaremos Date.now().toString() como ID simple para el MVP.
      const newId = `PROMO-${Date.now()}`;
      const nuevaPromo = await createPromocion(newId, formData);
      onCreated(nuevaPromo);
      onClose();
    } catch (error) {
      console.error("Error al crear promoción", error);
      alert("Error al guardar en base de datos. Comprueba los permisos o el .env");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Nueva Promoción</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre del Curso</label>
            <input 
              type="text" 
              className="glass-input" 
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
              placeholder="Ej. Bootcamp FullStack Web"
            />
          </div>
          
          <div className="input-group">
            <label>Sede (Campus)</label>
            <select 
              className="glass-input"
              value={formData.campus}
              onChange={e => setFormData({...formData, campus: e.target.value})}
            >
              <option value="Madrid">Madrid</option>
              <option value="Sevilla">Sevilla</option>
              <option value="Valencia">Valencia</option>
              <option value="Remoto">Remoto</option>
            </select>
          </div>

          <div className="input-group">
            <label>Fecha de Inicio</label>
            <input 
              type="date" 
              className="glass-input" 
              value={formData.fechaInicio}
              onChange={e => setFormData({...formData, fechaInicio: e.target.value})}
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-danger" onClick={onClose} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Guardando...' : 'Crear Promoción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
