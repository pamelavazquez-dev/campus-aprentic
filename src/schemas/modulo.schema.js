import { Modulo } from '../models/Modulo.model.js';

export const moduloConverter = {
  toFirestore: (modulo) => ({
    nombre: modulo.nombre,
    horas: modulo.horas,
    lecciones_Id: modulo.lecciones_Id,
    profesor_id: modulo.profesor_id || '',
    activo: modulo.activo !== undefined ? modulo.activo : true
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Modulo(
      snapshot.id,
      data.nombre || data.titulo || '',
      data.horas || 0,
      data.lecciones_Id || data.lecciones_id || [],
      data.profesor_id || '',
      data.activo !== undefined ? data.activo : true
    );
  }
};
