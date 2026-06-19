const { getAll, getDoc, createDoc, updateDoc, deleteDoc } = require('./base.service');
const { Campus } = require('../models');

async function obtenerCampus() {
  return getAll(Campus.collectionName);
}

async function obtenerCampusPorId(id) {
  return getDoc(Campus.collectionName, id);
}

async function crearCampus(data) {
  const id = data.id || `campus_${Date.now()}`;
  const campus = Campus.buildCampus({
    nombre: data.nombre,
    sede: data.sede,
    coordinadores_id: data.coordinadores_id,
    modulos_id: data.modulos_id,
    promociones_id: data.promociones_id,
  });

  return createDoc(Campus.collectionName, id, campus);
}

async function actualizarCampus(id, data) {
  const existente = await getDoc(Campus.collectionName, id);
  if (!existente) throw new Error('Campus no encontrado');

  const updatePayload = {};
  if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
  if (data.sede !== undefined) updatePayload.sede = data.sede;
  if (data.coordinadores_id !== undefined) updatePayload.coordinadores_id = data.coordinadores_id;
  if (data.modulos_id !== undefined) updatePayload.modulos_id = data.modulos_id;
  if (data.promociones_id !== undefined) updatePayload.promociones_id = data.promociones_id;

  return updateDoc(Campus.collectionName, id, updatePayload);
}

async function eliminarCampus(id) {
  return deleteDoc(Campus.collectionName, id);
}

module.exports = {
  obtenerCampus,
  obtenerCampusPorId,
  crearCampus,
  actualizarCampus,
  eliminarCampus,
};
