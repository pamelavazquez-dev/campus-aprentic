import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';

/**
 * Creates a user in Firebase Authentication using a secondary app instance.
 * This prevents the current admin user from being logged out during creation.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<string|null>} The UID of the newly created user or null if failed.
 */
export const createAuthUser = async (email, password) => {
  let authUid = null;
  try {
    const secondaryApp = initializeApp(firebaseConfig, `SecondaryApp-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    authUid = userCredential.user.uid;
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
  } catch (authError) {
    console.error("Error creating auth user:", authError);
    throw authError; // We should throw it to notify the forms about the error
  }
  return authUid;
};

/**
 * Generates the default password based on the user's name and/or surname.
 * Takes the first 2 letters of the name, first 2 letters of the surname (if any), and appends "1234!".
 * 
 * @param {string} nombreCompleto Full name (or just first name)
 * @param {string} [apellidosExtra] Optional explicit surnames
 * @returns {string} The generated password
 */
export const generateDefaultPassword = (nombreCompleto, apellidosExtra = '') => {
  let nombre = '';
  let apellidos = '';

  if (apellidosExtra) {
    nombre = nombreCompleto.trim();
    apellidos = apellidosExtra.trim();
  } else {
    const parts = nombreCompleto.trim().split(/\s+/);
    nombre = parts[0] || '';
    apellidos = parts.slice(1).join(' ') || '';
  }

  const n = nombre ? nombre.substring(0, 2).toLowerCase() : '';
  const a = apellidos ? apellidos.substring(0, 2).toLowerCase() : '';
  
  return `${n}${a}1234!`;
};
