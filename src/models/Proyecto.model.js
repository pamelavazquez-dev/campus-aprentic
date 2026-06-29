export class Proyecto {
  constructor(
    id,
    titulo,
    descripcion,
    promocionId,
    estado,
    alumnoId = '',
    alumnoEmail = '',
    alumnoAuthUid = '',
    moduloId = '',
    leccionId = '',
    archivoUrl = '',
    archivoNombre = '',
    entregadoEn = '',
    actualizadoEn = ''
  ) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.promocionId = promocionId;
    this.estado = estado;
    this.alumnoId = alumnoId;
    this.alumnoEmail = alumnoEmail;
    this.alumnoAuthUid = alumnoAuthUid;
    this.moduloId = moduloId;
    this.leccionId = leccionId;
    this.archivoUrl = archivoUrl;
    this.archivoNombre = archivoNombre;
    this.entregadoEn = entregadoEn;
    this.actualizadoEn = actualizadoEn;
  }
}

export const proyectoConverter = {
  toFirestore: (proyecto) => ({
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    promocionId: proyecto.promocionId,
    estado: proyecto.estado,
    alumnoId: proyecto.alumnoId,
    alumnoEmail: proyecto.alumnoEmail,
    alumnoAuthUid: proyecto.alumnoAuthUid,
    moduloId: proyecto.moduloId,
    leccionId: proyecto.leccionId,
    archivoUrl: proyecto.archivoUrl,
    archivoNombre: proyecto.archivoNombre,
    entregadoEn: proyecto.entregadoEn,
    actualizadoEn: proyecto.actualizadoEn
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Proyecto(
      snapshot.id,
      data.titulo || '',
      data.descripcion || '',
      data.promocionId || '',
      data.estado || 'abierto',
      data.alumnoId || '',
      data.alumnoEmail || '',
      data.alumnoAuthUid || '',
      data.moduloId || '',
      data.leccionId || '',
      data.archivoUrl || '',
      data.archivoNombre || '',
      data.entregadoEn || '',
      data.actualizadoEn || ''
    );
  }
};
