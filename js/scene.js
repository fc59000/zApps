document.addEventListener('DOMContentLoaded', function() {
  // Get scene ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sceneId = urlParams.get('id');
  
  if (!sceneId) {
    // Redirect to dashboard if no scene ID
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Check authentication state
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in
      loadSceneDetails(sceneId, user.uid);
      loadActors(sceneId); // Ajout de cette ligne pour charger les comédiens
      loadRehearsals(sceneId);
      loadCostumes(sceneId, null); // Chargera tous les costumes pour cette scène
      loadMusicSuggestions(sceneId);
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
  
  // Form submissions
  setupFormHandlers(sceneId);
  
  // Plan rehearsal button
  document.getElementById('planRehearsalBtn').addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('planRehearsalModal'));
    modal.show();
  });
  
  // Save rehearsal button in modal
  document.getElementById('saveRehearsalBtn').addEventListener('click', function() {
    saveRehearsal(sceneId);
  });
});

// Load scene details
function loadSceneDetails(sceneId, userId) {
  // Load the scene data from Firestore
  db.collection('scenes').doc(sceneId).get()
    .then((doc) => {
      if (!doc.exists) {
        alert("Scène non trouvée");
        window.location.href = 'dashboard.html';
        return;
      }
      
      const scene = doc.data();
      
      // Update page title
      document.title = `${scene.title} - zApps Planner`;
      
      // Update scene information
      document.getElementById('sceneTitle').textContent = scene.title;
      document.getElementById('sceneAuthor').textContent = scene.author + (scene.year ? ` (${scene.year})` : '');
      document.getElementById('sceneDescription').textContent = scene.description || '';
      
      // Load characters
      if (scene.characters && scene.characters.length > 0) {
        loadCharacters(scene.characters);
      }
      
      // Check if user is already in this scene
      db.collection('castings')
        .where('userId', '==', userId)
        .where('sceneId', '==', sceneId)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            // User is already in this scene
            const casting = querySnapshot.docs[0].data();
            
            document.getElementById('characterSelectionForm').innerHTML = `
              <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Vous jouez le rôle de <strong>${casting.character}</strong> dans cette scène.
              </div>
            `;
            
            // Show costume form
            document.getElementById('costumeForm').classList.remove('d-none');
            
            // Load costumes for this character
            loadCostumes(sceneId, casting.character);
          }
        });
    })
    .catch((error) => {
      console.error("Error loading scene:", error);
      alert("Erreur de chargement de la scène");
    });
}

// Load actors for this scene
function loadActors(sceneId) {
  const actorsList = document.getElementById('actorsList');
  
  // Clear current list
  actorsList.innerHTML = '<li class="list-group-item text-center text-muted">Chargement des comédiens...</li>';
  
  // Query Firestore for castings of this scene
  db.collection('castings')
    .where('sceneId', '==', sceneId)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        actorsList.innerHTML = '<li class="list-group-item text-center text-muted">Aucun comédien assigné</li>';
        return;
      }
      
      // Clear loading message
      actorsList.innerHTML = '';
      
      // Add each actor to the list
      querySnapshot.forEach((doc) => {
        const casting = doc.data();
        const actorItem = document.createElement('li');
        actorItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        actorItem.innerHTML = `
          ${casting.userName}
          <span class="badge bg-primary rounded-pill">${casting.character}</span>
        `;
        actorsList.appendChild(actorItem);
      });
    })
    .catch((error) => {
      console.error("Error loading actors:", error);
      actorsList.innerHTML = '<li class="list-group-item text-center text-danger">Erreur de chargement</li>';
    });
}

// Load characters list
function loadCharacters(characters) {
  const charactersList = document.getElementById('charactersList');
  const characterSelect = document.getElementById('characterSelect');
  
  // Clear lists
  charactersList.innerHTML = '';
  
  // Clear select and add default option
  characterSelect.innerHTML = '<option value="" selected disabled>Choisissez un personnage</option>';
  
  // Add characters to both list and select
  characters.forEach(character => {
    // Add to list
    const characterItem = document.createElement('a');
    characterItem.href = "#";
    characterItem.className = 'list-group-item list-group-item-action';
    characterItem.textContent = character;
    charactersList.appendChild(characterItem);
    
    // Add to select
    const option = document.createElement('option');
    option.value = character;
    option.textContent = character;
    characterSelect.appendChild(option);
  });
}

