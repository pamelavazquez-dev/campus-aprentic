// Firestore schema helper for Promocion documents.
// Promotion acts as a cohort or course offering in the current domain.

const collectionName = 'promociones';

function buildPromocion({ id, nombre, fechaInicio, fechaFin, campus, estado = 'activo', cursoIds = [] }) {
  return {
    id,
    nombre,
    fechaInicio,
    fechaFin,
    campus,
    estado,
    cursoIds,
    descripcion: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildPromocion,
};
