import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { adminConverter, Admin } from '../models/Admin.model';

const COLLECTION = 'admin';

export const getAdminById = (id) => getDoc(COLLECTION, id, adminConverter);
export const getAllAdmins = () => getAll(COLLECTION, adminConverter);
export const createAdmin = (id, data) => {
  const model = data instanceof Admin ? data : new Admin(id, data.nombre, data.email, data.avatar, data.campus_asignados, data.isActive);
  return createDoc(COLLECTION, id, model, adminConverter);
};
export const updateAdmin = (id, data) => {
  const model = data instanceof Admin ? data : new Admin(id, data.nombre, data.email, data.avatar, data.campus_asignados, data.isActive);
  return updateDoc(COLLECTION, id, model, adminConverter);
};
export const deleteAdmin = (id) => deleteDoc(COLLECTION, id);
