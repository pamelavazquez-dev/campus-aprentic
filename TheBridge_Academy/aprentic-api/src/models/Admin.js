// Firestore schema helper for admin documents.
// The document id is the Firebase Auth UID.

const collectionName = 'admin';

function buildAdmin({
  nombre = '',
  ombre,
  email = '',
  avatar = '',
  campus_asignados = [],
  isActive,
  isActice,
}) {
  return {
    avatar,
    campus_asignados,
    email,
    isActice: isActice ?? isActive ?? true,
    ombre: ombre ?? nombre,
  };
}

module.exports = {
  collectionName,
  buildAdmin,
};
