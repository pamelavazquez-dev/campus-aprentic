import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { notaConverter, Nota } from '../models/Nota.model';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'notas';

export const getNotaById = (id) => getDoc(COLLECTION, id, notaConverter);
export const getAllNotas = () => getAll(COLLECTION, notaConverter);
export const getNotasByAlumnoId = async (alumnoId) => {
  if (!alumnoId) return [];

  const notasQuery = query(
    collection(db, COLLECTION).withConverter(notaConverter),
    where('alumnoId', '==', alumnoId)
  );
  const snapshot = await getDocs(notasQuery);

  return snapshot.docs.map(doc => doc.data());
};
export const createNota = (id, data) => {
  const model = data instanceof Nota ? data : new Nota(id, data.proyectoId, data.alumnoId, data.profesorId, data.valor, data.comentario, data.creadoEn, data.actualizadoEn);
  return createDoc(COLLECTION, id, model, notaConverter);
};
export const updateNota = (id, data) => {
  const model = data instanceof Nota ? data : new Nota(id, data.proyectoId, data.alumnoId, data.profesorId, data.valor, data.comentario, data.creadoEn, data.actualizadoEn);
  return updateDoc(COLLECTION, id, model, notaConverter);
};
export const deleteNota = (id) => deleteDoc(COLLECTION, id);
