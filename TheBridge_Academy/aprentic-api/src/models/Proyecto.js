// Firestore schema helper for Proyecto documents.

const collectionName = 'proyectos';

function buildProyecto({ id, titulo, promocionId, alumnoIds = [] }) {
  return {
    id,
    titulo,
    promocionId,
    alumnoIds,
    notas: [],
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildProyecto,
};
