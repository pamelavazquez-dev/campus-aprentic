// Firestore schema helper for Curso documents.
// Courses describe public formations, categories, author and metadata.

const collectionName = 'cursos';

function buildCurso({ id, nombre, descripcion = '', instructorId, precio = 0, duracionHoras = 0, categoria = '', portadas = [], publicado = false }) {
  return {
    id,
    nombre,
    descripcion,
    instructorId,
    precio,
    duracionHoras,
    categoria,
    portadas,
    publicado,
    moduloIds: [],
    inscripcionIds: [],
    reviewIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildCurso,
};
