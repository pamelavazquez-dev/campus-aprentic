// Firestore schema helper for Usuario documents.

const collectionName = 'usuarios';

function buildUsuario({ id, nombre, email, passwordHash, rol = 'alumno' }) {
  return {
    id,
    nombre,
    email,
    passwordHash,
    rol,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildUsuario,
};
