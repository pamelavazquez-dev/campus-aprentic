export class Profesor {
  constructor(
    id,
    nombre,
    email,
    avatar,
    campus_id,
    promocion_id,
    isActive,
    password,
    initialPasswordChangeRequired = false
  ) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.avatar = avatar;
    this.campus_id = campus_id;
    this.promocion_id = promocion_id;
    this.isActive = isActive;
    this.initialPasswordChangeRequired = initialPasswordChangeRequired;
    if (password) this.password = password;
  }
}

export const profesorConverter = {
  toFirestore: (prof) => {
    const data = {
      nombre: prof.nombre,
      email: prof.email,
      avatar: prof.avatar,
      campus_id: prof.campus_id,
      promocion_id: prof.promocion_id,
      isActive: prof.isActive,
      initialPasswordChangeRequired: prof.initialPasswordChangeRequired || false,
    };

    if (prof.password) data.password = prof.password;
    return data;
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    const extractId = (val) => typeof val === 'object' && val?.id ? String(val.id) : String(val);
    const extractArrayIds = (arr) => (Array.isArray(arr) ? arr : [arr]).filter(Boolean).map(extractId);

    return new Profesor(
      snapshot.id,
      data.nombre || '',
      data.email || '',
      data.avatar || '',
      data.campus_id ? extractId(data.campus_id) : '',
      extractArrayIds(data.promocion_id),
      data.isActive !== undefined ? data.isActive : true,
      data.password,
      data.initialPasswordChangeRequired || false
    );
  },
};
