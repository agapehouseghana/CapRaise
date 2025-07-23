import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; 
const config = require('./config');

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY ,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET ,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Only export Auth and Storage - NO Firestore access from frontend
export const auth = getAuth(app);
export const storage = getStorage(app);

// Remove db export to prevent direct Firestore access
// All data operations should go through middleware API