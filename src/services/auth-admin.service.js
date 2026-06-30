import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signOut,
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';
import { generateInitialPassword } from '../utils/passwords';

export const createAuthUserWithInitialPassword = async ({ nombre, email }) => {
  const initialPassword = generateInitialPassword(nombre);
  const secondaryApp = initializeApp(firebaseConfig, `auth-user-creator-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, initialPassword);
    const uid = credential.user.uid;

    await signOut(secondaryAuth);

    return { uid, initialPassword };
  } catch (error) {
    if (secondaryAuth.currentUser) {
      await deleteUser(secondaryAuth.currentUser).catch(() => {});
    }
    throw error;
  } finally {
    await deleteApp(secondaryApp);
  }
};
