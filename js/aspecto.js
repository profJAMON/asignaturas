/* ============================================================
  Aspecto de la web — claro / oscuro
   ============================================================

   Para qué
   --------
   La web nace en modo oscuro, pero hay alumnos a los que les cuesta leer
   sobre fondo negro (y aulas con el proyector o la pantalla en claro).
  Este archivo pone dos botones en la barra lateral y recuerda la
   elección, así que se mantiene al pasar de una sesión a otra.

   Cómo funciona
   -------------
   La elección se guarda en localStorage («ob-aspecto») con uno de estos
  dos valores: "claro" u "oscuro".

   Luego se escriben DOS atributos en el <html>:

     data-tema="claro" | "oscuro"              -> el tema ya resuelto.
                                                  Es el que lee el CSS.
    data-tema-elegido="claro"|"oscuro"       -> lo que pulsó el alumno.
                                                  Solo para marcar el botón.

   IMPORTANTE: este archivo se carga en el <head>, no al final del <body>,
   y a propósito sin defer. Tiene que escribir el atributo ANTES de que el
   navegador pinte la primera pantalla; si no, el alumno que ha elegido
   claro ve un fogonazo oscuro en cada página que abre.

  Por defecto: "oscuro". Quien no haya elegido un modo verá siempre
  el aspecto oscuro.
   ============================================================ */

(function () {
  'use strict';

  const CLAVE_GUARDADO = 'ob-aspecto';
  const POR_DEFECTO = 'oscuro';

  const OPCIONES = [
    { valor: 'claro',  icono: '☀', titulo: 'Modo claro: fondo blanco y letra oscura' },
    { valor: 'oscuro', icono: '☾', titulo: 'Modo oscuro: fondo oscuro y letra clara' }
  ];

  /* ----------------------------------------------------------
     Guardado
     ---------------------------------------------------------- */

  function elegido() {
    try {
      const guardado = localStorage.getItem(CLAVE_GUARDADO);
      if (guardado === 'claro' || guardado === 'oscuro') {
        return guardado;
      }
    } catch (e) {
      /* Modo incógnito o cookies bloqueadas: sin memoria, pero funciona. */
    }
    return POR_DEFECTO;
  }

  function guardar(opcion) {
    try {
      localStorage.setItem(CLAVE_GUARDADO, opcion);
    } catch (e) { /* ídem */ }
  }

  /* ----------------------------------------------------------
     Aplicar
     ---------------------------------------------------------- */

  function aplicar(opcion) {
    const raiz = document.documentElement;
    raiz.setAttribute('data-tema', opcion);
    raiz.setAttribute('data-tema-elegido', opcion);
  }

  /* Esto es lo que evita el fogonazo: se ejecuta mientras el navegador
     todavía está leyendo el <head>. */
  aplicar(elegido());

  function cambiar(opcion) {
    guardar(opcion);
    aplicar(opcion);
    pintarSelector();
  }

  /* ----------------------------------------------------------
     El selector de la barra lateral
     ---------------------------------------------------------- */

  function pintarSelector() {
    const caja = document.getElementById('selector-aspecto');
    if (!caja) return;

    const actual = elegido();
    caja.textContent = '';

    const titulo = document.createElement('p');
    titulo.className = 'sidebar__titulo';
    titulo.textContent = 'Aspecto';
    caja.appendChild(titulo);

    const fila = document.createElement('div');
    fila.className = 'aspectos';
    fila.setAttribute('role', 'group');
    fila.setAttribute('aria-label', 'Aspecto de la página');

    OPCIONES.forEach(opcion => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'aspecto';
      boton.textContent = opcion.icono;
      boton.title = opcion.titulo;
      boton.setAttribute('aria-label', opcion.titulo);
      boton.setAttribute('aria-pressed', opcion.valor === actual ? 'true' : 'false');
      if (opcion.valor === actual) boton.classList.add('aspecto--activo');
      boton.addEventListener('click', () => cambiar(opcion.valor));
      fila.appendChild(boton);
    });

    caja.appendChild(fila);

    /* Los botones son texto nuevo en pantalla: hay que avisar al
       traductor, igual que hace el resto de la web. */
    if (window.retraducir) window.retraducir();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pintarSelector);
  } else {
    pintarSelector();
  }
})();
