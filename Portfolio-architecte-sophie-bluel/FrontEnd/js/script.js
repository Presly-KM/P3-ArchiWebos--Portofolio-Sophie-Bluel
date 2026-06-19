async function initialiserGalerie() {     
    // 1. Récupération des données initiales de l'API
    const reponse = await fetch("http://localhost:5678/api/works");
    // On passe le tableau works en "let" pour pouvoir le modifier dynamiquement à la suppression
    let works = await reponse.json();

    // --- FONCTION : Générer la galerie principale ---
    function generateWorks(worksToRender) {
        const classGallery = document.querySelector(".gallery");
        if (!classGallery) return;
        classGallery.innerHTML = ""; 
        
        for (let i = 0; i < worksToRender.length; i++) {
            const figureElement = document.createElement("figure");
            const imageElement = document.createElement("img");
            const imageFigcaption = document.createElement("figcaption");

            imageElement.src = worksToRender[i].imageUrl;
            imageElement.alt = worksToRender[i].title;
            imageFigcaption.textContent = worksToRender[i].title;

            classGallery.appendChild(figureElement);
            figureElement.appendChild(imageElement);
            figureElement.appendChild(imageFigcaption);
        }
    }

    // --- FONCTION : Gestion des filtres d'accueil ---
    function GestionnaireFiltre() {
        const filterBtns = document.querySelectorAll(".filter-btn");
        
        filterBtns.forEach(btn => {
            btn.addEventListener("click", function (e) {
                filterBtns.forEach(b => b.classList.remove("filter-btn-active"));
                e.target.classList.add("filter-btn-active"); 
                
                const boutonTexte = e.target.textContent;
                
                if (boutonTexte === "Tous") {                                                                           
                    generateWorks(works);                                                                               
                } else {
                    const filtre = works.filter(item => item.category.name === boutonTexte);
                    generateWorks(filtre);
                }
            });
        });
    }

    // --- FONCTION : Gestion de l'affichage du mode édition ---
    function gererModeEdition() {
        const token = window.localStorage.getItem("token");

        if (token) {
            const editElements = document.querySelectorAll(".edit-mode-only");
            editElements.forEach(element => element.classList.remove("hidden"));

            const filters = document.querySelector(".filters");
            if (filters) filters.classList.add("hidden");

            const loginLink = document.getElementById("login-link");
            if (loginLink) {                                                                                                            
                loginLink.textContent = "logout";
                loginLink.href = "#"; 

                loginLink.addEventListener("click", function () {
                    window.localStorage.removeItem("token");
                    window.location.reload();
                });
            }
        }
    }

    // --- FONCTION : Générer la galerie de la modale ---
    function generateModalWorks(worksToRender) {
        const modalGallery = document.querySelector(".modal-gallery");
        if (!modalGallery) return;

        modalGallery.innerHTML = ""; 

        for (let i = 0; i < worksToRender.length; i++) {
            const figureElement = document.createElement("figure");
            const imageElement = document.createElement("img");
            const trashBtn = document.createElement("button");

            imageElement.src = worksToRender[i].imageUrl;
            imageElement.alt = worksToRender[i].title;

            trashBtn.classList.add("trash-btn");
            // Utilisation d'un attribut aria pour que le lecteur d'écran lise "Supprimer" au lieu de rien
            trashBtn.setAttribute("aria-label", `Supprimer le projet ${worksToRender[i].title}`);
            trashBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            
            // Stockage de l'ID du projet dans le dataset
            trashBtn.dataset.id = worksToRender[i].id;

            figureElement.appendChild(imageElement);
            figureElement.appendChild(trashBtn);
            modalGallery.appendChild(figureElement);
        }
    }

    // --- FONCTION : API Call pour la suppression ---
    async function supprimerProjet(id) {
        const token = window.localStorage.getItem("token");
        
        // Sécurité : si pas de token, on n'essaie même pas de taper sur l'API
        if (!token) return false;

        try {
            const response = await fetch(`http://localhost:5678/api/works/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}` // Transmission du jeton SecOps
                }
            });

            return response.ok; // Renvoie true si le statut est 200/204
        } catch (error) {
            console.error("Erreur réseau lors de la suppression :", error);
            return false;
        }
    }

    // --- FONCTION : Orchestration de la modale ---
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
        const modalGallery = document.querySelector(".modal-gallery");

        if (!modifyBtn || !modalContainer) return;

        function réinitialiserModale() {
            modalContainer.classList.add("hidden");
            viewGallery.classList.remove("hidden");
            viewAddPhoto.classList.add("hidden");
            backBtn.classList.add("hidden");
            if (addForm) addForm.reset(); 
        }

        modifyBtn.addEventListener("click", function (e) {
            e.preventDefault();
            modalContainer.classList.remove("hidden"); 
            generateModalWorks(works); 
        });

        addPhotoBtn.addEventListener("click", function () {
            viewGallery.classList.add("hidden");
            viewAddPhoto.classList.remove("hidden");
            backBtn.classList.remove("hidden");
        });

        backBtn.addEventListener("click", function () {
            viewGallery.classList.remove("hidden");
            viewAddPhoto.classList.add("hidden");
            backBtn.classList.add("hidden");
        });

        closeBtn.addEventListener("click", réinitialiserModale);
        overlay.addEventListener("click", réinitialiserModale);

        // 🟢 ÉCOUTEUR DÉLÉGUÉ : Capture des clics de suppression dans la modale
        if (modalGallery) {
            modalGallery.addEventListener("click", async function (e) {
                // On cherche si le clic provient du bouton trash-btn ou de son icône interne
                const boutonPoubelle = e.target.closest(".trash-btn");
                
                if (boutonPoubelle) {
                    e.preventDefault();
                    const idProjet = boutonPoubelle.dataset.id;                      // idProjet représente l'identifiant du projet à supprimer. On le récupère depuis le HTML, avec l'attribut data-id du bouton trash-btn.
                    
                    // Lancement de la requête de suppression sécurisée
                    const suppressionReussie = await supprimerProjet(idProjet);      // on attend la réponse de l'API pour savoir si la suppression a été effectuée avec succès DANS LE SERVEUR. Quelques lignes de code plus bas, "works = works.filter(item => item.id !== parseInt(idProjet))" se chargera de rendre la suppression effective visuellement dans la galerie d'accueil et dans la modale, sans que l'utilisateur soit obligé de recharger la page.
                    
                    if (suppressionReussie) {
                        // Mise à jour de l'état local (On filtre le tableau pour retirer l'élément supprimé)
                        works = works.filter(item => item.id !== parseInt(idProjet));  // Grace au let (l.5), "works" qui correspond aux données par défaut des 11 projets, peut à l'occasion de la suppression de projets etre réassigné afin de remplacer l'ancien tableau par un nouveau dépouillé de l'élément supprimé. La ligne de code dit : « Parcours tout mon tableau de projets, examine-les un par un, et ne garde que ceux dont l'identifiant (id) est différent de celui de la poubelle cliquée. ». Concernant parseInt : Comme l'opérateur !== est très strict, si on compare le nombre 5 avec le texte "5", JavaScript considérera qu'ils sont différents et refusera de supprimer le projet. La fonction parseInt() sert à transformer le texte "5" en un vrai nombre 5 pour que la comparaison fonctionne parfaitement.
                        
                        // Rafraîchissement réactif de l'interface (Zéro rechargement de page !)
                        generateWorks(works);      // Met à jour la galerie d'accueil
                        generateModalWorks(works); // Met à jour les miniatures de la modale
                    } else {
                        alert("Impossible de supprimer ce projet. Session expirée ou droits insuffisants.");
                    }
                }
            });
        }
    }

    // --- EXÉCUTION ---
    generateWorks(works);
    GestionnaireFiltre();
    gererModeEdition();
    gestionnaireModal(); 
}

initialiserGalerie();