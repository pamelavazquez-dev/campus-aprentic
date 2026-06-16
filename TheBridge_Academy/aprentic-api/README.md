# AprenTIC Campus API

Estructura del proyecto (archivos vacíos).

Preparación para Firebase
 - Archivo de configuración: src/config/firebase.js (placeholder).
 - Archivos Firebase: firebase.json, .firebaserc.
 - Variables de entorno añadidas en .env.example para credenciales y configuración.

Para conectar con Firebase, rellena las variables en `.env` y añade la inicialización en `src/config/firebase.js`.

Seed con Firebase
 - Instala dependencias: `npm install`
 - Rellena las variables de Firebase en `.env`
 - Ejecuta `npm run seed`
 - El script generará CSVs en `data/` y, si la configuración de Firebase es válida, inyectará los datos en Firestore.