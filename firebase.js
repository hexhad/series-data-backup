// Import the functions you need from the SDKs you need
import { config } from "dotenv";
config();

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NODE_APP_API_KEY,
  authDomain: process.env.NODE_APP_AUTH_DOMAIN,
  projectId: process.env.NODE_APP_PROJECT_ID,
  storageBucket: process.env.NODE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.NODE_APP_MESSAGING_SENDER_ID,
  appId: process.env.NODE_APP_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)