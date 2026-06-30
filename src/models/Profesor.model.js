export class Profesor {
  constructor(id, nombre, email, avatar, campus_id, promocion_id, isActive, password) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.avatar = avatar;
    this.campus_id = campus_id;
    this.promocion_id = promocion_id;
    this.isActive = isActive;
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
      isActive: prof.isActive
    };
    if (prof.password) data.password = prof.password;
    return data;
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Profesor(
      snapshot.id,
      data.nombre || '',
      data.email || '',
      data.avatar || '',
      data.campus_id || '',
      data.promocion_id || [],
      data.isActive !== undefined ? data.isActive : true,
      data.password
    );
  }
};
