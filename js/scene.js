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
        participants.push(doc.data().userName);
      });
      
      return db.collection('rehearsals').add({
        sceneId: sceneId,
        date: date,
        time: time,
        duration: parseFloat(duration),
        location: location,
        requestCoach: coachPresence,
        notes: notes,
        participants: participants,
        createdBy: userId,
        creatorName: userData.name,
        createdAt: new Date()
      });
    })
    .then(() => {
      // Close modal and reload rehearsals
      const modal = bootstrap.Modal.getInstance(document.getElementById('planRehearsalModal'));
      modal.hide();
      
      alert("Répétition planifiée avec succès!");
      loadRehearsals(sceneId);
    })
    .catch((error) => {
      console.error("Error saving rehearsal:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    });
}
