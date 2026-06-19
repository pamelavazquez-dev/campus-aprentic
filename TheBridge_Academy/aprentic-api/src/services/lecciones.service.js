const { getAll, getDoc, createDoc, updateDoc, deleteDoc, getDocIdFromRef } = require('./base.service');
const { Leccion } = require('../models');

async function obtenerLecciones() {
  return getAll(Leccion.collectionName);
}

async function obtenerLeccionPorId(id) {
  return getDoc(Leccion.collectionName, id);
}

async function crearLeccion(data) {
  const id = data.id || `leccion_${Date.now()}`;
  const leccion = Leccion.buildLeccion({
    modulo_id: data.modulo_id,
    titulo: data.titulo,
    descripcion: data.descripcion,
    description: data.description,
    contenido_url: data.contenido_url,
    videos_url: data.videos_url,
  });

  return createDoc(Leccion.collectionName, id, leccion);
}

async function actualizarLeccion(id, data) {
  const existente = await getDoc(Leccion.collectionName, id);
  if (!existente) throw new Error('Leccion no encontrada');

  const updatePayload = {};
  if (data.modulo_id !== undefined) updatePayload.modulo_id = data.modulo_id;
  if (data.titulo !== undefined) updatePayload.titulo = data.titulo;
  if (data.descripcion !== undefined || data.description !== undefined) {
    updatePayload.descripcion = data.descripcion ?? data.description;
  }
  if (data.contenido_url !== undefined) updatePayload.contenido_url = data.contenido_url;
  if (data.videos_url !== undefined) updatePayload.videos_url = data.videos_url;

  return updateDoc(Leccion.collectionName, id, updatePayload);
}

async function obtenerLeccionesPorModulo(moduloId) {
  const lecciones = await getAll(Leccion.collectionName);
  return lecciones.filter((leccion) => getDocIdFromRef(leccion.modulo_id) === moduloId);
}

async function eliminarLeccion(id) {
  return deleteDoc(Leccion.collectionName, id);
}

module.exports = {
  obtenerLecciones,
  obtenerLeccionPorId,
  crearLeccion,
  actualizarLeccion,
  obtenerLeccionesPorModulo,
  eliminarLeccion,
};
