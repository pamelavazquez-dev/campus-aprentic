import { getAdminById } from './admins.service';
import { getProfesorById } from './profesores.service';
import { getAlumnoById } from './alumnos.service';

export async function getUserRole(uid) {
  if (!uid) return null;

  const admin = await getAdminById(uid);
  if (admin) return { name: 'admin', profile: admin };

  const profesor = await getProfesorById(uid);
  if (profesor) return { name: 'profesor', profile: profesor };

  const alumno = await getAlumnoById(uid);
  if (alumno) return { name: 'alumno', profile: alumno };

  return null;
}
