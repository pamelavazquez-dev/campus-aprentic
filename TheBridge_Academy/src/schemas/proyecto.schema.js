import { Proyecto } from '../models/Proyecto.model.js';

export const proyectoConverter = {
  toFirestore: (proyecto) => ({
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    promocionId: proyecto.promocionId,
    alumnoIds: proyecto.alumnoIds,
    notas: proyecto.notas,
    estado: proyecto.estado
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Proyecto(
      snapshot.id,
      data.titulo || '',
      data.descripcion || '',
      data.promocionId || '',
      data.alumnoIds || [],
      data.notas || data.notaIds || [],
      data.estado || 'abierto'
    );
  }
};
