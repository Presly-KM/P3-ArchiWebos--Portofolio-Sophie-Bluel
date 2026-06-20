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

        // Éléments spécifiques à la prévisualisation de l'image
        const fileInput = document.getElementById("file-upload");
        const imagePreview = document.getElementById("image-preview");
        const uploadIcon = document.querySelector(".upload-container .upload-icon");
        const uploadLabel = document.querySelector(".upload-container .upload-label");
        const uploadSpecs = document.querySelector(".upload-container .upload-specs");
       
        if (!modifyBtn || !modalContainer) return;

        // Fonction utilitaire pour remettre l'encart d'upload dans son état d'origine
        function réinitialiserEncartUpload() {
            if (imagePreview) {
                imagePreview.src = "#";
                imagePreview.classList.add("hidden");
            }
            if (uploadIcon) uploadIcon.classList.remove("hidden");
            if (uploadLabel) uploadLabel.classList.remove("hidden");
            if (uploadSpecs) uploadSpecs.classList.remove("hidden");
        }
                
        function réinitialiserModale() {
            modalContainer.classList.add("hidden");
            viewGallery.classList.remove("hidden");
            viewAddPhoto.classList.add("hidden");
            backBtn.classList.add("hidden");
            if (addForm) addForm.reset(); 
            réinitialiserEncartUpload(); // 🧹 Nettoyage de l'aperçu à la fermeture
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
            if (addForm) addForm.reset();
            réinitialiserEncartUpload(); // 🧹 Nettoyage de l'aperçu au retour en arrière
        });

        closeBtn.addEventListener("click", réinitialiserModale);
        overlay.addEventListener("click", réinitialiserModale);

        // ÉCOUTEUR : Changement de fichier (Prévisualisation)
        if (fileInput) {
            fileInput.addEventListener("change", function () {
                const fichierSelectionne = fileInput.files[0];   // fileInput.files est une collection de fichiers sélectionnés par l'utilisateur. Ici, on prend le premier fichier (index 0) car on ne gère qu'un seul fichier à la fois.           

                if (fichierSelectionne) {
                    // 1. Génération de l'URL temporaire de l'image
                    const urlApercu = URL.createObjectURL(fichierSelectionne);
                    
                    // 2. Injection de l'URL dans la balise img et affichage
                    imagePreview.src = urlApercu;
                    imagePreview.classList.remove("hidden");

                    // 3. Masquage des éléments de l'encart d'origine
                    if (uploadIcon) uploadIcon.classList.add("hidden");
                    if (uploadLabel) uploadLabel.classList.add("hidden");
                    if (uploadSpecs) uploadSpecs.classList.add("hidden");
                }
            });
        }

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

        // 🟢 ÉCOUTEUR : Soumission du formulaire d'ajout de projet
        if (addForm) {
            addForm.addEventListener("submit", async function (e) {
                e.preventDefault(); // On bloque le rechargement natif HTML

                const token = window.localStorage.getItem("token");
                const titleInput = document.getElementById("photo-title");
                const categorySelect = document.getElementById("photo-category");

                // Sécurité : Vérification que les fichiers et données sont saisis
                if (!fileInput.files[0] || !titleInput.value || !categorySelect.value) {
                    alert("Veuillez remplir tous les champs du formulaire.");
                    return;
                }

                // Construction de l'objet de données Multipart
                const formData = new FormData();                                             // FormData est un objet natif de JavaScript qui permet de construire facilement des requêtes HTTP multipart/form-data, notamment pour l'upload de fichiers.
                formData.append("image", fileInput.files[0]);
                formData.append("title", titleInput.value);
                formData.append("category", categorySelect.value);

                try {
                    const response = await fetch("http://localhost:5678/api/works", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`
                            // Surtout aucun Content-Type ici, FormData s'en charge !
                        },
                        body: formData
                    });

                    if (response.ok) {
                        const nouveauProjet = await response.json();
                        
                        // Synchronisation réactive de notre Source de Vérité locale
                        works.push(nouveauProjet);
                        
                        // Rafraîchissement des deux galeries en temps réel
                        generateWorks(works);
                        
                        // Fermeture et réinitialisation de la modale
                        réinitialiserModale();
                    } else {
                        alert("Erreur lors de l'envoi du projet au serveur.");
                    }
                } catch (error) {
                    console.error("Erreur réseau lors de l'ajout :", error);
                    alert("Impossible de contacter le serveur d'authentification.");
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