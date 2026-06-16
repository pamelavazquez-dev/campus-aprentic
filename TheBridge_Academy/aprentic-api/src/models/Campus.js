// Firestore schema helper for Campus documents.

const collectionName = 'campus';

function buildCampus({ id, nombre, ubicacion }) {
  return {
    id,
    nombre,
    ubicacion,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildCampus,
};
