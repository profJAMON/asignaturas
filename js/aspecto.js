/* ============================================================
   Aspecto de la web — claro / oscuro / automático
   ============================================================

   Para qué
   --------
   La web nace en modo oscuro, pero hay alumnos a los que les cuesta leer
   sobre fondo negro (y aulas con el proyector o la pantalla en claro).
   Este archivo pone tres botones en la barra lateral y recuerda la
   elección, así que se mantiene al pasar de una sesión a otra.

   Cómo funciona
   -------------
   La elección se guarda en localStorage («ob-aspecto») con uno de estos
   tres valores: "claro", "oscuro" o "auto".

   Luego se escriben DOS atributos en el <html>:

     data-tema="claro" | "oscuro"              -> el tema ya resuelto.
                                                  Es el que lee el CSS.
     data-tema-elegido="claro"|"oscuro"|"auto" -> lo que pulsó el alumno.
                                                  Solo para marcar el botón.

   Resolver "auto" (mirar la configuración del sistema con
   prefers-color-scheme) se hace AQUÍ y no en el CSS. Así la hoja de
   estilos tiene un único bloque de paleta clara en vez de repetirla en un
   @media, que es donde siempre se acaba olvidando un color.

   IMPORTANTE: este archivo se carga en el <head>, no al final del <body>,
   y a propósito sin defer. Tiene que escribir el atributo ANTES de que el
   navegador pinte la primera pantalla; si no, el alumno que ha elegido
   claro ve un fogonazo oscuro en cada página que abre.

   Si el alumno tiene el sistema en automático y lo cambia mientras la
   página está abierta (Windows y Android lo hacen solos al atardecer),
   la web lo sigue en el momento, sin recargar.

   Por defecto: "auto". Quien no haya tocado nada verá el aspecto que
   tenga configurado su equipo. Para que la web salga siempre oscura
   mientras no se elija, cambiar POR_DEFECTO a 'oscuro' aquí abajo.
   ============================================================ */

(function () {
  'use strict';

  const CLAVE_GUARDADO = 'ob-aspecto';
  const POR_DEFECTO = 'auto';

  const OPCIONES = [
    { valor: 'claro',  etiqueta: 'Claro',  titulo: 'Fondo blanco y letra oscura' },
    { valor: 'oscuro', etiqueta: 'Oscuro', titulo: 'Fondo oscuro y letra clara' },
    { valor: 'auto',   etiqueta: 'Auto',   titulo: 'El mismo aspecto que tengas puesto en el móvil o el ordenador' }
  ];

  /* matchMedia existe en todo lo que se usa hoy, pero si algún navegador
     raro no lo trae, "auto" se resuelve como oscuro y no se rompe nada. */
  const PREFIERE_CLARO = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: light)')
    : null;

  /* ----------------------------------------------------------
     Guardado
     ---------------------------------------------------------- */

  function elegido() {
    try {
      const guardado = localStorage.getItem(CLAVE_GUARDADO);
      if (guardado === 'claro' || guardado === 'oscuro' || guardado === 'auto') {
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

  function resolver(opcion) {
    if (opcion === 'claro' || opcion === 'oscuro') return opcion;
    return PREFIERE_CLARO && PREFIERE_CLARO.matches ? 'claro' : 'oscuro';
  }

  function aplicar(opcion) {
    const raiz = document.documentElement;
    raiz.setAttribute('data-tema', resolver(opcion));
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

  /* El sistema cambia de claro a oscuro por su cuenta (modo noche). */
  if (PREFIERE_CLARO && PREFIERE_CLARO.addEventListener) {
    PREFIERE_CLARO.addEventListener('change', () => {
      if (elegido() === 'auto') {
        aplicar('auto');
        pintarSelector();
      }
    });
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
      boton.textContent = opcion.etiqueta;
      boton.title = opcion.titulo;
      boton.setAttribute('aria-pressed', opcion.valor === actual ? 'true' : 'false');
      if (opcion.valor === actual) boton.classList.add('aspecto--activo');
      boton.addEventListener('click', () => cambiar(opcion.valor));
      fila.appendChild(boton);
    });

    caja.appendChild(fila);

    /* Con "auto" el botón marcado no dice qué se está viendo, así que se
       escribe debajo. Sin esto, el alumno pulsa Auto, no cambia nada
       (porque su equipo ya estaba en oscuro) y cree que está roto. */
    if (actual === 'auto') {
      const nota = document.createElement('p');
      nota.className = 'aspecto-nota';
      nota.textContent = resolver('auto') === 'claro'
        ? 'Según tu equipo: ahora claro'
        : 'Según tu equipo: ahora oscuro';
      caja.appendChild(nota);
    }

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
