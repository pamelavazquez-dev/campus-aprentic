import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from './config/firebase.js'; // Let's check where config is

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
  try {
    console.log("Borrando campus-malaga...");
    await deleteDoc(doc(db, "campus", "campus-malaga"));
    console.log("Borrando campus-sevilla...");
    await deleteDoc(doc(db, "campus", "campus-sevilla"));

    console.log("Actualizando fullstack_sevilla_web...");
    await setDoc(doc(db, "campus", "fullstack_sevilla_web"), {
      nombre: "Fullstack Sevilla",
      sede: "Sevilla",
      coordinadores_id: [doc(collection(db, 'coordinadores'))],
      modulos_id: [],
      promociones_id: []
    }, { merge: true });

    console.log("Actualizando fullstack_malaga_web...");
    await setDoc(doc(db, "campus", "fullstack_malaga_web"), {
      nombre: "Fullstack Málaga",
      sede: "Málaga",
      coordinadores_id: [doc(collection(db, 'coordinadores'))],
      modulos_id: [],
      promociones_id: []
    }, { merge: true });

    console.log("Actualizando ciberseguridad_sevilla...");
    await setDoc(doc(db, "campus", "ciberseguridad_sevilla"), {
      nombre: "Ciberseguridad Sevilla",
      sede: "Sevilla",
      coordinadores_id: [doc(collection(db, 'coordinadores'))],
      modulos_id: [],
      promociones_id: []
    }, { merge: true });

    console.log("Actualizando ciberseguridad_malaga...");
    await setDoc(doc(db, "campus", "ciberseguridad_malaga"), {
      nombre: "Ciberseguridad Málaga",
      sede: "Málaga",
      coordinadores_id: [doc(collection(db, 'coordinadores'))],
      modulos_id: [],
      promociones_id: []
    }, { merge: true });

    console.log("¡Hecho!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
