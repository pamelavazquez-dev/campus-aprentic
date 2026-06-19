#!/usr/bin/env node
/**
 * Analiza la estructura real de Firestore sin volcar objetos internos de Firebase.
 * Ejecutar desde aprentic-api: node scripts/analyze-db.js
 */

const { db, auth } = require('../src/config/db');
const env = require('../src/config/env');
const { normalizeFirestoreValue } = require('../src/services/base.service');

const COLLECTIONS = [
  'admin',
  'alumnos',
  'campus',
  'inscripciones',
  'lecciones',
  'modulos',
  'notas',
  'profesores',
  'promociones',
  'proyectos',
];

function formatValue(value) {
  const normalized = normalizeFirestoreValue(value);
  if (typeof normalized === 'string') return `"${normalized}"`;
  return JSON.stringify(normalized, null, 2);
}

async function authenticateIfNeeded() {
  if (!env.FIREBASE_TEST_USER_EMAIL || !env.FIREBASE_TEST_USER_PASSWORD) {
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(env.FIREBASE_TEST_USER_EMAIL, env.FIREBASE_TEST_USER_PASSWORD);
    console.log('Autenticado\n');
  } catch (error) {
    console.warn('No se pudo autenticar:', error.message, '\n');
  }
}

async function analyzeDatabase() {
  await authenticateIfNeeded();

  for (const collectionName of COLLECTIONS) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`COLECCION: ${collectionName}`);
    console.log(`${'='.repeat(80)}`);

    try {
      const snapshot = await db.collection(collectionName).limit(1).get();

      if (snapshot.empty) {
        console.log('  (sin documentos)');
        continue;
      }

      snapshot.forEach((doc) => {
        console.log(`\n  Documento ID: ${doc.id}`);
        console.log('  Datos:');
        Object.entries(doc.data()).forEach(([key, value]) => {
          console.log(`    ${key}: ${formatValue(value)}`);
        });
      });
    } catch (error) {
      console.log(`  Error al leer: ${error.message}`);
    }
  }
}

analyzeDatabase().catch((error) => {
  console.error('Error en script:', error);
  process.exit(1);
});
