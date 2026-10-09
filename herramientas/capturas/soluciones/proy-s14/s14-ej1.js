// 1. Buscar los elementos
let cajaAlias = document.querySelector("#alias");
let boton = document.querySelector("#boton-saludar");
let saludo = document.querySelector("#saludo");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Leer la caja y responder
    let alias = cajaAlias.value;
    saludo.textContent = "¡Hola, " + alias + "! Bienvenido a mi web.";
});
