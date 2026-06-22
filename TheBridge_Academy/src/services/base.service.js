import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc as firestoreGetDoc, 
  getDocs as firestoreGetDocs, 
  setDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc as firestoreDeleteDoc 
} from 'firebase/firestore';

/**
 * Normaliza las referencias y los timestamps de Firestore para que
 * sean más fáciles de usar en React.
 */
function normalizeDocData(document) {
  const data = document.data();
  const normalized = { id: document.id };
  
  for (const [key, value] of Object.entries(data)) {
    // Convertir Timestamps de Firestore a cadenas ISO
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      normalized[key] = new Date(value.seconds * 1000).toISOString();
    } 
    // Convertir DocumentReferences a sus rutas (strings)
    else if (value && typeof value === 'object' && value.type === 'document') {
      normalized[key] = value.path;
    } 
    else {
      normalized[key] = value;
    }
  }
  
  return normalized;
}

/**
 * Prepara los datos antes de guardarlos (por ahora pasa los datos directamente,
 * pero se puede ampliar para inyectar referencias si fuera necesario).
 */
function prepareDocData(data) {
  // Aquí podríamos convertir fechas de vuelta a Timestamps si Firebase lo exige,
  // pero Firebase v9 acepta objetos Date nativos directamente.
  const prepared = { ...data };
  
  for (const [key, value] of Object.entries(prepared)) {
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      prepared[key] = new Date(value);
    }
  }
  
  return prepared;
}

export const getDoc = async (collectionName, id, converter = null) => {
  if (!id) return null;
  let docRef = doc(db, collectionName, id);
  if (converter) docRef = docRef.withConverter(converter);
  
  const document = await firestoreGetDoc(docRef);
  
  if (!document.exists()) return null;
  return converter ? document.data() : normalizeDocData(document);
};

export const getAll = async (collectionName, converter = null) => {
  if (!db) throw new Error("Firebase DB not initialized. Missing API keys.");
  let collRef = collection(db, collectionName);
  if (converter) collRef = collRef.withConverter(converter);
  
  const snapshot = await firestoreGetDocs(collRef);
  return converter ? snapshot.docs.map(doc => doc.data()) : snapshot.docs.map(normalizeDocData);
};

export const createDoc = async (collectionName, id, data, converter = null) => {
  let docRef = doc(db, collectionName, id);
  if (converter) docRef = docRef.withConverter(converter);
  
  const preparedData = converter ? data : prepareDocData(data);
  await setDoc(docRef, preparedData);
  return { id, ...data }; // Retornamos los datos para feedback
};

export const updateDoc = async (collectionName, id, data, converter = null) => {
  let docRef = doc(db, collectionName, id);
  if (converter) docRef = docRef.withConverter(converter);
  
  const preparedData = converter ? data : prepareDocData(data);
  await firestoreUpdateDoc(docRef, preparedData);
  return { id, ...data };
};

export const deleteDoc = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await firestoreDeleteDoc(docRef);
};
