// 1. Buscar los elementos
let boton = document.querySelector("#boton-chiste");
let chiste = document.querySelector("#chiste");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Hacer algo
    chiste.textContent = "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!";
});
