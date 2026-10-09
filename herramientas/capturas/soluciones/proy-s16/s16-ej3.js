// 1. Buscar los elementos
let botonModo = document.querySelector("#boton-modo");
let botonLugar = document.querySelector("#boton-lugar");
let lugar = document.querySelector("#lugar");

// 2 y 3. Modo oscuro: interruptor en el body
botonModo.addEventListener("click", function () {
    document.body.classList.toggle("modo-oscuro");
});

// 2 y 3. Ver el lugar: quitar la clase oculto
botonLugar.addEventListener("click", function () {
    lugar.classList.remove("oculto");
});
