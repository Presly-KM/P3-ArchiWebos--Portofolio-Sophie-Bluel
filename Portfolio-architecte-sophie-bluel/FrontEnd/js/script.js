async function initialiserGalerie() {                                 // Par défaut, JavaScript interdit l'utilisation du mot-clé await directement au premier niveau d'un fichier. Cela génère une erreur bloquante (SyntaxError: Cannot use keyword 'await' outside an async function) et stoppe immédiatement le script. Ainsi, pour pouvoir utiliser le mot-clé await, on l'encapsule dans une fonction asynchrone (async function) que l'on appelle ensuite. 
const reponse = await fetch("http://localhost:5678/api/works")
const works = await reponse.json()

/*
{
    "id": 1,
    "title": "Abajour Tahina",
    "imageUrl": "http://localhost:5678/images/abajour-tahina1651286843956.png",
    "categoryId": 1,
    "userId": 1,
    "category": {
      "id": 1,
      "name": "Objets"
    }
*/

function generateWorks(works) {
 const classGallery = document.querySelector(".gallery")          // Il ne faut pas la placer dans la boucle for (en dessous de la ligne 21) par souci d'optimisation car JavaScript va fouiller tout ton code HTML à chaque tour de boucle (11 fois de suite !). Il vaut mieux le sortir et le placer juste au-dessus de la boucle.
 classGallery.innerHTML = "";                                     // Sécurité : on vide avant de générer
 
 for (let i = 0; i < works.length; i++) {
 const figureElement = document.createElement("figure")
 const imageElement = document.createElement("img")
 const imageFigcaption = document.createElement("figcaption")

 imageElement.src = works[i].imageUrl
 imageElement.alt = works[i].title
 imageFigcaption.textContent = works[i].title

 classGallery.appendChild(figureElement);
 figureElement.appendChild(imageElement);
 figureElement.appendChild(imageFigcaption);

}
}


// --- FONCTION : Gestion des filtres de la page d'accueil ---
function GestionnaireFiltre(works) {   
 const filterBtns = document.querySelectorAll(".filter-btn");
 
for (let i = 0; i < filterBtns.length; i++) {                            // Boucle principale pour attribuer l'écouteur de clic à chaque bouton
   filterBtns[i].addEventListener("click", function (e) {
   for (let j = 0; j < filterBtns.length; j++) {                          // 1. Gestion visuelle de la classe active
      filterBtns[j].classList.remove("filter-btn-active");                // On retire la classe active de TOUS les boutons via une boucle for
       }
   e.target.classList.add("filter-btn-active");                           // On l'ajoute uniquement sur le bouton qui vient d'être cliqué
  
   const boutonTexte = e.target.textContent;                              // 2. Récupération du texte du bouton cliqué
   document.querySelector(".gallery").innerHTML = "";                     // 3. On vide la galerie avant d'afficher les éléments filtrés
   
     if (boutonTexte === "Tous") {                                          // 4. Conditions de filtrage (comparaisons strictes avec ===)
          generateWorks(works);                                               // On renvoie le tableau initial complet
      } else if (boutonTexte === "Objets") {
          const filtreObjets = works.filter(item => item.category.name === "Objets");   // On filtre pour ne garder que la catégorie "Objets"
          generateWorks(filtreObjets);
      } else if (boutonTexte === "Appartements") {
          const filtreAppartements = works.filter(item => item.category.name === "Appartements");// On filtre pour ne garder que la catégorie "Appartements"
          generateWorks(filtreAppartements);
      } else if (boutonTexte === "Hôtels & restaurants") {
          const filtreHotelsEtrestaurants = works.filter(item => item.category.name === "Hotels & restaurants");// On filtre pour ne garder que la catégorie "Hôtels & restaurants"
          generateWorks(filtreHotelsEtrestaurants);
            }
        });
    }
}


// --- FONCTION : Gestion de l'état connecté ---
    function gererModeEdition() {
        const token = window.localStorage.getItem("token");

        if (token) {
            // 1. Afficher les éléments du mode édition (Bandeau et Bouton modifier)
            const editElements = document.querySelectorAll(".edit-mode-only");
            editElements.forEach(element => {
                element.classList.remove("hidden");        // On affiche en retirant hidden                                                //element.style.display veut dire "on modifie le style CSS de l'élément en question" en effet, on peut modifier n'importe quelle propriété CSS via JavaScript. Ici, on modifie la propriété display pour afficher l'élément. Car avant display était sur none (donc invisible) et maintenant on le met sur flex (donc visible).
            });

            // 2. Masquer les filtres de catégories
            const filters = document.querySelector(".filters");
            if (filters) {
                filters.classList.add("hidden");           // On masque les filtres
            }

            // 3. Transformer le lien "login" en "logout"
            const loginLink = document.getElementById("login-link");
            if (loginLink) {                                                            //  if (loginLink) veut dire "si loginLink existe" 
                loginLink.textContent = "logout";
                loginLink.href = "#"; // Devient un bouton d'action

                // Écouteur de clic pour la déconnexion (SecOps : Nettoyage du cache session)
                loginLink.addEventListener("click", function () {
                    window.localStorage.removeItem("token");                           // Supprime le token du stockage local
                    window.location.reload();                                           // Recharge la page pour rafraîchir l'interface
                });
            }
        }
    }


// --- FONCTION : Générer la galerie miniature à l'intérieur de la modale ---
    function generateModalWorks(works) {
        const modalGallery = document.querySelector(".modal-gallery");                      
        if (!modalGallery) return;                                                                             // Sécurité : si la modale n'existe pas, on arrête d'executer la fonction. On quitte la fonction pour éviter les erreurs JavaScript

        modalGallery.innerHTML = ""; // On nettoie la grille avant d'injecter pour éviter les doublons

        for (let i = 0; i < works.length; i++) {
            const figureElement = document.createElement("figure");
            const imageElement = document.createElement("img");
            const trashBtn = document.createElement("button");

            imageElement.src = works[i].imageUrl;
            imageElement.alt = works[i].title;

            // Ajout du bouton de suppression avec l'icône poubelle FontAwesome
            trashBtn.classList.add("trash-btn");
            trashBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            
            /* Note DevOps / SecOps : On greffe l'ID de la photo dans le dataset HTML du bouton. 
               Cela nous permettra de savoir exactement quel ID envoyer à l'API lors de la suppression. */
            trashBtn.dataset.id = works[i].id;

            figureElement.appendChild(imageElement);
            figureElement.appendChild(trashBtn);
            modalGallery.appendChild(figureElement);
        }
    }

// --- FONCTION : Gérer l'ouverture et la fermeture de la boîte modale ---
    function gestionnaireModal() {
        const modifyBtn = document.getElementById("modify-btn");
        const modalContainer = document.getElementById("modal-container");
        const closeBtn = document.getElementById("modal-close-btn");
        const overlay = document.getElementById("modal-overlay");

        const addPhotoBtn = document.getElementById("add-photo-btn");
        const backBtn = document.getElementById("modal-back-btn");
        const viewGallery = document.getElementById("modal-content-gallery");
        const viewAddPhoto = document.getElementById("modal-content-add-photo");
        const addForm = document.getElementById("add-photo-form");
       
        if (!modifyBtn || !modalContainer) return;

        function réinitialiserModale() {
            modalContainer.classList.add("hidden");
            viewGallery.classList.remove("hidden");
            viewAddPhoto.classList.add("hidden");
            backBtn.classList.add("hidden");
            if (addForm) addForm.reset();                                // addForm.reset() permet de réinitialiser le formulaire d'ajout de photo à son état initial (vide) après la fermeture de la modale. Cela évite que les champs restent remplis avec les anciennes valeurs. En effet .reset() est une méthode native de l'objet HTMLFormElement qui réinitialise tous les champs du formulaire à leurs valeurs par défaut.
        }

        // Clic sur "modifier" -> Ouvre la modale
        modifyBtn.addEventListener("click", function (e) {
            e.preventDefault();
            modalContainer.classList.remove("hidden"); // Devient visible
            generateModalWorks(works); 
        });

        // Clic sur "Ajouter une photo" -> Bascule sur la Vue 2
        addPhotoBtn.addEventListener("click", function () {
            viewGallery.classList.add("hidden");
            viewAddPhoto.classList.remove("hidden");
            backBtn.classList.remove("hidden");
        });

        // Clic sur la flèche retour -> Revient sur la Vue 1
        backBtn.addEventListener("click", function () {
            viewGallery.classList.remove("hidden");
            viewAddPhoto.classList.add("hidden");
            backBtn.classList.add("hidden");
        });

        closeBtn.addEventListener("click", réinitialiserModale);          // Ajout d'un écouteur sur le bouton de fermeture pour fermer la modale lorsqu'on clique dessus
        overlay.addEventListener("click", réinitialiserModale);           // Ajout d'un écouteur sur l'overlay pour fermer la modale lorsqu'on clique en dehors de celle-ci
    }

    // --- EXÉCUTION DES FONCTIONS AU CHARGEMENT ---
    generateWorks(works);
    GestionnaireFiltre(works);
    gererModeEdition();
    gestionnaireModal(); // Activation des écouteurs de la modale
}

// Lancement du script global
initialiserGalerie();



