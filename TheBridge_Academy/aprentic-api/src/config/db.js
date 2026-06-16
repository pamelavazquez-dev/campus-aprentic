const firebase = require('firebase/compat/app');
require('firebase/compat/auth');
require('firebase/compat/firestore');
require('dotenv').config();

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDz3aqZSzapkPiWdiEXUxHhtZN0vmCcYz4',
	authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'proyecto-final-bootcamp-e17c2.firebaseapp.com',
	projectId: process.env.FIREBASE_PROJECT_ID || 'proyecto-final-bootcamp-e17c2',
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'proyecto-final-bootcamp-e17c2.appspot.com',
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '380862418947',
	appId: process.env.FIREBASE_APP_ID || '1:380862418947:web:5ba8ea5744e47b2c7abe36',
	measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-PP47RY1Z2Z',
};

if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

module.exports = { firebase, db, auth };
