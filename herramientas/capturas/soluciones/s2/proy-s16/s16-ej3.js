// 1. Buscar el botón
let boton = document.querySelector("#boton-gusta");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Poner o quitar la clase, como un interruptor
    boton.classList.toggle("activo");
});
