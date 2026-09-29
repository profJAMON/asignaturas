// 1. Buscar los elementos
let botonMostrar = document.querySelector("#boton-mostrar");
let botonOcultar = document.querySelector("#boton-ocultar");
let ingredientes = document.querySelector("#ingredientes");

// 2 y 3. Mostrar: quitar la clase
botonMostrar.addEventListener("click", function () {
    ingredientes.classList.remove("oculto");
});

// 2 y 3. Ocultar: poner la clase
botonOcultar.addEventListener("click", function () {
    ingredientes.classList.add("oculto");
});
