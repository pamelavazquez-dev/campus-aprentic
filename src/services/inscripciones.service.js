import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { inscripcionConverter, Inscripcion } from '../models/Inscripcion.model';

const COLLECTION = 'inscripciones';

export const getInscripcionById = (id) => getDoc(COLLECTION, id, inscripcionConverter);
export const getAllInscripciones = () => getAll(COLLECTION, inscripcionConverter);
export const createInscripcion = (id, data) => {
  const model = data instanceof Inscripcion ? data : new Inscripcion(id, data.nombre, data.apellidos, data.dni, data.email, data.campus_id, data.promocion_id, data.aceptada, data.observaciones, data.creadoEn, data.actualizadoEn);
  return createDoc(COLLECTION, id, model, inscripcionConverter);
};
export const updateInscripcion = (id, data) => {
  const model = data instanceof Inscripcion ? data : new Inscripcion(id, data.nombre, data.apellidos, data.dni, data.email, data.campus_id, data.promocion_id, data.aceptada, data.observaciones, data.creadoEn, data.actualizadoEn);
  return updateDoc(COLLECTION, id, model, inscripcionConverter);
};
export const deleteInscripcion = (id) => deleteDoc(COLLECTION, id);
