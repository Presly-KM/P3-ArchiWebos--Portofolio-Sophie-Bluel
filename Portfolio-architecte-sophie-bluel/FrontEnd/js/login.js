// Constante globale pour centraliser l'URL de l'API (pratique si l'hôte change en prod)
const LOGIN_API_URL = "http://localhost:5678/api/users/login";

/**
 * 1. Extraction des données du DOM
 * Rôle : Récupérer proprement les valeurs saisies par l'utilisateur.
 */
function recupererIdentifiants() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    return {
        email: email,
        password: password
    };
}

/**
 * 2. Couche Réseau / API
 * Rôle : Gérer uniquement l'envoi des paquets via fetch.
 */
async function envoyerRequeteConnexion(identifiant) {
    return await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identifiant)
    });
}

/**
 * 3. Couche Sécurité et Session (SecOps)
 * Rôle : Analyser la réponse du serveur, stocker le token ou bloquer l'accès.
 */
async function traiterReponseConnexion(reponse) {
    if (reponse.ok) {                                                             // .ok est une propriété de l'objet Response qui est true si le statut HTTP est compris entre 200 et 299 (succès)
        const data = await reponse.json();                                        // Le serveur nous renvoie ici : { userId: X, token: "eyJhbGciOi..." }
        
        // Stockage sécurisé de la session client
        window.localStorage.setItem("token", data.token);                         // On stocke le token dans le localStorage pour maintenir la session de l'utilisateur. data.token signifie que l'on accède à la propriété "token" de l'objet JSON renvoyé par le serveur.
        
        // Redirection vers l'application principale
        window.location.href = "index.html";
    } else {
        // Gestion de l'échec d'authentification (401/404)
        alert("Erreur dans l'identifiant ou le mot de passe");
    }
}

// --- ÉCOUTEUR PRINCIPAL (Le chef d'orchestre) ---
const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Bloque le rechargement HTML natif

    // Appel de la couche 1 : DOM
    const identifiant = recupererIdentifiants();                                   // Récupération des identifiants saisis par l'utilisateur : { email: "...", password: "..." }

    try {
        // Appel de la couche 2 : Réseau
        const reponse = await envoyerRequeteConnexion(identifiant);                // Envoi de la requête POST à l'API avec les identifiants de l'utilisateur : => fetch("http://localhost:5678/api/users/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(identifiant) })
        
        // Appel de la couche 3 : Sécurité
        await traiterReponseConnexion(reponse);                                    // Analyse de la réponse du serveur et stockage du token si succès : => if (reponse.ok) { const data = await reponse.json(); window.localStorage.setItem("token", data.token); window.location.href = "index.html"; } else { alert("Erreur dans l'identifiant ou le mot de passe"); }

    } catch (error) {
        // Gestion globale des crashs réseau (serveur éteint, coupure internet...)
        console.error("Erreur critique d'infrastructure :", error);
        alert("Impossible de joindre le serveur d'authentification.");
    }
});