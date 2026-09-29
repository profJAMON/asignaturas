// 1. Buscar los elementos
let boton = document.querySelector("#boton-solucion");
let solucion = document.querySelector("#solucion");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Mostrar la solución y cambiar el botón
    solucion.textContent = "Un reloj.";
    boton.textContent = "Ya lo sabes";
});
