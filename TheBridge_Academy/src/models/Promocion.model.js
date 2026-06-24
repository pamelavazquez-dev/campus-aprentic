export class Promocion {
  constructor(id, nombre, fechaInicio, fechaFin, campus_id, alumnos_id, profesor_id) {
    this.id = id;
    this.nombre = nombre;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.campus_id = campus_id;
    this.alumnos_id = alumnos_id;
    this.profesor_id = profesor_id;
  }

  get formatoFechaCorta() {
    if (!this.fechaInicio) return 'N/A';
    return new Date(this.fechaInicio).toLocaleDateString();
  }

  get campus() {
    return this.campus_id;
  }
}

const parseDate = (value) => {
  if (value && typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000).toISOString();
  }
  return value || null;
};

const parseReference = (ref) => {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object') {
    if (typeof ref.id === 'string') return ref.id;
    if (typeof ref.path === 'string') return ref.path;
    if (ref._key?.path?.segments) return ref._key.path.segments.join('/');
  }
  return '';
};

export const promocionConverter = {
  toFirestore: (promo) => ({
    nombre: promo.nombre,
    fechaInicio: promo.fechaInicio,
    fechaFin: promo.fechaFin,
    campus_id: promo.campus_id,
    alumnos_id: promo.alumnos_id,
    profesor_id: promo.profesor_id,
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return new Promocion(
      snapshot.id,
      data.nombre || '',
      parseDate(data.fechaInicio),
      parseDate(data.fechaFin),
      parseReference(data.campus_id || data.campus),
      data.alumnos_id || [],
      data.profesor_id || []
    );
  },
};