// Setup form handlers
function setupFormHandlers(sceneId) {
  // Join scene form
  document.getElementById('joinSceneForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const character = document.getElementById('characterSelect').value;
    if (!character) {
      alert("Veuillez sélectionner un personnage");
      return;
    }
    
    joinScene(sceneId, character);
  });
  
  // Add costume form
  document.getElementById('addCostumeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const description = document.getElementById('costumeDescription').value;
    
    // Get character from casting
    const userId = auth.currentUser.uid;
    db.collection('castings')
      .where('userId', '==', userId)
      .where('sceneId', '==', sceneId)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const casting = querySnapshot.docs[0].data();
          addCostume(sceneId, casting.character, description);
        }
      });
  });
  
  // Add music form
  document.getElementById('addMusicForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('musicTitle').value;
    const artist = document.getElementById('musicArtist').value;
    const link = document.getElementById('musicLink').value;
    const notes = document.getElementById('musicNotes').value;
    
    addMusic(sceneId, title, artist, link, notes);
  });
  
  // Add note form
  document.getElementById('addNoteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const content = document.getElementById('noteContent').value;
    addNote(sceneId, content);
  });
}

// Join a scene (select a character)
function joinScene(sceneId, character) {
  const userId = auth.currentUser.uid;
  
  // Check if already in this scene
  db.collection('castings')
    .where('userId', '==', userId)
    .where('sceneId', '==', sceneId)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        // Already in this scene, update character
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            character: character,
            updatedAt: new Date()
          });
        });
      } else {
        // Get user name
        return db.collection('users').doc(userId).get()
          .then((userDoc) => {
            if (userDoc.exists) {
              const userData = userDoc.data();
              
              // Add new casting
              return db.collection('castings').add({
                userId: userId,
                userName: userData.name,
                sceneId: sceneId,
                character: character,
                createdAt: new Date()
              });
            }
          });
      }
    })
    .then(() => {
      alert(`Vous avez choisi le personnage "${character}" dans cette scène.`);
      
      // Reload the page to reflect changes
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error joining scene:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    });
}

// Load costumes for a character
function loadCostumes(sceneId, character) {
  const costumesList = document.getElementById('costumesList');
  
  // Show loading message
  costumesList.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Chargement des costumes...</div>';
  
  // Query based on scene/character or just scene
  let query;
  if (character) {
    query = db.collection('costumes')
      .where('sceneId', '==', sceneId)
      .where('character', '==', character);
  } else {
    query = db.collection('costumes')
      .where('sceneId', '==', sceneId);
  }
  
  // Execute query
  query.get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        costumesList.innerHTML = `
          <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Aucun élément de costume ajouté pour le moment.
          </div>
        `;
        return;
      }
      
      // Clear and create list
      costumesList.innerHTML = '';
      const list = document.createElement('ul');
      list.className = 'list-group mb-4';
      
      querySnapshot.forEach((doc) => {
        const costume = doc.data();
        const costumeItem = document.createElement('li');
        costumeItem.className = 'list-group-item';
        
        // Check if current user is the owner
        const isOwner = costume.userId === auth.currentUser.uid;
        
        costumeItem.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${costume.character}:</strong> ${costume.description}
              <div><small class="text-muted">Ajouté par ${costume.userName}</small></div>
            </div>
            ${isOwner ? `
              <button class="btn btn-sm btn-outline-danger delete-costume-btn" data-id="${doc.id}">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </div>
        `;
        
        list.appendChild(costumeItem);
      });
      
      costumesList.appendChild(list);
      
      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-costume-btn').forEach(button => {
        button.addEventListener('click', function() {
          deleteCostume(this.getAttribute('data-id'));
        });
      });
    })
    .catch((error) => {
      console.error("Error loading costumes:", error);
      costumesList.innerHTML = '<div class="alert alert-danger">Erreur de chargement des costumes</div>';
    });
}

// Delete a costume element
function deleteCostume(costumeId) {
  if (confirm("Voulez-vous vraiment supprimer cet élément de costume ?")) {
    db.collection('costumes').doc(costumeId).delete()
      .then(() => {
        alert("Élément de costume supprimé");
        
        // Get scene ID from URL to reload costumes
        const urlParams = new URLSearchParams(window.location.search);
        const sceneId = urlParams.get('id');
        
        // Get current user's character
        const userId = auth.currentUser.uid;
        db.collection('castings')
          .where('userId', '==', userId)
          .where('sceneId', '==', sceneId)
          .get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              const casting = querySnapshot.docs[0].data();
              loadCostumes(sceneId, casting.character);
            }
          });
      })
      .catch((error) => {
        console.error("Error deleting costume:", error);
        alert("Erreur lors de la suppression");
      });
  }
}

