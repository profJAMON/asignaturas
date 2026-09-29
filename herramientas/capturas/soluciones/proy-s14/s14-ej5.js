// 1. Buscar los elementos
let cajaAlias = document.querySelector("#alias");
let cajaDia = document.querySelector("#dia");
let cajaEntradas = document.querySelector("#entradas");
let boton = document.querySelector("#boton-calcular");
let resultado = document.querySelector("#resultado");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Leer las cajas, calcular y responder
    let alias = cajaAlias.value;
    let dia = cajaDia.value;
    let entradas = Number(cajaEntradas.value);
    let total = entradas * 8;
    resultado.textContent = alias + ": " + entradas + " entradas para el " + dia + " cuestan " + total + " euros.";
});
