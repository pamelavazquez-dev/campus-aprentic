import { db } from '../config/firebase';
import { 
  addDoc,
  collection, 
  doc, 
  getDoc as firestoreGetDoc, 
  getDocs as firestoreGetDocs, 
  setDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc as firestoreDeleteDoc 
} from 'firebase/firestore';

/**
 * Conversor genérico por defecto de Firestore.
 * Abstrae la normalización de fechas y referencias.
 */
export const defaultConverter = {
  toFirestore(data) {
    const prepared = { ...data };
    for (const [key, value] of Object.entries(prepared)) {
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        prepared[key] = new Date(value);
      }
    }
    return prepared;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    const normalized = { id: snapshot.id };
    
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
        normalized[key] = new Date(value.seconds * 1000).toISOString();
      } else if (value && typeof value === 'object' && value.type === 'document') {
        normalized[key] = value.path;
      } else {
        normalized[key] = value;
      }
    }
    return normalized;
  }
};

export const getDoc = async (collectionName, id, converter = defaultConverter) => {
  if (!id) return null;
  const docRef = doc(db, collectionName, id).withConverter(converter);
  const document = await firestoreGetDoc(docRef);
  return document.exists() ? document.data() : null;
};

export const getAll = async (collectionName, converter = defaultConverter) => {
  if (!db) throw new Error("Firebase DB not initialized.");
  const collRef = collection(db, collectionName).withConverter(converter);
  const snapshot = await firestoreGetDocs(collRef);
  return snapshot.docs.map(doc => doc.data());
};

export const createDoc = async (collectionName, id, data, converter = defaultConverter) => {
  if (!id) {
    const collRef = collection(db, collectionName).withConverter(converter);
    const docRef = await addDoc(collRef, data);
    return { ...data, id: docRef.id };
  }
  const docRef = doc(db, collectionName, id).withConverter(converter);
  await setDoc(docRef, data);
  return { ...data, id };
};

export const updateDoc = async (collectionName, id, data, converter = defaultConverter) => {
  const docRef = doc(db, collectionName, id).withConverter(converter);
  await setDoc(docRef, data, { merge: true });
  return { id, ...data };
};

export const deleteDoc = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await firestoreDeleteDoc(docRef);
};
