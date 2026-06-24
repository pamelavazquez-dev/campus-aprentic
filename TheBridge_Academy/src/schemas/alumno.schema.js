import { Alumno } from '../models/Alumno.model.js';

export const alumnoConverter = {
  toFirestore: (alumno) => ({
    nombre: alumno.nombre,
    email: alumno.email,
    avatar: alumno.avatar,
    promociones_id: alumno.promociones_id,
    modulos_id: alumno.modulos_id
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Alumno(
      snapshot.id,
      data.nombre || '',
      data.email || '',
      data.avatar || '',
      data.promociones_id || [],
      data.modulos_id || []
    );
  }
};
