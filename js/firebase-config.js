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

// Initialize with predefined scenes
function initializeScenes() {
  const scenes = [
    { 
      title: "Lorenzaccio", 
      author: "Alfred de Musset", 
      year: 1834, 
      characters: ["Le duc", "Lorenzo"],
      description: "Cette scène présente la rencontre entre le Duc et Lorenzo. Un moment clé de la pièce qui montre la duplicité de Lorenzo." 
    },
    { 
      title: "La meilleure façon de marcher (Footing)", 
      author: "Claude Miller", 
      year: 1976, 
      characters: ["Marc", "Philippe"],
      description: "Marc et Philippe se retrouvent pour un footing matinal, révélant les tensions sous-jacentes de leur relation." 
    },
    { 
      title: "La meilleure façon de marcher (La chambre)", 
      author: "Claude Miller", 
      year: 1976, 
      characters: ["Marc", "Philippe"],
      description: "Dans l'intimité d'une chambre, Marc confronte Philippe sur un secret découvert." 
    },
    { 
      title: "Au Bout de 30 ans", 
      author: "Hanokh Levin", 
      year: 1989, 
      characters: ["Lui", "Elle"],
      description: "Un couple fait le bilan de trente années de vie commune, entre amertume et révélations." 
    },
    { 
      title: "4.48 Psychose", 
      author: "Sarah Kane", 
      year: 2000, 
      characters: ["Personnage 1", "Personnage 2"],
      description: "Exploration poétique et fragmentée d'un esprit tourmenté par la dépression." 
    },
    { 
      title: "Incendies", 
      author: "Wadji Mouawouad", 
      year: 2003, 
      characters: ["Sawda", "Nawal"],
      description: "Deux femmes confrontées à l'horreur de la guerre civile." 
    },
    { 
      title: "Peanuts", 
      author: "Fausto Paravidino", 
      year: 2004, 
      characters: ["Buddy", "Piggy"],
      description: "Dialogue entre deux amis sur les joies et désillusions de la vie quotidienne." 
    },
    { 
      title: "Théâtre sans animaux (Égalité fraternité)", 
      author: "Jean Michel Ribes", 
      year: 2004, 
      characters: ["Jacques", "André"],
      description: "Une conversation qui dérape autour des valeurs républicaines." 
    },
    { 
      title: "Théâtre sans animaux (Tragédie)", 
      author: "Jean Michel Ribes", 
      year: 2004, 
      characters: ["Personnage 1", "Personnage 2"],
      description: "Une situation quotidienne qui prend une tournure absurde." 
    },
    { 
      title: "Le Moche", 
      author: "Marius von Mayenburg", 
      year: 2008, 
      characters: ["Lette", "Karlmann"],
      description: "Quand un homme découvre sa laideur et les conséquences sur sa vie professionnelle et personnelle." 
    },
    { 
      title: "Tenderness", 
      author: "Antoine Lemaire", 
      year: 2010, 
      characters: ["Mellors", "Constance"],
      description: "Une rencontre intense entre deux êtres que tout semble opposer." 
    },
    { 
      title: "Caligula TM", 
      author: "Stéphane Guérin", 
      year: 2012, 
      characters: ["La petite sœur", "Le jeune empereur", "Le narrateur"],
      description: "Vision contemporaine et décalée du mythe de Caligula." 
    },
    { 
      title: "La réunification des deux Corées (L'attente)", 
      author: "Joël Pommerat", 
      year: 2013, 
      characters: ["Homme 1", "Homme 2"],
      description: "L'attente interminable de deux hommes et les non-dits qui s'installent." 
    },
    { 
      title: "La réunification des deux Corées (La mort)", 
      author: "Joël Pommerat", 
      year: 2013, 
      characters: ["La femme", "Le médecin", "L'homme"],
      description: "Face à la mort, les relations humaines se révèlent dans leur complexité." 
    },
    { 
      title: "Testostérone (Extrait 1)", 
      author: "Antoine Lemaire", 
      year: 2020, 
      characters: ["L'Ex", "Myriam"],
      description: "Les tensions d'un couple en crise." 
    },
    { 
      title: "Testostérone (Extrait 2)", 
      author: "Antoine Lemaire", 
      year: 2020, 
      characters: ["L'Ex", "Myriam"],
      description: "Suite de la confrontation entre deux anciens amants." 
    },
    { 
      title: "Anatomie d'une chute", 
      author: "Justine Triet et Arthur Harari", 
      year: 2023, 
      characters: ["Samuel", "Sandra"],
      description: "Tensions et révélations au sein d'un couple d'écrivains en crise." 
    },
    { 
      title: "Les Enivrés", 
      author: "Ivan Viripaev", 
      year: 2012, 
      characters: ["Personnage 1", "Personnage 2"],
      description: "Des personnages en état d'ivresse parlent de la vie et de leurs désirs profonds." 
    },
    { 
      title: "The Lighthouse", 
      author: "Edgar Allan Poe / Robert Eggers", 
      year: 2019, 
      characters: ["Gardien 1", "Gardien 2"],
      description: "Deux gardiens de phare isolés sombrent progressivement dans la folie." 
    }
  ];
  
  // Create a batch to add all scenes at once
  const batch = db.batch();
  
  scenes.forEach((scene) => {
    const sceneRef = db.collection('scenes').doc();
    batch.set(sceneRef, scene);
  });
  
  return batch.commit().then(() => {
    console.log("Scènes initialisées avec succès");
  }).catch(err => {
    console.error("Erreur lors de l'initialisation des scènes:", err);
  });
}

// Check if scenes collection exists and initialize if needed
function checkAndInitializeData() {
  db.collection('scenes').limit(1).get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log("Initialisation des scènes...");
        initializeScenes();
      } else {
        console.log("Collection de scènes déjà existante");
      }
    })
    .catch(err => {
      console.error("Erreur lors de la vérification des scènes:", err);
    });
}

// Call this function when Firebase is initialized
checkAndInitializeData();
