const { getAll, getDoc, createDoc, updateDoc, deleteDoc } = require('./base.service');
const { Profesor, Usuario } = require('../models');

async function obtenerProfesores() {
  return getAll(Profesor.collectionName);
}

async function obtenerProfesorPorId(id) {
  return getDoc(Profesor.collectionName, id);
}

async function crearProfesor(data) {
  const profesores = await getAll(Profesor.collectionName);
  if (profesores.some((item) => item.email === data.email)) {
    throw new Error('El email ya está registrado para otro profesor');
  }

  const profesor = Profesor.buildProfesor({
    ...data,
    id: data.id || `prof_${Date.now()}`,
  });

  await createDoc(Profesor.collectionName, profesor.id, profesor);
  const usuario = Usuario.buildUsuario({
    id: `user_${Date.now()}`,
    nombre: profesor.nombre,
    email: profesor.email,
    passwordHash: data.passwordHash || '',
    rol: 'profesor',
  });
  await createDoc(Usuario.collectionName, usuario.id, usuario);
  return profesor;
}

async function actualizarProfesor(id, data) {
  const profesorExistente = await getDoc(Profesor.collectionName, id);
  if (!profesorExistente) {
    throw new Error('Profesor no encontrado');
  }

  if (data.email && data.email !== profesorExistente.email) {
    const profesores = await getAll(Profesor.collectionName);
    if (profesores.some((item) => item.email === data.email && item.id !== id)) {
      throw new Error('El email ya está registrado para otro profesor');
    }
  }

  return updateDoc(Profesor.collectionName, id, { ...data, updatedAt: new Date().toISOString() });
}

async function eliminarProfesor(id) {
  const profesor = await getDoc(Profesor.collectionName, id);
  if (!profesor) {
    throw new Error('Profesor no encontrado');
  }

  const usuarios = await getAll(Usuario.collectionName);
  const usuario = usuarios.find((item) => item.email === profesor.email);
  if (usuario) {
    await deleteDoc(Usuario.collectionName, usuario.id);
  }
  await deleteDoc(Profesor.collectionName, id);
}

module.exports = {
  obtenerProfesores,
  obtenerProfesorPorId,
  crearProfesor,
  actualizarProfesor,
  eliminarProfesor,
};
