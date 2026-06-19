const { db } = require('../config/db');

const REFERENCE_COLLECTION_BY_FIELD = {
  alumnos_id: 'alumnos',
  campus_asignados: 'campus',
  campus_id: 'campus',
  coordinadores_id: 'admin',
  lecciones_Id: 'lecciones',
  lecciones_id: 'lecciones',
  modulo_id: 'modulos',
  modulos_id: 'modulos',
  promocion_id: 'promociones',
  promociones_id: 'promociones',
  profesor_id: 'profesores',
};

const EMBEDDED_ID_COLLECTIONS = new Set(['notas', 'proyectos']);

function collection(name) {
  return db.collection(name);
}

function stripLeadingSlash(path) {
  return typeof path === 'string' ? path.replace(/^\/+/, '') : path;
}

function ensureLeadingSlash(path) {
  if (!path) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

function getReferencePath(value) {
  if (!value || typeof value !== 'object') return null;
  if (typeof value.path === 'string') return ensureLeadingSlash(value.path);

  const delegatePath = value._delegate && value._delegate._key && value._delegate._key.path;
  if (delegatePath && Array.isArray(delegatePath.segments)) {
    const { segments, offset = 0, len = segments.length } = delegatePath;
    return ensureLeadingSlash(segments.slice(offset, offset + len).join('/'));
  }

  const keyPath = value._key && value._key.path;
  if (keyPath && Array.isArray(keyPath.segments)) {
    const { segments, offset = 0, len = segments.length } = keyPath;
    return ensureLeadingSlash(segments.slice(offset, offset + len).join('/'));
  }

  return null;
}

function getDocIdFromRef(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    const cleanPath = stripLeadingSlash(value);
    const segments = cleanPath.split('/').filter(Boolean);
    return segments.length > 1 ? segments[segments.length - 1] : cleanPath;
  }

  const refPath = getReferencePath(value);
  if (refPath) return getDocIdFromRef(refPath);
  if (typeof value === 'object' && value.id) return value.id;

  return null;
}

function toFirestoreReference(value, fallbackCollection) {
  if (!value) return value;
  if (typeof value === 'object' && getReferencePath(value)) return value;

  if (typeof value !== 'string') return value;

  const cleanValue = stripLeadingSlash(value.trim());
  if (!cleanValue) return value;

  if (cleanValue.includes('/')) {
    return db.doc(cleanValue);
  }

  if (fallbackCollection) {
    return db.collection(fallbackCollection).doc(cleanValue);
  }

  return value;
}

function normalizeWriteValue(key, value) {
  if (value === null || value === undefined) return value;

  const fallbackCollection = REFERENCE_COLLECTION_BY_FIELD[key];
  if (fallbackCollection) {
    if (Array.isArray(value)) {
      return value.map((item) => normalizeWriteValue(key, item));
    }
    if (typeof value === 'string' || getReferencePath(value)) {
      return toFirestoreReference(value, fallbackCollection);
    }
  }

  if (Array.isArray(value)) return value.map((item) => normalizeWriteValue(null, item));

  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') return value;
    if (getReferencePath(value)) return value;

    const normalized = {};
    for (const [innerKey, innerValue] of Object.entries(value)) {
      normalized[innerKey] = normalizeWriteValue(innerKey, innerValue);
    }
    return normalized;
  }

  return value;
}

function prepareDocData(collectionName, data) {
  const prepared = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (key === 'id' && !EMBEDDED_ID_COLLECTIONS.has(collectionName)) continue;
    prepared[key] = normalizeWriteValue(key, value);
  }
  return prepared;
}

function normalizeFirestoreValue(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalizeFirestoreValue);
  if (value instanceof Date) return value.toISOString();

  if (typeof value === 'object') {
    const refPath = getReferencePath(value);
    if (refPath) return refPath;
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    if (typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
      return new Date(value.seconds * 1000 + value.nanoseconds / 1e6).toISOString();
    }

    const normalized = {};
    for (const [key, innerValue] of Object.entries(value)) {
      normalized[key] = normalizeFirestoreValue(innerValue);
    }
    return normalized;
  }

  return value;
}

function normalizeDocData(doc) {
  const rawData = doc.data();
  const normalized = {};
  Object.entries(rawData).forEach(([key, value]) => {
    normalized[key] = normalizeFirestoreValue(value);
  });
  return normalized;
}

async function getDoc(collectionName, id) {
  if (!id) return null;
  const doc = await collection(collectionName).doc(id).get();
  return doc.exists ? { id: doc.id, ...normalizeDocData(doc) } : null;
}

async function getAll(collectionName) {
  const snapshot = await collection(collectionName).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...normalizeDocData(doc) }));
}

async function createDoc(collectionName, id, data) {
  const preparedData = prepareDocData(collectionName, data);
  const ref = collection(collectionName).doc(id);
  await ref.set(preparedData);
  const created = await ref.get();
  return { id: created.id, ...normalizeDocData(created) };
}

async function updateDoc(collectionName, id, data) {
  const ref = collection(collectionName).doc(id);
  await ref.update(prepareDocData(collectionName, data));
  const updated = await ref.get();
  return { id: updated.id, ...normalizeDocData(updated) };
}

async function deleteDoc(collectionName, id) {
  await collection(collectionName).doc(id).delete();
}

module.exports = {
  getDoc,
  getAll,
  createDoc,
  updateDoc,
  deleteDoc,
  getDocIdFromRef,
  normalizeFirestoreValue,
  prepareDocData,
};
