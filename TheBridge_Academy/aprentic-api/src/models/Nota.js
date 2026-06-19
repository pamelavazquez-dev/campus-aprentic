// Firestore schema helper for Nota documents.
// Notes are scores assigned to student submissions or projects.

const collectionName = 'notas';

function buildNota({ id, proyectoId, alumnoId, profesorId, valor = 0, comentario = '', creadoEn = new Date().toISOString(), actualizadoEn = new Date().toISOString() }) {
  return {
    id,
    proyectoId,
    alumnoId,
    profesorId,
    valor,
    comentario,
    creadoEn,
    actualizadoEn,
  };
}

module.exports = {
  collectionName,
  buildNota,
};
