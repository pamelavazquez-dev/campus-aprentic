import { getDoc as getFirestoreDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { leccionConverter, Leccion } from '../models/Leccion.model';
import { leccionSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';
import { collection, query, where, getDocs, doc, setDoc, getDoc as getDocFb } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'lecciones';

export const getLeccionById = (id) => getFirestoreDoc(COLLECTION, id, leccionConverter);
export const getAllLecciones = () => getAll(COLLECTION, leccionConverter);

export const getLeccionesByModuloId = async (moduloId) => {
  if (!moduloId) return [];
  const moduloRef = doc(db, 'modulos', moduloId);
  const q = query(
    collection(db, COLLECTION).withConverter(leccionConverter), 
    where('modulo_id', 'in', [moduloId, moduloRef])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data()); // Solo retorna metadatos sin el texto pesado
};

// Función para descargar el texto masivo (implementa cache local luego)
export const getLeccionMarkdown = async (leccionId) => {
  if (!leccionId) return '';
  try {
    const docRef = doc(db, COLLECTION, leccionId, 'contenido', 'main');
    // 1. Intentar descargar desde caché local primero para minimizar costes
    try {
      const cacheSnapshot = await getDocFb(docRef, { source: 'cache' });
      if (cacheSnapshot.exists()) return cacheSnapshot.data().texto || '';
    } catch (cacheError) {
      // Cache miss, ignorar error y hacer fetch normal
    }
    // 2. Fallback a servidor si no está en caché
    const snapshot = await getDocFb(docRef);
    if (snapshot.exists()) {
      return snapshot.data().texto || '';
    }
    return '';
  } catch (e) {
    console.error('Error fetching markdown', e);
    return '';
  }
};

export const createLeccion = async (id, data) => {
  const leccionData = validateData(leccionSchema, data);
  const model = data instanceof Leccion ? data : new Leccion(id, leccionData.modulo_id, leccionData.titulo, leccionData.descripcion, leccionData.contenido_url, leccionData.videos_url, '');
  
  const createdLec = await createDoc(COLLECTION, id, model, leccionConverter);
  
  // Guardamos el texto pesado en la subcolección
  if (leccionData.contenido_markdown) {
    const markdownRef = doc(db, COLLECTION, createdLec.id, 'contenido', 'main');
    await setDoc(markdownRef, { texto: leccionData.contenido_markdown });
  }
  
  return createdLec;
};

export const updateLeccion = async (id, data) => {
  const leccionData = validateData(leccionSchema, data);
  const model = data instanceof Leccion ? data : new Leccion(id, leccionData.modulo_id, leccionData.titulo, leccionData.descripcion, leccionData.contenido_url, leccionData.videos_url, '');
  
  await updateDoc(COLLECTION, id, model, leccionConverter);

  if (leccionData.contenido_markdown !== undefined) {
    const markdownRef = doc(db, COLLECTION, id, 'contenido', 'main');
    await setDoc(markdownRef, { texto: leccionData.contenido_markdown });
  }
  
  return model;
};

export const deleteLeccion = (id) => deleteDoc(COLLECTION, id);
