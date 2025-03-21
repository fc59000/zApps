document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            loadUserData(user.uid);
            loadScenes();
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
    
    // Scene search functionality
    document.getElementById('sceneSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const sceneCards = document.querySelectorAll('#allScenesContainer .card');
        
        sceneCards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const author = card.querySelector('.card-subtitle').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || author.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
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

// Load all scenes from Firestore
function loadScenes() {
    const allScenesContainer = document.getElementById('allScenesContainer');
    const myScenesContainer = document.getElementById('myScenesContainer');
    
    // Sample scenes data - in a real app, this would come from Firestore
    const scenes = [
        { id: 1, title: "Lorenzaccio", author: "Alfred de Musset", year: 1834, characters: ["Le Duc", "Lorenzo", "Catherine"] },
        { id: 2, title: "La meilleure façon de marcher (Footing)", author: "Claude Miller", year: 1976, characters: ["Marc", "Philippe"] },
        { id: 3, title: "La meilleure façon de marcher (La chambre)", author: "Claude Miller", year: 1976, characters: ["Marc", "Philippe"] },
        { id: 4, title: "Au Bout de 30 ans", author: "Hanokh Levin", year: 1989, characters: ["Homme", "Femme"] },
        { id: 5, title: "4.48 Psychose", author: "Sarah Kane", year: 2000, characters: ["Personnage 1", "Personnage 2"] }
    ];
    
    // Clear containers
    allScenesContainer.innerHTML = '';
    myScenesContainer.innerHTML = '';
    
    let userHasScenes = false;
    
    // Create cards for all scenes
    scenes.forEach(scene => {
        // Create a card for the scene
        const sceneCard = createSceneCard(scene);
        
        // Add to all scenes container
        allScenesContainer.appendChild(sceneCard);
        
        // In a real app, check if user is in this scene and add to my scenes if yes
        // For now, let's add the first two scenes to "my scenes" as examples
        if (scene.id <= 2) {
            const mySceneCard = createSceneCard(scene);
            myScenesContainer.appendChild(mySceneCard);
            userHasScenes = true;
        }
    });
    
    // Show/hide the "no scenes" message
    document.getElementById('noScenesMessage').style.display = userHasScenes ? 'none' : 'block';
}

// Create a card element for a scene
function createSceneCard(scene) {
    const cardCol = document.createElement('div');
    cardCol.className = 'col';
    
    cardCol.innerHTML = `
        <div class="card h-100 shadow-sm scene-card" data-scene-id="${scene.id}">
            <div class="card-body">
                <h5 class="card-title">${scene.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${scene.author} (${scene.year})</h6>
                
                <div class="mt-3">
                    <h6>Personnages:</h6>
                    <ul class="character-list">
                        ${scene.characters.map(char => `<li>${char}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-primary join-scene-btn">
                        <i class="fas fa-plus-circle"></i> Rejoindre cette scène
                    </button>
                </div>
            </div>
            <div class="card-footer d-flex justify-content-between">
                <small class="text-muted">
                    <i class="fas fa-users"></i> <span class="actor-count">0</span> comédien(s)
                </small>
                <a href="#" class="card-link scene-details-link">
                    <i class="fas fa-info-circle"></i> Détails
                </a>
            </div>
        </div>
    `;
    
    // Add event listener for the "Join Scene" button
    const joinButton = cardCol.querySelector('.join-scene-btn');
    joinButton.addEventListener('click', function() {
        joinScene(scene.id);
    });
    
    // Add event listener for the "Details" link
    const detailsLink = cardCol.querySelector('.scene-details-link');
    detailsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSceneDetails(scene.id);
    });
    
    return cardCol;
}

// Join a scene (would save to Firestore in real app)
function joinScene(sceneId) {
    alert(`Vous avez rejoint la scène #${sceneId}. Cette fonction sera implémentée pour sauvegarder dans Firestore.`);
    // In a real app, this would update Firestore and reload the my scenes section
}

// Show scene details (navigate to scene detail page)
function showSceneDetails(sceneId) {
    window.location.href = `scene.html?id=${sceneId}`;
}

// Load upcoming rehearsals
function loadUpcomingRehearsals(userId) {
    const container = document.getElementById('upcomingRehearsalsContainer');
    const noRehearsalsMessage = document.getElementById('noRehearsalsMessage');
    
    // Sample rehearsal data - would come from Firestore in real app
    const rehearsals = [
        { 
            id: 1, 
            sceneId: 1, 
            sceneTitle: "Lorenzaccio",
            date: "2025-03-25", 
            time: "18:00",
            location: "Centre culturel Le Millénaire",
            participants: ["Alexandra", "François", "Vincent"],
            coach: "Loïc"
        },
        { 
            id: 2, 
            sceneId: 2, 
            sceneTitle: "La meilleure façon de marcher (Footing)",
            date: "2025-03-27", 
            time: "19:30",
            location: "Appartement de Julie",
            participants: ["Julie", "Antoine"],
            coach: null
        }
    ];
    
    // Remove loading/no rehearsals message if there are rehearsals
    if (rehearsals.length > 0) {
        noRehearsalsMessage.style.display = 'none';
        
        // Clear container and add rehearsals
        container.innerHTML = '';
        
        rehearsals.forEach(rehearsal => {
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
            
            const rehearsalItem = document.createElement('a');
            rehearsalItem.href = `rehearsal.html?id=${rehearsal.id}`;
            rehearsalItem.className = 'list-group-item list-group-item-action';
            
            rehearsalItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${rehearsal.sceneTitle}</h5>
                    <small class="text-primary">
                        <i class="fas fa-calendar"></i> ${formattedDate} à ${formattedTime}
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
        });
    }
}
