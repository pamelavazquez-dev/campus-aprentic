export class Campus {
  constructor(id, nombre, sede, coordinadores_id, modulos_id, promociones_id) {
    this.id = id;
    this.nombre = nombre;
    this.sede = sede;
    this.coordinadores_id = coordinadores_id;
    this.modulos_id = modulos_id;
    this.promociones_id = promociones_id;
  }
}

export const campusConverter = {
  toFirestore: (campus) => ({
    nombre: campus.nombre,
    sede: campus.sede,
    coordinadores_id: campus.coordinadores_id,
    modulos_id: campus.modulos_id,
    promociones_id: campus.promociones_id
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Campus(
      snapshot.id, 
      data.nombre || '', 
      data.sede || '',
      data.coordinadores_id || [],
      data.modulos_id || [],
      data.promociones_id || []
    );
  }
};
