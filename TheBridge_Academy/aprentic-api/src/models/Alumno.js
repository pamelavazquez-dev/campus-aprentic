// Firestore schema helper for alumno documents.
// The document id is usually the Firebase Auth UID.

const collectionName = 'alumnos';

function buildAlumno({ nombre = '', email = '', avatar = '', promociones_id = [], promocion_id = '', promocionId = '' }) {
  const promociones = Array.isArray(promociones_id)
    ? promociones_id
    : promociones_id
    ? [promociones_id]
    : [];
  const promotions = promociones.length
    ? promociones
    : promocion_id
    ? [promocion_id]
    : promocionId
    ? [promocionId]
    : [];
  return {
    nombre,
    email,
    avatar,
    promociones_id: promotions,
  };
}

module.exports = {
  collectionName,
  buildAlumno,
};
