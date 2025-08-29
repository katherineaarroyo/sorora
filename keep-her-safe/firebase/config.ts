// Import the functions you need from the SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence, // This is just a typescript type import error, it's needed and works
  Auth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfo8m0joBIrIxSKA-B5w3JqGBWgnmjiMY",
  authDomain: "keep-her-safe.firebaseapp.com",
  projectId: "keep-her-safe",
  storageBucket: "keep-her-safe.firebasestorage.app",
  messagingSenderId: "788622349880",
  appId: "1:788622349880:web:f11ff63e569e7390be38cd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Setup Auth with persistence
let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Fallback for environments like web
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { app, auth, firestore };
export type { Auth };
