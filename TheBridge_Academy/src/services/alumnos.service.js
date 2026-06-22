import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { alumnoConverter, Alumno } from '../models/Alumno.model';

const COLLECTION = 'alumnos';

export const getAlumnoById = (id) => getDoc(COLLECTION, id, alumnoConverter);
export const getAllAlumnos = () => getAll(COLLECTION, alumnoConverter);
export const createAlumno = (id, data) => {
  const model = data instanceof Alumno ? data : new Alumno(id, data.nombre, data.email, data.avatar, data.promociones_id, data.modulos_id);
  return createDoc(COLLECTION, id, model, alumnoConverter);
};
export const updateAlumno = (id, data) => {
  const model = data instanceof Alumno ? data : new Alumno(id, data.nombre, data.email, data.avatar, data.promociones_id, data.modulos_id);
  return updateDoc(COLLECTION, id, model, alumnoConverter);
};
export const deleteAlumno = (id) => deleteDoc(COLLECTION, id);
