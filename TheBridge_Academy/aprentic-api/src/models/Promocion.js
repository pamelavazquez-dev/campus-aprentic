// Firestore schema helper for Promocion documents.
// Promotion acts as a cohort in the current Firestore domain.

const collectionName = 'promociones';

function toDateValue(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
}

function toProfesorRef(value) {
  if (typeof value !== 'string') return value;
  const cleanValue = value.trim().replace(/^\/+/, '');
  if (!cleanValue || cleanValue.includes('/')) return value;
  return `/profesor/${cleanValue}`;
}

function buildProfesorAssignment(item) {
  if (!item) return item;

  if (typeof item === 'string') {
    return {
      isActive: true,
      profesor_id: toProfesorRef(item),
    };
  }

  return {
    isActive: item.isActive ?? true,
    profesor_id: toProfesorRef(item.profesor_id ?? item.id ?? item.uid ?? item.authUid),
  };
}

function buildPromocion({
  nombre = '',
  fechaInicio = null,
  fechaFin = null,
  campus_id = '',
  alumnos_id = [],
  profesor_id = [],
}) {
  const profesorItems = Array.isArray(profesor_id) ? profesor_id : [profesor_id].filter(Boolean);

  return {
    alumnos_id,
    campus_id,
    fechaFin: toDateValue(fechaFin),
    fechaInicio: toDateValue(fechaInicio),
    nombre,
    profesor_id: profesorItems.map(buildProfesorAssignment),
  };
}

module.exports = {
  collectionName,
  buildPromocion,
};
