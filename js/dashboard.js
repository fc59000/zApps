document.addEventListener('DOMContentLoaded', function() {
  // Check authentication state
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in
      loadUserData(user.uid);
      loadScenes(user.uid);
      loadUpcomingRehearsals(user.uid);
    } else {
      // User is signed out, redirect to login
      window.location.href = '../index.html';
    }
  });
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    auth.signOut().then(() => {
      window.location.href = '../index.html';
    });
  });
});

// Load user data from Firestore
function loadUserData(userId) {
  db.collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        
        // Update welcome message
        document.getElementById('userName').textContent = userData.name;
        
        // If user is a coach, show coach message
        if (userData.role === 'coach') {
          document.getElementById('coachMessage').classList.remove('d-none');
        }
      }
    })
    .catch((error) => {
      console.error("Error getting user data:", error);
    });
}

// Load scenes from Firestore
function loadScenes(userId) {
  const allScenesContainer = document.getElementById('allScenesContainer');
  const myScenesContainer = document.getElementById('myScenesContainer');
  
  // Clear containers
  allScenesContainer.innerHTML = '';
  myScenesContainer.innerHTML = '';
  
  // Load all scenes
  db.collection('scenes').get()
    .then((scenesSnapshot) => {
      if (scenesSnapshot.empty) {
        console.log("No scenes found");
        return;
      }
      
      // Load castings to check which scenes the user is in
      return db.collection('castings')
        .where('userId', '==', userId)
        .get()
        .then((castingsSnapshot) => {
          const userSceneIds = new Set();
          
          castingsSnapshot.forEach((doc) => {
            userSceneIds.add(doc.data().sceneId);
          });
          
          let userHasScenes = false;
          
          // Process all scenes
          scenesSnapshot.forEach((doc) => {
            const scene = { id: doc.id, ...doc.data() };
            
            // Create a card for the scene and add to all scenes
            const sceneCard = createSceneCard(scene);
            allScenesContainer.appendChild(sceneCard);
            
            // If user is in this scene, add to my scenes
            if (userSceneIds.has(scene.id)) {
              const mySceneCard = createSceneCard(scene, true);
              myScenesContainer.appendChild(mySceneCard);
              userHasScenes = true;
            }
          });
          
          // Show/hide the "no scenes" message
          document.getElementById('noScenesMessage').style.display = userHasScenes ? 'none' : 'block';
        });
    })
    .catch((error) => {
      console.error("Error loading scenes:", error);
    });
}

// Create a card element for a scene
function createSceneCard(scene, isMyScene = false) {
  const cardCol = document.createElement('div');
  cardCol.className = 'col';
  
  let charactersHTML = '';
  if (scene.characters && scene.characters.length > 0) {
    charactersHTML = scene.characters.map(char => `<li>${char}</li>`).join('');
  }
  
  cardCol.innerHTML = `
    <div class="card h-100 shadow-sm scene-card" data-scene-id="${scene.id}">
      <div class="card-body">
        <h5 class="card-title">${scene.title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${scene.author} (${scene.year})</h6>
        
        <div class="mt-3">
          <h6>Personnages:</h6>
          <ul class="character-list">
            ${charactersHTML}
          </ul>
        </div>
        
        <div class="mt-3">
          ${!isMyScene ? `
            <button class="btn btn-sm btn-outline-primary join-scene-btn">
              <i class="fas fa-plus-circle"></i> Rejoindre cette scène
            </button>
          ` : `
            <button class="btn btn-sm btn-outline-secondary">
              <i class="fas fa-check-circle"></i> Scène sélectionnée
            </button>
          `}
        </div>
      </div>
      <div class="card-footer d-flex justify-content-between">
        <small class="text-muted">
          <i class="fas fa-users"></i> <span class="actor-count">0</span> comédien(s)
        </small>
        <a href="scene.html?id=${scene.id}" class="card-link scene-details-link">
          <i class="fas fa-info-circle"></i> Détails
        </a>
      </div>
    </div>
  `;
  
  // Add event listener for the "Join Scene" button if not already in scene
  if (!isMyScene) {
    const joinButton = cardCol.querySelector('.join-scene-btn');
    joinButton.addEventListener('click', function() {
      showCharacterSelection(scene);
    });
  }
  
  return cardCol;
}

