import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Correct Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjuZGUchVMe_GnTmACsBMWFtGCnLq6EEA",
  authDomain: "mflix-c5522.firebaseapp.com",
  projectId: "mflix-c5522",
  storageBucket: "mflix-c5522.appspot.com", // ✅ THIS LINE FIXED
  messagingSenderId: "122925828213",
  appId: "1:122925828213:web:0b408360e8c44dd21c503c"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };