// Firestore schema helper for admin documents.
// The document id is the Firebase Auth UID.

const collectionName = 'admin';

function buildAdmin({ nombre = '', email = '', avatar = '', campus_asignados = [], isActive = true }) {
  return {
    nombre,
    email,
    avatar,
    campus_asignados,
    isActive,
  };
}

module.exports = {
  collectionName,
  buildAdmin,
};
