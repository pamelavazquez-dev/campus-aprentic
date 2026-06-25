import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
export const analytics = app && typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Activar persistencia offline (caché local) para evitar reads innecesarios
if (db) {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia fallida: múltiples pestañas abiertas no soportan la persistencia clásica, o estás en incógnito.');
    } else if (err.code === 'unimplemented') {
      console.warn('El navegador actual no soporta persistencia de Firestore.');
    }
  });
}

export default app;
