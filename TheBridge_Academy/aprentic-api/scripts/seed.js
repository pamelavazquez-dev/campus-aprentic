#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const env = require('../src/config/env');
const { db, auth } = require('../src/config/db');

// Seed de referencia alineado con las colecciones reales de Firestore.
// Ejecutar desde aprentic-api: node scripts/seed.js

const outDir = path.join(__dirname, '..', 'data');

function writeCsv(filename, headers, rows) {
  const content = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n') + '\n';
  fs.writeFileSync(path.join(outDir, filename), content, 'utf8');
  console.log('Wrote', filename);
}

function getSeedData() {
  const admin = [
    {
      id: 'UID_AUTH_FIREBASE',
      avatar: 'url',
      campus_asignados: ['/campus/fullstack_sevilla_web'],
      email: 'prueba',
      isActice: true,
      ombre: 'prueba',
    },
  ];

  const alumnos = [
    {
      id: 'UID_AUTH_FIREBASE',
      avatar: 'url',
      email: 'prueba',
      nombre: 'prueba',
      promociones_id: ['/promociones/pr1'],
    },
  ];

  const campus = [
    {
      id: 'fullstack_sevilla_web',
      coordinadores_id: '/admin/uid',
      modulos_id: ['/modulos/modulo_0_fs'],
      nombre: 'FS Sevilla',
      promociones_id: ['/promociones/uid_auto'],
      sede: 'Datos',
    },
  ];

  const inscripciones = [
    {
      id: 'i1',
      aceptada: true,
      actualizadoEn: new Date('2026-06-30T10:00:00.000Z'),
      apellidos: 'xxx',
      campus_id: '/campus/fullstack_sevilla_web',
      creadoEn: new Date('2026-06-18T10:00:00.000Z'),
      dni: '1233333',
      email: 'asas',
      nombre: 'prueba',
      observaciones: 'texto',
      promocion_id: '/promocion_id/pr1',
    },
  ];

  const lecciones = [
    {
      id: 'abwRXWACMt4DCRptmlpP',
      contenido_url: 'assets/lecciones/temario/leccion1.md',
      descripcion: 'aqui descripcion',
      modulo_id: '/modulos/modulo_o_fs',
      titulo: 'HTML',
      videos_url: ['assets/lecciones/videos/leccion1.mp4'],
    },
  ];

  const modulos = [
    {
      id: 'modulo_0_fs',
      horas: 70,
      lecciones_Id: ['/lecciones/uid'],
      nombre: 'Lenguaje de Marcas',
    },
  ];

  const notas = [
    {
      id: 'n1',
      actualizadoEn: '2026-04-15T12:00:00Z',
      alumnoId: 'a1',
      comentario: 'Muy buen trabajo',
      creadoEn: '2026-04-15T12:00:00Z',
      profesorId: 'pr1',
      proyectoId: 'pr1',
      valor: 9,
    },
  ];

  const profesores = [
    {
      id: 'UID_AUTH_FIREBASE',
      avatar: 'url',
      campus_id: '/campus/fullstack_sevilla_web',
      email: 'prueba',
      isActive: true,
      nombre: 'prueba',
      promocion_id: ['/promociones/pr1'],
    },
  ];

  const promociones = [
    {
      id: 'zKV8wWMTAFw8IW7TQcWo',
      alumnos_id: ['/alumnos/uid', '/alumnos/uid1'],
      campus_id: '/campus/fs_sevilla_web',
      fechaFin: null,
      fechaInicio: new Date('2026-06-18T10:00:00.000Z'),
      nombre: 'Promo 1',
      profesor_id: [
        { isActive: false, profesor_id: '/profesor/uid' },
        { isActive: true, profesor_id: '/profesores/uid' },
      ],
    },
  ];

  const proyectos = [
    {
      id: 'pr1',
      alumnoIds: ['a1', 'a2'],
      descripcion: 'Entrega inicial',
      estado: 'abierto',
      notaIds: ['n1'],
      notas: [],
      promocionId: 'p1',
      titulo: 'Proyecto A',
    },
  ];

  return {
    admin,
    alumnos,
    campus,
    inscripciones,
    lecciones,
    modulos,
    notas,
    profesores,
    promociones,
    proyectos,
  };
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
    { name: 'admin', items: data.admin },
    { name: 'alumnos', items: data.alumnos },
    { name: 'campus', items: data.campus },
    { name: 'inscripciones', items: data.inscripciones },
    { name: 'lecciones', items: data.lecciones },
    { name: 'modulos', items: data.modulos },
    { name: 'notas', items: data.notas },
    { name: 'profesores', items: data.profesores },
    { name: 'promociones', items: data.promociones },
    { name: 'proyectos', items: data.proyectos },
  ];

  collections.forEach((collectionData) => {
    collectionData.items.forEach((item) => {
      const { id, ...dataToWrite } = item;
      const ref = db.collection(collectionData.name).doc(id);
      batch.set(ref, dataToWrite);
    });
  });

  await batch.commit();
  console.log('Datos inyectados a Firestore.');
}

function generateCsvs(data) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  writeCsv('alumnos.csv', ['id', 'nombre', 'email'], data.alumnos.map((item) => [item.id, item.nombre, item.email]));
  writeCsv('campus.csv', ['id', 'nombre', 'sede'], data.campus.map((item) => [item.id, item.nombre, item.sede]));
  writeCsv('inscripciones.csv', ['id', 'nombre', 'email', 'dni', 'campus_id', 'aceptada'], data.inscripciones.map((item) => [item.id, item.nombre, item.email, item.dni, item.campus_id, item.aceptada]));
  writeCsv('lecciones.csv', ['id', 'titulo', 'modulo_id'], data.lecciones.map((item) => [item.id, item.titulo, item.modulo_id]));
  writeCsv('modulos.csv', ['id', 'nombre', 'horas'], data.modulos.map((item) => [item.id, item.nombre, item.horas]));
  writeCsv('profesores.csv', ['id', 'nombre', 'email', 'campus_id', 'isActive'], data.profesores.map((item) => [item.id, item.nombre, item.email, item.campus_id, item.isActive]));
  writeCsv('promociones.csv', ['id', 'nombre', 'campus_id', 'fechaInicio', 'fechaFin'], data.promociones.map((item) => [item.id, item.nombre, item.campus_id, item.fechaInicio.toISOString(), item.fechaFin]));
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