// Load music suggestions
function loadMusicSuggestions(sceneId) {
  const musicList = document.getElementById('musicList');
  
  // Show loading message
  musicList.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Chargement des suggestions...</div>';
  
  // Query Firestore
  db.collection('music')
    .where('sceneId', '==', sceneId)
    .orderBy('createdAt', 'desc')
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        musicList.innerHTML = `
          <div class="text-center p-3 text-muted">
            <i class="fas fa-music fa-2x mb-2"></i>
            <p>Aucune suggestion musicale pour le moment</p>
          </div>
        `;
        return;
      }
      
      // Clear loading message
      musicList.innerHTML = '';
      
      // Add each suggestion
      querySnapshot.forEach((doc) => {
        const music = doc.data();
        const musicCard = document.createElement('div');
        musicCard.className = 'card mb-2';
        
        // Check if current user is the owner
        const isOwner = music.userId === auth.currentUser.uid;
        
        musicCard.innerHTML = `
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h6 class="card-title mb-1">${music.title}</h6>
              <div>
                <button class="btn btn-sm btn-outline-primary vote-music-btn" data-id="${doc.id}">
                  <i class="fas fa-thumbs-up"></i> ${music.votes || 0}
                </button>
              </div>
            </div>
            <p class="card-subtitle text-muted small mb-2">${music.artist}</p>
            ${music.notes ? `<p class="card-text small mb-2">${music.notes}</p>` : ''}
            ${music.link ? `
              <a href="${music.link}" target="_blank" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-external-link-alt"></i> Écouter
              </a>
            ` : ''}
            <div class="mt-2">
              <small class="text-muted">Proposé par ${music.userName}</small>
              ${isOwner ? `
                <button class="btn btn-sm btn-outline-danger float-end delete-music-btn" data-id="${doc.id}">
                  <i class="fas fa-trash"></i>
                </button>
              ` : ''}
            </div>
          </div>
        `;
        
        musicList.appendChild(musicCard);
      });
      
      // Add event listeners for vote buttons
      document.querySelectorAll('.vote-music-btn').forEach(button => {
        button.addEventListener('click', function() {
          voteForMusic(this.getAttribute('data-id'));
        });
      });
      
      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-music-btn').forEach(button => {
        button.addEventListener('click', function() {
          deleteMusic(this.getAttribute('data-id'));
        });
      });
    })
    .catch((error) => {
      console.error("Error loading music suggestions:", error);
      musicList.innerHTML = '<div class="alert alert-danger">Erreur de chargement des suggestions musicales</div>';
    });
}

// Vote for music
function voteForMusic(musicId) {
  // Get the document
  db.collection('music').doc(musicId).get()
    .then((doc) => {
      if (doc.exists) {
        // Increment votes
        const currentVotes = doc.data().votes || 0;
        return doc.ref.update({
          votes: currentVotes + 1
        });
      }
    })
    .then(() => {
      // Reload music suggestions
      const urlParams = new URLSearchParams(window.location.search);
      const sceneId = urlParams.get('id');
      loadMusicSuggestions(sceneId);
    })
    .catch((error) => {
      console.error("Error voting for music:", error);
      alert("Erreur lors du vote");
    });
}

// Delete music
function deleteMusic(musicId) {
  if (confirm("Voulez-vous vraiment supprimer cette suggestion musicale ?")) {
    db.collection('music').doc(musicId).delete()
      .then(() => {
        alert("Suggestion musicale supprimée");
        
        // Reload music suggestions
        const urlParams = new URLSearchParams(window.location.search);
        const sceneId = urlParams.get('id');
        loadMusicSuggestions(sceneId);
      })
      .catch((error) => {
        console.error("Error deleting music:", error);
        alert("Erreur lors de la suppression");
      });
  }
}

