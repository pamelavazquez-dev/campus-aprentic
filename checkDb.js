import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}

const db = getFirestore();

async function run() {
  const leccionesSnap = await db.collection('lecciones').get();
  console.log("\nTodas las Lecciones:");
  leccionesSnap.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, "titulo:", data.titulo, "modulo_id:", data.modulo_id, "profesor_id:", data.profesor_id ? (typeof data.profesor_id === 'string' ? data.profesor_id : data.profesor_id.id) : null);
  });
}
run();
