// 1. Buscar los elementos
let boton = document.querySelector("#boton-abrir");
let regalo = document.querySelector("#regalo");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Cambiar el párrafo y el texto del botón
    regalo.textContent = "¡Es un monopatín!";
    boton.textContent = "Abierto";
});
