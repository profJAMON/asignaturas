/* ============================================================
   El zoom al entrar en una asignatura
   ============================================================

   Qué hace
   --------
   Al pulsar una tarjeta de la portada, la tarjeta crece hasta
   convertirse en la cabecera de la asignatura, como cuando se abre
   una ficha en Netflix. Y al volver, se encoge hasta su sitio.

   No hay ninguna animación escrita aquí. El efecto sale de emparejar
   un NOMBRE entre las dos páginas: si un elemento de la página vieja
   y otro de la nueva se llaman igual, el navegador entiende que son
   el mismo y anima por su cuenta la diferencia de posición, tamaño y
   forma. La transición entre páginas ya estaba puesta
   (@view-transition en el CSS); esto solo dice quién es quién.

   El nombre es "cabecera" y lo llevan:

     - la cabecera de una asignatura y la de una sesión, siempre,
       desde el CSS;
     - la tarjeta pulsada de la portada, solo mientras dura el salto,
       porque lo pone y lo quita este archivo.

   Por qué la tarjeta no lo lleva puesto desde el CSS
   --------------------------------------------------
   Porque un nombre no puede repetirse: si las tres tarjetas se
   llamaran "cabecera" a la vez, el navegador cancela la transición
   ENTERA y no avisa de nada: ni error de consola ni aviso. Se ve
   como que "no funciona" y no hay por dónde cogerlo. De ahí que se
   ponga en una sola tarjeta, en el momento del clic, y se quite
   después.

   Dónde no pasa nada
   ------------------
   Firefox todavía no hace transiciones entre documentos. Allí el
   enlace navega como siempre, sin animación y sin errores; no hace
   falta ningún respaldo. Lo mismo con prefers-reduced-motion: el CSS
   las apaga y este archivo se queda sin efecto.
   ============================================================ */

(function () {
  'use strict';

  const NOMBRE = 'cabecera';

  /* De qué asignatura venimos. Lo escribe la página de una asignatura
     al salir y lo consume la portada al entrar; así el zoom de vuelta
     sabe a qué tarjeta tiene que encogerse.

     Va en sessionStorage y no en localStorage a propósito: es cosa de
     esta pestaña y de este rato, no algo que deba sobrevivir a cerrar
     el navegador. */
  const CLAVE_VUELTA = 'ob-zoom-vuelta';

  function guardar(valor) {
    try {
      if (valor) sessionStorage.setItem(CLAVE_VUELTA, valor);
      else sessionStorage.removeItem(CLAVE_VUELTA);
    } catch (e) { /* sin memoria, se pierde el zoom de vuelta y ya */ }
  }

  /* Se lee UNA vez: consumirlo evita que un valor viejo tiña una
     tarjeta que no tiene nada que ver con la página anterior. */
  function consumir() {
    try {
      const valor = sessionStorage.getItem(CLAVE_VUELTA);
      sessionStorage.removeItem(CLAVE_VUELTA);
      return valor || null;
    } catch (e) {
      return null;
    }
  }

  /* La asignatura de ESTA página, solo si es la portada de una
     asignatura (index.html?a=<id>). En una sesión o en el calendario
     devuelve null: desde ahí no se vuelve a ninguna tarjeta. */
  function asignaturaDeEstaPagina() {
    const ruta = window.location.pathname;
    const archivo = ruta.substring(ruta.lastIndexOf('/') + 1) || 'index.html';
    if (archivo !== 'index.html') return null;
    return new URLSearchParams(window.location.search).get('a');
  }

  /* ---------- Poner y quitar el nombre ---------- */

  function limpiar() {
    document.querySelectorAll('[data-zoom]').forEach(el => {
      el.style.viewTransitionName = '';
      el.removeAttribute('data-zoom');
    });
  }

  function marcar(elemento) {
    limpiar();
    if (!elemento) return;
    elemento.style.viewTransitionName = NOMBRE;
    elemento.setAttribute('data-zoom', '');
  }

  /* ---------- Ida: de la portada a la asignatura ---------- */

  /* Delegado en el documento porque las tarjetas las pinta js/main.js
     después, por fetch. Con un listener por tarjeta habría que
     esperar a que existieran. */
  document.addEventListener('click', evento => {
    /* Solo el clic normal. Con Ctrl, Cmd o rueda el enlace se abre en
       otra pestaña y ESTA página no se va a ninguna parte: marcarla
       dejaría un nombre puesto para siempre, y el siguiente salto de
       verdad se encontraría dos elementos llamados igual. */
    if (evento.defaultPrevented) return;
    if (evento.button !== 0) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;

    const tarjeta = evento.target.closest('.asignatura-card');
    if (tarjeta) marcar(tarjeta);
  });

  /* ---------- Vuelta: de la asignatura a la portada ---------- */

  /* Al salir de la página de una asignatura se deja dicho cuál era.
     Desde cualquier otra página se borra: si el alumno va asignatura →
     sesión → portada, lo último que vio no fue la tarjeta, y encoger
     la portada hasta ella sería contar un salto que no ha ocurrido. */
  window.addEventListener('pagehide', () => {
    guardar(asignaturaDeEstaPagina());
  });

  /* pagereveal se dispara en la página NUEVA, justo antes de que el
     navegador tome su foto. Es el único momento en que sirve poner el
     nombre: un milisegundo después la foto ya está hecha.

     Firefox no lo tiene; allí esta parte sencillamente no corre. */
  window.addEventListener('pagereveal', evento => {
    if (!evento.viewTransition) return;

    const vengoDe = consumir();
    if (!vengoDe) return;

    /* Solo en la portada general: en cualquier otra página no hay
       tarjetas a las que encogerse. */
    if (document.documentElement.getAttribute('data-pagina') !== 'portada') return;

    const tarjeta = document.querySelector(`.asignatura-card[data-asignatura="${CSS.escape(vengoDe)}"]`);
    marcar(tarjeta);

    /* En cuanto acaba el zoom se le quita el nombre. Si se quedara
       puesto, esa tarjeta seguiría llamándose "cabecera" el resto de
       la visita y se emparejaría con la cabecera de la siguiente
       página aunque el alumno se hubiera ido por otro camino (el
       buscador, la barra de arriba): se vería crecer una tarjeta que
       nadie ha pulsado. */
    evento.viewTransition.finished.then(limpiar, limpiar);
  });

  /* Volver con el botón de atrás puede devolver la página tal y como
     se quedó (el navegador la guarda entera). Si se dejó una tarjeta
     marcada, hay que desmarcarla o el siguiente salto encontrará el
     nombre donde no toca. */
  window.addEventListener('pageshow', evento => {
    if (evento.persisted) limpiar();
  });
})();
