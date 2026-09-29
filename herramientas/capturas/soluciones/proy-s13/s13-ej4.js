// 1. Buscar los elementos
let botonHoy = document.querySelector("#boton-hoy");
let botonManana = document.querySelector("#boton-manana");
let tiempo = document.querySelector("#tiempo");

// 2 y 3. Al pulsar cada botón, cambiar el texto
botonHoy.addEventListener("click", function () {
    console.log("Has pulsado Hoy");
    tiempo.textContent = "Hoy: sol y 25 grados.";
});

botonManana.addEventListener("click", function () {
    console.log("Has pulsado Mañana");
    tiempo.textContent = "Mañana: lluvia y 18 grados.";
});
