import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { profesorConverter, Profesor } from '../models/Profesor.model';
import { profesorEstadoSchema, profesorSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';

const COLLECTION = 'profesores';

export const getProfesorById = (id) => getDoc(COLLECTION, id, profesorConverter);
export const getAllProfesores = () => getAll(COLLECTION, profesorConverter);
export const createProfesor = (id, data) => {
  const profesorData = validateData(profesorSchema, data);
  const model = data instanceof Profesor ? data : new Profesor(id, profesorData.nombre, profesorData.email, profesorData.avatar, profesorData.campus_id, profesorData.promocion_id, profesorData.isActive);
  return createDoc(COLLECTION, id, model, profesorConverter);
};
export const updateProfesor = (id, data) => {
  const profesorData = validateData(profesorSchema, data);
  const model = data instanceof Profesor ? data : new Profesor(id, profesorData.nombre, profesorData.email, profesorData.avatar, profesorData.campus_id, profesorData.promocion_id, profesorData.isActive);
  return updateDoc(COLLECTION, id, model, profesorConverter);
};
export const updateProfesorEstado = async (id, isActive) => {
  const estadoData = validateData(profesorEstadoSchema, { isActive });
  await updateDoc(COLLECTION, id, estadoData);
  return { id, ...estadoData };
};
export const deleteProfesor = (id) => deleteDoc(COLLECTION, id);
