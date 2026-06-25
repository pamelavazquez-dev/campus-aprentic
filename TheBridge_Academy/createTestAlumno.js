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
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestAlumno() {
  const email = 'alumno.test@thebridge.com';
  const password = '123456789';

  try {
    console.log('Creando alumno de prueba...');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    
    await setDoc(doc(db, 'alumnos', uid), {
      email: email,
      nombre: 'Carlos Martínez',
      campus_id: doc(db, 'campus', 'sevilla'),
      modulos_id: [],
      isActive: true,
      avatar: '',
    });
    
    console.log(`✅ Alumno creado con éxito!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   UID: ${uid}`);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('⚠️ El alumno ya existe. Puedes hacer login con:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.error('❌ Error:', e.message);
    }
  }
  process.exit(0);
}

createTestAlumno();
