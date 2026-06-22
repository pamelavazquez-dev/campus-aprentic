import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { moduloConverter, Modulo } from '../models/Modulo.model';

const COLLECTION = 'modulos';

export const getModuloById = (id) => getDoc(COLLECTION, id, moduloConverter);
export const getAllModulos = () => getAll(COLLECTION, moduloConverter);
export const createModulo = (id, data) => {
  const model = data instanceof Modulo ? data : new Modulo(id, data.nombre, data.horas, data.lecciones_Id);
  return createDoc(COLLECTION, id, model, moduloConverter);
};
export const updateModulo = (id, data) => {
  const model = data instanceof Modulo ? data : new Modulo(id, data.nombre, data.horas, data.lecciones_Id);
  return updateDoc(COLLECTION, id, model, moduloConverter);
};
export const deleteModulo = (id) => deleteDoc(COLLECTION, id);
