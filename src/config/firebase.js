import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
// Replace these values with your actual Firebase project configuration
// See FIREBASE_SETUP.md for detailed instructions
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR-PROJECT.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Check if Firebase is configured
const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.databaseURL !== "https://YOUR-PROJECT.firebaseio.com";

if (!isFirebaseConfigured) {
  console.warn(
    '⚠️ Firebase no está configurado. Por favor, sigue las instrucciones en FIREBASE_SETUP.md para configurar tu proyecto de Firebase.'
  );
}

// Initialize Firebase
let app;
let auth;
let database;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Show user-friendly error
  if (error.code === 'app/invalid-credential') {
    console.error('Credenciales de Firebase inválidas. Verifica tu configuración en src/config/firebase.js');
  }
}

export { auth, database, isFirebaseConfigured };
export default app;
