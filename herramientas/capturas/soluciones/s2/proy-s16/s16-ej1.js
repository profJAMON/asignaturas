// 1. Buscar los elementos
let aviso = document.querySelector("#aviso");
let boton = document.querySelector("#boton-resaltar");

// 2. Esperar al clic
boton.addEventListener("click", function () {
    // 3. Poner la clase
    aviso.classList.add("resaltado");
});
