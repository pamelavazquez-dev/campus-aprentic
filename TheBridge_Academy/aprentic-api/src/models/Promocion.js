// Firestore schema helper for Promocion documents.
// Promotion acts as a cohort or course offering in the current domain.

const collectionName = 'promociones';

function buildPromocion({ nombre = '', fechaInicio = null, fechaFin = null, campus_id = '', alumnos_id = [], profesor_id = [] }) {
  return {
    nombre,
    fechaInicio,
    fechaFin,
    campus_id,
    alumnos_id,
    profesor_id,
  };
}

module.exports = {
  collectionName,
  buildPromocion,
};
