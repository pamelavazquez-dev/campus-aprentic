import { Profesor } from '../models/Profesor.model.js';

export const profesorConverter = {
  toFirestore: (prof) => ({
    nombre: prof.nombre,
    email: prof.email,
    avatar: prof.avatar,
    campus_id: prof.campus_id,
    promocion_id: prof.promocion_id,
    isActive: prof.isActive
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Profesor(
      snapshot.id,
      data.nombre || '',
      data.email || '',
      data.avatar || '',
      data.campus_id || '',
      data.promocion_id || [],
      data.isActive !== undefined ? data.isActive : true
    );
  }
};
