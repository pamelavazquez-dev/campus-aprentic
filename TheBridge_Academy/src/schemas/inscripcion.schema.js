import { Inscripcion } from '../models/Inscripcion.model.js';

export const inscripcionConverter = {
  toFirestore: (insc) => ({
    nombre: insc.nombre,
    apellidos: insc.apellidos,
    dni: insc.dni,
    email: insc.email,
    campus_id: insc.campus_id,
    promocion_id: insc.promocion_id,
    aceptada: insc.aceptada,
    observaciones: insc.observaciones,
    creadoEn: insc.creadoEn,
    actualizadoEn: insc.actualizadoEn
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    
    const parseDate = (val) => {
      if (val && typeof val === 'object' && 'seconds' in val) return new Date(val.seconds * 1000).toISOString();
      return val || null;
    };

    return new Inscripcion(
      snapshot.id,
      data.nombre || '',
      data.apellidos || '',
      data.dni || '',
      data.email || '',
      data.campus_id || '',
      data.promocion_id || '',
      data.aceptada || false,
      data.observaciones || '',
      parseDate(data.creadoEn),
      parseDate(data.actualizadoEn)
    );
  }
};