// Show character selection dialog
function showCharacterSelection(scene) {
  // Create a modal for character selection
  const modalHTML = `
    <div class="modal fade" id="characterModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Choisir un personnage</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Sélectionnez le personnage que vous souhaitez jouer dans "${scene.title}"</p>
            <form id="characterForm">
              <div class="mb-3">
                <select class="form-select" id="characterSelect" required>
                  <option value="" selected disabled>Choisissez un personnage</option>
                  ${scene.characters.map(char => `<option value="${char}">${char}</option>`).join('')}
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" id="confirmCharacterBtn">Confirmer</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to the document
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer);
  
  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('characterModal'));
  modal.show();
  
  // Handle character selection
  document.getElementById('confirmCharacterBtn').addEventListener('click', function() {
    const character = document.getElementById('characterSelect').value;
    if (!character) {
      alert("Veuillez sélectionner un personnage");
      return;
    }
    
    joinScene(scene.id, character);
    modal.hide();
    
    // Remove modal after hiding
    modal._element.addEventListener('hidden.bs.modal', function() {
      modalContainer.remove();
    });
  });
}

// Join a scene (save to Firestore)
function joinScene(sceneId, character) {
  const userId = auth.currentUser.uid;
  
  // Get user data
  db.collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        
        // Add to castings collection
        return db.collection('castings').add({
          userId: userId,
          userName: userData.name,
          sceneId: sceneId,
          character: character,
          createdAt: new Date()
        });
      }
    })
    .then(() => {
      alert(`Vous avez rejoint la scène avec le personnage "${character}".`);
      // Reload the page to show updated scenes
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error joining scene:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    });
}

// Load upcoming rehearsals
function loadUpcomingRehearsals(userId) {
  const container = document.getElementById('upcomingRehearsalsContainer');
  const noRehearsalsMessage = document.getElementById('noRehearsalsMessage');
  
  // Get user's scenes
  db.collection('castings')
    .where('userId', '==', userId)
    .get()
    .then((castingsSnapshot) => {
      const userSceneIds = [];
      castingsSnapshot.forEach((doc) => {
        userSceneIds.push(doc.data().sceneId);
      });
      
      if (userSceneIds.length === 0) {
        return { empty: true }; // No scenes, so no rehearsals
      }
      
      // Get rehearsals for user's scenes
      return db.collection('rehearsals')
        .where('sceneId', 'in', userSceneIds)
        .orderBy('date')
        .get();
    })
    .then((rehearsalsSnapshot) => {
      if (rehearsalsSnapshot.empty) {
        noRehearsalsMessage.style.display = 'block';
        return;
      }
      
      // Hide no rehearsals message
      noRehearsalsMessage.style.display = 'none';
      
      // Clear container
      container.innerHTML = '';
      
      // Process rehearsals
      rehearsalsSnapshot.forEach((doc) => {
        const rehearsal = doc.data();
        
        // Get scene info
        db.collection('scenes').doc(rehearsal.sceneId).get()
          .then((sceneDoc) => {
            if (sceneDoc.exists) {
              const scene = sceneDoc.data();
              
              // Format date
              const dateObj = new Date(rehearsal.date);
              const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              });
              
              // Create rehearsal item
              const rehearsalItem = document.createElement('a');
              rehearsalItem.href = `rehearsal.html?id=${doc.id}`;
              rehearsalItem.className = 'list-group-item list-group-item-action';
              
              rehearsalItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">${scene.title}</h5>
                  <small class="text-primary">
                    <i class="fas fa-calendar"></i> ${formattedDate} à ${rehearsal.time}
                  </small>
                </div>
                <p class="mb-1">
                  <i class="fas fa-map-marker-alt"></i> ${rehearsal.location}
                </p>
                <div class="d-flex justify-content-between">
                  <small>
                    <i class="fas fa-users"></i> ${rehearsal.participants.join(', ')}
                  </small>
                  <small>
                    ${rehearsal.coach ? `<i class="fas fa-chalkboard-teacher"></i> Coach: ${rehearsal.coach}` : ''}
                  </small>
                </div>
              `;
              
              container.appendChild(rehearsalItem);
            }
          });
      });
    })
    .catch((error) => {
      console.error("Error loading rehearsals:", error);
    });
}
