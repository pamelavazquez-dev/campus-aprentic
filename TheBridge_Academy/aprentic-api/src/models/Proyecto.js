// Firestore schema helper for Proyecto documents.
// Projects are course assessments linked to a promotion and students.

const collectionName = 'proyectos';

function buildProyecto({ id, titulo, promocionId, alumnoIds = [], descripcion = '' }) {
  return {
    id,
    titulo,
    descripcion,
    promocionId,
    alumnoIds,
    notaIds: [],
    notas: [],
    estado: 'abierto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildProyecto,
};
