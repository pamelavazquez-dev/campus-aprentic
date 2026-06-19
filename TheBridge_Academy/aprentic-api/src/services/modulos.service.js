const { getAll, getDoc, createDoc, updateDoc, deleteDoc, getDocIdFromRef } = require('./base.service');
const { Modulo } = require('../models');

async function obtenerModulos() {
  return getAll(Modulo.collectionName);
}

async function obtenerModuloPorId(id) {
  return getDoc(Modulo.collectionName, id);
}

async function crearModulo(data) {
  const id = data.id || `modulo_${Date.now()}`;
  const modulo = Modulo.buildModulo({
    nombre: data.nombre,
    titulo: data.titulo,
    horas: data.horas,
    lecciones_Id: data.lecciones_Id,
    lecciones_id: data.lecciones_id,
  });

  return createDoc(Modulo.collectionName, id, modulo);
}

async function actualizarModulo(id, data) {
  const existente = await getDoc(Modulo.collectionName, id);
  if (!existente) throw new Error('Modulo no encontrado');

  const updatePayload = {};
  if (data.nombre !== undefined || data.titulo !== undefined) {
    updatePayload.nombre = data.nombre ?? data.titulo;
  }
  if (data.horas !== undefined) updatePayload.horas = data.horas;
  if (data.lecciones_Id !== undefined || data.lecciones_id !== undefined) {
    updatePayload.lecciones_Id = data.lecciones_Id || data.lecciones_id;
  }

  return updateDoc(Modulo.collectionName, id, updatePayload);
}

async function obtenerModulosPorLeccion(leccionId) {
  const modulos = await getAll(Modulo.collectionName);
  return modulos.filter((modulo) => (
    Array.isArray(modulo.lecciones_Id)
    && modulo.lecciones_Id.some((ref) => getDocIdFromRef(ref) === leccionId)
  ));
}

async function eliminarModulo(id) {
  return deleteDoc(Modulo.collectionName, id);
}

module.exports = {
  obtenerModulos,
  obtenerModuloPorId,
  crearModulo,
  actualizarModulo,
  obtenerModulosPorLeccion,
  eliminarModulo,
};
