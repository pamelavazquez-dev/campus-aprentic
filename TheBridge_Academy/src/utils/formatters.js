export const formatList = (value, fallback = 'Sin datos') => {
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : fallback;
  if (typeof value === 'string') return value || fallback;
  if (value?.path) return value.path;
  if (value?.id) return value.id;
  return fallback;
};

export const formatValue = (value, fallback = 'Sin datos') => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return formatList(value, fallback);
  if (value.path) return value.path;
  if (value.id) return value.id;
  if (value._key?.path?.segments) return value._key.path.segments.join('/');
  return fallback;
};

export const shortId = (value) => {
  if (!value) return 'Sin UID';
  return value.length > 18 ? `${value.slice(0, 18)}...` : value;
};
