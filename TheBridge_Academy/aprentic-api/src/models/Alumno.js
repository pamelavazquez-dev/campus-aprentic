// Firestore schema helper for Alumno documents.
// This model includes promotion and progress fields for the course/cohort domain.

const collectionName = 'alumnos';

function buildAlumno({ id, nombre, email, foto = '', promocionId, cursoIds = [], inscripcionIds = [] }) {
  return {
    id,
    nombre,
    email,
    foto,
    promocionId,
    cursoIds,
    inscripcionIds,
    progreso: {
      completadas: 0,
      totales: 0,
    },
    rol: 'alumno',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildAlumno,
};
