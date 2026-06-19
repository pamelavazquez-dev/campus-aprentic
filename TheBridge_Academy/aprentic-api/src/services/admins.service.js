const { getAll, getDoc, createDoc, updateDoc, deleteDoc } = require('./base.service');
const { Admin } = require('../models');

async function obtenerAdmins() {
  return getAll(Admin.collectionName);
}

async function obtenerAdminPorId(id) {
  return getDoc(Admin.collectionName, id);
}

async function crearAdmin(data) {
  const id = data.id || data.uid || data.authUid;
  if (!id) throw new Error('Se requiere id o uid de Firebase Auth para crear un admin');

  const admin = Admin.buildAdmin({
    nombre: data.nombre,
    email: data.email,
    avatar: data.avatar,
    campus_asignados: data.campus_asignados,
    isActive: data.isActive,
  });
  return createDoc(Admin.collectionName, id, admin);
}

async function actualizarAdmin(id, data) {
  const existente = await getDoc(Admin.collectionName, id);
  if (!existente) throw new Error('Admin no encontrado');

  const updatePayload = {};
  if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.avatar !== undefined) updatePayload.avatar = data.avatar;
  if (data.campus_asignados !== undefined) updatePayload.campus_asignados = data.campus_asignados;
  if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

  return updateDoc(Admin.collectionName, id, updatePayload);
}

async function eliminarAdmin(id) {
  return deleteDoc(Admin.collectionName, id);
}

module.exports = {
  obtenerAdmins,
  obtenerAdminPorId,
  crearAdmin,
  actualizarAdmin,
  eliminarAdmin,
};
