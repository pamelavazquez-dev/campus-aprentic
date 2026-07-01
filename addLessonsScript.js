import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {
  // Ignore if already initialized
}

const db = getFirestore();

async function addLessons() {
  console.log('⏳ Buscando módulos...');
  const modulosSnap = await db.collection('modulos').get();
  
  if (modulosSnap.empty) {
    console.error('❌ No se encontraron módulos. Crea un módulo primero desde la aplicación.');
    process.exit(1);
  }

  // Tomamos el primer módulo disponible
  const modulo = modulosSnap.docs[0]; 
  const moduloId = modulo.id;
  const moduloData = modulo.data();

  console.log(`✅ Módulo seleccionado: ${moduloData.nombre || moduloData.titulo || moduloId} (${moduloId})`);

  const nuevasLecciones = [
    {
      titulo: 'Lección Extra 1: Arquitectura Limpia',
      descripcion: 'Aprende los fundamentos de la Arquitectura Limpia y su aplicación práctica.',
      videos_url: ['https://www.youtube.com/watch?v=y3MWfPDmVqo'],
      markdown: '# Arquitectura Limpia\n\nEn esta lección aprenderemos sobre *Clean Architecture*...\n\n### Material de apoyo\nTe recomendamos visualizar el siguiente video:\n\n[Video Guía: Arquitectura Limpia](https://www.youtube.com/watch?v=y3MWfPDmVqo)'
    },
    {
      titulo: 'Lección Extra 2: Patrones de Diseño',
      descripcion: 'Patrones creacionales, estructurales y de comportamiento en frontend.',
      videos_url: ['https://www.youtube.com/watch?v=v9ejT8FO-7I'],
      markdown: '# Patrones de Diseño\n\nVamos a repasar los patrones del *Gang of Four* (GoF).\n\n### Material de apoyo\nTe recomendamos visualizar el siguiente video:\n\n[Video Guía: Patrones de Diseño](https://www.youtube.com/watch?v=v9ejT8FO-7I)'
    },
    {
      titulo: 'Lección Extra 3: Microservicios y Frontend',
      descripcion: 'Despliegue y orquestación de aplicaciones con múltiples servicios.',
      videos_url: ['https://www.youtube.com/watch?v=1xo-0gCVhCU'],
      markdown: '# Microservicios\n\n¿Por qué dividimos las aplicaciones en servicios pequeños y autónomos?\n\n### Material de apoyo\nTe recomendamos visualizar el siguiente video:\n\n[Video Guía: Introducción a Microservicios](https://www.youtube.com/watch?v=1xo-0gCVhCU)'
    },
    {
      titulo: 'Lección Extra 4: Serverless y Firebase',
      descripcion: 'Ventajas de usar un BaaS (Backend as a Service) como Firebase.',
      videos_url: ['https://www.youtube.com/watch?v=vAoB4VbhRzM'],
      markdown: '# Serverless y Firebase\n\nAprovechando Firebase para delegar la carga del backend.\n\n### Material de apoyo\nTe recomendamos visualizar el siguiente video:\n\n[Video Guía: Serverless Moderno](https://www.youtube.com/watch?v=vAoB4VbhRzM)'
    },
    {
      titulo: 'Lección Extra 5: Web Workers en React',
      descripcion: 'Delegando procesos pesados al cliente sin bloquear la interfaz.',
      videos_url: ['https://www.youtube.com/watch?v=9_tEGAj3V6Y'],
      markdown: '# Web Workers\n\nCómo extraer texto de PDFs pesados sin bloquear el *Main Thread*.\n\n### Material de apoyo\nTe recomendamos visualizar el siguiente video:\n\n[Video Guía: Web Workers y Concurrencia](https://www.youtube.com/watch?v=9_tEGAj3V6Y)'
    }
  ];

  const leccionesIds = [...(moduloData.lecciones_Id || moduloData.lecciones_id || [])];

  for (const lec of nuevasLecciones) {
    const docRef = db.collection('lecciones').doc();
    const data = {
      modulo_id: moduloId,
      titulo: lec.titulo,
      descripcion: lec.descripcion,
      videos_url: lec.videos_url,
      activo: true,
      orden: leccionesIds.length + 1
    };

    // Crear la lección
    await docRef.set(data);
    leccionesIds.push(docRef.id);

    // Guardar el texto masivo en la subcolección para optimizar lecturas
    await docRef.collection('contenido').doc('main').set({
      texto: lec.markdown
    });
    
    console.log(`✅ Lección añadida: ${lec.titulo}`);
  }

  // Actualizar el módulo con las nuevas lecciones
  await modulo.ref.update({
    lecciones_Id: leccionesIds
  });

  console.log('🎉 5 Lecciones añadidas al módulo exitosamente.');
  process.exit(0);
}

addLessons().catch(e => {
  console.error(e);
  process.exit(1);
});
