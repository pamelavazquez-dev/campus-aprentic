import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}

const db = getFirestore();

async function fix() {
  const leccionesSnap = await db.collection('lecciones').get();
  let count = 0;
  for (const doc of leccionesSnap.docs) {
    const data = doc.data();
    if (data.titulo && data.titulo.startsWith("Lección Extra")) {
      const moduloRef = db.collection('modulos').doc('mod-ciber-0');
      
      // Asumiendo que el profesor es 'BUHGyIg1h0XnLtzSoCQ24q9VtPu2' de los logs anteriores
      // Si el modulo mod-ciber-0 tiene profesor_id:
      const modSnap = await moduloRef.get();
      const profesorId = modSnap.data().profesor_id;
      let profesorRef = null;
      if (profesorId) {
         profesorRef = typeof profesorId === 'string' ? db.collection('profesores').doc(profesorId) : profesorId;
      }
      
      await doc.ref.update({
        modulo_id: moduloRef,
        profesor_id: profesorRef || db.collection('profesores').doc('BUHGyIg1h0XnLtzSoCQ24q9VtPu2')
      });
      count++;
    }
  }
  console.log(`✅ ${count} lecciones corregidas (modulo_id a DocumentReference y profesor_id asignado).`);
}

fix().catch(console.error);
