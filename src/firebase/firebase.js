// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLQVyol5oJmPWQy0GgMyurNlxHDBrENAc",
  authDomain: "uniconnectapp-80798.firebaseapp.com",
  projectId: "uniconnectapp-80798",
  storageBucket: "uniconnectapp-80798.firebasestorage.app",
  messagingSenderId: "50705909873",
  appId: "1:50705909873:web:a88c8cc4238050755033d0",
  databaseURL: "https://uniconnectapp-80798-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;