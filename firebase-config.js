// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9tRXUWx3Nu9KHiEkIsHvNNU7M0lbuDgc",
  authDomain: "zapps-efdc1.firebaseapp.com",
  projectId: "zapps-efdc1",
  storageBucket: "zapps-efdc1.firebasestorage.app",
  messagingSenderId: "656692853921",
  appId: "1:656692853921:web:f26dc1e994d9335aff3e0",
  measurementId: "G-GWQ9CJY39M"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();