// Add a note
function addNote(sceneId, content) {
  const userId = auth.currentUser.uid;
  
  db.collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        
        return db.collection('notes').add({
          userId: userId,
          userName: userData.name,
          sceneId: sceneId,
          content: content,
          createdAt: new Date()
        });
      }
    })
    .then(() => {
      // Reset form
      document.getElementById('noteContent').value = '';
      
      // Reload notes
      loadNotes(sceneId);
    })
    .catch((error) => {
      console.error("Error adding note:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    });
}

// Load notes
function loadNotes(sceneId) {
  const notesList = document.getElementById('notesList');
  
  // Show loading message
  notesList.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Chargement des notes...</div>';
  
  // Query Firestore
  db.collection('notes')
    .where('sceneId', '==', sceneId)
    .orderBy('createdAt', 'desc')
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        notesList.innerHTML = `
          <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Aucune note pour le moment.
          </div>
        `;
        return;
      }
      
      // Clear loading message
      notesList.innerHTML = '';
      
      // Add each note
      querySnapshot.forEach((doc) => {
        const note = doc.data();
        const noteCard = document.createElement('div');
        noteCard.className = 'card mb-3';
        
        // Format date
        const date = note.createdAt.toDate();
        const formattedDate = date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Check if current user is the owner
        const isOwner = note.userId === auth.currentUser.uid;
        
        noteCard.innerHTML = `
          <div class="card-body">
            <p class="card-text">${note.content}</p>
            <div class="d-flex justify-content-between">
              <small class="text-muted">Ajouté par ${note.userName}</small>
              <small class="text-muted">${formattedDate}</small>
            </div>
            ${isOwner ? `
              <button class="btn btn-sm btn-outline-danger mt-2 delete-note-btn" data-id="${doc.id}">
                <i class="fas fa-trash"></i> Supprimer
              </button>
            ` : ''}
          </div>
        `;
        
        notesList.appendChild(noteCard);
      });
      
      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-note-btn').forEach(button => {
        button.addEventListener('click', function() {
          deleteNote(this.getAttribute('data-id'));
        });
      });
    })
    .catch((error) => {
      console.error("Error loading notes:", error);
      notesList.innerHTML = '<div class="alert alert-danger">Erreur de chargement des notes</div>';
    });
}

// Delete a note
function deleteNote(noteId) {
  if (confirm("Voulez-vous vraiment supprimer cette note ?")) {
    db.collection('notes').doc(noteId).delete()
      .then(() => {
        alert("Note supprimée");
        
        // Reload notes
        const urlParams = new URLSearchParams(window.location.search);
        const sceneId = urlParams.get('id');
        loadNotes(sceneId);
      })
      .catch((error) => {
        console.error("Error deleting note:", error);
        alert("Erreur lors de la suppression");
      });
  }
}

// Load rehearsals
function loadRehearsals(sceneId) {
  const rehearsalsList = document.getElementById('rehearsalsList');
  
  // Show loading message
  rehearsalsList.innerHTML = '<li class="list-group-item text-center text-muted">Chargement des répétitions...</li>';
  
  // Query Firestore
  db.collection('rehearsals')
    .where('sceneId', '==', sceneId)
    .orderBy('date')
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        rehearsalsList.innerHTML = '<li class="list-group-item text-center text-muted">Aucune répétition planifiée</li>';
        return;
      }
      
      // Clear loading message
      rehearsalsList.innerHTML = '';
      
      // Add each rehearsal
      querySnapshot.forEach((doc) => {
        const rehearsal = doc.data();
        
        // Format date
        const formattedDate = new Date(rehearsal.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
        
        // Vérifier si l'utilisateur courant est le créateur
        const isCreator = rehearsal.createdBy === auth.currentUser.uid;
        
        const rehearsalItem = document.createElement('li');
        rehearsalItem.className = 'list-group-item';
        rehearsalItem.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
            <strong>${formattedDate}</strong>
            <span>${rehearsal.time}</span>
            ${isCreator ? `
              <button class="btn btn-sm btn-outline-danger delete-rehearsal-btn" data-id="${doc.id}">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </div>
          <div class="mt-1">
            <i class="fas fa-map-marker-alt"></i> ${rehearsal.location}
          </div>
          ${rehearsal.requestCoach ? `
            <div class="mt-1">
              <small class="text-muted">Coach demandé</small>
            </div>
          ` : ''}
          ${rehearsal.notes ? `
            <div class="mt-1">
              <small>${rehearsal.notes}</small>
            </div>
          ` : ''}
          <div class="mt-1">
            <small class="text-muted">Organisé par ${rehearsal.creatorName}</small>
          </div>
        `;
        
        rehearsalsList.appendChild(rehearsalItem);
      });
      
      // Ajouter les écouteurs d'événements pour les boutons de suppression
      document.querySelectorAll('.delete-rehearsal-btn').forEach(button => {
        button.addEventListener('click', function() {
          deleteRehearsal(this.getAttribute('data-id'));
        });
      });
    })
    .catch((error) => {
      console.error("Error loading rehearsals:", error);
      rehearsalsList.innerHTML = '<li class="list-group-item text-center text-danger">Erreur de chargement</li>';
    });
}

