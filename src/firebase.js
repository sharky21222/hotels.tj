// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ВСТАВЬ свои данные из консоли Firebase!
const firebaseConfig = {
 apiKey: "AIzaSyAHqmmW1bW-4-HJf3NevbByqrJzDSI02rQ",
  authDomain: "hotels-tj.firebaseapp.com",
  projectId: "hotels-tj",
  storageBucket: "hotels-tj.firebasestorage.app",
  messagingSenderId: "156330415279",
  appId: "1:156330415279:web:73543f596a208f3ac7f05a",
  measurementId: "G-1L8V0J5HZ6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
