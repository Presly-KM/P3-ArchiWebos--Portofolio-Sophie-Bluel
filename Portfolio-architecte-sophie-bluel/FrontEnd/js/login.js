// login.js - Ce fichier est branché uniquement sur login.html

const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // 1. Récupération des valeurs du formulaire
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const identifiant = {
        email: email,
        password: password
    };

    try {
        // 2. Envoi de la requête POST à l'API
        const reponse = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(identifiant)
        });

        // 3. Vérification du statut de la réponse HTTP
        if (reponse.ok) {                                                       // .ok est une propriété de l'objet Response qui est true si le statut HTTP est compris entre 200 et 299 (succès)
            const data = await reponse.json();                                  // Le serveur nous renvoie ici : { userId: X, token: "eyJhbGciOi..." }
                        
            window.localStorage.setItem("token", data.token);                   // On stocke le token dans le localStorage pour l'utiliser dans d'autres pages

            // Redirection vers la page d'accueil en mode connecté
            window.location.href = "index.html";                                

        } else {
            // Si le statut est 401 ou 404, le couple email/password est invalide
            alert("Erreur dans l'identifiant ou le mot de passe");
        }

    } catch (error) {
        // Gestion des erreurs réseau (ex: serveur de Fatima éteint)
        console.error("Erreur réseau lors de la connexion :", error);
        alert("Impossible de contacter le serveur d'authentification.");
    }
});