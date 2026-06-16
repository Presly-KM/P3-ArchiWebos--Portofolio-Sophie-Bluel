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
const filterBtn = document.querySelectorAll(".filter-btn")

filterBtn.addEventListener("click", function () {
if (filterBtn.textContent === "Objets") {
  const filtreObjets = works.filter(works => works.category.name === "Objets")
// On efface la page et on la regenere avec les works filtrées
  document.querySelector(".gallery").innerHTML = ""
  generateWorks(filtreObjets)
}
if (filterBtn.textContent === "Appartements") {
  const filtreAppartements = works.filter(works => works.category.name === "Appartements")
// On efface la page et on la regenere avec les works filtrées
  document.querySelector(".gallery").innerHTML = ""
  generateWorks(filtreAppartements)
}
if (filterBtn.textContent === "Hôtels & restaurants") {
  const filtreHotelsEtrestaurants = works.filter(works => works.category.name === "Hôtels & restaurants")
// On efface la page et on la regenere avec les works filtrées
  document.querySelector(".gallery").innerHTML = ""
  generateWorks(filtreHotelsEtrestaurants)
}

})

}

GestionnaireFiltre(works)
}

initialiserGalerie()



