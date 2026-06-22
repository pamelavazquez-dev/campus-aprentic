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
  
  // Mantenemos esto por compatibilidad con el front que construimos
  get formatoFechaCorta() {
    if (!this.fechaInicio) return 'N/A';
    return new Date(this.fechaInicio).toLocaleDateString();
  }
  get campus() { return this.campus_id; }
}

export const promocionConverter = {
  toFirestore: (promo) => ({
    nombre: promo.nombre,
    fechaInicio: promo.fechaInicio,
    fechaFin: promo.fechaFin,
    campus_id: promo.campus_id,
    alumnos_id: promo.alumnos_id,
    profesor_id: promo.profesor_id
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    
    // Función para manejar el parseo de fechas de Firebase o Strings
    const parseDate = (val) => {
      if (val && typeof val === 'object' && 'seconds' in val) return new Date(val.seconds * 1000).toISOString();
      return val || null;
    };

    return new Promocion(
      snapshot.id,
      data.nombre || '',
      parseDate(data.fechaInicio),
      parseDate(data.fechaFin),
      data.campus_id || data.campus || '', // Soporte para el campo vivo
      data.alumnos_id || [],
      data.profesor_id || []
    );
  }
};
