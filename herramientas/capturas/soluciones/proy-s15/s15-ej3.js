// 1. Buscar los elementos
let pregunta1 = document.querySelector("#pregunta1");
let pregunta2 = document.querySelector("#pregunta2");
let pregunta3 = document.querySelector("#pregunta3");
let boton = document.querySelector("#boton-corregir");
let resultado = document.querySelector("#resultado");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Contar los aciertos
    let aciertos = 0;

    if (pregunta1.value === "París") {
        aciertos = aciertos + 1;
    }
    if (pregunta2.value === "8") {
        aciertos = aciertos + 1;
    }
    if (pregunta3.value === "60") {
        aciertos = aciertos + 1;
    }

    // 4. Dar un mensaje según los aciertos
    if (aciertos === 3) {
        resultado.textContent = "¡Perfecto! 3 de 3.";
    } else if (aciertos >= 1) {
        resultado.textContent = "Has acertado " + aciertos + " de 3. ¡Casi!";
    } else {
        resultado.textContent = "Ninguna bien. ¡Inténtalo otra vez!";
    }
});
