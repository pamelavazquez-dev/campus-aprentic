export class Modulo {
  constructor(id, nombre, horas, lecciones_Id, tipo = '') {
    this.id = id;
    this.nombre = nombre;
    this.horas = horas;
    this.lecciones_Id = lecciones_Id;
    this.tipo = tipo;
  }
}

export const moduloConverter = {
  toFirestore: (modulo) => ({
    nombre: modulo.nombre,
    horas: modulo.horas,
    lecciones_Id: modulo.lecciones_Id,
    tipo: modulo.tipo || ''
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Modulo(
      snapshot.id,
      data.nombre || data.titulo || '', // Fallback al titulo antiguo
      data.horas || 0,
      data.lecciones_Id || data.lecciones_id || [],
      data.tipo || ''
    );
  }
};
