const { getAll, getDoc, createDoc, updateDoc, deleteDoc, getDocIdFromRef } = require('./base.service');
const { Promocion, Campus } = require('../models');

function isInvalidDateRange(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return false;
  return new Date(fechaInicio) >= new Date(fechaFin);
}

async function obtenerPromociones() {
  const promociones = await getAll(Promocion.collectionName);
  const campus = await getAll(Campus.collectionName);

  return promociones.map((promo) => {
    const campusId = getDocIdFromRef(promo.campus_id || promo.campus);
    return {
      ...promo,
      campusData: campus.find((item) => item.id === campusId) || null,
    };
  });
}

async function obtenerPromocionPorId(id) {
  const promocion = await getDoc(Promocion.collectionName, id);
  if (!promocion) return null;

  const campusId = getDocIdFromRef(promocion.campus_id || promocion.campus);
  const campus = campusId ? await getDoc(Campus.collectionName, campusId) : null;

  return {
    ...promocion,
    campusData: campus || null,
  };
}

async function crearPromocion(data) {
  if (isInvalidDateRange(data.fechaInicio, data.fechaFin)) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  const id = data.id || `promo_${Date.now()}`;
  const promocion = Promocion.buildPromocion({
    nombre: data.nombre,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    campus_id: data.campus_id,
    alumnos_id: data.alumnos_id,
    profesor_id: data.profesor_id,
  });

  return createDoc(Promocion.collectionName, id, promocion);
}

async function actualizarPromocion(id, data) {
  const promocionExistente = await getDoc(Promocion.collectionName, id);
  if (!promocionExistente) throw new Error('Promocion no encontrada');

  const nextFechaInicio = data.fechaInicio ?? promocionExistente.fechaInicio;
  const nextFechaFin = data.fechaFin ?? promocionExistente.fechaFin;
  if (isInvalidDateRange(nextFechaInicio, nextFechaFin)) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  const updatePayload = {};
  if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
  if (data.fechaInicio !== undefined) updatePayload.fechaInicio = data.fechaInicio;
  if (data.fechaFin !== undefined) updatePayload.fechaFin = data.fechaFin;
  if (data.campus_id !== undefined) updatePayload.campus_id = data.campus_id;
  if (data.alumnos_id !== undefined) updatePayload.alumnos_id = data.alumnos_id;
  if (data.profesor_id !== undefined) updatePayload.profesor_id = data.profesor_id;

  return updateDoc(Promocion.collectionName, id, updatePayload);
}

async function eliminarPromocion(id) {
  await deleteDoc(Promocion.collectionName, id);
}

module.exports = {
  obtenerPromociones,
  obtenerPromocionPorId,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
};
