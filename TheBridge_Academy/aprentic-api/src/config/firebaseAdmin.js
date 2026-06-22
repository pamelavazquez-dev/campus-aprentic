const admin = require('firebase-admin');

// Inicialización de Firebase Admin.
// Para uso en producción o entorno local seguro, proveer la ruta al Service Account JSON
// mediante la variable de entorno GOOGLE_APPLICATION_CREDENTIALS.
// Ej: set GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  console.log('Firebase Admin SDK inicializado exitosamente.');
} catch (error) {
  console.error('Error al inicializar Firebase Admin SDK. Asegúrate de configurar GOOGLE_APPLICATION_CREDENTIALS:', error.message);
}

module.exports = admin;
