const { getAll, getDoc, createDoc, updateDoc, deleteDoc } = require('./base.service');
const { Promocion, Campus } = require('../models');

async function obtenerPromociones() {
  const promociones = await getAll(Promocion.collectionName);
  const campus = await getAll(Campus.collectionName);
  return promociones.map((promo) => ({
    ...promo,
    campusData: campus.find((item) => item.nombre === promo.campus) || null,
  }));
}

async function obtenerPromocionPorId(id) {
  const promocion = await getDoc(Promocion.collectionName, id);
  if (!promocion) return null;
  const campus = await getAll(Campus.collectionName);
  return {
    ...promocion,
    campusData: campus.find((item) => item.nombre === promocion.campus) || null,
  };
}

async function crearPromocion(data) {
  if (new Date(data.fechaInicio) >= new Date(data.fechaFin)) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  const promocion = Promocion.buildPromocion({
    ...data,
    id: data.id || `promo_${Date.now()}`,
  });

  return createDoc(Promocion.collectionName, promocion.id, promocion);
}

async function actualizarPromocion(id, data) {
  const promocionExistente = await getDoc(Promocion.collectionName, id);
  if (!promocionExistente) {
    throw new Error('Promoción no encontrada');
  }

  if (data.fechaInicio && data.fechaFin && new Date(data.fechaInicio) >= new Date(data.fechaFin)) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  return updateDoc(Promocion.collectionName, id, { ...data, updatedAt: new Date().toISOString() });
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
