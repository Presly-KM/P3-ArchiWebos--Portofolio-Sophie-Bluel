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

generateWorks(works)


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
      } 
     else if (boutonTexte === "Objets") {
        const filtreObjets = works.filter(item => item.category.name === "Objets");   // On filtre pour ne garder que la catégorie "Objets"
                generateWorks(filtreObjets);
            } 
       else if (boutonTexte === "Appartements") {
         const filtreAppartements = works.filter(item => item.category.name === "Appartements");// On filtre pour ne garder que la catégorie "Appartements"
                generateWorks(filtreAppartements);
            } 
            else if (boutonTexte === "Hôtels & restaurants") {
              const filtreHotelsEtrestaurants = works.filter(item => item.category.name === "Hotels & restaurants");// On filtre pour ne garder que la catégorie "Hôtels & restaurants"
                generateWorks(filtreHotelsEtrestaurants);
            }
        });
    }
}

GestionnaireFiltre(works)

}

// --- FONCTION : Gestion de l'état connecté ---
    function gererModeEdition() {
        const token = window.localStorage.getItem("token");

        if (token) {
            // 1. Afficher les éléments du mode édition (Bandeau et Bouton modifier)
            const editElements = document.querySelectorAll(".edit-mode-only");
            editElements.forEach(element => {
                // Pour le bandeau on utilise flex, pour le bouton modifier on utilise flex aussi
                element.style.display = "flex";                                                 //element.style.display veut dire "on modifie le style CSS de l'élément en question" en effet, on peut modifier n'importe quelle propriété CSS via JavaScript. Ici, on modifie la propriété display pour afficher l'élément. Car avant display était sur none (donc invisible) et maintenant on le met sur flex (donc visible).
            });

            // 2. Masquer les filtres de catégories
            const filters = document.querySelector(".filters");
            if (filters) {
                filters.style.display = "none";
            }

            // 3. Transformer le lien "login" en "logout"
            const loginLink = document.getElementById("login-link");
            if (loginLink) {                                                            //  if (loginLink) veut dire "si loginLink existe" 
                loginLink.textContent = "logout";
                loginLink.href = "#"; // Devient un bouton d'action

                // Écouteur de clic pour la déconnexion (SecOps : Nettoyage du cache session)
                loginLink.addEventListener("click", function () {
                    // Supprime le token du stockage local
                    window.localStorage.removeItem("token");
                    // Recharge la page pour rafraîchir l'interface
                    window.location.reload();
                });
            }
        }
    }

    // On lance la vérification du mode édition
    gererModeEdition();



initialiserGalerie()



