const { assertFails, assertSucceeds, initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

let testEnv;

beforeAll(async () => {
  // Inicializamos el emulador con las reglas
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-academia-test',
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
  it('Alumnos solo pueden crear y actualizar entregas (proyectos) que correspondan a su propio UID', async () => {
    // 1. Simular un alumno logueado con UID 'alumno123'
    const dbAlumno = testEnv.authenticatedContext('alumno123').firestore();
    
    // CASO DE ÉXITO: Crear una entrega propia
    const validEntrega = dbAlumno.collection('proyectos').doc('proyecto1');
    await assertSucceeds(validEntrega.set({
      alumnoAuthUid: 'alumno123',
      titulo: 'Mi Proyecto',
      archivoUrl: 'https://github.com/alumno123/repo'
    }));

    // CASO DE FALLO: Intentar crear una entrega simulando ser otro alumno
    const invalidEntrega = dbAlumno.collection('proyectos').doc('proyecto2');
    await assertFails(invalidEntrega.set({
      alumnoAuthUid: 'otroAlumnoUID',
      titulo: 'Hacking Project',
      archivoUrl: 'https://github.com/hacker/repo'
    }));
  });

  it('Alumnos no pueden modificar entregas de otros alumnos', async () => {
    // Setup inicial como admin para crear un documento de otro usuario
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('proyectos').doc('proyecto-otro').set({
        alumnoAuthUid: 'otroAlumnoUID',
        titulo: 'Proyecto de Otro',
        archivoUrl: 'https://github.com/otro/repo'
      });
    });

    const dbAlumno = testEnv.authenticatedContext('alumno123').firestore();
    const docToHack = dbAlumno.collection('proyectos').doc('proyecto-otro');

    // Intentar actualizar el documento del otro alumno
    await assertFails(docToHack.update({
      archivoUrl: 'https://github.com/hacker/repo'
    }));
  });
});
