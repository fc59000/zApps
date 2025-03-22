// Firebase configuration (que vous avez déjà)
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

// Create scenes collection if it doesn't exist
function checkAndInitializeData() {
  db.collection('scenes').limit(1).get()
    .then((snapshot) => {
      if (snapshot.empty) {
        initializeScenes();
      }
    });
}

// Initialize with predefined scenes
function initializeScenes() {
  const scenes = [
    // Liste des scènes comme dans mon message précédent
    // (Je ne les ai pas toutes recopiées pour gagner de l'espace)
  ];
  
  const batch = db.batch();
  
  scenes.forEach((scene) => {
    const sceneRef = db.collection('scenes').doc();
    batch.set(sceneRef, scene);
  });
  
  return batch.commit().then(() => {
    console.log("Scènes initialisées avec succès");
  });
}

// Run initialization check
checkAndInitializeData();
