const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_STORAGE_BUCKET
} = process.env;

let firestore;
let auth;
let initialized = false;

if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
  const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const cert = {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey,
  };

  admin.initializeApp({
    credential: admin.credential.cert(cert),
    storageBucket: FIREBASE_STORAGE_BUCKET || undefined
  });

  firestore = admin.firestore();
  auth = admin.auth();
  initialized = true;
}

module.exports = {
  admin,
  firestore,
  auth,
  initialized
};

