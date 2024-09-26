import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Firebase Auth (or other services if needed)

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

const auth = getAuth(app); // Initialize Firebase Authentication

export { auth };
