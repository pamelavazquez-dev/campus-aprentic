import { useState } from 'react';
import { createReview } from '../../services/reviews.service';
import Card from '../Card';
import Input from '../Input';
import { useAuth } from '../../hooks/useAuth';

export default function ReviewForm({ promocionId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) {
      setMensaje('Por favor añade un comentario.');
      return;
    }

    setLoading(true);
    try {
      await createReview(null, {
        promocion_id: promocionId,
        alumno_id: user.uid,
        rating: Number(rating),
        comentario,
        fecha: new Date().toISOString()
      });
      setMensaje('¡Valoración enviada correctamente!');
      setComentario('');
      setRating(5);
      if (onSubmitted) onSubmitted();
    } catch (error) {
      console.error(error);
      setMensaje('Error al enviar la valoración.');
    }
    setLoading(false);
  };

  return (
    <Card>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Deja una Valoración</h3>
      {mensaje && (
        <div style={{ padding: '12px', background: mensaje.includes('Error') ? '#FFE5E8' : '#d1fae5', color: mensaje.includes('Error') ? 'var(--danger)' : '#065f46', borderRadius: '8px', marginBottom: '16px' }}>
          {mensaje}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Calificación (1-5)</label>
          <select 
            className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]" 
            value={rating} 
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="5">⭐⭐⭐⭐⭐ - Excelente</option>
            <option value="4">⭐⭐⭐⭐ - Muy Bueno</option>
            <option value="3">⭐⭐⭐ - Bueno</option>
            <option value="2">⭐⭐ - Regular</option>
            <option value="1">⭐ - Malo</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Tu opinión</label>
          <textarea 
            className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]" 
            rows="3" 
            value={comentario} 
            onChange={(e) => setComentario(e.target.value)}
            placeholder="¿Qué te ha parecido este contenido?"
          />
        </div>
        
        <button type="submit" className="w-full bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow flex items-center justify-center gap-2 border-none cursor-pointer mt-4 disabled:bg-gray300 disabled:shadow-none disabled:text-gray500 disabled:cursor-not-allowed disabled:transform-none" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Valoración'}
        </button>
      </form>
    </Card>
  );
}
