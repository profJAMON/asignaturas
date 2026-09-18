/* ============================================================
   Calendario de ritmo — fechas previstas de cada asignatura
   ============================================================

   Para qué
   --------
   Pinta la fecha prevista de cada sesión, para saber si vamos bien de
   tiempo. Sirve para TODAS las asignaturas que tengan un archivo
   data/calendario-<asignatura>.js cargado en la página:

   - Instalaciones se da a dos grupos (1r y 2n) con horarios distintos:
     su archivo trae "grupos", y hay que elegir el grupo en la barra
     lateral (guardado en localStorage) para ver fechas.
   - Operaciones se da a un único grupo: su archivo NO trae "grupos",
     y la fecha se muestra directamente, sin elegir nada.

   Este archivo:
   1. Pinta un selector "<Asignatura>: tu grupo" en la barra lateral por
      cada asignatura con grupos (mismo patrón que el de aspecto/idioma).
   2. Decora cada enlace de sesión de la barra lateral con su fecha.
   3. Pinta la fecha prevista de la sesión que se está viendo (tema.html).
   4. Da soporte a calendario.html?a=<asignatura>.

   Formato de los datos
   --------------------
   Con grupos:  unidad.fechas = { "1r": {inicio, fin}, "2n": {...} }
                sesiones[id]  = { titulo, unidad, "1r": iso, "2n": iso }
   Sin grupos:  unidad.fechas = { inicio, fin }
                sesiones[id]  = { titulo, unidad, fecha: iso }

   Para añadir el calendario de otra asignatura: crea su archivo de
   datos, añade una línea en CALENDARIOS (abajo) y carga el archivo en
   index.html, tema.html y calendario.html antes que este.

   Si un archivo de datos no está cargado en la página, todo lo de esa
   asignatura simplemente no hace nada.
   ============================================================ */

