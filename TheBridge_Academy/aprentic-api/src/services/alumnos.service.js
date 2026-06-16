const { getAll, getDoc, createDoc, updateDoc, deleteDoc } = require('./base.service');
const { Alumno, Promocion } = require('../models');

async function obtenerAlumnos() {
  const alumnos = await getAll(Alumno.collectionName);
  const promociones = await getAll(Promocion.collectionName);
  return alumnos.map((alumno) => ({
    ...alumno,
    promocion: promociones.find((promo) => promo.id === alumno.promocionId) || null,
  }));
}

async function obtenerAlumnoPorId(id) {
  const alumno = await getDoc(Alumno.collectionName, id);
  if (!alumno) return null;
  const promocion = await getDoc(Promocion.collectionName, alumno.promocionId);
  return { ...alumno, promocion: promocion || null };
}

async function crearAlumno(data) {
  const alumnos = await getAll(Alumno.collectionName);
  if (alumnos.some((item) => item.email === data.email)) {
    throw new Error('El email ya está registrado para otro alumno');
  }

  const promocion = await getDoc(Promocion.collectionName, data.promocionId);
  if (!promocion) {
    throw new Error('La promoción asociada no existe');
  }

  const alumno = Alumno.buildAlumno({
    ...data,
    id: data.id || `alumno_${Date.now()}`,
  });

  return createDoc(Alumno.collectionName, alumno.id, alumno);
}

async function actualizarAlumno(id, data) {
  const alumnoExistente = await getDoc(Alumno.collectionName, id);
  if (!alumnoExistente) {
    throw new Error('Alumno no encontrado');
  }

  if (data.email && data.email !== alumnoExistente.email) {
    const alumnos = await getAll(Alumno.collectionName);
    if (alumnos.some((item) => item.email === data.email && item.id !== id)) {
      throw new Error('El email ya está registrado para otro alumno');
    }
  }

  if (data.promocionId && data.promocionId !== alumnoExistente.promocionId) {
    const promocion = await getDoc(Promocion.collectionName, data.promocionId);
    if (!promocion) {
      throw new Error('La promoción asociada no existe');
    }
  }

  return updateDoc(Alumno.collectionName, id, { ...data, updatedAt: new Date().toISOString() });
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
