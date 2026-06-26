export class Modulo {
  constructor(id, nombre, horas, lecciones_Id, tipo = '', activo = true, profesor_id = '') {
    this.id = id;
    this.nombre = nombre;
    this.horas = horas;
    this.lecciones_Id = lecciones_Id;
    this.tipo = tipo;
    this.activo = activo;
    this.profesor_id = profesor_id;
  }
}

export const moduloConverter = {
  toFirestore: (modulo) => ({
    nombre: modulo.nombre,
    horas: modulo.horas,
    lecciones_Id: modulo.lecciones_Id,
    tipo: modulo.tipo || '',
    activo: modulo.activo !== false,
    profesor_id: modulo.profesor_id || ''
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Modulo(
      snapshot.id,
      data.nombre || data.titulo || '', // Fallback al titulo antiguo
      data.horas || 0,
      data.lecciones_Id || data.lecciones_id || [],
      data.tipo || '',
      data.activo !== false,
      data.profesor_id || ''
    );
  }
};
