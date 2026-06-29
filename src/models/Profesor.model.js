export class Profesor {
  constructor(id, nombre, email, avatar, campus_id, promocion_id, isActive) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.avatar = avatar;
    this.campus_id = campus_id;
    this.promocion_id = promocion_id;
    this.isActive = isActive;
  }
}

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
