export class Admin {
  constructor(id, nombre, email, avatar, campus_asignados, isActive, initialPasswordChangeRequired = false) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.avatar = avatar;
    this.campus_asignados = campus_asignados;
    this.isActive = isActive;
    this.initialPasswordChangeRequired = initialPasswordChangeRequired;
  }
}

export const adminConverter = {
  toFirestore: (admin) => ({
    nombre: admin.nombre,
    email: admin.email,
    avatar: admin.avatar,
    campus_asignados: admin.campus_asignados,
    isActive: admin.isActive,
    initialPasswordChangeRequired: admin.initialPasswordChangeRequired
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    const extractId = (val) => typeof val === 'object' && val?.id ? String(val.id) : String(val);
    const extractArrayIds = (arr) => (Array.isArray(arr) ? arr : [arr]).filter(Boolean).map(extractId);

    return new Admin(
      snapshot.id,
      data.nombre || data.ombre || '', // Soportar el typo antiguo
      data.email || '',
      data.avatar || '',
      extractArrayIds(data.campus_asignados),
      data.isActive !== undefined ? data.isActive : (data.isActice !== undefined ? data.isActice : true),
      data.initialPasswordChangeRequired || false
    );
  }
};
