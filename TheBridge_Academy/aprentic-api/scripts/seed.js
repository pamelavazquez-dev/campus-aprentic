#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { firestore, initialized } = require('../src/config/firebase');

// Script de seed que genera CSVs de ejemplo en ./data y prepara inyección a Firestore
// Ejecutar: `node scripts/seed.js` desde la raíz del proyecto `aprentic-api`

const outDir = path.join(__dirname, '..', 'data');

function writeCsv(filename, headers, rows) {
  const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n') + '\n';
  fs.writeFileSync(path.join(outDir, filename), content, 'utf8');
  console.log('Wrote', filename);
}

function getSeedData() {
  const promociones = [
    { id: 'p1', nombre: 'Fullstack Web 2026', fechaInicio: '2026-01-05', fechaFin: '2026-06-30', campus: 'Madrid' },
    { id: 'p2', nombre: 'Data Science 2026', fechaInicio: '2026-02-01', fechaFin: '2026-07-31', campus: 'Barcelona' }
  ];

  const profesores = [
    { id: 't1', nombre: 'Ana Pérez', email: 'ana.perez@example.com' },
    { id: 't2', nombre: 'Luis Gómez', email: 'luis.gomez@example.com' }
  ];

  const alumnos = [
    { id: 'a1', nombre: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', foto: '', promocionId: 'p1' },
    { id: 'a2', nombre: 'María López', email: 'maria.lopez@example.com', foto: '', promocionId: 'p1' },
    { id: 'a3', nombre: 'Jorge Martínez', email: 'jorge.martinez@example.com', foto: '', promocionId: 'p2' }
  ];

  const proyectos = [
    { id: 'pr1', titulo: 'Proyecto A', promocionId: 'p1', alumnoIds: ['a1', 'a2'] },
    { id: 'pr2', titulo: 'Proyecto B', promocionId: 'p2', alumnoIds: ['a3'] }
  ];

  return { promociones, profesores, alumnos, proyectos };
}

async function injectFirestore(data) {
  if (!initialized || !firestore) {
    console.log('Firebase no está inicializado. Solo se generan los CSV.');
    return;
  }

  const batch = firestore.batch();

  data.promociones.forEach((promo) => {
    const ref = firestore.collection('promociones').doc(promo.id);
    batch.set(ref, promo);
  });

  data.profesores.forEach((profesor) => {
    const ref = firestore.collection('profesores').doc(profesor.id);
    batch.set(ref, profesor);
  });

  data.alumnos.forEach((alumno) => {
    const ref = firestore.collection('alumnos').doc(alumno.id);
    batch.set(ref, alumno);
  });

  data.proyectos.forEach((proyecto) => {
    const ref = firestore.collection('proyectos').doc(proyecto.id);
    batch.set(ref, proyecto);
  });

  await batch.commit();
  console.log('Datos inyectados a Firestore.');
}

function generateCsvs(data) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  writeCsv('promociones.csv', ['id', 'nombre', 'fechaInicio', 'fechaFin', 'campus'], data.promociones.map(p => [p.id, p.nombre, p.fechaInicio, p.fechaFin, p.campus]));
  writeCsv('profesores.csv', ['id', 'nombre', 'email'], data.profesores.map(p => [p.id, p.nombre, p.email]));
  writeCsv('alumnos.csv', ['id', 'nombre', 'email', 'foto', 'promocionId'], data.alumnos.map(a => [a.id, a.nombre, a.email, a.foto, a.promocionId]));
  writeCsv('proyectos.csv', ['id', 'titulo', 'promocionId', 'alumnoIds'], data.proyectos.map(pr => [pr.id, pr.titulo, pr.promocionId, pr.alumnoIds.join('|')]));
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
