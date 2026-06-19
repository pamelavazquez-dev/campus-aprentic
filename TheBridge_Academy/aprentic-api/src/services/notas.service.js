const { getAll, getDoc, createDoc, updateDoc, deleteDoc } = require('./base.service');
const { Nota } = require('../models');

async function obtenerNotas() {
  return getAll(Nota.collectionName);
}

async function obtenerNotaPorId(id) {
  return getDoc(Nota.collectionName, id);
}

async function crearNota(data) {
  const id = data.id || `nota_${Date.now()}`;
  const nota = Nota.buildNota({
    id,
    proyectoId: data.proyectoId,
    alumnoId: data.alumnoId,
    profesorId: data.profesorId,
    valor: data.valor,
    comentario: data.comentario,
    creadoEn: data.creadoEn,
    actualizadoEn: data.actualizadoEn,
  });

  return createDoc(Nota.collectionName, id, nota);
}

async function actualizarNota(id, data) {
  const existente = await getDoc(Nota.collectionName, id);
  if (!existente) throw new Error('Nota no encontrada');

  const updatePayload = {};
  if (data.proyectoId !== undefined) updatePayload.proyectoId = data.proyectoId;
  if (data.alumnoId !== undefined) updatePayload.alumnoId = data.alumnoId;
  if (data.profesorId !== undefined) updatePayload.profesorId = data.profesorId;
  if (data.valor !== undefined) updatePayload.valor = data.valor;
  if (data.comentario !== undefined) updatePayload.comentario = data.comentario;
  if (data.creadoEn !== undefined) updatePayload.creadoEn = data.creadoEn;
  if (data.actualizadoEn !== undefined) updatePayload.actualizadoEn = data.actualizadoEn;

  return updateDoc(Nota.collectionName, id, updatePayload);
}

async function obtenerNotasPorProyecto(proyectoId) {
  const notas = await getAll(Nota.collectionName);
  return notas.filter((nota) => nota.proyectoId === proyectoId);
}

async function obtenerNotasPorAlumno(alumnoId) {
  const notas = await getAll(Nota.collectionName);
  return notas.filter((nota) => nota.alumnoId === alumnoId);
}

async function obtenerNotasPorProfesor(profesorId) {
  const notas = await getAll(Nota.collectionName);
  return notas.filter((nota) => nota.profesorId === profesorId);
}

async function eliminarNota(id) {
  return deleteDoc(Nota.collectionName, id);
}

module.exports = {
  obtenerNotas,
  obtenerNotaPorId,
  crearNota,
  actualizarNota,
  obtenerNotasPorProyecto,
  obtenerNotasPorAlumno,
  obtenerNotasPorProfesor,
  eliminarNota,
};
