// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZAwhfzhssZ-We62-raAYkaPmhZcmCB-Q",
  authDomain: "firetracker-ac48f.firebaseapp.com",
  projectId: "firetracker-ac48f",
  storageBucket: "firetracker-ac48f.appspot.com",
  messagingSenderId: "810892824074",
  appId: "1:810892824074:web:c37926457ff4ea0ed0d9f3",
  measurementId: "G-48DG272SZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// const analytics = getAnalytics(app);