const { getAll, getDoc, createDoc, updateDoc, deleteDoc, getDocIdFromRef } = require('./base.service');
const { Proyecto } = require('../models');

function getPromocionId(data) {
  return getDocIdFromRef(data.promocion_id) || data.promocionId || '';
}

async function obtenerProyectos() {
  return getAll(Proyecto.collectionName);
}

async function obtenerProyectoPorId(id) {
  return getDoc(Proyecto.collectionName, id);
}

async function crearProyecto(data) {
  const id = data.id || `proy_${Date.now()}`;
  const proyecto = Proyecto.buildProyecto({
    id,
    titulo: data.titulo,
    descripcion: data.descripcion,
    promocionId: getPromocionId(data),
    alumnoIds: data.alumnoIds,
    notaIds: data.notaIds,
    notas: data.notas,
    estado: data.estado,
  });

  return createDoc(Proyecto.collectionName, id, proyecto);
}

async function actualizarProyecto(id, data) {
  const proyectoExistente = await getDoc(Proyecto.collectionName, id);
  if (!proyectoExistente) throw new Error('Proyecto no encontrado');

  const updatePayload = { ...data };
  if (data.promocion_id !== undefined || data.promocionId !== undefined) {
    updatePayload.promocionId = getPromocionId(data);
    delete updatePayload.promocion_id;
  }

  return updateDoc(Proyecto.collectionName, id, updatePayload);
}

async function eliminarProyecto(id) {
  await deleteDoc(Proyecto.collectionName, id);
}

module.exports = {
  obtenerProyectos,
  obtenerProyectoPorId,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
};
