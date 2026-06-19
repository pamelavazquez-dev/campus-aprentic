const { getAll, getDoc, createDoc, updateDoc, deleteDoc, getDocIdFromRef } = require('./base.service');
const { Alumno, Promocion } = require('../models');

function getPrimaryPromocionId(alumno) {
  return getDocIdFromRef(alumno.promocion_id)
    || getDocIdFromRef(Array.isArray(alumno.promociones_id) ? alumno.promociones_id[0] : null);
}

function getPromocionesInput(data) {
  if (Array.isArray(data.promociones_id)) return data.promociones_id;
  if (data.promocion_id) return [data.promocion_id];
  if (data.promocionId) return [data.promocionId];
  return [];
}

async function obtenerAlumnos() {
  const alumnos = await getAll(Alumno.collectionName);
  const promociones = await getAll(Promocion.collectionName);

  return alumnos.map((alumno) => {
    const promotionId = getPrimaryPromocionId(alumno);
    return {
      ...alumno,
      promocion: promociones.find((promo) => promo.id === promotionId) || null,
    };
  });
}

async function obtenerAlumnoPorId(id) {
  const alumno = await getDoc(Alumno.collectionName, id);
  if (!alumno) return null;

  const promotionId = getPrimaryPromocionId(alumno);
  const promocion = promotionId ? await getDoc(Promocion.collectionName, promotionId) : null;
  return { ...alumno, promocion: promocion || null };
}

async function crearAlumno(data) {
  const alumnos = await getAll(Alumno.collectionName);
  if (data.email && alumnos.some((item) => item.email === data.email)) {
    throw new Error('El email ya esta registrado para otro alumno');
  }

  const id = data.id || data.uid || data.authUid || `alumno_${Date.now()}`;
  const alumno = Alumno.buildAlumno({
    nombre: data.nombre,
    email: data.email,
    avatar: data.avatar,
    promociones_id: getPromocionesInput(data),
  });

  return createDoc(Alumno.collectionName, id, alumno);
}

async function actualizarAlumno(id, data) {
  const alumnoExistente = await getDoc(Alumno.collectionName, id);
  if (!alumnoExistente) throw new Error('Alumno no encontrado');

  if (data.email && data.email !== alumnoExistente.email) {
    const alumnos = await getAll(Alumno.collectionName);
    if (alumnos.some((item) => item.email === data.email && item.id !== id)) {
      throw new Error('El email ya esta registrado para otro alumno');
    }
  }

  const updatePayload = {};
  if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.avatar !== undefined) updatePayload.avatar = data.avatar;
  if (
    data.promociones_id !== undefined
    || data.promocion_id !== undefined
    || data.promocionId !== undefined
  ) {
    updatePayload.promociones_id = getPromocionesInput(data);
  }

  return updateDoc(Alumno.collectionName, id, updatePayload);
}

async function eliminarAlumno(id) {
  await deleteDoc(Alumno.collectionName, id);
}

module.exports = {
  obtenerAlumnos,
  obtenerAlumnoPorId,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno,
};