// Add costume
function addCostume(sceneId, character, description) {
  const userId = auth.currentUser.uid;
  
  db.collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        
        return db.collection('costumes').add({
          userId: userId,
          userName: userData.name,
          sceneId: sceneId,
          character: character,
          description: description,
          createdAt: new Date()
        });
      }
    })
    .then(() => {
      // Reset form and reload costumes
      document.getElementById('costumeDescription').value = '';
      loadCostumes(sceneId, character);
    })
    .catch((error) => {
      console.error("Error adding costume:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    });
}

// Add music suggestion
function addMusic(sceneId, title, artist, link, notes) {
  const userId = auth.currentUser.uid;
  
  db.collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        
        return db.collection('music').add({
          userId: userId,
          userName: userData.name,
          sceneId: sceneId,
          title: title,
          artist: artist,
          link: link || '',
          notes: notes || '',
          votes: 0,
          createdAt: new Date()
        });
      }
    })
    .then(() => {
      // Reset form and reload music suggestions
      document.getElementById('musicTitle').value = '';
      document.getElementById('musicArtist').value = '';
      document.getElementById('musicLink').value = '';
      document.getElementById('musicNotes').value = '';
      
      loadMusicSuggestions(sceneId);
    })
    .catch((error) => {
      console.error("Error adding music:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    });
}

// Save rehearsal
function saveRehearsal(sceneId) {
  const date = document.getElementById('rehearsalDate').value;
  const time = document.getElementById('rehearsalTime').value;
  const duration = document.getElementById('rehearsalDuration').value;
  const location = document.getElementById('rehearsalLocation').value;
  const coachPresence = document.getElementById('coachPresence').checked;
  const notes = document.getElementById('rehearsalNotes').value;
  
  console.log("Tentative d'ajout de répétition:", { date, time, location, duration, coachPresence });
  
  if (!date || !time || !location) {
    alert("Veuillez remplir tous les champs requis");
    return;
  }
  
  const userId = auth.currentUser.uid;
  
  // Get scene info and current user name
  Promise.all([
    db.collection('scenes').doc(sceneId).get(),
    db.collection('users').doc(userId).get(),
    db.collection('castings').where('sceneId', '==', sceneId).get()
  ])
    .then(([sceneDoc, userDoc, castingsSnapshot]) => {
      if (!sceneDoc.exists || !userDoc.exists) {
        throw new Error("Scene or user not found");
      }
      
      const userData = userDoc.data();
      const participants = [];
      
      castingsSnapshot.forEach((doc) => {
        if (doc.data().userName) {
          participants.push(doc.data().userName);
        }
      });
      
      // Utiliser Timestamp pour les dates
      return db.collection('rehearsals').add({
        sceneId: sceneId,
        sceneName: sceneDoc.data().title || '',
        date: date,
        time: time,
        duration: parseFloat(duration) || 2,
        location: location,
        requestCoach: coachPresence,
        notes: notes || '',
        participants: participants,
        createdBy: userId,
        creatorName: userData.name,
        createdAt: firebase.firestore.Timestamp.now()
      });
    })
    .then(() => {
      console.log("Répétition enregistrée avec succès");
      
      // Fermer le modal de manière robuste
      try {
        const modalElement = document.getElementById('planRehearsalModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        } else {
          // Fallback si l'instance de modal n'est pas trouvée
          jQuery(modalElement).modal('hide');
        }
      } catch (error) {
        console.error("Erreur lors de la fermeture du modal:", error);
        // Fallback ultime
        document.querySelector('.modal-backdrop')?.remove();
        document.body.classList.remove('modal-open');
      }
      
      alert("Répétition planifiée avec succès!");
      loadRehearsals(sceneId);
    })
    .catch((error) => {
      console.error("Error saving rehearsal:", error);
      alert("Une erreur s'est produite lors de l'enregistrement de la répétition: " + error.message);
    });
}

// Delete a rehearsal
function deleteRehearsal(rehearsalId) {
  if (confirm("Voulez-vous vraiment supprimer cette répétition ?")) {
    db.collection('rehearsals').doc(rehearsalId).delete()
      .then(() => {
        alert("Répétition supprimée");
        
        // Reload rehearsals
        const urlParams = new URLSearchParams(window.location.search);
        const sceneId = urlParams.get('id');
        loadRehearsals(sceneId);
      })
      .catch((error) => {
        console.error("Error deleting rehearsal:", error);
        alert("Erreur lors de la suppression");
      });
  }
}
