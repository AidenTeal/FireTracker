// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZAwhfzhssZ-We62-raAYkaPmhZcmCB-Q",
  authDomain: "firetracker-ac48f.firebaseapp.com",
  projectId: "firetracker-ac48f",
  storageBucket: "firetracker-ac48f",
  messagingSenderId: "810892824074",
  appId: "1:810892824074:web:c37926457ff4ea0ed0d9f3",
  measurementId: "G-48DG272SZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export default { auth, provider, db };
