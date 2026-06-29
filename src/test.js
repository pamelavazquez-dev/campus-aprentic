
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig } from './config/firebase.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const alumnosSnap = await getDocs(collection(db, 'alumnos'));
  console.log('--- ALUMNOS ---');
  alumnosSnap.forEach(doc => {
    console.log(doc.id, doc.data().nombre, doc.data().email, doc.data().promocion_id, doc.data().promociones_id);
  });

  const modsSnap = await getDocs(collection(db, 'modulos'));
  console.log('--- MODULOS ---');
  modsSnap.forEach(doc => {
    console.log(doc.id, doc.data().nombre, doc.data().promociones_activas);
  });
  
  process.exit(0);
}
main().catch(console.error);

