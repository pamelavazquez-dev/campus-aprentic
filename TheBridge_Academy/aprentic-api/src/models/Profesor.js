// Firestore schema helper for profesor documents.
// The document id is usually the Firebase Auth UID.

const collectionName = 'profesores';

function buildProfesor({ nombre = '', email = '', avatar = '', campus_id = '', promocion_id = [], isActive = true }) {
  return {
    nombre,
    email,
    avatar,
    campus_id,
    promocion_id,
    isActive,
  };
}

module.exports = {
  collectionName,
  buildProfesor,
};
