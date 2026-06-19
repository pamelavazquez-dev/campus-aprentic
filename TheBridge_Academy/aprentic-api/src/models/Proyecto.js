// Firestore schema helper for Proyecto documents.
// Projects are course assessments linked to a promotion and students.

const collectionName = 'proyectos';

function buildProyecto({ id, titulo, descripcion = '', promocionId, alumnoIds = [], notaIds = [], notas = [], estado = 'abierto' }) {
  return {
    id,
    titulo,
    descripcion,
    promocionId,
    alumnoIds,
    notaIds,
    notas,
    estado,
  };
}

module.exports = {
  collectionName,
  buildProyecto,
};
