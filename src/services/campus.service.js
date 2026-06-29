import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { campusConverter, Campus } from '../models/Campus.model';

const COLLECTION = 'campus';

export const getCampusById = (id) => getDoc(COLLECTION, id, campusConverter);
export const getAllCampus = () => getAll(COLLECTION, campusConverter);
export const createCampus = (id, data) => {
  const model = data instanceof Campus ? data : new Campus(id, data.nombre, data.sede, data.coordinadores_id, data.modulos_id, data.promociones_id);
  return createDoc(COLLECTION, id, model, campusConverter);
};
export const updateCampus = (id, data) => {
  const model = data instanceof Campus ? data : new Campus(id, data.nombre, data.sede, data.coordinadores_id, data.modulos_id, data.promociones_id);
  return updateDoc(COLLECTION, id, model, campusConverter);
};
export const deleteCampus = (id) => deleteDoc(COLLECTION, id);
