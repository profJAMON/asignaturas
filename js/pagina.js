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

   IMPORTANTE: va en el <head> y sin defer, igual que js/aspecto.js y
   por la misma razón. Tiene que escribir el atributo ANTES del primer
   pintado; si se hiciera al final del <body>, el alumno vería medio
   segundo la barra lateral y las tres columnas antes de que la página
   se recolocara.
   ============================================================ */

(function () {
  'use strict';

  const ruta = window.location.pathname;
  const archivo = ruta.substring(ruta.lastIndexOf('/') + 1) || 'index.html';
  const asignatura = new URLSearchParams(window.location.search).get('a');

  if (archivo === 'index.html' && !asignatura) {
    document.documentElement.setAttribute('data-pagina', 'portada');
  }
})();
