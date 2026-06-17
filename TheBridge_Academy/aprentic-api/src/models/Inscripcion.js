// Firestore schema helper for Inscripcion documents.
// Enrollments connect alumno and curso with progress state.

const collectionName = 'inscripciones';

function buildInscripcion({ id, alumnoId, cursoId, instructorId, estado = 'activa' }) {
  return {
    id,
    alumnoId,
    cursoId,
    instructorId,
    estado,
    progreso: {
      completadas: 0,
      totales: 0,
    },
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildInscripcion,
};
