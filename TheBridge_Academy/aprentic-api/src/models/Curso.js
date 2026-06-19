// Firestore schema helper for Curso documents.
// Courses describe public formations, categories, author and metadata.
// NOTE: En la BD real, los cursos no se usan directamente. Usar modulos y lecciones.

const collectionName = 'cursos';

function buildCurso({ id, nombre, descripcion = '', instructor_id = '', precio = 0, duracionHoras = 0, categoria = '', portadas = [] }) {
  return {
    id,
    nombre,
    descripcion,
    instructor_id,
    precio,
    duracionHoras,
    categoria,
    portadas,
  };
}

module.exports = {
  collectionName,
  buildCurso,
};
