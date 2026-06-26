import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { leccionConverter, Leccion } from '../models/Leccion.model';
import { leccionSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';

const COLLECTION = 'lecciones';

export const getLeccionById = (id) => getDoc(COLLECTION, id, leccionConverter);
export const getAllLecciones = () => getAll(COLLECTION, leccionConverter);
export const createLeccion = (id, data) => {
  const leccionData = validateData(leccionSchema, data);
  const model = data instanceof Leccion ? data : new Leccion(id, leccionData.modulo_id, leccionData.titulo, leccionData.descripcion, leccionData.contenido_url, leccionData.videos_url, leccionData.contenido_markdown);
  return createDoc(COLLECTION, id, model, leccionConverter);
};
export const updateLeccion = (id, data) => {
  const leccionData = validateData(leccionSchema, data);
  const model = data instanceof Leccion ? data : new Leccion(id, leccionData.modulo_id, leccionData.titulo, leccionData.descripcion, leccionData.contenido_url, leccionData.videos_url, leccionData.contenido_markdown);
  return updateDoc(COLLECTION, id, model, leccionConverter);
};
export const deleteLeccion = (id) => deleteDoc(COLLECTION, id);
