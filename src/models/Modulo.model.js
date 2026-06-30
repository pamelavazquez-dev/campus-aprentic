export class Modulo {
  constructor(id, nombre, horas, lecciones_Id, tipo = '', activo = true, profesor_id = '', promociones_activas = []) {
    this.id = id;
    this.nombre = nombre;
    this.horas = horas;
    this.lecciones_Id = lecciones_Id;
    this.tipo = tipo;
    this.activo = activo;
    this.profesor_id = profesor_id;
    this.promociones_activas = promociones_activas;
  }
}

export const moduloConverter = {
  toFirestore: (modulo) => ({
    nombre: modulo.nombre,
    horas: modulo.horas,
    lecciones_Id: modulo.lecciones_Id,
    tipo: modulo.tipo || '',
    activo: modulo.activo !== false,
    profesor_id: modulo.profesor_id || '',
    promociones_activas: modulo.promociones_activas || []
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    
    // Función auxiliar para extraer strings de posibles DocumentReferences
    const extractId = (val) => typeof val === 'object' && val?.id ? String(val.id) : String(val);
    const extractArrayIds = (arr) => (Array.isArray(arr) ? arr : []).map(extractId);
    
    return new Modulo(
      snapshot.id,
      data.nombre || data.titulo || '', // Fallback al titulo antiguo
      data.horas || 0,
      extractArrayIds(data.lecciones_Id || data.lecciones_id),
      data.tipo || '',
      data.activo !== false,
      data.profesor_id ? extractId(data.profesor_id) : '',
      extractArrayIds(data.promociones_activas)
    );
  }
};
