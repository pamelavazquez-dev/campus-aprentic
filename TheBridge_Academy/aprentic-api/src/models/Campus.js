// Firestore schema helper for Campus documents.

const collectionName = 'campus';

function buildCampus({ id, nombre, ubicacion, sede = '' }) {
  return {
    id,
    nombre,
    ubicacion,
    sede,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildCampus,
};
