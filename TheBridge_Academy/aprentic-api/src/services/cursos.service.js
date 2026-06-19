const { getAll, getDoc, createDoc, updateDoc, deleteDoc, getDocIdFromRef } = require('./base.service');
const { Curso } = require('../models');

async function obtenerCursos() {
  return getAll(Curso.collectionName);
}

async function obtenerCursoPorId(id) {
  return getDoc(Curso.collectionName, id);
}

async function crearCurso(data) {
  const id = data.id || `curso_${Date.now()}`;
  const curso = Curso.buildCurso({ ...data, id });
  return createDoc(Curso.collectionName, id, curso);
}

async function actualizarCurso(id, data) {
  const existente = await getDoc(Curso.collectionName, id);
  if (!existente) throw new Error('Curso no encontrado');
  return updateDoc(Curso.collectionName, id, data);
}

async function obtenerCursosPorCampus(campusId) {
  const cursos = await getAll(Curso.collectionName);
  return cursos.filter((curso) => getDocIdFromRef(curso.campus_id) === campusId);
}

async function obtenerCursosPorInstructor(instructorId) {
  const cursos = await getAll(Curso.collectionName);
  return cursos.filter((curso) => getDocIdFromRef(curso.instructor_id) === instructorId);
}

async function eliminarCurso(id) {
  return deleteDoc(Curso.collectionName, id);
}

module.exports = {
  obtenerCursos,
  obtenerCursoPorId,
  crearCurso,
  actualizarCurso,
  obtenerCursosPorCampus,
  obtenerCursosPorInstructor,
  eliminarCurso,
};
