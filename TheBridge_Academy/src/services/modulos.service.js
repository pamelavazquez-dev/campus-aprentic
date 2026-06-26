import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { moduloConverter, Modulo } from '../models/Modulo.model';
import { moduloSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';

const COLLECTION = 'modulos';

export const getModuloById = (id) => getDoc(COLLECTION, id, moduloConverter);
export const getAllModulos = () => getAll(COLLECTION, moduloConverter);
export const createModulo = (id, data) => {
  const moduloData = validateData(moduloSchema, data);
  const model = data instanceof Modulo ? data : new Modulo(id, moduloData.nombre, moduloData.horas, moduloData.lecciones_Id, moduloData.tipo, moduloData.activo, moduloData.profesor_id, moduloData.promociones_activas);
  return createDoc(COLLECTION, id, model, moduloConverter);
};
export const updateModulo = (id, data) => {
  const moduloData = validateData(moduloSchema, data);
  const model = data instanceof Modulo ? data : new Modulo(id, moduloData.nombre, moduloData.horas, moduloData.lecciones_Id, moduloData.tipo, moduloData.activo, moduloData.profesor_id, moduloData.promociones_activas);
  return updateDoc(COLLECTION, id, model, moduloConverter);
};
export const deleteModulo = (id) => deleteDoc(COLLECTION, id);
