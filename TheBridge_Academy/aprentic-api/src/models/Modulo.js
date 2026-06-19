// Firestore schema helper for Modulo documents.

const collectionName = 'modulos';

function buildModulo({ nombre = '', titulo = '', horas = 0, lecciones_Id = [], lecciones_id = [] }) {
  const name = nombre || titulo;
  const lessons = lecciones_Id.length ? lecciones_Id : lecciones_id;
  return {
    nombre: name,
    horas,
    lecciones_Id: lessons,
  };
}

module.exports = {
  collectionName,
  buildModulo,
};
