import { Admin } from '../models/Admin.model.js';

export const adminConverter = {
  toFirestore: (admin) => ({
    nombre: admin.nombre,
    email: admin.email,
    avatar: admin.avatar,
    campus_asignados: admin.campus_asignados,
    isActive: admin.isActive
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Admin(
      snapshot.id,
      data.nombre || data.ombre || '', // Soportar el typo antiguo
      data.email || '',
      data.avatar || '',
      data.campus_asignados || [],
      data.isActive !== undefined ? data.isActive : (data.isActice !== undefined ? data.isActice : true)
    );
  }
};
