// Firestore schema helper for Promocion documents.

const collectionName = 'promociones';

function buildPromocion({ id, nombre, fechaInicio, fechaFin, campus }) {
  return {
    id,
    nombre,
    fechaInicio,
    fechaFin,
    campus,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildPromocion,
};
