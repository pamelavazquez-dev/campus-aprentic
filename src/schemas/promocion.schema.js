import { Promocion } from '../models/Promocion.model.js';

export const promocionConverter = {
  toFirestore: (promo) => ({
    nombre: promo.nombre,
    fechaInicio: promo.fechaInicio,
    fechaFin: promo.fechaFin,
    campus_id: promo.campus_id,
    alumnos_id: promo.alumnos_id,
    profesor_id: promo.profesor_id
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    
    // Función para manejar el parseo de fechas de Firebase o Strings
    const parseDate = (val) => {
      if (val && typeof val === 'object' && 'seconds' in val) return new Date(val.seconds * 1000).toISOString();
      return val || null;
    };

    // Función para manejar referencias de Firestore
    const parseRef = (val) => {
      if (val && typeof val === 'object' && val.type === 'document') return val.path;
      if (val && typeof val === 'object' && val.id) return val.id; // Fallback
      return val || '';
    };

    return new Promocion(
      snapshot.id,
      data.nombre || '',
      parseDate(data.fechaInicio),
      parseDate(data.fechaFin),
      parseRef(data.campus_id || data.campus), 
      data.alumnos_id || [],
      data.profesor_id || []
    );
  }
};
