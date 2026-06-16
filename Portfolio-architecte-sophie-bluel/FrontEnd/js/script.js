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

for (let i = 0; i < works.length; i++) {

 const classGallery = document.querySelector(".gallery")
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

}



initialiserGalerie()

/*
function ajouterFiltre() {

  const btn-objets = document.querySelector(".btn-objets")
  btn-objets.addEventListener("click", function () {
  if (works[i].category.name === "Objets") {
  const filtreObjets = works.filter(works => works.category.name === "Objets")
  
  // On efface la page et on la regenere avec les works filtrées
  document.querySelector(".gallery").innerHTML = ""
  generateWorks(filtreObjets)
 }
}
 
}
*/