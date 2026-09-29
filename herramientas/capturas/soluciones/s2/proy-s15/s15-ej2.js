// 1. Buscar los elementos
let cajaNumero = document.querySelector("#numero");
let boton = document.querySelector("#boton-probar");
let pista = document.querySelector("#pista");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Leer el número y decidir
    let numero = Number(cajaNumero.value);

    if (numero === 7) {
        pista.textContent = "¡Has acertado! Era el 7.";
    } else {
        pista.textContent = "No es ese. Prueba otra vez.";
    }
});
