export class Nota {
  constructor(id, proyectoId, alumnoId, profesorId, valor, comentario, creadoEn, actualizadoEn) {
    this.id = id;
    this.proyectoId = proyectoId;
    this.alumnoId = alumnoId;
    this.profesorId = profesorId;
    this.valor = valor;
    this.comentario = comentario;
    this.creadoEn = creadoEn;
    this.actualizadoEn = actualizadoEn;
  }
}

export const notaConverter = {
  toFirestore: (nota) => ({
    proyectoId: nota.proyectoId,
    alumnoId: nota.alumnoId,
    profesorId: nota.profesorId,
    valor: nota.valor,
    comentario: nota.comentario,
    creadoEn: nota.creadoEn,
    actualizadoEn: nota.actualizadoEn
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Nota(
      snapshot.id,
      data.proyectoId || '',
      data.alumnoId || '',
      data.profesorId || '',
      data.valor || 0,
      data.comentario || '',
      data.creadoEn || new Date().toISOString(),
      data.actualizadoEn || new Date().toISOString()
    );
  }
};
