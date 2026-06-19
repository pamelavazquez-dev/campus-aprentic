// Firestore schema helper for Leccion documents.
// Lessons belong to a module and can include content files or references.

const collectionName = 'lecciones';

function buildLeccion({ modulo_id = '', titulo = '', descripcion = '', description = '', contenido_url = '', videos_url = [] }) {
  return {
    modulo_id,
    titulo,
    descripcion: descripcion || description,
    contenido_url,
    videos_url,
  };
}

module.exports = {
  collectionName,
  buildLeccion,
};
