// Firestore schema helper for Alumno documents
// Fields are inferred from seed data and project requirements.

const collectionName = 'alumnos';

function buildAlumno({ id, nombre, email, foto = '', promocionId }) {
  return {
    id,
    nombre,
    email,
    foto,
    promocionId,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildAlumno,
};
