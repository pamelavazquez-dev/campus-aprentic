import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { profesorConverter, Profesor } from '../models/Profesor.model';

const COLLECTION = 'profesores';

export const getProfesorById = (id) => getDoc(COLLECTION, id, profesorConverter);
export const getAllProfesores = () => getAll(COLLECTION, profesorConverter);
export const createProfesor = (id, data) => {
  const model = data instanceof Profesor ? data : new Profesor(id, data.nombre, data.email, data.avatar, data.campus_id, data.promocion_id, data.isActive);
  return createDoc(COLLECTION, id, model, profesorConverter);
};
export const updateProfesor = (id, data) => {
  const model = data instanceof Profesor ? data : new Profesor(id, data.nombre, data.email, data.avatar, data.campus_id, data.promocion_id, data.isActive);
  return updateDoc(COLLECTION, id, model, profesorConverter);
};
export const deleteProfesor = (id) => deleteDoc(COLLECTION, id);
