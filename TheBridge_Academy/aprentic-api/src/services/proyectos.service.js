const { getAll, getDoc, createDoc, updateDoc, deleteDoc } = require('./base.service');
const { Proyecto, Promocion, Alumno } = require('../models');

async function obtenerProyectos() {
  const proyectos = await getAll(Proyecto.collectionName);
  return proyectos;
}

async function obtenerProyectoPorId(id) {
  return getDoc(Proyecto.collectionName, id);
}

async function crearProyecto(data) {
  const promocion = await getDoc(Promocion.collectionName, data.promocionId);
  if (!promocion) {
    throw new Error('La promoción asociada no existe');
  }

  const alumnoIds = data.alumnoIds || [];
  const alumnos = await getAll(Alumno.collectionName);
  const invalidAlumno = alumnoIds.find((alumnoId) => !alumnos.some((alumno) => alumno.id === alumnoId));
  if (invalidAlumno) {
    throw new Error(`El alumno ${invalidAlumno} no existe`);
  }

  const proyecto = Proyecto.buildProyecto({
    ...data,
    id: data.id || `proy_${Date.now()}`,
  });

  return createDoc(Proyecto.collectionName, proyecto.id, proyecto);
}

async function actualizarProyecto(id, data) {
  const proyectoExistente = await getDoc(Proyecto.collectionName, id);
  if (!proyectoExistente) {
    throw new Error('Proyecto no encontrado');
  }

  if (data.promocionId) {
    const promocion = await getDoc(Promocion.collectionName, data.promocionId);
    if (!promocion) {
      throw new Error('La promoción asociada no existe');
    }
  }

  if (data.alumnoIds) {
    const alumnos = await getAll(Alumno.collectionName);
    const invalidAlumno = data.alumnoIds.find((alumnoId) => !alumnos.some((alumno) => alumno.id === alumnoId));
    if (invalidAlumno) {
      throw new Error(`El alumno ${invalidAlumno} no existe`);
    }
  }

  return updateDoc(Proyecto.collectionName, id, { ...data, updatedAt: new Date().toISOString() });
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
