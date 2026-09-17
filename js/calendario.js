/* ============================================================
   Calendario de ritmo — selector de grupo y fechas previstas
   ============================================================

   Para qué
   --------
   Instalaciones se da a dos grupos (1r y 2n) con horarios distintos,
   así que la misma sesión le toca a cada uno en una fecha distinta.
   Este archivo:

   1. Pinta un selector "Instalaciones: tu grupo" en la barra lateral
      (mismo patrón que el de aspecto/idioma), guardado en localStorage.
   2. Con el grupo elegido, decora cada enlace de sesión de Instalaciones
      en la barra lateral con su fecha prevista.
   3. Pinta la fecha prevista de la sesión que se está viendo en tema.html.
   4. Da soporte a calendario.html, que lista todo el curso.

   Los datos viven en data/calendario-instalaciones.js (CALENDARIO_
   INSTALACIONES), cargado ANTES que este archivo. Si no está cargado
   (por ejemplo, en una página que no lo necesita), todo esto no hace
   nada: cada función comprueba que el objeto existe.

   Por qué no hace falta tocar tema.js/sidebar.js más que una línea
   cada uno: decorarEnlaceSesion() y pintarFechaPrevista() son los
   únicos puntos de enganche, y ambos siguen el mismo patrón que ya
   usa el sitio (`if (typeof retraducir === 'function') retraducir()`):
   si esta función no existe, no pasa nada.
   ============================================================ */

