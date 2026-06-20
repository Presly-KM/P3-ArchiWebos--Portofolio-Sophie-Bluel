async function initialiserGalerie() {     
    // ==========================================
    // 1. ÉTAT GLOBAL & INITIALISATION
    // ==========================================
    const reponse = await fetch("http://localhost:5678/api/works");
    let works = await reponse.json();

    // ==========================================
    // 2. FONCTIONS DE RENDU GRAPHlique (DOM)
    // ==========================================
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
            trashBtn.setAttribute("aria-label", `Supprimer le projet ${worksToRender[i].title}`);
            trashBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            trashBtn.dataset.id = worksToRender[i].id;

            figureElement.appendChild(imageElement);
            figureElement.appendChild(trashBtn);
            modalGallery.appendChild(figureElement);
        }
    }

    // ==========================================
    // 3. FONCTIONS SYSTÈME (FILTRES & ÉDITION)
    // ==========================================
    function GestionnaireFiltre() {
        const filterBtns = document.querySelectorAll(".filter-btn");
        filterBtns.forEach(btn => {
            btn.addEventListener("click", function (e) {
                filterBtns.forEach(b => b.classList.remove("filter-btn-active"));
                e.target.classList.add("filter-btn-active"); 
                const boutonTexte = e.target.textContent;                                  // Récupération du texte du bouton de filtre cliqué
                
                if (boutonTexte === "Tous") {                                                                           
                    generateWorks(works);                                                                               
                } else {
                    const filtre = works.filter(item => item.category.name === boutonTexte); // Le filter ne garde que les projets dont le nom de catégorie correspond au texte du bouton sur lequel on a cliqué. Works est le tableau global de tous les projets, et filtre est le tableau filtré.
                    generateWorks(filtre);
                }
            });
        });
    }

    function gererModeEdition() {
        const token = window.localStorage.getItem("token");
        if (token) {                                                                                   // Si un token est présent (l'utilisateur est connecté)...
            document.querySelectorAll(".edit-mode-only").forEach(el => el.classList.remove("hidden")); // Le mode édition étant activé, on affiche les éléments réservés au mode édition et masqués par défaut.
            const filters = document.querySelector(".filters");
            if (filters) filters.classList.add("hidden");                                              //  On Masque les boutons de filtre lorsque l'utilisateur est connecté.

            const loginLink = document.getElementById("login-link");                                   // On récupère l'id login-link pour transformer le lien "login" en "logout" et lui ajouter un événement de déconnexion.
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

    // ==========================================
    // 4. SERVICES API (HTTP REQUESTS)
    // ==========================================
    async function supprimerProjetAPI(id) {
        const token = window.localStorage.getItem("token");
        if (!token) return false;
        try {
            const response = await fetch(`http://localhost:5678/api/works/${id}`, {          // On utilise la méthode DELETE pour supprimer le projet correspondant à l'ID fourni.
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }                              // On ajoute le token dans l'en-tête (headers) de la requête pour authentifier l'utilisateur et autoriser la suppression du projet.
            });
            return response.ok;
        } catch (error) {
            console.error("Erreur DELETE:", error);
            return false;
        }
    }

    async function ajouterProjetAPI(formData) {
        const token = window.localStorage.getItem("token");                                 
        try {
            const response = await fetch("http://localhost:5678/api/works", {               // On utilise la méthode POST pour envoyer les données du nouveau projet au serveur.
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            return response;
        } catch (error) {
            console.error("Erreur POST:", error);
            return null;
        }
    }

    // ==========================================
    // 5. PILOTAGE DES COMPOSANTS DE LA MODALE
    // ==========================================
    
    // Outil global pour vider l'aperçu de l'image
    function réinitialiserEncartUpload() {
        const imagePreview = document.getElementById("image-preview");                   
        if (imagePreview) {                                                               // On réinitialise l'aperçu de l'image en remettant la source à "#" et en ajoutant la classe "hidden" pour masquer l'élément.
            imagePreview.src = "#";
            imagePreview.classList.add("hidden");
        }
        const icon = document.querySelector(".upload-container .upload-icon");         
        const label = document.querySelector(".upload-container .upload-label");
        const specs = document.querySelector(".upload-container .upload-specs");
        if (icon) icon.classList.remove("hidden");                                        // On réaffiche les éléments de l'encart d'upload (l'icone, l'étiquette, les spécifications) en supprimant la classe "hidden" pour les rendre visibles.
        if (label) label.classList.remove("hidden");
        if (specs) specs.classList.remove("hidden");
    }

    function réinitialiserModale() {
        document.getElementById("modal-container").classList.add("hidden");                                // On masque la modale en ajoutant la classe "hidden" à l'élément modal-container.
        document.getElementById("modal-content-gallery").classList.remove("hidden");                       // On réaffiche le contenu de la galerie dans la modale en supprimant la classe "hidden" de l'élément modal-content-gallery.
        document.getElementById("modal-content-add-photo").classList.add("hidden");                        // On masque le contenu d'ajout de photo dans la modale en ajoutant la classe "hidden" à l'élément modal-content-add-photo.
        document.getElementById("modal-back-btn").classList.add("hidden");                                 // On masque le bouton de retour dans la modale en ajoutant la classe "hidden" à l'élément modal-back-btn.
        const addForm = document.getElementById("add-photo-form");                                         // On récupère le formulaire d'ajout de photo pour le réinitialiser.
        if (addForm) addForm.reset();                                                                      // Si le formulaire existe, on le réinitialise en appelant la méthode reset() pour vider tous les champs du formulaire.
        réinitialiserEncartUpload();                                                                       // On réinitialise l'encart d'upload pour vider l'aperçu de l'image et réafficher les éléments de l'encart.
    }

    // Sous-fonction A : Gérer uniquement l'ouverture, la fermeture et la navigation
    function configurerNavigationModal() {                     
        const modifyBtn = document.getElementById("modify-btn");
        const addPhotoBtn = document.getElementById("add-photo-btn");
        const backBtn = document.getElementById("modal-back-btn");

        if (!modifyBtn) return;

        modifyBtn.addEventListener("click", function (e) {
            e.preventDefault();
            document.getElementById("modal-container").classList.remove("hidden");                        // A l'appui sur le bouton de "modifier" on affiche la modale en supprimant la classe "hidden" de l'élément modal-container.
            generateModalWorks(works);                                                                    // On génère le contenu de la galerie dans la modale en appelant la fonction generateModalWorks avec le tableau works.
        });

        addPhotoBtn.addEventListener("click", function () {                                                // A l'appui sur le bouton "ajouter une photo" on masque le contenu de la galerie et on affiche le contenu d'ajout de photo dans la modale.
            document.getElementById("modal-content-gallery").classList.add("hidden");
            document.getElementById("modal-content-add-photo").classList.remove("hidden");
            backBtn.classList.remove("hidden");
        });

        backBtn.addEventListener("click", réinitialiserModale);                                           // A l'appui sur le bouton de retour on réinitialise la modale en appelant la fonction réinitialiserModale pour revenir à l'état initial de la modale.
        document.getElementById("modal-close-btn").addEventListener("click", réinitialiserModale);        // A l'appui sur le bouton de fermeture on réinitialise la modale en appelant la fonction réinitialiserModale pour revenir à l'état initial de la modale.
        document.getElementById("modal-overlay").addEventListener("click", réinitialiserModale);          // A l'appui sur l'overlay de la modale on réinitialise la modale en appelant la fonction réinitialiserModale pour revenir à l'état initial de la modale.
    }

    // Sous-fonction B : Gérer uniquement la prévisualisation de l'image
    function configurerPrevisualisationImage() {                                                            // On configure la prévisualisation de l'image sélectionnée dans le formulaire d'ajout de photo.
        const fileInput = document.getElementById("file-upload");
        const imagePreview = document.getElementById("image-preview");                                      // On récupère l'élément img qui servira à afficher la prévisualisation de l'image sélectionnée par l'utilisateur.
        if (!fileInput) return;

        fileInput.addEventListener("change", function () {                                                  // On écoute l'événement "change" sur l'input de type "file" pour détecter quand l'utilisateur sélectionne un fichier.
            const fichierSelectionne = fileInput.files[0];                                                  // On met fileInput.files[0] car fileInput.files est une liste de fichiers sélectionnés, et on ne veut que le premier fichier (le seul dans ce cas). Ainsi, on récupère le fichier sélectionné par l'utilisateur.
            if (fichierSelectionne) {                                                                       // Si un fichier est sélectionné...
                imagePreview.src = URL.createObjectURL(fichierSelectionne);                                 // On crée une URL temporaire pour le fichier sélectionné afin de l'afficher dans l'élément img de prévisualisation. En effet, URL.createObjectURL() crée une URL locale pour le fichier sélectionné, ce qui permet de l'afficher dans l'élément img sans avoir besoin de l'envoyer au serveur.
                imagePreview.classList.remove("hidden");
                
                document.querySelector(".upload-container .upload-icon").classList.add("hidden");           // On masque l'icône d'upload lorsque l'image est prévisualisée en ajoutant la classe "hidden" à l'élément upload-icon.
                document.querySelector(".upload-container .upload-label").classList.add("hidden");          // On masque le label d'upload lorsque l'image est prévisualisée en ajoutant la classe "hidden" à l'élément upload-label.
                document.querySelector(".upload-container .upload-specs").classList.add("hidden");          // On masque les spécifications d'upload lorsque l'image est prévisualisée en ajoutant la classe "hidden" à l'élément upload-specs.
            }
        });
    }

    // Sous-fonction C : Gérer uniquement l'interception et le traitement de suppression
    function configurerSuppressionProjet() {
        const modalGallery = document.querySelector(".modal-gallery");
        if (!modalGallery) return;

        modalGallery.addEventListener("click", async function (e) {
            const boutonPoubelle = e.target.closest(".trash-btn");                                          // On utilise closest() pour s'assurer que l'on cible le bouton de suppression même si l'utilisateur clique sur l'icône à l'intérieur du bouton.
            if (boutonPoubelle) {
                e.preventDefault();
                const idProjet = boutonPoubelle.dataset.id;                                                 // On récupère l'ID du projet à supprimer depuis l'attribut data-id du bouton de suppression.
                const suppressionReussie = await supprimerProjetAPI(idProjet);                              // On appelle la fonction supprimerProjetAPI pour envoyer la requête DELETE au serveur et on attend la réponse.
                
                if (suppressionReussie) {                                                                   // Si la suppression a réussi, on met à jour le tableau works en filtrant le projet supprimé et on régénère la galerie et la modale.
                    works = works.filter(item => item.id !== parseInt(idProjet));
                    generateWorks(works);      
                    generateModalWorks(works); 
                } else {
                    alert("Impossible de supprimer ce projet.");
                }
            }
        });
    }

    // Sous-fonction D : Gérer uniquement la validation et la soumission du formulaire
    function configurerSoumissionFormulaire() {
        const addForm = document.getElementById("add-photo-form");
        if (!addForm) return;

        addForm.addEventListener("submit", async function (e) {
            e.preventDefault(); 
            const fileInput = document.getElementById("file-upload");
            const titleInput = document.getElementById("photo-title");
            const categorySelect = document.getElementById("photo-category");

            if (!fileInput.files[0] || !titleInput.value || !categorySelect.value) {
                alert("Veuillez remplir tous les champs du formulaire.");
                return;
            }

            const formData = new FormData();                                             // On crée un objet FormData pour envoyer les données du formulaire au serveur. FormData est utilisé pour construire un ensemble de paires clé/valeur représentant les champs du formulaire et leurs valeurs, ce qui est particulièrement utile pour l'envoi de fichiers.
            formData.append("image", fileInput.files[0]);                                // On ajoute le fichier sélectionné à l'objet FormData avec la clé "image". Cela permet d'envoyer le fichier au serveur sous cette clé. L'étiquette ("image") : Ce nom n'est pas choisi au hasard. C'est le mot exact que le serveur attend dans son code (dans le back-end de Fatima). Si on écris "photo" ou "monFichier", le serveur ouvrira le carton, cherchera l'étiquette "image", ne la trouvera pas, et la requête plantera.
            formData.append("title", titleInput.value);                                  // On ajoute le titre du projet à l'objet FormData avec la clé "title". Cela permet d'envoyer le titre au serveur sous cette clé.
            formData.append("category", categorySelect.value);                           // On ajoute la catégorie du projet à l'objet FormData avec la clé "category". Cela permet d'envoyer la catégorie au serveur sous cette clé.

            const response = await ajouterProjetAPI(formData);                           // On appelle la fonction ajouterProjetAPI pour envoyer les données du formulaire au serveur via une requête POST et on attend la réponse.

            if (response && response.ok) {                                               // Si la réponse est OK (statut HTTP 200-299), on récupère le projet nouvellement créé depuis la réponse JSON et on l'ajoute au tableau works, puis on régénère la galerie et on réinitialise la modale.
                const nouveauProjet = await response.json();
                works.push(nouveauProjet);
                generateWorks(works);
                réinitialiserModale();
            } else {
                alert("Erreur lors de l'envoi du projet au serveur.");
            }
        });
    }

    // ==========================================
    // 6. EXÉCUTION DU SYSTEME
    // ==========================================
    generateWorks(works);
    GestionnaireFiltre();
    gererModeEdition();
    
    // Lancement de nos modules spécialisés pour la modale
    configurerNavigationModal();
    configurerPrevisualisationImage();
    configurerSuppressionProjet();
    configurerSoumissionFormulaire();
}

initialiserGalerie();