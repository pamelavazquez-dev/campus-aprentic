const { getAll, getDoc, createDoc, updateDoc, deleteDoc, getDocIdFromRef } = require('./base.service');
const { Inscripcion } = require('../models');

async function obtenerInscripciones() {
  return getAll(Inscripcion.collectionName);
}

async function obtenerInscripcionPorId(id) {
  return getDoc(Inscripcion.collectionName, id);
}

async function crearInscripcion(data) {
  const id = data.id || `insc_${Date.now()}`;
  const inscripcion = Inscripcion.buildInscripcion({
    nombre: data.nombre,
    email: data.email,
    apellidos: data.apellidos,
    dni: data.dni,
    campus_id: data.campus_id,
    promocion_id: data.promocion_id || data.promocionId,
    aceptada: data.aceptada,
    observaciones: data.observaciones,
    creadoEn: data.creadoEn ?? data.creado_En,
    actualizadoEn: data.actualizadoEn,
  });

  return createDoc(Inscripcion.collectionName, id, inscripcion);
}

async function actualizarInscripcion(id, data) {
  const existente = await getDoc(Inscripcion.collectionName, id);
  if (!existente) throw new Error('Inscripcion no encontrada');

  const updatePayload = {};
  if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.apellidos !== undefined) updatePayload.apellidos = data.apellidos;
  if (data.dni !== undefined) updatePayload.dni = data.dni;
  if (data.campus_id !== undefined) updatePayload.campus_id = data.campus_id;
  if (data.promocion_id !== undefined || data.promocionId !== undefined) {
    updatePayload.promocion_id = data.promocion_id || data.promocionId;
  }
  if (data.aceptada !== undefined) updatePayload.aceptada = data.aceptada;
  if (data.observaciones !== undefined) updatePayload.observaciones = data.observaciones;
  if (data.creadoEn !== undefined || data.creado_En !== undefined) {
    updatePayload.creadoEn = data.creadoEn ?? data.creado_En;
  }
  if (data.actualizadoEn !== undefined) updatePayload.actualizadoEn = data.actualizadoEn;

  return updateDoc(Inscripcion.collectionName, id, updatePayload);
}

async function obtenerInscripcionesPorCampus(campusId) {
  const inscripciones = await getAll(Inscripcion.collectionName);
  return inscripciones.filter((item) => getDocIdFromRef(item.campus_id) === campusId);
}

async function obtenerInscripcionesPorPromocion(promocionId) {
  const inscripciones = await getAll(Inscripcion.collectionName);
  return inscripciones.filter((item) => getDocIdFromRef(item.promocion_id) === promocionId);
}

async function eliminarInscripcion(id) {
  return deleteDoc(Inscripcion.collectionName, id);
}

module.exports = {
  obtenerInscripciones,
  obtenerInscripcionPorId,
  crearInscripcion,
  actualizarInscripcion,
  obtenerInscripcionesPorCampus,
  obtenerInscripcionesPorPromocion,
  eliminarInscripcion,
};
