export class Proyecto {
  constructor(id, titulo, descripcion, promocionId, alumnoIds, notas, estado) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.promocionId = promocionId;
    this.alumnoIds = alumnoIds;
    this.notas = notas;
    this.estado = estado;
  }
}

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
