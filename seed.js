import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

// ============================================================================
// CONFIGURACIÓN E INICIALIZACIÓN
// ============================================================================
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

// ============================================================================
// DATOS FICTICIOS BASE
// ============================================================================
const nombres = ['Ana', 'Carlos', 'Maria', 'Jose', 'Laura', 'David', 'Elena', 'Javier', 'Carmen', 'Daniel', 'Lucia', 'Miguel', 'Marta', 'Alejandro', 'Paula', 'Hugo', 'Sofia', 'Manuel', 'Alba', 'Pablo'];
const apellidos = ['Garcia', 'Lopez', 'Martinez', 'Sanchez', 'Perez', 'Gomez', 'Martin', 'Jimenez', 'Ruiz', 'Hernandez', 'Diaz', 'Moreno', 'Alvarez', 'Romero', 'Alonso', 'Gutierrez', 'Navarro', 'Torres', 'Dominguez', 'Vazquez'];
const especialidades = ['Desarrollo Web Full Stack', 'Ciberseguridad', 'Data Science e IA', 'Diseño UX/UI', 'Marketing Digital'];

// Normalizar: quita tildes, ñ y caracteres extraños
const normalizar = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toLowerCase();
};

// Generar correo: primera letra nombre + apellido
const generarEmail = (nombre, apellido) => {
  const n = normalizar(nombre).charAt(0);
  const a = normalizar(apellido);
  return `${n}${a}@aprentic.com`;
};

// Generar contraseña: 2 letras nombre + 2 letras apellido + 1234!
const generarPassword = (nombre, apellido) => {
  const n = normalizar(nombre).substring(0, 2);
  const a = normalizar(apellido).substring(0, 2);
  return `${n}${a}1234!`;
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ============================================================================
// 1. LIMPIEZA DE DATOS (TEAR DOWN)
// ============================================================================
async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`✅ Colección '${collectionPath}' limpiada (${snapshot.size} eliminados).`);
}

async function cleanCrossReferences() {
  const modulosRef = db.collection('modulos');
  const snapshot = await modulosRef.get();
  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { lecciones_Id: [], profesor_id: '' });
  });
  
  await batch.commit();
  console.log(`✅ Referencias cruzadas limpiadas en 'modulos'.`);
}

// ============================================================================
// 2. INSERCIÓN DE DATOS (SEEDING)
// ============================================================================
async function seedProfesores() {
  const profesores = [];
  console.log('⏳ Creando 5 profesores...');
  
  for (let i = 0; i < 5; i++) {
    const nombre = nombres[i];
    const apellido = apellidos[i];
    const email = generarEmail(nombre, apellido);
    const password = generarPassword(nombre, apellido);
    
    // Crear en Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      await auth.updateUser(userRecord.uid, { password, displayName: `${nombre} ${apellido}` });
    } catch(e) {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: `${nombre} ${apellido}`,
      });
    }

    // Guardar en Firestore
    const profData = {
      nombre: `${nombre} ${apellido}`,
      email: email,
      password: password, 
      especialidad: especialidades[i],
      avatar: '',
      campus_id: '', // Se asignarían en la app o manualmente
      promocion_id: [],
      isActive: true
    };
    
    await db.collection('profesores').doc(userRecord.uid).set(profData);
    profesores.push({ id: userRecord.uid, ...profData });
  }
  
  console.log(`✅ 5 Profesores creados y enlazados con Auth.`);
  return profesores;
}

async function seedAlumnos() {
  console.log('⏳ Creando 20 alumnos...');
  
  for (let i = 5; i < 25; i++) {
    const nombre = nombres[i % nombres.length];
    const primerApellido = apellidos[i % apellidos.length];
    const segundoApellido = apellidos[(i+1) % apellidos.length];
    
    // Para no duplicar correos si coinciden nombres/apellidos en la demo
    const uniqueId = i > 10 ? i : '';
    const email = generarEmail(nombre, primerApellido) + uniqueId;
    const password = generarPassword(nombre, primerApellido);
    
    // Crear en Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      await auth.updateUser(userRecord.uid, { password, displayName: `${nombre} ${primerApellido} ${segundoApellido}` });
    } catch(e) {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: `${nombre} ${primerApellido} ${segundoApellido}`,
      });
    }

    // Guardar en Firestore
    const alumnoData = {
      nombre: `${nombre} ${primerApellido} ${segundoApellido}`,
      email: email,
      password: password,
      avatar: '',
      campus_id: '',
      modulos_id: [],
      promociones_id: [],
      isActive: true
    };
    
    await db.collection('alumnos').doc(userRecord.uid).set(alumnoData);
  }
  console.log(`✅ 20 Alumnos creados y enlazados con Auth.`);
}

async function seedLecciones(profesores) {
  console.log('⏳ Creando 10 lecciones...');
  
  const temas = ['Introducción a React', 'Bases de datos NoSQL', 'Seguridad en aplicaciones', 'Diseño UX/UI Avanzado', 'Despliegue continuo', 'Testing en Frontend', 'Arquitectura de Software', 'Gestión de estado', 'APIs RESTful', 'Rendimiento web'];
  
  for (let i = 0; i < 10; i++) {
    const profesorAsignado = getRandom(profesores);
    const titulo = temas[i];
    
    const markdownContent = `
# ${titulo}

Esta lección cubre los aspectos fundamentales de **${titulo}**.

## Objetivos
- Comprender la teoría detrás del concepto.
- Aplicar el conocimiento a un caso práctico de entorno real.
- Conocer los estándares y mejores prácticas del mercado actual.

> **Nota del profesor (${profesorAsignado.nombre}):** Revisad la documentación oficial antes de la sesión en directo.

### Práctica Dirigida
Vamos a estructurar un ejemplo básico. Prestad atención a cómo organizamos la lógica.

\`\`\`javascript
// Ejemplo de inicialización para ${titulo}
function startModule() {
  console.log("¡Módulo de ${titulo} iniciado con éxito!");
  // Tu código va aquí
}

startModule();
\`\`\`
    `.trim();

    const leccionData = {
      titulo: titulo,
      descripcion: `Breve introducción sobre los conceptos de ${titulo} impartida por ${profesorAsignado.nombre}.`,
      contenido: markdownContent,
      profesor_id: db.collection('profesores').doc(profesorAsignado.id),
      orden: i + 1,
      duracionMinutos: 45 + Math.floor(Math.random() * 30),
      activo: true
    };
    
    await db.collection('lecciones').add(leccionData);
  }
  
  console.log(`✅ 10 Lecciones creadas con formato Markdown interactivo.`);
}

// ============================================================================
// ORQUESTADOR
// ============================================================================
async function runMigration() {
  console.log('=============================================');
  console.log('INICIANDO LIMPIEZA Y POBLACIÓN DE DATOS');
  console.log('=============================================');
  
  try {
    console.log('\n--- FASE 1: TEAR DOWN ---');
    await deleteCollection('alumnos');
    await deleteCollection('profesores');
    await deleteCollection('lecciones');
    await cleanCrossReferences();

    console.log('\n--- FASE 2: SEEDING ---');
    const profesoresCreados = await seedProfesores();
    await seedAlumnos();
    await seedLecciones(profesoresCreados);
    
    console.log('\n=============================================');
    console.log('🎉 SCRIPT COMPLETADO CON ÉXITO');
    console.log('=============================================');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA EJECUCIÓN:', error);
    process.exit(1);
  }
}

runMigration();
