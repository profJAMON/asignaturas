/* ============================================================
   Buscador de sesiones  (Ctrl+K)
   ============================================================

   Para qué
   --------
   "¿Dónde estaba lo de los permisos?". Con 95 sesiones repartidas en
   tres asignaturas, la respuesta estaba a tres o cuatro clics y un
   rato de acordarse de en qué unidad caía. Ahora se escribe y ya.

   Qué se busca
   ------------
   Títulos y descripciones de sesiones, y títulos de unidad. NO el
   texto de dentro de las lecciones: eso obligaría a descargarse el
   sitio entero para buscar, y con los títulos se resuelve la
   pregunta que de verdad se hace el alumno.

   Qué cuesta
   ----------
   Nada en la asignatura abierta: esas sesiones ya se las ha
   descargado la barra lateral y están en la caché de la página (ver
   js/asignaturas.js). Las otras dos asignaturas solo se piden si al
   alumno no le basta con la suya, y entonces una sola vez. Así el
   buscador no le cuesta una tanda de peticiones a quien nunca lo abre.

   Teclas
   ------
     Ctrl+K o Cmd+K   abrir (también la barra "/" fuera de un campo)
     ↑ ↓              moverse
     Enter            abrir la sesión marcada
     Esc              cerrar
   ============================================================ */

