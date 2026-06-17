// Firestore schema helper for Nota documents.
// Notes are scores assigned to student submissions or projects.

const collectionName = 'notas';

function buildNota({ id, proyectoId, alumnoId, profesorId, valor = 0, comentario = '' }) {
  return {
    id,
    proyectoId,
    alumnoId,
    profesorId,
    valor,
    comentario,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildNota,
};
