document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Firebase login
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Redirect to dashboard
                window.location.href = 'pages/dashboard.html';
            })
            .catch((error) => {
                alert('Erreur de connexion: ' + error.message);
            });
    });
    
    // Register form submission
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const phone = document.getElementById('registerPhone').value;
        
        // Check if it's a coach (special role)
        const isCoach = name === 'Loïc' || name === 'Stéphanie';
        
        // Firebase registration
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Add user to Firestore
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    phone: phone || '',
                    role: isCoach ? 'coach' : 'actor',
                    createdAt: new Date()
                });
            })
            .then(() => {
                // Redirect to dashboard
                window.location.href = 'pages/dashboard.html';
            })
            .catch((error) => {
                alert('Erreur d\'inscription: ' + error.message);
            });
    });
    
    // Forgot password link
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = prompt('Entrez votre email pour réinitialiser votre mot de passe:');
        if (email) {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert('Un email de réinitialisation a été envoyé à ' + email);
                })
                .catch((error) => {
                    alert('Erreur: ' + error.message);
                });
        }
    });
    
    // Guest access link
    document.getElementById('guestAccess').addEventListener('click', function(e) {
        e.preventDefault();
        // Redirect to public schedule page (we'll create this later)
        window.location.href = 'pages/public-schedule.html';
    });
});
