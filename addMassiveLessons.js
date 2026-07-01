import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}

const db = getFirestore();

// Nombres de lecciones genéricos para usar según el track
const temasCiber = ['Análisis de Vulnerabilidades', 'Criptografía Aplicada', 'Respuesta a Incidentes', 'Hardening de Servidores', 'Auditoría de Redes'];
const temasFS = ['Arquitectura de Componentes', 'Manejo de Estado Global', 'Optimización de Rendimiento', 'Seguridad en el Backend', 'Despliegue Continuo'];

async function addMassiveLessons() {
  console.log('⏳ Obteniendo módulos...');
  const modulosSnap = await db.collection('modulos').get();
  
  if (modulosSnap.empty) {
    console.error('❌ No se encontraron módulos.');
    process.exit(1);
  }

  const modulos = modulosSnap.docs;
  let totalAñadidas = 0;

  for (const modDoc of modulos) {
    const modId = modDoc.id;
    const modData = modDoc.data();
    
    // Ignorar módulos que no sean de ciber o fs (aunque todos deberían serlo)
    const isCiber = modId.includes('ciber');
    const isFS = modId.includes('fs');
    
    if (!isCiber && !isFS) continue;
    
    const temas = isCiber ? temasCiber : temasFS;
    
    // Obtener nombre del profesor
    let profesorNombre = 'Instructor';
    let profesorRef = null;
    
    if (modData.profesor_id) {
      profesorRef = typeof modData.profesor_id === 'string' 
        ? db.collection('profesores').doc(modData.profesor_id) 
        : modData.profesor_id;
        
      try {
        const profSnap = await profesorRef.get();
        if (profSnap.exists) {
          profesorNombre = profSnap.data().nombre || 'Instructor';
        }
      } catch(e) {}
    }

    const leccionesIds = [...(modData.lecciones_Id || modData.lecciones_id || [])];

    console.log(`\n▶ Procesando módulo: ${modData.nombre || modId}`);

    for (let i = 0; i < 5; i++) {
      const titulo = `${temas[i]} - Nivel Avanzado`;
      const markdownContent = `
# ${titulo}

Esta lección cubre los aspectos fundamentales de **${titulo}**.

## Objetivos

- Comprender la teoría detrás del concepto.
- Aplicar el conocimiento a un caso práctico de entorno real.
- Conocer los estándares y mejores prácticas del mercado actual.

> *"Nota del profesor (${profesorNombre}): Revisad la documentación oficial antes de la sesión en directo."*

## Práctica Dirigida

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

      const docRef = db.collection('lecciones').doc();
      const data = {
        modulo_id: modDoc.ref, // Como DocumentReference
        profesor_id: profesorRef, // Como DocumentReference
        titulo: titulo,
        descripcion: `Profundizaremos en ${titulo} de forma práctica y teórica.`,
        videos_url: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'], // Link genérico
        activo: true,
        orden: leccionesIds.length + 1
      };

      // Crear lección
      await docRef.set(data);
      leccionesIds.push(docRef.id);

      // Guardar contenido markdown en subcolección
      await docRef.collection('contenido').doc('main').set({
        texto: markdownContent
      });
      
      totalAñadidas++;
    }

    // Actualizar el módulo con los nuevos IDs
    await modDoc.ref.update({
      lecciones_Id: leccionesIds
    });
    console.log(`✅ 5 lecciones añadidas a ${modData.nombre || modId}.`);
  }

  console.log(`\n🎉 Proceso completado. Se han añadido un total de ${totalAñadidas} lecciones a los módulos.`);
  process.exit(0);
}

addMassiveLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
