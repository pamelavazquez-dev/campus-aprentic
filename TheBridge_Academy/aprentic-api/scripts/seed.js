#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const env = require('../src/config/env');
const { db, auth } = require('../src/config/db');

// Script de seed que genera CSVs de ejemplo en ./data y escribe datos de prueba en Firestore.
// Ejecutar: `node scripts/seed.js` desde la raíz del proyecto `aprentic-api`

const outDir = path.join(__dirname, '..', 'data');

function writeCsv(filename, headers, rows) {
  const content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n') + '\n';
  fs.writeFileSync(path.join(outDir, filename), content, 'utf8');
  console.log('Wrote', filename);
}

function getSeedData() {
  const campus = [
    { id: 'c1', nombre: 'Madrid', ubicacion: 'Madrid Centro', sede: 'Principal' },
    { id: 'c2', nombre: 'Barcelona', ubicacion: 'Barcelona 22', sede: 'Sants' },
  ];

  const promociones = [
    { id: 'p1', nombre: 'Fullstack Web 2026', fechaInicio: '2026-01-05', fechaFin: '2026-06-30', campus: 'c1', estado: 'activo', cursoIds: ['cu1'] },
    { id: 'p2', nombre: 'Data Science 2026', fechaInicio: '2026-02-01', fechaFin: '2026-07-31', campus: 'c2', estado: 'activo', cursoIds: ['cu2'] },
  ];

  const usuarios = [
    { id: 'u1', nombre: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', passwordHash: 'test123', rol: 'alumno', avatar: '', estado: 'activo' },
    { id: 'u2', nombre: 'Ana Pérez', email: 'ana.perez@example.com', passwordHash: 'test123', rol: 'profesor', avatar: '', estado: 'activo' },
    { id: 'u3', nombre: 'María López', email: 'maria.lopez@example.com', passwordHash: 'test123', rol: 'alumno', avatar: '', estado: 'activo' },
  ];

  const profesores = [
    { id: 'pr1', nombre: 'Ana Pérez', email: 'ana.perez@example.com', avatar: '', cursoIds: ['cu1'] },
    { id: 'pr2', nombre: 'Luis Gómez', email: 'luis.gomez@example.com', avatar: '', cursoIds: ['cu2'] },
  ];

  const alumnos = [
    { id: 'a1', nombre: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', foto: '', promocionId: 'p1', cursoIds: ['cu1'], inscripcionIds: ['i1'] },
    { id: 'a2', nombre: 'María López', email: 'maria.lopez@example.com', foto: '', promocionId: 'p1', cursoIds: ['cu1'], inscripcionIds: ['i2'] },
    { id: 'a3', nombre: 'Jorge Martínez', email: 'jorge.martinez@example.com', foto: '', promocionId: 'p2', cursoIds: ['cu2'], inscripcionIds: ['i3'] },
  ];

  const cursos = [
    { id: 'cu1', nombre: 'Fullstack Web', descripcion: 'Curso completo de desarrollo web', instructorId: 'pr1', precio: 0, duracionHoras: 240, categoria: 'Desarrollo Web', portadas: ['https://example.com/cover1.jpg'], publicado: true, moduloIds: ['m1'], inscripcionIds: ['i1', 'i2'], reviewIds: ['r1'] },
    { id: 'cu2', nombre: 'Data Science', descripcion: 'Curso de análisis de datos', instructorId: 'pr2', precio: 0, duracionHoras: 200, categoria: 'Data', portadas: ['https://example.com/cover2.jpg'], publicado: true, moduloIds: ['m2'], inscripcionIds: ['i3'], reviewIds: [] },
  ];

  const modulos = [
    { id: 'm1', cursoId: 'cu1', titulo: 'Introducción a Web', descripcion: 'Bases de HTML, CSS y JS', orden: 1, leccionIds: ['l1', 'l2'] },
    { id: 'm2', cursoId: 'cu2', titulo: 'Fundamentos de Data Science', descripcion: 'Introducción a Python y estadística', orden: 1, leccionIds: ['l3'] },
  ];

  const lecciones = [
    { id: 'l1', moduloId: 'm1', titulo: 'HTML básico', contenido: 'Estructura de una página', tipoContenido: 'video', recursoUrl: 'https://example.com/html', orden: 1, completadaPor: [] },
    { id: 'l2', moduloId: 'm1', titulo: 'JavaScript básico', contenido: 'Variables y funciones', tipoContenido: 'video', recursoUrl: 'https://example.com/js', orden: 2, completadaPor: [] },
    { id: 'l3', moduloId: 'm2', titulo: 'Python y datos', contenido: 'Primeros pasos con pandas', tipoContenido: 'video', recursoUrl: 'https://example.com/python', orden: 1, completadaPor: [] },
  ];

  const inscripciones = [
    { id: 'i1', alumnoId: 'a1', cursoId: 'cu1', instructorId: 'pr1', estado: 'activa', progreso: { completadas: 0, totales: 2 }, creadoEn: '2026-01-10T10:00:00Z', actualizadoEn: '2026-01-10T10:00:00Z' },
    { id: 'i2', alumnoId: 'a2', cursoId: 'cu1', instructorId: 'pr1', estado: 'activa', progreso: { completadas: 0, totales: 2 }, creadoEn: '2026-01-11T11:00:00Z', actualizadoEn: '2026-01-11T11:00:00Z' },
    { id: 'i3', alumnoId: 'a3', cursoId: 'cu2', instructorId: 'pr2', estado: 'activa', progreso: { completadas: 0, totales: 1 }, creadoEn: '2026-02-05T12:00:00Z', actualizadoEn: '2026-02-05T12:00:00Z' },
  ];

  const reviews = [
    { id: 'r1', cursoId: 'cu1', alumnoId: 'a1', calificacion: 5, comentario: 'Excelente curso', publicado: true, creadoEn: '2026-03-01T12:00:00Z', actualizadoEn: '2026-03-01T12:00:00Z' },
  ];

  const proyectos = [
    { id: 'pr1', titulo: 'Proyecto A', descripcion: 'Entrega inicial', promocionId: 'p1', alumnoIds: ['a1', 'a2'], notaIds: ['n1'], notas: [], estado: 'abierto' },
  ];

  const notas = [
    { id: 'n1', proyectoId: 'pr1', alumnoId: 'a1', profesorId: 'pr1', valor: 9, comentario: 'Muy buen trabajo', creadoEn: '2026-04-15T12:00:00Z', actualizadoEn: '2026-04-15T12:00:00Z' },
  ];

  return { campus, promociones, usuarios, profesores, alumnos, cursos, modulos, lecciones, inscripciones, reviews, proyectos, notas };
}

async function authenticateIfNeeded() {
  if (!env.FIREBASE_TEST_USER_EMAIL || !env.FIREBASE_TEST_USER_PASSWORD) {
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(env.FIREBASE_TEST_USER_EMAIL, env.FIREBASE_TEST_USER_PASSWORD);
    console.log('Autenticado con Firebase Test User.');
  } catch (error) {
    console.warn('No se pudo autenticar con Firebase Test User:', error.message);
  }
}

async function injectFirestore(data) {
  if (!db || typeof db.batch !== 'function') {
    console.error('No se pudo inicializar Firestore. Revisa src/config/db.js.');
    return;
  }

  await authenticateIfNeeded();

  const batch = db.batch();

  const collections = [
    { name: 'campus', items: data.campus },
    { name: 'promociones', items: data.promociones },
    { name: 'usuarios', items: data.usuarios },
    { name: 'profesores', items: data.profesores },
    { name: 'alumnos', items: data.alumnos },
    { name: 'cursos', items: data.cursos },
    { name: 'modulos', items: data.modulos },
    { name: 'lecciones', items: data.lecciones },
    { name: 'inscripciones', items: data.inscripciones },
    { name: 'reviews', items: data.reviews },
    { name: 'proyectos', items: data.proyectos },
    { name: 'notas', items: data.notas },
  ];

  collections.forEach((collectionData) => {
    collectionData.items.forEach((item) => {
      const ref = db.collection(collectionData.name).doc(item.id);
      batch.set(ref, item);
    });
  });

  await batch.commit();
  console.log('Datos inyectados a Firestore.');
}

function generateCsvs(data) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  writeCsv('campus.csv', ['id', 'nombre', 'ubicacion', 'sede'], data.campus.map((item) => [item.id, item.nombre, item.ubicacion, item.sede]));
  writeCsv('promociones.csv', ['id', 'nombre', 'fechaInicio', 'fechaFin', 'campus', 'estado', 'cursoIds'], data.promociones.map((item) => [item.id, item.nombre, item.fechaInicio, item.fechaFin, item.campus, item.estado, item.cursoIds.join('|')]));
  writeCsv('usuarios.csv', ['id', 'nombre', 'email', 'rol', 'estado'], data.usuarios.map((item) => [item.id, item.nombre, item.email, item.rol, item.estado]));
  writeCsv('profesores.csv', ['id', 'nombre', 'email', 'cursoIds'], data.profesores.map((item) => [item.id, item.nombre, item.email, item.cursoIds.join('|')]));
  writeCsv('alumnos.csv', ['id', 'nombre', 'email', 'promocionId', 'cursoIds'], data.alumnos.map((item) => [item.id, item.nombre, item.email, item.promocionId, item.cursoIds.join('|')]));
}

async function run() {
  const data = getSeedData();
  generateCsvs(data);
  await injectFirestore(data);
}

run().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
