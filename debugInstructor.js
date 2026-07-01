import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkInstructor() {
  const profs = await db.collection('profesores').get();
  profs.docs.forEach(doc => {
    const d = doc.data();
    if (d.nombre.includes('Laura')) {
      console.log('--- LAURA PEREZ ---');
      console.log('ID:', doc.id);
      console.log('Promociones asignadas:', d.promocion_id);
      console.log('Campus:', d.campus_id);
    }
  });

  const promos = await db.collection('promociones').get();
  console.log('\n--- PROMOCIONES ---');
  promos.docs.forEach(doc => {
    console.log(doc.id, doc.data().nombre);
  });
}

checkInstructor();
