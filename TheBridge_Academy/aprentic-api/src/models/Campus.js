// Firestore schema helper for Campus documents.

const collectionName = 'campus';

function buildCampus({ nombre = '', sede = '', coordinadores_id = null, modulos_id = [], promociones_id = [] }) {
  return {
    nombre,
    sede,
    coordinadores_id,
    modulos_id,
    promociones_id,
  };
}

module.exports = {
  collectionName,
  buildCampus,
};
