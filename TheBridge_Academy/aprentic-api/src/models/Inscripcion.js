// Firestore schema helper for Inscripcion documents.

const collectionName = 'inscripciones';

function toDateValue(value, fallback = new Date()) {
  if (value === undefined) return fallback;
  if (value === null || value === '') return null;
  if (value instanceof Date) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
}

function toInscripcionPromocionRef(value) {
  if (typeof value !== 'string') return value;
  const cleanValue = value.trim().replace(/^\/+/, '');
  if (!cleanValue || cleanValue.includes('/')) return value;
  return `/promocion_id/${cleanValue}`;
}

function buildInscripcion({
  nombre = '',
  email = '',
  apellidos = '',
  dni = '',
  campus_id = '',
  promocion_id = '',
  aceptada = false,
  observaciones = '',
  creadoEn,
  actualizadoEn,
}) {
  return {
    aceptada,
    actualizadoEn: toDateValue(actualizadoEn),
    apellidos,
    campus_id,
    creadoEn: toDateValue(creadoEn),
    dni,
    email,
    nombre,
    observaciones,
    promocion_id: toInscripcionPromocionRef(promocion_id),
  };
}

module.exports = {
  collectionName,
  buildInscripcion,
};
