import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { promocionConverter, Promocion } from '../models/Promocion.model';
import { promocionSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';

const COLLECTION = 'promociones';

const buildPromocion = (id, data) => {
  const promocionData = validateData(promocionSchema, {
    ...data,
    campus_id: data.campus_id || data.campus || '',
  });

  return data instanceof Promocion
    ? data
    : new Promocion(
      id,
      promocionData.nombre,
      promocionData.fechaInicio,
      promocionData.fechaFin || null,
      promocionData.campus_id,
      promocionData.alumnos_id,
      promocionData.profesor_id,
      promocionData.estado || data.estado || 'activa'
    );
};

export const getPromocionById = (id) => getDoc(COLLECTION, id, promocionConverter);
export const getAllPromociones = () => getAll(COLLECTION, promocionConverter);
export const createPromocion = (id, data) => createDoc(COLLECTION, id, buildPromocion(id, data), promocionConverter);
export const updatePromocion = (id, data) => updateDoc(COLLECTION, id, buildPromocion(id, data), promocionConverter);
export const deletePromocion = (id) => deleteDoc(COLLECTION, id);
