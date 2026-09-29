// 1. Buscar los elementos
let cajaPizza = document.querySelector("#pizza");
let cajaTamano = document.querySelector("#tamano");
let boton = document.querySelector("#boton-pedir");
let pedido = document.querySelector("#pedido");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Leer lo elegido y responder
    let pizza = cajaPizza.value;
    let tamano = cajaTamano.value;
    pedido.textContent = "Tu pedido: pizza " + pizza + " " + tamano + ".";
});
