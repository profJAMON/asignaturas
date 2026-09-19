/* ============================================================
   Barra superior
   ============================================================

   Para qué
   --------
   Da dos cosas que antes no estaban en ningún sitio fijo: dónde estás
   (la marca de la izquierda, que es la ruta de la asignatura abierta)
   y a dónde puedes ir sin volver atrás dos veces (asignaturas,
   unidades y calendario).

   Los selectores de idioma y aspecto también viven en esta barra, pero
   no los pinta este archivo: los siguen pintando js/idioma.js y
   js/aspecto.js en sus contenedores de siempre (#selector-idioma y
   #selector-aspecto). Aquí solo cambiaron de sitio en el HTML.

   Cómo se usa
   -----------
   El archivo no sabe en qué asignatura estás: se lo dicen.

     - index.html y calendario.html lo saben desde el principio (viene
       en la URL), así que basta con la pasada automática de abajo.
     - tema.html NO lo sabe hasta que ha buscado la sesión en todas las
       asignaturas, así que js/tema.js llama a pintarBarra(asignatura)
       cuando ya la tiene. Mientras tanto la barra enseña la versión
       neutra ("~/asignaturas"), no se queda vacía.

   Llamarla dos veces no rompe nada: cada pasada vuelve a pintar la
   navegación desde cero.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     En qué página estamos
     ----------------------------------------------------------
     Se mira el nombre del archivo, no la ruta entera: el sitio se
     publica también en GitHub Pages colgando de /asignaturas/, donde
     la ruta lleva delante un trozo que aquí no interesa. */

  function paginaActual() {
    const ruta = window.location.pathname;
    const archivo = ruta.substring(ruta.lastIndexOf('/') + 1);
    /* Una URL que acaba en "/" es la portada. */
    return archivo === '' ? 'index.html' : archivo;
  }

  /* ¿Esta asignatura tiene calendario de ritmo cargado?
     Si js/calendario.js no está en esta página, la respuesta es no y
     el enlace simplemente no se pinta. */
  function tieneCalendario(asignatura) {
    if (!asignatura) return false;
    return !!(window.calendarioRitmo && window.calendarioRitmo.datos(asignatura.id));
  }

  /* ----------------------------------------------------------
     La marca de la izquierda
     ---------------------------------------------------------- */

  function pintarMarca(asignatura) {
    const enlace = document.getElementById('barra-marca');
    const texto = document.getElementById('barra-marca-texto');
    if (!enlace || !texto) return;

    if (asignatura) {
      texto.textContent = asignatura.id;
      enlace.href = urlPortadaAsignatura(asignatura);
      enlace.title = asignatura.nombre;
    } else {
      texto.textContent = 'asignaturas';
      enlace.href = 'index.html';
      enlace.title = 'Todas las asignaturas';
    }
  }

  /* ----------------------------------------------------------
     La navegación
     ---------------------------------------------------------- */

  function crearEnlace(texto, href, esActual) {
    const a = document.createElement('a');
    a.className = 'barra__enlace';
    a.href = href;
    a.textContent = texto;
    /* aria-current es lo que le dice al lector de pantalla cuál de los
       enlaces es la página en la que ya estás; el subrayado en cian
       cuelga de este mismo atributo (ver css/estilos.css). */
    if (esActual) a.setAttribute('aria-current', 'page');
    return a;
  }

  function pintarNavegacion(asignatura) {
    const nav = document.getElementById('barra-nav');
    if (!nav) return;

    const pagina = paginaActual();
    const enPortada = pagina === 'index.html';
    nav.textContent = '';

    /* 1. Siempre: el listado de asignaturas. Es "la página actual" solo
          en la portada sin asignatura elegida. */
    nav.appendChild(crearEnlace('Asignaturas', 'index.html', enPortada && !asignatura));

    /* 2. Las unidades de la asignatura abierta. No existe si todavía no
          hay ninguna elegida. */
    if (asignatura) {
      nav.appendChild(crearEnlace(
        'Unidades',
        urlPortadaAsignatura(asignatura),
        enPortada
      ));
    }

    /* 3. El calendario, solo en las asignaturas que tienen fechas. */
    if (tieneCalendario(asignatura)) {
      nav.appendChild(crearEnlace(
        'Calendario',
        `calendario.html?a=${encodeURIComponent(asignatura.id)}`,
        pagina === 'calendario.html'
      ));
    }

    /* Texto nuevo en pantalla: hay que avisar al traductor, igual que
       hacen el resto de los archivos que pintan cosas. */
    if (typeof retraducir === 'function') retraducir();
  }

  function pintarBarra(asignatura) {
    pintarMarca(asignatura || null);
    pintarNavegacion(asignatura || null);

    /* En qué asignatura está el alumno, apuntado en el <html> para que
       lo vea cualquiera sin volver a averiguarlo. Lo usa el buscador
       (js/buscador.js), que empieza buscando por la asignatura abierta:
       en tema.html la asignatura no se sabe hasta que se ha localizado
       la sesión, y esta es la única llamada que lo sabe seguro. */
    if (asignatura) {
      document.documentElement.dataset.asignatura = asignatura.id;
    } else {
      delete document.documentElement.dataset.asignatura;
    }

    /* El buscador pinta su botón dentro de la barra; si la barra se
       vuelve a pintar, hay que volver a ponerlo. */
    if (typeof window.pintarBotonBuscar === 'function') window.pintarBotonBuscar();
  }

  /* Lo usa js/tema.js cuando ya sabe de qué asignatura es la sesión. */
  window.pintarBarra = pintarBarra;

  /* ----------------------------------------------------------
     Primera pasada
     ----------------------------------------------------------
     Con lo que se sepa por la URL. En tema.html eso es null casi
     siempre (los enlaces de sesión no llevan ?a=), y por eso tema.js
     vuelve a llamar después. */

  function arrancar() {
    pintarBarra(typeof asignaturaDeLaUrl === 'function' ? asignaturaDeLaUrl() : null);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