(function () {
  'use strict';

  const CLAVE_GUARDADO = 'ob-grupo-instalaciones';

  function datos() {
    return typeof CALENDARIO_INSTALACIONES !== 'undefined' ? CALENDARIO_INSTALACIONES : null;
  }

  /* ----------------------------------------------------------
     Grupo elegido (localStorage)
     ---------------------------------------------------------- */

  function grupoElegido() {
    try {
      const guardado = localStorage.getItem(CLAVE_GUARDADO);
      const d = datos();
      if (d && guardado && d.grupos.some(g => g.id === guardado)) return guardado;
    } catch (e) {
      /* Modo incógnito o cookies bloqueadas: sin memoria, pero funciona. */
    }
    return null;
  }

  function guardarGrupo(id) {
    try {
      localStorage.setItem(CLAVE_GUARDADO, id);
    } catch (e) { /* ídem */ }
  }

  /* ----------------------------------------------------------
     Fechas: acceso y formato
     ---------------------------------------------------------- */

  /* "2026-09-25" -> "vie 25 sep" (evita ambigüedad día/mes y cabe en
     poco espacio en la barra lateral). */
  function formatearFecha(iso) {
    if (!iso) return null;
    const [anio, mes, dia] = iso.split('-').map(Number);
    const f = new Date(anio, mes - 1, dia);
    const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${dias[f.getDay()]} ${f.getDate()} ${meses[f.getMonth()]}`;
  }

  function hoyIso() {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
  }

  /* 'pasada' | 'actual' | 'futura', comparando con hoy. "Actual" es un
     margen de unos días alrededor de la fecha de inicio, no solo el
     día exacto, porque las fechas son previstas y pueden desplazarse. */
  function estadoFecha(iso) {
    if (!iso) return 'futura';
    const hoy = hoyIso();
    if (iso < hoy) return 'pasada';
    return 'futura';
  }

  function fechaSesion(sesionId, grupo) {
    const d = datos();
    if (!d || !grupo) return null;
    const entrada = d.sesiones[sesionId];
    return entrada ? entrada[grupo] || null : null;
  }

  function fechasUnidad(unidadId, grupo) {
    const d = datos();
    if (!d || !grupo) return null;
    const unidad = d.unidades.find(u => u.id === unidadId);
    return unidad ? unidad.fechas[grupo] || null : null;
  }

  /* ----------------------------------------------------------
     Selector de grupo en la barra lateral
     ---------------------------------------------------------- */

  /* Elementos ya pintados que hay que refrescar cuando cambia el grupo,
     sin recargar la página (igual de espíritu que aspecto.js). */
  const _decoraciones = [];

  function pintarSelectorGrupo() {
    const caja = document.getElementById('selector-grupo');
    const d = datos();
    if (!caja || !d) return;

    const actual = grupoElegido();
    caja.textContent = '';

    const titulo = document.createElement('p');
    titulo.className = 'sidebar__titulo';
    titulo.textContent = 'Instalaciones: tu grupo';
    caja.appendChild(titulo);

    const fila = document.createElement('div');
    fila.className = 'grupos';
    fila.setAttribute('role', 'group');
    fila.setAttribute('aria-label', 'Tu grupo de Instalaciones');

    d.grupos.forEach(grupo => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'grupo';
      boton.textContent = grupo.nombre;
      boton.title = `Ver las fechas previstas de ${grupo.nombre}`;
      boton.setAttribute('aria-pressed', grupo.id === actual ? 'true' : 'false');
      if (grupo.id === actual) boton.classList.add('grupo--activo');
      boton.addEventListener('click', () => {
        guardarGrupo(grupo.id);
        pintarSelectorGrupo();
        refrescarDecoraciones();
        if (typeof refrescarPaginaCalendario === 'function') refrescarPaginaCalendario();
      });
      fila.appendChild(boton);
    });

    caja.appendChild(fila);

    if (!actual) {
      const nota = document.createElement('p');
      nota.className = 'aspecto-nota';
      nota.textContent = 'Elige tu grupo para ver cuándo toca cada sesión.';
      caja.appendChild(nota);
    }

    if (window.retraducir) window.retraducir();
  }

  /* ----------------------------------------------------------
     Decorar los enlaces de sesión de la barra lateral
     ---------------------------------------------------------- */

  /* Llamado desde sidebar.js por cada sesión de CADA asignatura; solo
     hace algo si es una sesión de Instalaciones y hay grupo elegido. */
  function decorarEnlaceSesion(enlace, asignatura, sesionId) {
    if (!asignatura || asignatura.id !== 'instalaciones') return;
    const d = datos();
    if (!d || !d.sesiones[sesionId]) return;

    const span = document.createElement('span');
    span.className = 'sesion__fecha';
    enlace.appendChild(span);
    _decoraciones.push({ tipo: 'sesion', el: span, enlace, id: sesionId });
    _pintarUnaDecoracion(_decoraciones[_decoraciones.length - 1]);
  }

  function _pintarUnaDecoracion(dec) {
    const grupo = grupoElegido();
    if (dec.tipo === 'sesion') {
      const iso = fechaSesion(dec.id, grupo);
      if (!grupo || !iso) {
        dec.el.textContent = '';
        dec.enlace.classList.remove('pasada', 'actual');
        return;
      }
      dec.el.textContent = formatearFecha(iso);
      const estado = estadoFecha(iso);
      dec.enlace.classList.toggle('pasada', estado === 'pasada');
    }
  }

  function refrescarDecoraciones() {
    _decoraciones.forEach(_pintarUnaDecoracion);
  }

  /* ----------------------------------------------------------
     Fecha prevista en la propia sesión (tema.html)
     ---------------------------------------------------------- */

  let _badgeTema = null;

  function pintarFechaPrevista(asignaturaId, sesionId) {
    const badge = document.getElementById('tema-fecha');
    if (!badge) return;
    if (asignaturaId !== 'instalaciones' || !datos()) {
      badge.hidden = true;
      return;
    }
    _badgeTema = { id: sesionId };
    _actualizarBadgeTema();
  }

  function _actualizarBadgeTema() {
    const badge = document.getElementById('tema-fecha');
    if (!badge || !_badgeTema) return;
    const grupo = grupoElegido();
    const iso = fechaSesion(_badgeTema.id, grupo);
    if (!grupo) {
      badge.textContent = 'Elige tu grupo (1r/2n) en la barra lateral para ver la fecha prevista';
      badge.hidden = false;
    } else if (iso) {
      badge.textContent = `📅 Fecha prevista (${grupo}): ${formatearFecha(iso)}`;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  /* Se engancha al refresco general para que el badge de tema.html
     también se actualice al cambiar de grupo sin recargar. */
  const _refrescarDecoracionesOriginal = refrescarDecoraciones;
  refrescarDecoraciones = function () {
    _refrescarDecoracionesOriginal();
    _actualizarBadgeTema();
  };

  /* ----------------------------------------------------------
     Exponer lo que usan sidebar.js, tema.js y calendario.html
     ---------------------------------------------------------- */

  window.decorarEnlaceSesion = decorarEnlaceSesion;
  window.pintarFechaPrevista = pintarFechaPrevista;
  window.pintarSelectorGrupo = pintarSelectorGrupo;
  window.calendarioInstalaciones = {
    datos,
    grupoElegido,
    guardarGrupo,
    formatearFecha,
    estadoFecha,
    hoyIso,
    fechaSesion,
    fechasUnidad,
    refrescarDecoraciones
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pintarSelectorGrupo);
  } else {
    pintarSelectorGrupo();
  }
})();
