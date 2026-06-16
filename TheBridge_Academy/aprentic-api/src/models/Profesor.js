// Firestore schema helper for Profesor documents.

const collectionName = 'profesores';

function buildProfesor({ id, nombre, email }) {
  return {
    id,
    nombre,
    email,
    rol: 'profesor',
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  collectionName,
  buildProfesor,
};
