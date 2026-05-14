// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBERY3RjPi1eVlpWq1GXNeM5RK0mBDbaxo",
  authDomain: "grainfi-farm.firebaseapp.com",
  projectId: "grainfi-farm",
  storageBucket: "grainfi-farm.firebasestorage.app",
  messagingSenderId: "1081346426270",
  appId: "1:1081346426270:web:d087e83717317e835d028f",
  measurementId: "G-6TDVYYL0HM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // This is the Firestore database

// Initialize analytics only on the client-side
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    const analytics = getAnalytics(app);
    // You can now use analytics here if needed
  });
}

export { db }; // Export db so it can be used in other files