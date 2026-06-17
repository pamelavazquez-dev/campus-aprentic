// Firestore schema helper for Review documents.
// Reviews are written by alumnos for cursos.

const collectionName = 'reviews';

function buildReview({ id, cursoId, alumnoId, calificacion = 0, comentario = '' }) {
  return {
    id,
    cursoId,
    alumnoId,
    calificacion,
    comentario,
    publicado: true,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildReview,
};
