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

    function gererModeEdition() {
        const token = window.localStorage.getItem("token");
        if (token) {
            document.querySelectorAll(".edit-mode-only").forEach(el => el.classList.remove("hidden"));
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

    // ==========================================
    // 4. SERVICES API (HTTP REQUESTS)
    // ==========================================
    async function supprimerProjetAPI(id) {
        const token = window.localStorage.getItem("token");
        if (!token) return false;
        try {
            const response = await fetch(`http://localhost:5678/api/works/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
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
            const response = await fetch("http://localhost:5678/api/works", {
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
        if (imagePreview) {
            imagePreview.src = "#";
            imagePreview.classList.add("hidden");
        }
        const icon = document.querySelector(".upload-container .upload-icon");
        const label = document.querySelector(".upload-container .upload-label");
        const specs = document.querySelector(".upload-container .upload-specs");
        if (icon) icon.classList.remove("hidden");
        if (label) label.classList.remove("hidden");
        if (specs) specs.classList.remove("hidden");
    }

    function réinitialiserModale() {
        document.getElementById("modal-container").classList.add("hidden");
        document.getElementById("modal-content-gallery").classList.remove("hidden");
        document.getElementById("modal-content-add-photo").classList.add("hidden");
        document.getElementById("modal-back-btn").classList.add("hidden");
        const addForm = document.getElementById("add-photo-form");
        if (addForm) addForm.reset(); 
        réinitialiserEncartUpload();
    }

    // Sous-fonction A : Gérer uniquement l'ouverture, la fermeture et la navigation
    function configurerNavigationModal() {
        const modifyBtn = document.getElementById("modify-btn");
        const addPhotoBtn = document.getElementById("add-photo-btn");
        const backBtn = document.getElementById("modal-back-btn");

        if (!modifyBtn) return;

        modifyBtn.addEventListener("click", function (e) {
            e.preventDefault();
            document.getElementById("modal-container").classList.remove("hidden"); 
            generateModalWorks(works); 
        });

        addPhotoBtn.addEventListener("click", function () {
            document.getElementById("modal-content-gallery").classList.add("hidden");
            document.getElementById("modal-content-add-photo").classList.remove("hidden");
            backBtn.classList.remove("hidden");
        });

        backBtn.addEventListener("click", réinitialiserModale);
        document.getElementById("modal-close-btn").addEventListener("click", réinitialiserModale);
        document.getElementById("modal-overlay").addEventListener("click", réinitialiserModale);
    }

    // Sous-fonction B : Gérer uniquement la prévisualisation de l'image
    function configurerPrevisualisationImage() {
        const fileInput = document.getElementById("file-upload");
        const imagePreview = document.getElementById("image-preview");
        if (!fileInput) return;

        fileInput.addEventListener("change", function () {
            const fichierSelectionne = fileInput.files[0];
            if (fichierSelectionne) {
                imagePreview.src = URL.createObjectURL(fichierSelectionne);
                imagePreview.classList.remove("hidden");
                
                document.querySelector(".upload-container .upload-icon").classList.add("hidden");
                document.querySelector(".upload-container .upload-label").classList.add("hidden");
                document.querySelector(".upload-container .upload-specs").classList.add("hidden");
            }
        });
    }

    // Sous-fonction C : Gérer uniquement l'interception et le traitement de suppression
    function configurerSuppressionProjet() {
        const modalGallery = document.querySelector(".modal-gallery");
        if (!modalGallery) return;

        modalGallery.addEventListener("click", async function (e) {
            const boutonPoubelle = e.target.closest(".trash-btn");
            if (boutonPoubelle) {
                e.preventDefault();
                const idProjet = boutonPoubelle.dataset.id;
                const suppressionReussie = await supprimerProjetAPI(idProjet);
                
                if (suppressionReussie) {
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

            const formData = new FormData();
            formData.append("image", fileInput.files[0]);
            formData.append("title", titleInput.value);
            formData.append("category", categorySelect.value);

            const response = await ajouterProjetAPI(formData);

            if (response && response.ok) {
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