// Firestore schema helper for Inscripcion documents.
// Enrollments connect alumno and curso with progress state.

const collectionName = 'inscripciones';

function buildInscripcion({ nombre = '', email = '', apellidos = '', dni = '', campus_id = '', promocion_id = '', aceptada = false, observaciones = '', creadoEn = new Date(), actualizadoEn = new Date() }) {
  return {
    nombre,
    email,
    apellidos,
    dni,
    campus_id,
    promocion_id,
    aceptada,
    observaciones,
    creadoEn,
    actualizadoEn,
  };
}

module.exports = {
  collectionName,
  buildInscripcion,
};
