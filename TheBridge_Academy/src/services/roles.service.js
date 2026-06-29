import { getAdminById } from './admins.service';
import { getProfesorById } from './profesores.service';
import { getAlumnoById } from './alumnos.service';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const getUserByEmail = async (collectionName, email) => {
  if (!db || !email) return null;

  const usersQuery = query(
    collection(db, collectionName),
    where('email', '==', email),
    limit(1)
  );
  const snapshot = await getDocs(usersQuery);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

export async function getUserRole(uid, email = '') {
  if (!uid) return null;

  // 1. Intentar recuperar el nombre del rol desde caché
  const cachedRole = localStorage.getItem(`userRoleName_${uid}`);
  
  if (cachedRole) {
    let profile = null;
    if (cachedRole === 'admin') profile = await getAdminById(uid) || await getUserByEmail('admin', email);
    if (cachedRole === 'instructor') profile = await getProfesorById(uid) || await getUserByEmail('profesores', email);
    if (cachedRole === 'alumno') profile = await getAlumnoById(uid) || await getUserByEmail('alumnos', email);
    
    if (profile) return { name: cachedRole, profile };
    
    // Si el perfil ya no existe, limpiamos la caché y probamos con el flujo completo
    localStorage.removeItem(`userRoleName_${uid}`);
  }

  // 2. Si no hay caché, buscamos secuencialmente y cacheamos el resultado
  const admin = await getAdminById(uid) || await getUserByEmail('admin', email);
  if (admin) {
    localStorage.setItem(`userRoleName_${uid}`, 'admin');
    return { name: 'admin', profile: admin };
  }

  const profesor = await getProfesorById(uid) || await getUserByEmail('profesores', email);
  if (profesor) {
    localStorage.setItem(`userRoleName_${uid}`, 'instructor');
    return { name: 'instructor', profile: profesor };
  }

  const alumno = await getAlumnoById(uid) || await getUserByEmail('alumnos', email);
  if (alumno) {
    localStorage.setItem(`userRoleName_${uid}`, 'alumno');
    return { name: 'alumno', profile: alumno };
  }

  return null;
}
