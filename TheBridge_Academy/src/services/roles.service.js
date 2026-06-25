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

  const admin = await getAdminById(uid);
  if (admin) return { name: 'admin', profile: admin };

  const profesor = await getProfesorById(uid);
  if (profesor) return { name: 'instructor', profile: profesor };

  const alumno = await getAlumnoById(uid) || await getUserByEmail('alumnos', email);
  if (alumno) return { name: 'alumno', profile: alumno };

  return null;
}
