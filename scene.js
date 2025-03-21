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
    // In a real app, this would load from Firestore
    // For now, using sample data
    
    // Sample scene data
    const scenes = [
        { 
            id: 1, 
            title: "Lorenzaccio", 
            author: "Alfred de Musset (1834)", 
            description: "Cette scène présente la rencontre entre le Duc et Lorenzo. Un moment clé de la pièce qui montre la duplicité de Lorenzo.",
            characters: ["Le Duc", "Lorenzo", "Catherine"]
        },
        { 
            id: 2, 
            title: "La meilleure façon de marcher (Footing)", 
            author: "Claude Miller (1976)", 
            description: "Marc et Philippe se retrouvent pour un footing matinal, révélant les tensions sous-jacentes de leur relation.",
            characters: ["Marc", "Philippe"]
        },
        { 
            id: 3, 
            title: "La meilleure façon de marcher (La chambre)", 
            author: "Claude Miller (1976)", 
            description: "Dans l'intimité d'une chambre, Marc confronte Philippe sur un secret découvert.", 
            characters: ["Marc", "Philippe"]
        },
        { 
            id: 4, 
            title: "Au Bout de 30 ans", 
            author: "Hanokh Levin (1989)", 
            description: "Un couple fait le bilan de trente années de vie commune, entre amertume et révélations.",
            characters: ["Homme", "Femme"]
        },
        { 
            id: 5, 
            title: "4.48 Psychose", 
            author: "Sarah Kane (2000)", 
            description: "Exploration poétique et fragmentée d'un esprit tourmenté par la dépression.",
            characters: ["Personnage 1", "Personnage 2"]
        }
    ];
    
    // Find the scene data
    const scene = scenes.find(s => s.id == sceneId);
    
    if (!scene) {
        alert("Scène non trouvée");
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Update page title
    document.title = `${scene.title} - zApps Planner`;
    
    // Update scene information
    document.getElementById('sceneTitle').textContent = scene.title;
    document.getElementById('sceneAuthor').textContent = scene.author;
    document.getElementById('sceneDescription').textContent = scene.description;
    
    // Load characters
    loadCharacters(scene.characters);
    
    // Sample actors data - in a real app, this would come from Firestore
    const actors = [
        { id: 'user1', name: 'François', character: 'Le Duc', scene: 1 },
        { id: 'user2', name: 'Vincent', character: 'Lorenzo', scene: 1 }
    ];
    
    // Filter actors for this scene
    const sceneActors = actors.filter(a => a.scene == sceneId);
    
    // Update actors list
    const actorsList = document.getElementById('actorsList');
    if (sceneActors.length > 0) {
        actorsList.innerHTML = '';
        sceneActors.forEach(actor => {
            const actorItem = document.createElement('li');
            actorItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            actorItem.innerHTML = `
                ${actor.name}
                <span class="badge bg-primary rounded-pill">${actor.character}</span>
            `;
            actorsList.appendChild(actorItem);
        });
    }
    
    // Sample rehearsals data
    const rehearsals = [
        { 
            id: 1, 
            sceneId: 1, 
            date: "2025-03-25", 
            time: "18:00",
            location: "Centre culturel Le Millénaire",
            participants: ["François", "Vincent"],
            coach: "Loïc"
        }
    ];
    
    // Filter rehearsals for this scene
    const sceneRehearsals = rehearsals.filter(r => r.sceneId == sceneId);
    
    // Update rehearsals list
    const rehearsalsList = document.getElementById('rehearsalsList');
    if (sceneRehearsals.length > 0) {
        rehearsalsList.innerHTML = '';
        sceneRehearsals.forEach(rehearsal => {
            const dateObj = new Date(`${rehearsal.date}T${rehearsal.time}`);
            const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
            });
            const formattedTime = dateObj.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const rehearsalItem = document.createElement('li');
            rehearsalItem.className = 'list-group-item';
            rehearsalItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <strong>${formattedDate}</strong>
                    <span>${formattedTime}</span>
                </div>
                <div class="mt-1">
                    <i class="fas fa-map-marker-alt"></i> ${rehearsal.location}
                </div>
                <div class="mt-1">
                    ${rehearsal.coach ? `<small class="text-muted">Coach: ${rehearsal.coach}</small>` : ''}
                </div>
            `;
            rehearsalsList.appendChild(rehearsalItem);
        });
    }
    
    // Check if user is already in this scene
    const userActor = actors.find(a => a.id === userId && a.scene == sceneId);
    if (userActor) {
        // User is already in this scene
        document.getElementById('characterSelectionForm').innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Vous jouez le rôle de <strong>${userActor.character}</strong> dans cette scène.
            </div>
        `;
        
        // Show costume form
        document.getElementById('costumeForm').classList.remove('d-none');
        document.getElementById('costumesList').innerHTML = '';
        
        // Sample costume data - in a real app, this would come from Firestore
        const costumes = [
            { id: 1, characterId: 'Le Duc', sceneId: 1, description: "Cape noire royale", addedBy: "François" },
            { id: 2, characterId: 'Le Duc', sceneId: 1, description: "Couronne dorée", addedBy: "François" }
        ];
        
        // Filter costumes for this character
        const characterCostumes = costumes.filter(c => c.characterId === userActor.character && c.sceneId == sceneId);
        
        if (characterCostumes.length > 0) {
            const costumesList = document.createElement('ul');
            costumesList.className = 'list-group mb-4';
            
            characterCostumes.forEach(costume => {
                const costumeItem = document.createElement('li');
                costumeItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                costumeItem.innerHTML = `
                    ${costume.description}
                    <button class="btn btn-sm btn-outline-danger delete-costume-btn" data-id="${costume.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                costumesList.appendChild(costumeItem);
            });
            
            document.getElementById('costumesList').appendChild(costumesList);
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-costume-btn').forEach(button => {
                button.addEventListener('click', function() {
                    deleteCostume(this.getAttribute('data-id'));
                });
            });
        } else {
            document.getElementById('costumesList').innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Aucun élément de costume ajouté pour ${userActor.character}.
                </div>
            `;
        }
    }
    
    // Sample music data - in a real app, this would come from Firestore
    const musicSuggestions = [
        { 
            id: 1, 
            sceneId: 1, 
            title: "Requiem in D minor", 
            artist: "Mozart",
            link: "https://www.youtube.com/watch?v=sPlhKP0nZII",
            notes: "Parfait pour l'ambiance sombre de la scène",
            addedBy: "François",
            votes: 3
        }
    ];
    
    // Filter music for this scene
    const sceneMusic = musicSuggestions.filter(m => m.sceneId == sceneId);
    
    // Update music list
    const musicList = document.getElementById('musicList');
    if (sceneMusic.length > 0) {
        musicList.innerHTML = '';
        sceneMusic.forEach(music => {
            const musicCard = document.createElement('div');
            musicCard.className = 'card mb-2';
            musicCard.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h6 class="card-title mb-1">${music.title}</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-primary vote-music-btn" data-id="${music.id}">
                                <i class="fas fa-thumbs-up"></i> ${music.votes}
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
                        <small class="text-muted">Proposé par ${music.addedBy}</small>
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
    }
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
        addCostume(sceneId, description);
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
    // In a real app, this would update Firestore
    alert(`Vous avez choisi le personnage "${character}" dans cette scène.`);
    
    // Reload the page to reflect changes
    window.location.reload();
}

// Add a costume element
function addCostume(sceneId, description) {
    // In a real app, this would add to Firestore
    alert(`Élément de costume ajouté: "${description}"`);
    
    // Reset form and reload costumes
    document.getElementById('costumeDescription').value = '';
    
    // In a real app, would reload from Firestore
    // For demo, just add to the list
    const costumesList = document.getElementById('costumesList');
    if (costumesList.querySelector('.alert')) {
        // Remove "no costumes" message if it exists
        costumesList.innerHTML = '';
    }
    
    // If no list yet, create one
    let list = costumesList.querySelector('ul');
    if (!list) {
        list = document.createElement('ul');
        list.className = 'list-group mb-4';
        costumesList.appendChild(list);
    }
    
    // Add new item
    const newItem = document.createElement('li');
    newItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    newItem.innerHTML = `
        ${description}
        <button class="btn btn-sm btn-outline-danger delete-costume-btn" data-id="temp">
            <i class="fas fa-trash"></i>
        </button>
    `;
    list.appendChild(newItem);
}

// Delete a costume element
function deleteCostume(costumeId) {
    // In a real app, this would delete from Firestore
    if (confirm("Voulez-vous vraiment supprimer cet élément de costume ?")) {
        // Remove from DOM for demo
        const button = document.querySelector(`.delete-costume-btn[data-id="${costumeId}"]`);
        if (button) {
            const listItem = button.closest('li');
            listItem.remove();
            
            // If no more items, show message
            const list = document.querySelector('#costumesList ul');
            if (list && list.children.length === 0) {
                document.getElementById('costumesList').innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> Aucun élément de costume ajouté.
                    </div>
                `;
            }
        }
    }
}

// Add a music suggestion
function addMusic(sceneId, title, artist, link, notes) {
    // In a real app, this would add to Firestore
    alert(`Suggestion musicale ajoutée: "${title}" par ${artist}`);
    
    // Reset form
    document.getElementById('musicTitle').value = '';
    document.getElementById('musicArtist').value = '';
    document.getElementById('musicLink').value = '';
    document.getElementById('musicNotes').value = '';
    
    // For demo, add to the list
    const musicList = document.getElementById('musicList');
    if (musicList.querySelector('.text-center')) {
        // Remove "no music" message
        musicList.innerHTML = '';
    }
    
    // Add new card
    const musicCard = document.createElement('div');
    musicCard.className = 'card mb-2';
    musicCard.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between">
                <h6 class="card-title mb-1">${title}</h6>
                <div>
                    <button class="btn btn-sm btn-outline-primary vote-music-btn" data-id="temp">
                        <i class="fas fa-thumbs-up"></i> 0
                    </button>
                </div>
            </div>
            <p class="card-subtitle text-muted small mb-2">${artist}</p>
            ${notes ? `<p class="card-text small mb-2">${notes}</p>` : ''}
            ${link ? `
                <a href="${link}" target="_blank" class="btn btn-sm btn-outline-secondary">
                    <i class="fas fa-external-link-alt"></i> Écouter
                </a>
            ` : ''}
            <div class="mt-2">
                <small class="text-muted">Proposé par vous</small>
            </div>
        </div>
    `;
    musicList.appendChild(musicCard);
}

// Vote for a music suggestion
function voteForMusic(musicId) {
    // In a real app, this would update Firestore
    
    // For demo, just update the vote count
    const button = document.querySelector(`.vote-music-btn[data-id="${musicId}"]`);
    if (button) {
        // Get current vote count
        const voteText = button.textContent.trim();
        const voteCount = parseInt(voteText) || 0;
        
        // Update vote count
        button.innerHTML = `<i class="fas fa-thumbs-up"></i> ${voteCount + 1}`;
    }
}

// Add a note
function addNote(sceneId, content) {
    // In a real app, this would add to Firestore
    alert(`Note ajoutée pour la scène.`);
    
    // Reset form
    document.getElementById('noteContent').value = '';
    
    // For demo, add to the list
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    
    // Add new note
    const noteCard = document.createElement('div');
    noteCard.className = 'card mb-3';
    noteCard.innerHTML = `
        <div class="card-body">
            <p class="card-text">${content}</p>
            <div class="d-flex justify-content-between">
                <small class="text-muted">Ajouté par vous</small>
                <small class="text-muted">À l'instant</small>
            </div>
        </div>
    `;
    notesList.appendChild(noteCard);
}

// Save a rehearsal
function saveRehearsal(sceneId) {
    const date = document.getElementById('rehearsalDate').value;
    const time = document.getElementById('rehearsalTime').value;
    const duration = document.getElementById('rehearsalDuration').value;
    const location = document.getElementById('rehearsalLocation').value;
    const coachPresence = document.getElementById('coachPresence').checked;
    const notes = document.getElementById('rehearsalNotes').value;
    
    if (!date || !time || !location) {
        alert("Veuillez remplir tous les champs requis");
        return;
    }
    
    // In a real app, this would save to Firestore
    alert(`Répétition planifiée pour le ${date} à ${time} à ${location}`);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('planRehearsalModal'));
    modal.hide();
    
    // For demo, add to the list
    const rehearsalsList = document.getElementById('rehearsalsList');
    
    // Remove "no rehearsals" message if it exists
    if (rehearsalsList.querySelector('.text-center')) {
        rehearsalsList.innerHTML = '';
    }
    
    // Format date and time
    const dateObj = new Date(`${date}T${time}`);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    const formattedTime = dateObj.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Add new rehearsal
    const rehearsalItem = document.createElement('li');
    rehearsalItem.className = 'list-group-item';
    rehearsalItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <strong>${formattedDate}</strong>
            <span>${formattedTime}</span>
        </div>
        <div class="mt-1">
            <i class="fas fa-map-marker-alt"></i> ${location}
        </div>
        <div class="mt-1">
            ${coachPresence ? '<small class="text-muted">Coach: Stéphanie (demandé)</small>' : ''}
        </div>
    `;
    rehearsalsList.appendChild(rehearsalItem);
}