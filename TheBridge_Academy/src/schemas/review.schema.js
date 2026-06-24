import { Review } from '../models/Review.model';

export const reviewConverter = {
  toFirestore: (review) => ({
    promocion_id: review.promocion_id,
    alumno_id: review.alumno_id,
    rating: review.rating,
    comentario: review.comentario,
    fecha: review.fecha
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    
    const parseDate = (val) => {
      if (val && typeof val === 'object' && 'seconds' in val) return new Date(val.seconds * 1000).toISOString();
      return val || null;
    };

    return new Review(
      snapshot.id,
      data.promocion_id || '',
      data.alumno_id || '',
      data.rating || 0,
      data.comentario || '',
      parseDate(data.fecha)
    );
  }
};
