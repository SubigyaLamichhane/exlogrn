import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getReactNativePersistence } from "firebase/auth/react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBdjN3FX1Qyw1D1vaB1GYxr26igF9P3mIQ",
  authDomain: "smart-credit-2.firebaseapp.com",
  projectId: "smart-credit-2",
  storageBucket: "smart-credit-2.appspot.com",
  messagingSenderId: "876282507761",
  appId: "1:876282507761:android:7684db7013ef59ef481450",
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Get the already initialized app
}

// Initialize Firebase Auth with Async Storage for persistence
// Check if Auth has already been initialized
let auth;
try {
  auth = getAuth(app);
  // console.log(auth);
} catch (error) {
  // console.log
  // If getAuth throws an error, it means auth has not been initialized, so we initialize it here
  if (error.message.includes("auth/initialize-auth")) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    console.error("Error initializing auth:", error);
  }
}

export { auth };
