import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBnio-PSFk8TkXgcNgC-g7351yD4NubFp4",
  authDomain: "capraise100.firebaseapp.com",
  projectId: "capraise100",
  storageBucket: "capraise100.appspot.com",
  messagingSenderId: "680397788487",
  appId: "1:680397788487:web:efc01a5f2776aaaabba862"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app);