import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { adminConverter, Admin } from '../models/Admin.model';
import { adminSchema, adminEstadoSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';

const COLLECTION = 'admin';

export const getAdminById = (id) => getDoc(COLLECTION, id, adminConverter);
export const getAllAdmins = () => getAll(COLLECTION, adminConverter);
export const createAdmin = (id, data) => {
  const adminData = validateData(adminSchema, data);
  const model = data instanceof Admin ? data : new Admin(id, adminData.nombre, adminData.email, adminData.avatar, adminData.campus_asignados, adminData.isActive);
  return createDoc(COLLECTION, id, model, adminConverter);
};
export const updateAdmin = (id, data) => {
  const adminData = validateData(adminSchema, data);
  const model = data instanceof Admin ? data : new Admin(id, adminData.nombre, adminData.email, adminData.avatar, adminData.campus_asignados, adminData.isActive);
  return updateDoc(COLLECTION, id, model, adminConverter);
};
export const updateAdminEstado = async (id, isActive) => {
  const estadoData = validateData(adminEstadoSchema, { isActive });
  await updateDoc(COLLECTION, id, estadoData);
  return { id, ...estadoData };
};
export const deleteAdmin = (id) => deleteDoc(COLLECTION, id);
