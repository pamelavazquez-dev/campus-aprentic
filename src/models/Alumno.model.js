export class Alumno {
  constructor(
    id,
    nombre,
    email,
    avatar,
    promociones_id,
    modulos_id,
    password = '',
    initialPasswordChangeRequired = false
  ) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.avatar = avatar;
    this.promociones_id = promociones_id;
    this.modulos_id = modulos_id;
    this.initialPasswordChangeRequired = initialPasswordChangeRequired;
    if (password) this.password = password;
  }
}

export const alumnoConverter = {
  toFirestore: (alumno) => {
    const data = {
      nombre: alumno.nombre,
      email: alumno.email,
      avatar: alumno.avatar,
      promociones_id: alumno.promociones_id,
      modulos_id: alumno.modulos_id,
      initialPasswordChangeRequired: alumno.initialPasswordChangeRequired
    };

    if (alumno.password) data.password = alumno.password;

    return data;
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    const extractId = (val) => typeof val === 'object' && val?.id ? String(val.id) : String(val);
    const extractArrayIds = (arr) => (Array.isArray(arr) ? arr : []).map(extractId);

    const rawPromos = data.promociones_id || (data.promocion_id ? [data.promocion_id] : []);

    return new Alumno(
      snapshot.id,
      data.nombre || '',
      data.email || '',
      data.avatar || '',
      extractArrayIds(rawPromos),
      extractArrayIds(data.modulos_id),
      data.password || '',
      data.initialPasswordChangeRequired || false
    );
  }
};
