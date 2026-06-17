// Firestore schema helper for Modulo documents.
// Modules belong to a course and group lesson content.

const collectionName = 'modulos';

function buildModulo({ id, cursoId, titulo, descripcion = '', orden = 0 }) {
  return {
    id,
    cursoId,
    titulo,
    descripcion,
    orden,
    leccionIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildModulo,
};
