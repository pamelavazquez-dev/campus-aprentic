import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDz3aqZSzapkPiWdiEXUxHhtZN0vmCcYz4",
  authDomain: "proyecto-final-bootcamp-e17c2.firebaseapp.com",
  projectId: "proyecto-final-bootcamp-e17c2",
  storageBucket: "proyecto-final-bootcamp-e17c2.firebasestorage.app",
  messagingSenderId: "380862418947",
  appId: "1:380862418947:web:5ba8ea5744e47b2c7abe36",
  measurementId: "G-PP47RY1Z2Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
