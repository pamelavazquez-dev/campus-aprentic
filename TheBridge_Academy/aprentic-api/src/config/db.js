const firebase = require('firebase/compat/app');
require('firebase/compat/auth');
require('firebase/compat/firestore');
const env = require('./env');

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY || 'AIzaSyDz3aqZSzapkPiWdiEXUxHhtZN0vmCcYz4',
  authDomain: env.FIREBASE_AUTH_DOMAIN || 'proyecto-final-bootcamp-e17c2.firebaseapp.com',
  projectId: env.FIREBASE_PROJECT_ID || 'proyecto-final-bootcamp-e17c2',
  storageBucket: env.FIREBASE_STORAGE_BUCKET || 'proyecto-final-bootcamp-e17c2.firebasestorage.app',
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '380862418947',
  appId: env.FIREBASE_APP_ID || '1:380862418947:web:5ba8ea5744e47b2c7abe36',
  measurementId: env.FIREBASE_MEASUREMENT_ID || 'G-PP47RY1Z2Z',
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);
const auth = firebase.auth(app);

const emulatorHost = env.FIRESTORE_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST;
if (emulatorHost) {
  const [host, port] = emulatorHost.split(':');
  db.settings({
    host: `${host}:${port || 8080}`,
    ssl: false,
    experimentalForceLongPolling: true,
  });
  console.log(`Firestore emulator configured at ${host}:${port || 8080}`);
}

module.exports = {
  db,
  auth,
};
