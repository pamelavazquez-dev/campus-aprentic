// Firestore schema helper for Leccion documents.
// Lessons belong to a module and can include content files or references.

const collectionName = 'lecciones';

function buildLeccion({ id, moduloId, titulo, contenido = '', tipoContenido = 'video', recursoUrl = '', orden = 0 }) {
  return {
    id,
    moduloId,
    titulo,
    contenido,
    tipoContenido,
    recursoUrl,
    orden,
    completadaPor: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildLeccion,
};