(function () {
  'use strict';

  let caja = null;         // el diálogo entero
  let campo = null;        // el input
  let listaEl = null;      // donde van los resultados
  let pieEl = null;        // la línea de abajo
  let abierto = false;
  let focoPrevio = null;   // a quién hay que devolverle el foco al cerrar

  let indice = [];               // lo que se puede buscar ahora mismo
  let asignaturasIndexadas = new Set();
  let cargandoTodo = false;
  let todoCargado = false;
  let resultados = [];
  let marcado = 0;

  /* ---------- Normalizar ----------
     Se busca sin tildes y sin mayúsculas: quien escribe "publicacion"
     tiene que encontrar "Publicación". normalize('NFD') separa la
     letra de su tilde y el replace se queda solo con la letra. */
  function normalizar(texto) {
    return (texto || '')
      .toString()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  /* ---------- El índice ---------- */

  function anadirAlIndice(entradas) {
    entradas.forEach(({ sesion, unidad, asignatura }) => {
      if (indice.some(e => e.id === sesion.id)) return;
      indice.push({
        id: sesion.id,
        titulo: sesion.titulo || sesion.id,
        descripcion: sesion.descripcion || '',
        unidad: unidad.titulo || '',
        asignatura,
        /* Se prepara una sola vez, no en cada pulsación de tecla. */
        busqueda: normalizar(
          `${sesion.titulo} ${sesion.descripcion || ''} ${unidad.titulo || ''}`
        ),
      });
    });
  }

  async function indexarAsignatura(asignatura) {
    if (!asignatura || asignaturasIndexadas.has(asignatura.id)) return;
    asignaturasIndexadas.add(asignatura.id);
    try {
      anadirAlIndice(await cargarSesionesDeAsignatura(asignatura));
    } catch (e) {
      asignaturasIndexadas.delete(asignatura.id);
      console.error(`Buscador: no se ha podido indexar "${asignatura.id}"`, e);
    }
  }

  /* La asignatura abierta. En index.html y calendario.html viene en la
     URL; en tema.html la escribe js/barra.js cuando ya sabe de cuál es
     la sesión. */
  function asignaturaActual() {
    const id = document.documentElement.dataset.asignatura;
    if (id && typeof asignaturaPorId === 'function') return asignaturaPorId(id);
    return typeof asignaturaDeLaUrl === 'function' ? asignaturaDeLaUrl() : null;
  }

  async function cargarElResto() {
    if (cargandoTodo || todoCargado) return;
    cargandoTodo = true;
    pintarPie();
    await Promise.all(ASIGNATURAS.map(indexarAsignatura));
    cargandoTodo = false;
    todoCargado = true;
    buscar();
  }

  /* ---------- Buscar ----------
     Todas las palabras tienen que aparecer, en cualquier orden: así
     "css caja" encuentra "Modelo de caja" de la unidad de CSS. */
  function puntuar(entrada, palabras) {
    let puntos = 0;
    for (const palabra of palabras) {
      const donde = entrada.busqueda.indexOf(palabra);
      if (donde === -1) return -1;
      /* Cuanto más al principio, más arriba: lo que casa con el título
         vale más que lo que casa con la descripción o la unidad. */
      puntos += donde < entrada.titulo.length ? 3 : 1;
      if (entrada.busqueda.startsWith(palabra)) puntos += 2;
    }
    return puntos;
  }

  function buscar() {
    const consulta = normalizar(campo.value).trim();
    const palabras = consulta.split(/\s+/).filter(Boolean);

    if (palabras.length === 0) {
      resultados = [];
      marcado = 0;
      pintarResultados();
      return;
    }

    resultados = indice
      .map(entrada => ({ entrada, puntos: puntuar(entrada, palabras) }))
      .filter(r => r.puntos >= 0)
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 12)
      .map(r => r.entrada);

    marcado = 0;
    pintarResultados();

    /* Si con la asignatura abierta se encuentra poco, se traen las
       otras. Solo entonces: quien busca algo de su propia asignatura y
       lo encuentra no paga ninguna petición de más. */
    if (resultados.length < 5 && consulta.length >= 2) cargarElResto();
  }

  /* ---------- Pintar ---------- */

  function pintarResultados() {
    listaEl.textContent = '';

    if (resultados.length === 0) {
      const vacio = document.createElement('p');
      vacio.className = 'buscador__vacio';
      vacio.textContent = campo.value.trim()
        ? 'Nada con ese nombre.'
        : 'Escribe para buscar una sesión.';
      listaEl.appendChild(vacio);
      pintarPie();
      return;
    }

    resultados.forEach((entrada, i) => {
      const fila = document.createElement('a');
      fila.className = 'buscador__fila';
      fila.href = `${urlSesion(entrada.id)}&a=${encodeURIComponent(entrada.asignatura.id)}`;
      fila.id = `buscador-r${i}`;
      fila.setAttribute('role', 'option');
      fila.setAttribute('aria-selected', String(i === marcado));
      if (i === marcado) fila.classList.add('marcada');

      const titulo = document.createElement('span');
      titulo.className = 'buscador__titulo';
      titulo.textContent = entrada.titulo;

      const donde = document.createElement('span');
      donde.className = 'buscador__donde';
      donde.textContent = `${entrada.asignatura.nombre} · ${entrada.unidad}`;

      fila.appendChild(titulo);
      fila.appendChild(donde);

      /* Ya la ha abierto alguna vez: se marca, igual que en el menú. */
      if (window.progreso && window.progreso.estaVisitada(entrada.id)) {
        const visto = document.createElement('span');
        visto.className = 'buscador__visto';
        visto.textContent = 'vista';
        fila.appendChild(visto);
      }

      fila.addEventListener('mouseenter', () => {
        marcado = i;
        actualizarMarca();
      });
      listaEl.appendChild(fila);
    });

    actualizarMarca();
    pintarPie();
  }

  /* Solo mueve la marca, sin volver a construir la lista: repintarla
     entera en cada flecha hace que parezca que parpadea. */
  function actualizarMarca() {
    const filas = listaEl.querySelectorAll('.buscador__fila');
    filas.forEach((fila, i) => {
      const activa = i === marcado;
      fila.classList.toggle('marcada', activa);
      fila.setAttribute('aria-selected', String(activa));
      if (activa) {
        fila.scrollIntoView({ block: 'nearest' });
        campo.setAttribute('aria-activedescendant', fila.id);
      }
    });
  }

  function pintarPie() {
    if (cargandoTodo) {
      pieEl.textContent = 'Buscando también en las demás asignaturas…';
    } else if (todoCargado) {
      pieEl.textContent = '↑↓ moverse · Enter abrir · Esc cerrar';
    } else {
      const actual = asignaturaActual();
      pieEl.textContent = actual
        ? `Buscando en ${actual.nombre}. Sigue escribiendo para buscar en todas.`
        : '↑↓ moverse · Enter abrir · Esc cerrar';
    }
  }

  /* ---------- Abrir y cerrar ---------- */

  function construir() {
    caja = document.createElement('div');
    caja.className = 'buscador';
    caja.hidden = true;

    const panel = document.createElement('div');
    panel.className = 'buscador__panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Buscar una sesión');

    const fila = document.createElement('div');
    fila.className = 'buscador__campo';

    const prompt = document.createElement('span');
    prompt.className = 'buscador__prompt';
    prompt.setAttribute('aria-hidden', 'true');
    prompt.textContent = '$';

    campo = document.createElement('input');
    campo.type = 'search';
    campo.className = 'buscador__input';
    campo.placeholder = 'Buscar una sesión…';
    campo.setAttribute('aria-label', 'Buscar una sesión');
    campo.setAttribute('role', 'combobox');
    campo.setAttribute('aria-expanded', 'true');
    campo.setAttribute('aria-controls', 'buscador-lista');
    campo.setAttribute('autocomplete', 'off');

    fila.appendChild(prompt);
    fila.appendChild(campo);

    listaEl = document.createElement('div');
    listaEl.className = 'buscador__lista';
    listaEl.id = 'buscador-lista';
    listaEl.setAttribute('role', 'listbox');

    pieEl = document.createElement('p');
    pieEl.className = 'buscador__pie';

    panel.appendChild(fila);
    panel.appendChild(listaEl);
    panel.appendChild(pieEl);
    caja.appendChild(panel);
    document.body.appendChild(caja);

    caja.addEventListener('click', ev => {
      /* Pulsar fuera del panel cierra. */
      if (ev.target === caja) cerrar();
    });
    campo.addEventListener('input', buscar);
    campo.addEventListener('keydown', teclasDelCampo);
  }

  function teclasDelCampo(ev) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (resultados.length) {
        marcado = (marcado + 1) % resultados.length;
        actualizarMarca();
      }
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (resultados.length) {
        marcado = (marcado - 1 + resultados.length) % resultados.length;
        actualizarMarca();
      }
    } else if (ev.key === 'Enter') {
      const fila = listaEl.querySelectorAll('.buscador__fila')[marcado];
      if (fila) {
        ev.preventDefault();
        window.location.href = fila.href;
      }
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      cerrar();
    }
  }

  async function abrir() {
    if (abierto) return;
    if (!caja) construir();

    focoPrevio = document.activeElement;
    abierto = true;
    caja.hidden = false;
    campo.value = '';
    resultados = [];
    pintarResultados();
    campo.focus();

    /* La asignatura abierta primero. Normalmente no cuesta ninguna
       petición: la barra lateral ya la ha pedido. */
    await indexarAsignatura(asignaturaActual());
    /* Sin ninguna asignatura abierta (la portada general) no hay nada
       que buscar todavía, así que se indexa todo desde el principio. */
    if (!asignaturaActual()) await cargarElResto();
    if (abierto) buscar();
  }

  function cerrar() {
    if (!abierto) return;
    abierto = false;
    caja.hidden = true;
    campo.setAttribute('aria-activedescendant', '');
    if (focoPrevio && typeof focoPrevio.focus === 'function') focoPrevio.focus();
  }

  /* ---------- El botón de la barra ----------
     Porque un atajo de teclado que no se ve no existe: un alumno de
     primero no adivina que hay un Ctrl+K. El botón lo enseña y,
     además, es la única forma de abrirlo en un móvil. */

  function pintarBotonBuscar() {
    const nav = document.getElementById('barra-nav');
    if (!nav || nav.querySelector('.barra__buscar')) return;

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'barra__buscar';
    boton.addEventListener('click', abrir);

    const lupa = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lupa.setAttribute('viewBox', '0 0 24 24');
    lupa.setAttribute('fill', 'none');
    lupa.setAttribute('stroke', 'currentColor');
    lupa.setAttribute('stroke-width', '2');
    lupa.setAttribute('aria-hidden', 'true');
    lupa.innerHTML = '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>';

    const texto = document.createElement('span');
    texto.className = 'barra__buscar-texto';
    texto.textContent = 'Buscar';

    /* El atajo escrito al lado, en monoespaciada. Se esconde en móvil
       por CSS: allí no hay teclado que lo tenga. */
    const atajo = document.createElement('kbd');
    atajo.className = 'barra__atajo';
    atajo.textContent = navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl K';

    boton.appendChild(lupa);
    boton.appendChild(texto);
    boton.appendChild(atajo);
    boton.setAttribute('aria-label', 'Buscar una sesión');
    nav.appendChild(boton);
  }

  window.pintarBotonBuscar = pintarBotonBuscar;
  window.abrirBuscador = abrir;

  /* ---------- Atajos ---------- */

  document.addEventListener('keydown', ev => {
    const enCampo = /^(input|textarea|select)$/i.test(ev.target.tagName) || ev.target.isContentEditable;

    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      abierto ? cerrar() : abrir();
      return;
    }
    /* La barra "/" es el atajo de toda la vida para buscar, pero solo
       vale fuera de un campo de texto: dentro, "/" es una barra. */
    if (ev.key === '/' && !enCampo && !abierto) {
      ev.preventDefault();
      abrir();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pintarBotonBuscar);
  } else {
    pintarBotonBuscar();
  }
})();
