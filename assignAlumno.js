import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  apiKey: "AIzaSyDz3aqZSzapkPiWdiEXUxHhtZN0vmCcYz4",
  authDomain: "proyecto-final-bootcamp-e17c2.firebaseapp.com",
  projectId: "proyecto-final-bootcamp-e17c2",
  storageBucket: "proyecto-final-bootcamp-e17c2.firebasestorage.app",
  messagingSenderId: "380862418947",
  appId: "1:380862418947:web:5ba8ea5744e47b2c7abe36",
});
const db = getFirestore(app);
const auth = getAuth(app);

const alumnoUid = 'anWg2NUqmaQMwzFv36NtQld0GF02';
const promoId = '8Zo2ImQmDat8D2YRnv8T'; // FullStack Sevilla

async function assign() {
  try {
    await signInWithEmailAndPassword(auth, 'admin_test@demo.com', 'Password123!');
    console.log('✅ Autenticado como admin.');

    // 1. Add alumno to the FullStack Sevilla promotion
  await updateDoc(doc(db, 'promociones', promoId), {
    alumnos_id: arrayUnion(alumnoUid)
  });
  console.log('✅ Alumno añadido a FullStack Sevilla');

  // 2. Assign FS modules to the alumno
  await updateDoc(doc(db, 'alumnos', alumnoUid), {
    modulos_id: ['mod-fs-0', 'mod-fs-1', 'mod-fs-2', 'mod-fs-3'],
    promocion_id: promoId
  });
  console.log('✅ Módulos FS asignados al alumno');
  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

assign();
