// Firestore schema helper for Profesor documents.
// Professors are linked to courses and the user model.

const collectionName = 'profesores';

function buildProfesor({ id, nombre, email, avatar = '', cursoIds = [] }) {
  return {
    id,
    nombre,
    email,
    avatar,
    cursoIds,
    rol: 'profesor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildProfesor,
};
