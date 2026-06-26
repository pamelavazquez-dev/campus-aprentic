export class Alumno {
  constructor(id, nombre, email, avatar, promociones_id, modulos_id) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.avatar = avatar;
    this.promociones_id = promociones_id;
    this.modulos_id = modulos_id;
  }
}

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
      data.promociones_id || (data.promocion_id ? [data.promocion_id] : []),
      data.modulos_id || []
    );
  }
};
