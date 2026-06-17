// Firestore schema helper for Usuario documents.
// Users include authentication and profile data for all roles.

const collectionName = 'usuarios';

function buildUsuario({ id, nombre, email, passwordHash, rol = 'alumno', avatar = '', estado = 'activo' }) {
  return {
    id,
    nombre,
    email,
    passwordHash,
    rol,
    avatar,
    estado,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildUsuario,
};
