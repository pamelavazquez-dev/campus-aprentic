import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDz3aqZSzapkPiWdiEXUxHhtZN0vmCcYz4",
  authDomain: "proyecto-final-bootcamp-e17c2.firebaseapp.com",
  projectId: "proyecto-final-bootcamp-e17c2",
  storageBucket: "proyecto-final-bootcamp-e17c2.firebasestorage.app",
  messagingSenderId: "380862418947",
  appId: "1:380862418947:web:5ba8ea5744e47b2c7abe36",
  measurementId: "G-PP47RY1Z2Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersToCreate = [
  { email: 'admin_test@demo.com', pass: 'Password123!', col: 'admin', nombre: 'Admin Demo' },
  { email: 'alumno_test@demo.com', pass: 'Password123!', col: 'alumnos', nombre: 'Alumno Demo' },
  { email: 'instructor_test@demo.com', pass: 'Password123!', col: 'profesor', nombre: 'Profesor Demo' }
];

async function createUsers() {
  for (const u of usersToCreate) {
    try {
      console.log(`Verificando/Creando ${u.email}...`);
      let uid;
      try {
        const cred = await createUserWithEmailAndPassword(auth, u.email, u.pass);
        uid = cred.user.uid;
      } catch(e) {
        if (e.code === 'auth/email-already-in-use') {
           // Si ya existe, tenemos que autenticarnos para sacar el UID y guardar su doc
           const { signInWithEmailAndPassword } = await import('firebase/auth');
           const cred = await signInWithEmailAndPassword(auth, u.email, u.pass);
           uid = cred.user.uid;
        } else {
           throw e;
        }
      }

      await setDoc(doc(db, u.col, uid), {
        email: u.email,
        nombre: u.nombre,
        rol: u.col === 'admin' ? 'admin' : (u.col === 'alumnos' ? 'alumno' : 'instructor'),
        creadoEn: new Date().toISOString()
      });
      console.log(`✅ Documento guardado: ${u.email} en colección ${u.col}`);
    } catch (e) {
      console.error(`❌ Error con ${u.email}:`, e);
    }
  }
  process.exit(0);
}

createUsers();
