import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { promocionConverter, Promocion } from '../models/Promocion.model';

const COLLECTION = 'promociones';

export const getPromocionById = (id) => getDoc(COLLECTION, id, promocionConverter);
export const getAllPromociones = () => getAll(COLLECTION, promocionConverter);
export const createPromocion = (id, data) => {
  // Asegurar que pasamos una instancia o los datos requeridos por el converter
  const promo = data instanceof Promocion ? data : new Promocion(id, data.nombre, data.campus, data.fechaInicio, data.estado);
  return createDoc(COLLECTION, id, promo, promocionConverter);
};
export const updatePromocion = (id, data) => {
  const promo = data instanceof Promocion ? data : new Promocion(id, data.nombre, data.campus, data.fechaInicio, data.estado);
  return updateDoc(COLLECTION, id, promo, promocionConverter);
};
export const deletePromocion = (id) => deleteDoc(COLLECTION, id);
