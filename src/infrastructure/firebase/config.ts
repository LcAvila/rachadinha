// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyAAB53WbXXLHS1m7T365WE3hWJSwPzUM_0",
    authDomain: "rachadinha-5dbb3.firebaseapp.com",
    databaseURL: "https://rachadinha-5dbb3-default-rtdb.firebaseio.com",
    projectId: "rachadinha-5dbb3",
    storageBucket: "rachadinha-5dbb3.firebasestorage.app",
    messagingSenderId: "86843464836",
    appId: "1:86843464836:web:ada19fcbede44c3d1276d1",
    measurementId: "G-EXZC3Z4D8W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

