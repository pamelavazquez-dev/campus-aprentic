import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { leccionConverter, Leccion } from '../models/Leccion.model';

const COLLECTION = 'lecciones';

export const getLeccionById = (id) => getDoc(COLLECTION, id, leccionConverter);
export const getAllLecciones = () => getAll(COLLECTION, leccionConverter);
export const createLeccion = (id, data) => {
  const model = data instanceof Leccion ? data : new Leccion(id, data.modulo_id, data.titulo, data.descripcion, data.contenido_url, data.videos_url);
  return createDoc(COLLECTION, id, model, leccionConverter);
};
export const updateLeccion = (id, data) => {
  const model = data instanceof Leccion ? data : new Leccion(id, data.modulo_id, data.titulo, data.descripcion, data.contenido_url, data.videos_url);
  return updateDoc(COLLECTION, id, model, leccionConverter);
};
export const deleteLeccion = (id) => deleteDoc(COLLECTION, id);
