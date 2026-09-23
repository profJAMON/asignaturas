/* Botones para esconder o mostrar el menú lateral ("Unidad X, Sesión
   1, 2...") y el índice de la página ("En esta página"), por si alguien
   quiere más pantalla para el contenido. Sigue el mismo patrón que
   js/aspecto.js: se guarda en localStorage y se aplica en el <head>,
   sin defer, antes del primer pintado, para que no haya parpadeo. */
(function () {
  'use strict';

  const CLAVE_MENU = 'ob-menu';
  const CLAVE_INDICE = 'ob-indice';
  const VISIBLE = 'visible';
  const OCULTO = 'oculto';

  function leer(clave) {
    try {
      const guardado = localStorage.getItem(clave);
      if (guardado === VISIBLE || guardado === OCULTO) return guardado;
    } catch (e) { /* Modo incógnito o cookies bloqueadas: sin memoria, pero funciona. */ }
    return VISIBLE;
  }

  function guardar(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) { /* ídem */ }
  }

  function aplicar() {
    const raiz = document.documentElement;
    if (leer(CLAVE_MENU) === OCULTO) raiz.setAttribute('data-menu', OCULTO);
    else raiz.removeAttribute('data-menu');
    if (leer(CLAVE_INDICE) === OCULTO) raiz.setAttribute('data-indice', OCULTO);
    else raiz.removeAttribute('data-indice');
  }

  /* Esto es lo que evita el fogonazo: se ejecuta mientras el navegador
     todavía está leyendo el <head>. */
  aplicar();

  function alternar(clave) {
    guardar(clave, leer(clave) === VISIBLE ? OCULTO : VISIBLE);
    aplicar();
    pintarBotones();
  }

  function crearBoton(clase, claveEstado, tituloOcultar, tituloMostrar, iconoOcultar, iconoMostrar) {
    let boton = document.querySelector('.' + clase);
    if (!boton) {
      boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'toggle-col ' + clase;
      boton.addEventListener('click', () => alternar(claveEstado));
      document.body.appendChild(boton);
    }
    const oculto = leer(claveEstado) === OCULTO;
    boton.textContent = oculto ? iconoMostrar : iconoOcultar;
    boton.title = oculto ? tituloMostrar : tituloOcultar;
    boton.setAttribute('aria-label', boton.title);
    boton.setAttribute('aria-pressed', oculto ? 'true' : 'false');
  }

  function quitarBoton(clase) {
    const boton = document.querySelector('.' + clase);
    if (boton) boton.remove();
  }

  /* Solo se pinta el botón de una columna si esa columna existe de
     verdad en esta página. Ojo: NO se puede mirar si el elemento está
     visible con getComputedStyle, porque nuestro propio oculto="…" ya
     le habría puesto display:none y el botón desaparecería en cuanto
     se usara una vez. En vez de eso se comprueban los dos motivos
     "de verdad" por los que una columna no aplica aquí:
     - el menú: la portada general (index.html sin ?a=) lo esconde por
       CSS con data-pagina="portada", sin sacarlo del DOM.
     - el índice: tema.js le pone el atributo hidden cuando la lección
       no tiene subtítulos que listar. */
  function pintarBotones() {
    const sidebar = document.querySelector('.sidebar');
    const esPortada = document.documentElement.getAttribute('data-pagina') === 'portada';
    if (sidebar && !esPortada) {
      crearBoton('toggle-menu', CLAVE_MENU, 'Ocultar el menú', 'Mostrar el menú', '‹', '›');
    } else {
      quitarBoton('toggle-menu');
    }

    const indice = document.querySelector('.indice');
    if (indice && !indice.hidden) {
      crearBoton('toggle-indice', CLAVE_INDICE, 'Ocultar «En esta página»', 'Mostrar «En esta página»', '›', '‹');
    } else {
      quitarBoton('toggle-indice');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pintarBotones);
  } else {
    pintarBotones();
  }

  /* El índice de tema.html se pinta (o se esconde del todo, con
     aside.hidden, si la lección no tiene subtítulos) después de este
     script, así que hace falta reintentarlo una vez cargado todo. */
  window.addEventListener('load', pintarBotones);
})();
