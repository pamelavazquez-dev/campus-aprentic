import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { alumnoConverter, Alumno } from '../models/Alumno.model';
import { alumnoSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';

const COLLECTION = 'alumnos';

export const getAlumnoById = (id) => getDoc(COLLECTION, id, alumnoConverter);
export const getAllAlumnos = () => getAll(COLLECTION, alumnoConverter);
export const createAlumno = (id, data) => {
  const alumnoData = validateData(alumnoSchema, data);
  const model = data instanceof Alumno ? data : new Alumno(id, alumnoData.nombre, alumnoData.email, alumnoData.avatar, alumnoData.promociones_id, alumnoData.modulos_id);
  return createDoc(COLLECTION, id, model, alumnoConverter);
};
export const updateAlumno = (id, data) => {
  const alumnoData = validateData(alumnoSchema, data);
  const model = data instanceof Alumno ? data : new Alumno(id, alumnoData.nombre, alumnoData.email, alumnoData.avatar, alumnoData.promociones_id, alumnoData.modulos_id);
  return updateDoc(COLLECTION, id, model, alumnoConverter);
};
export const deleteAlumno = (id) => deleteDoc(COLLECTION, id);
