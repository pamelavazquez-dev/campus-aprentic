const { getAll, getDoc, createDoc, updateDoc, deleteDoc } = require('./base.service');
const { Profesor } = require('../models');

async function obtenerProfesores() {
  return getAll(Profesor.collectionName);
}

async function obtenerProfesorPorId(id) {
  return getDoc(Profesor.collectionName, id);
}

async function crearProfesor(data) {
  const profesores = await getAll(Profesor.collectionName);
  if (data.email && profesores.some((item) => item.email === data.email)) {
    throw new Error('El email ya esta registrado para otro profesor');
  }

  const id = data.id || data.uid || data.authUid || `prof_${Date.now()}`;
  const profesor = Profesor.buildProfesor({
    nombre: data.nombre,
    email: data.email,
    avatar: data.avatar,
    campus_id: data.campus_id,
    promocion_id: Array.isArray(data.promocion_id) ? data.promocion_id : data.promocion_id ? [data.promocion_id] : [],
    isActive: data.isActive,
  });

  return createDoc(Profesor.collectionName, id, profesor);
}

async function actualizarProfesor(id, data) {
  const profesorExistente = await getDoc(Profesor.collectionName, id);
  if (!profesorExistente) throw new Error('Profesor no encontrado');

  if (data.email && data.email !== profesorExistente.email) {
    const profesores = await getAll(Profesor.collectionName);
    if (profesores.some((item) => item.email === data.email && item.id !== id)) {
      throw new Error('El email ya esta registrado para otro profesor');
    }
  }

  const updatePayload = {};
  if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.avatar !== undefined) updatePayload.avatar = data.avatar;
  if (data.campus_id !== undefined) updatePayload.campus_id = data.campus_id;
  if (data.promocion_id !== undefined) {
    updatePayload.promocion_id = Array.isArray(data.promocion_id) ? data.promocion_id : [data.promocion_id];
  }
  if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

  return updateDoc(Profesor.collectionName, id, updatePayload);
}

async function eliminarProfesor(id) {
  const profesor = await getDoc(Profesor.collectionName, id);
  if (!profesor) throw new Error('Profesor no encontrado');
  await deleteDoc(Profesor.collectionName, id);
}

module.exports = {
  obtenerProfesores,
  obtenerProfesorPorId,
  crearProfesor,
  actualizarProfesor,
  eliminarProfesor,
};