(function () {
  'use strict';

  /* id de asignatura -> objeto de datos (o null si no está cargado).
     Se usa typeof porque los datos son `const` globales de otro <script>. */
  const CALENDARIOS = {
    operaciones: () => (typeof CALENDARIO_OPERACIONES !== 'undefined' ? CALENDARIO_OPERACIONES : null),
    instalaciones: () => (typeof CALENDARIO_INSTALACIONES !== 'undefined' ? CALENDARIO_INSTALACIONES : null)
  };

  /* Nombre corto para el selector de grupo y los textos. */
  const NOMBRE_CORTO = {
    operaciones: 'Operaciones',
    instalaciones: 'Instalaciones'
  };

  function datos(asignaturaId) {
    const fuente = CALENDARIOS[asignaturaId];
    return fuente ? fuente() : null;
  }

  function asignaturasConCalendario() {
    return Object.keys(CALENDARIOS).filter(id => datos(id));
  }

  function tieneGrupos(asignaturaId) {
    const d = datos(asignaturaId);
    return !!(d && Array.isArray(d.grupos) && d.grupos.length > 0);
  }

  function nombreCorto(asignaturaId) {
    return NOMBRE_CORTO[asignaturaId] || asignaturaId;
  }

  /* ----------------------------------------------------------
     Grupo elegido (localStorage) — solo asignaturas con grupos
     ---------------------------------------------------------- */

  /* La clave de Instalaciones se mantiene igual que antes
     ('ob-grupo-instalaciones') para no perder lo ya elegido. */
  function claveGuardado(asignaturaId) {
    return `ob-grupo-${asignaturaId}`;
  }

  /* Sin grupos devuelve null: no hace falta elegir. */
  function grupoElegido(asignaturaId) {
    if (!tieneGrupos(asignaturaId)) return null;
    try {
      const guardado = localStorage.getItem(claveGuardado(asignaturaId));
      if (guardado && datos(asignaturaId).grupos.some(g => g.id === guardado)) return guardado;
    } catch (e) {
      /* Modo incógnito o cookies bloqueadas: sin memoria, pero funciona. */
    }
    return null;
  }

  function guardarGrupo(asignaturaId, grupoId) {
    try {
      localStorage.setItem(claveGuardado(asignaturaId), grupoId);
    } catch (e) { /* ídem */ }
  }

  /* ¿Se pueden mostrar fechas ya? Sin grupos, siempre; con grupos,
     solo si hay uno elegido. */
  function listo(asignaturaId) {
    return !!datos(asignaturaId) && (!tieneGrupos(asignaturaId) || !!grupoElegido(asignaturaId));
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

  /* 'pasada' | 'futura', comparando con hoy. */
  function estadoFecha(iso) {
    if (!iso) return 'futura';
    return iso < hoyIso() ? 'pasada' : 'futura';
  }

  /* grupo: opcional. Si no se pasa, se usa el elegido (o ninguno si la
     asignatura no tiene grupos). */
  function fechaSesion(asignaturaId, sesionId, grupo) {
    const d = datos(asignaturaId);
    if (!d) return null;
    const entrada = d.sesiones[sesionId];
    if (!entrada) return null;
    if (!tieneGrupos(asignaturaId)) return entrada.fecha || null;
    const g = grupo || grupoElegido(asignaturaId);
    return g ? entrada[g] || null : null;
  }

  /* Devuelve { inicio, fin } o null. */
  function fechasUnidad(asignaturaId, unidadId, grupo) {
    const d = datos(asignaturaId);
    if (!d) return null;
    const unidad = d.unidades.find(u => u.id === unidadId);
    if (!unidad || !unidad.fechas) return null;
    if (!tieneGrupos(asignaturaId)) return unidad.fechas;
    const g = grupo || grupoElegido(asignaturaId);
    return g ? unidad.fechas[g] || null : null;
  }

  /* Fecha del examen de una unidad, si la lleva ("examen" es opcional:
     Instalaciones todavía no lo usa). Con grupos sería un objeto
     { "1r": iso, "2n": iso }, igual que "fechas". */
  function fechaExamen(asignaturaId, unidadId, grupo) {
    const d = datos(asignaturaId);
    if (!d) return null;
    const unidad = d.unidades.find(u => u.id === unidadId);
    if (!unidad || !unidad.examen) return null;
    if (!tieneGrupos(asignaturaId)) return unidad.examen;
    const g = grupo || grupoElegido(asignaturaId);
    return g ? unidad.examen[g] || null : null;
  }

  /* ----------------------------------------------------------
     Selector de grupo en la barra lateral
     ---------------------------------------------------------- */

  function pintarSelectorGrupo() {
    const caja = document.getElementById('selector-grupo');
    if (!caja) return;
    caja.textContent = '';

    const conGrupos = asignaturasConCalendario().filter(tieneGrupos);
    caja.hidden = conGrupos.length === 0;

    conGrupos.forEach(asignaturaId => {
      const d = datos(asignaturaId);
      const actual = grupoElegido(asignaturaId);
      const nombre = nombreCorto(asignaturaId);

      const titulo = document.createElement('p');
      titulo.className = 'sidebar__titulo';
      titulo.textContent = `${nombre}: tu grupo`;
      caja.appendChild(titulo);

      const fila = document.createElement('div');
      fila.className = 'grupos';
      fila.setAttribute('role', 'group');
      fila.setAttribute('aria-label', `Tu grupo de ${nombre}`);

      d.grupos.forEach(grupo => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'grupo';
        boton.textContent = grupo.nombre;
        boton.title = `Ver las fechas previstas de ${grupo.nombre}`;
        boton.setAttribute('aria-pressed', grupo.id === actual ? 'true' : 'false');
        if (grupo.id === actual) boton.classList.add('grupo--activo');
        boton.addEventListener('click', () => {
          guardarGrupo(asignaturaId, grupo.id);
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
    });

    if (window.retraducir) window.retraducir();
  }

  /* ----------------------------------------------------------
     Decorar los enlaces de sesión de la barra lateral
     ---------------------------------------------------------- */

  /* Elementos ya pintados que hay que refrescar cuando cambia el grupo,
     sin recargar la página (mismo espíritu que aspecto.js). */
  const _decoraciones = [];

  /* Llamado desde sidebar.js por cada sesión de CADA asignatura; solo
     hace algo si esa asignatura tiene calendario y la sesión tiene fecha. */
  function decorarEnlaceSesion(enlace, asignatura, sesionId) {
    if (!asignatura) return;
    const d = datos(asignatura.id);
    if (!d || !d.sesiones[sesionId]) return;

    const span = document.createElement('span');
    span.className = 'sesion__fecha';
    enlace.appendChild(span);
    const dec = { el: span, enlace, asignaturaId: asignatura.id, id: sesionId };
    _decoraciones.push(dec);
    _pintarUnaDecoracion(dec);
  }

  function _pintarUnaDecoracion(dec) {
    const iso = listo(dec.asignaturaId) ? fechaSesion(dec.asignaturaId, dec.id) : null;
    if (!iso) {
      dec.el.textContent = '';
      dec.enlace.classList.remove('pasada');
      return;
    }
    dec.el.textContent = formatearFecha(iso);
    dec.enlace.classList.toggle('pasada', estadoFecha(iso) === 'pasada');
  }

  /* ----------------------------------------------------------
     Fecha prevista en la propia sesión (tema.html)
     ---------------------------------------------------------- */

  let _badgeTema = null;

  function pintarFechaPrevista(asignaturaId, sesionId) {
    const badge = document.getElementById('tema-fecha');
    if (!badge) return;
    if (!datos(asignaturaId)) {
      _badgeTema = null;
      badge.hidden = true;
      return;
    }
    _badgeTema = { asignaturaId, id: sesionId };
    _actualizarBadgeTema();
  }

  function _actualizarBadgeTema() {
    const badge = document.getElementById('tema-fecha');
    if (!badge || !_badgeTema) return;
    const { asignaturaId, id } = _badgeTema;
    const d = datos(asignaturaId);

    if (!d || !d.sesiones[id]) {
      badge.hidden = true;
      return;
    }

    if (tieneGrupos(asignaturaId)) {
      const grupo = grupoElegido(asignaturaId);
      if (!grupo) {
        const nombres = d.grupos.map(g => g.nombre).join('/');
        badge.textContent = `Elige tu grupo (${nombres}) en la barra lateral para ver la fecha prevista`;
        badge.hidden = false;
        return;
      }
      const iso = fechaSesion(asignaturaId, id, grupo);
      badge.textContent = iso ? `📅 Fecha prevista (${grupo}): ${formatearFecha(iso)}` : '';
      badge.hidden = !iso;
      return;
    }

    const iso = fechaSesion(asignaturaId, id);
    badge.textContent = iso ? `📅 Fecha prevista: ${formatearFecha(iso)}` : '';
    badge.hidden = !iso;
  }

  function refrescarDecoraciones() {
    _decoraciones.forEach(_pintarUnaDecoracion);
    _actualizarBadgeTema();
  }

  /* ----------------------------------------------------------
     Exponer lo que usan sidebar.js, tema.js, main.js y calendario.html
     ---------------------------------------------------------- */

  window.decorarEnlaceSesion = decorarEnlaceSesion;
  window.pintarFechaPrevista = pintarFechaPrevista;
  window.pintarSelectorGrupo = pintarSelectorGrupo;
  window.calendarioRitmo = {
    datos,
    asignaturasConCalendario,
    tieneGrupos,
    nombreCorto,
    grupoElegido,
    guardarGrupo,
    listo,
    formatearFecha,
    estadoFecha,
    hoyIso,
    fechaSesion,
    fechasUnidad,
    fechaExamen,
    refrescarDecoraciones
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pintarSelectorGrupo);
  } else {
    pintarSelectorGrupo();
  }
})();
