/* ============================================================
   Qué página es esta
   ============================================================

   Para qué
   --------
   index.html hace dos papeles: sin ?a= es la portada general (elegir
   asignatura) y con ?a=<id> es la portada de una asignatura (sus
   unidades). La portada general se ve distinta: a ancho completo y
   sin barra lateral, porque ahí todavía no hay ninguna asignatura de
   la que enseñar el temario.

   Eso lo decide el CSS con :root[data-pagina="portada"], y este
   archivo es quien escribe ese atributo.

   Desde 2026-09 escribe además data-pagina="asignatura" en el otro
   caso (index.html?a=<id>). No es para el layout, que ahí no cambia:
   es para que el CSS pueda darle nombre de transición a la cabecera
   de la asignatura y no a la de la portada general. De ese nombre
   cuelga el zoom al entrar (ver js/zoom.js).

   IMPORTANTE: va en el <head> y sin defer, igual que js/aspecto.js y
   por la misma razón. Tiene que escribir el atributo ANTES del primer
   pintado; si se hiciera al final del <body>, el alumno vería medio
   segundo la barra lateral y las tres columnas antes de que la página
   se recolocara. Con el zoom hay un motivo más: el navegador fotografía
   la cabecera en cuanto puede, y si para entonces todavía no tiene
   nombre, la tarjeta crece hacia un hueco vacío.
   ============================================================ */

(function () {
  'use strict';

  const ruta = window.location.pathname;
  /* Una URL acabada en "/" también es la portada: así se publica el
     sitio en GitHub Pages (…/asignaturas/), donde el "index.html" no
     se escribe. Sin esta parte, esa dirección se quedaba sin atributo
     y la portada salía con la barra lateral vacía y encajonada en la
     columna del medio. */
  const archivo = ruta.substring(ruta.lastIndexOf('/') + 1) || 'index.html';
  const asignatura = new URLSearchParams(window.location.search).get('a');

  if (archivo === 'index.html') {
    document.documentElement.setAttribute('data-pagina', asignatura ? 'asignatura' : 'portada');
  }
})();
