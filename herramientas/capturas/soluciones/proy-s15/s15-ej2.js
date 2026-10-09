// 1. Buscar los elementos
let cajaBolsas = document.querySelector("#bolsas");
let boton = document.querySelector("#boton-calcular");
let total = document.querySelector("#total");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Calcular y decidir
    let bolsas = Number(cajaBolsas.value);
    let precio = bolsas * 3;

    if (precio >= 15) {
        total.textContent = "Total: " + precio + " euros. ¡Te regalamos una piruleta!";
    } else {
        total.textContent = "Total: " + precio + " euros. Sin regalo.";
    }
});
