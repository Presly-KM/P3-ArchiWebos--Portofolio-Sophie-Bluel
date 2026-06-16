function loginConnect() {   
let form = document.querySelector("form");
form.addEventListener("submit", function (event) {
    event.preventDefault();
 
    const identifiant = {
    email : document.getElementById("email").value,
    password : document.getElementById("password").value 
};

const chargeUtile = JSON.stringify(identifiant);

fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {"Content-Type": "application/json" },
    body: chargeUtile
})

})
}

loginConnect ()