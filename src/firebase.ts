import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDp0gIRTeCnMj2NfzrHed7m6pqrTtM61OI",
  authDomain: "paw-zal-db.firebaseapp.com",
  projectId: "paw-zal-db",
  storageBucket: "paw-zal-db.firebasestorage.app",
  messagingSenderId: "284501608508",
  appId: "1:284501608508:web:227d461206c42377bd5b39"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);