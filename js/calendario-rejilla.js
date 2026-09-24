/* ============================================================
   Calendario del curso — vista de mes
   ============================================================

   Para qué
   --------
   La tabla de calendario-pagina.js enseña el curso entero de una vez:
   sirve para planificar, pero para responder "¿qué toca esta semana?"
   obliga a buscar la fila. Esta rejilla es el vistazo rápido: un mes,
   con el día de hoy marcado y un punto en los días que tienen sesión o
   examen. Al pulsar un día se abre debajo qué hay ese día, con enlace a
   la sesión.

   Va ENCIMA de la tabla, no en su lugar: la tabla sigue siendo la vista
   completa, por unidades y con las horas de cada una.

   De dónde salen los datos
   ------------------------
   De js/calendario.js (window.calendarioRitmo), el mismo sitio que la
   tabla y que las fechas de la barra lateral. Aquí no se calcula
   ninguna fecha: solo se colocan en una cuadrícula.

   Grupos (1r/2n)
   --------------
   En Instalaciones cada grupo lleva su ritmo. Mientras no haya grupo
   elegido no hay fechas que pintar, así que la rejilla lo dice y espera.
   Al elegirlo, js/calendario.js llama a refrescarRejillaCalendario().

   Idioma
   ------
   Los nombres de días y meses se escriben aquí en castellano, como el
   resto de la web. No se usa toLocaleDateString: devolvería el idioma
   del equipo del alumno, y entonces media página estaría en castellano
   y la rejilla en otro idioma.
   ============================================================ */

(function () {
  'use strict';

  const DIAS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
  const DIAS_LARGO = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const cal = window.calendarioRitmo;

  /* Estado de la vista: qué asignatura, qué mes se está mirando y qué
     día está abierto abajo. */
  let _asignatura = null;
  let _anio = null;
  let _mes = null;          // 0-11
  let _diaAbierto = null;   // iso o null

  /* ----------------------------------------------------------
     Utilidades de fecha (sin Date donde se pueda, para no pelearse
     con zonas horarias: las fechas del curso son días, no instantes)
     ---------------------------------------------------------- */

  function iso(anio, mes, dia) {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  function diasDelMes(anio, mes) {
    return new Date(anio, mes + 1, 0).getDate();
  }

  /* 0 = lunes … 6 = domingo. getDay() da 0 = domingo, de ahí el ajuste. */
  function diaSemanaLunes(anio, mes, dia) {
    return (new Date(anio, mes, dia).getDay() + 6) % 7;
  }

  function formatearLargo(isoFecha) {
    const [a, m, d] = isoFecha.split('-').map(Number);
    return `${DIAS_LARGO[diaSemanaLunes(a, m - 1, d)]} ${d} de ${MESES[m - 1]}`;
  }

  /* ----------------------------------------------------------
     Qué hay cada día
     ----------------------------------------------------------
     Devuelve { "2026-09-21": [ {tipo, titulo, sesionId?}, ... ] }
     usando el grupo elegido (o el único ritmo, si la asignatura no
     tiene grupos). Sin fechas disponibles devuelve {}. */

  function eventosPorDia(asignaturaId) {
    const d = cal.datos(asignaturaId);
    const mapa = {};
    if (!d || !cal.listo(asignaturaId)) return mapa;

    function anotar(fecha, evento) {
      if (!fecha) return;
      (mapa[fecha] = mapa[fecha] || []).push(evento);
    }

    Object.keys(d.sesiones).forEach(sesionId => {
      anotar(cal.fechaSesion(asignaturaId, sesionId), {
        tipo: 'sesion',
        titulo: d.sesiones[sesionId].titulo,
        sesionId: sesionId
      });
    });

    (d.unidades || []).forEach(unidad => {
      anotar(cal.fechaExamen(asignaturaId, unidad.id), {
        tipo: 'examen',
        titulo: cal.tituloExamen(asignaturaId, unidad.id)
      });
    });

    /* El examen primero: si un día cae examen, es lo que importa. */
    Object.keys(mapa).forEach(fecha => {
      mapa[fecha].sort((x, y) => (x.tipo === 'examen' ? -1 : 0) - (y.tipo === 'examen' ? -1 : 0));
    });

    return mapa;
  }

  /* Primer y último mes con algo, para no dejar navegar hasta 2043. */
  function limites(mapa) {
    const fechas = Object.keys(mapa).sort();
    if (fechas.length === 0) return null;
    const primera = fechas[0].split('-').map(Number);
    const ultima = fechas[fechas.length - 1].split('-').map(Number);
    return {
      desde: { anio: primera[0], mes: primera[1] - 1 },
      hasta: { anio: ultima[0], mes: ultima[1] - 1 }
    };
  }

  function comoNumero(anio, mes) {
    return anio * 12 + mes;
  }

  /* ----------------------------------------------------------
     Pintado
     ---------------------------------------------------------- */

  function pintarRejillaCalendario(asignatura) {
    if (asignatura) _asignatura = asignatura;
    const caja = document.getElementById('calendario-rejilla');
    if (!caja || !cal || !_asignatura) return;

    const datos = cal.datos(_asignatura.id);
    const seccion = document.getElementById('seccion-rejilla');

    if (!datos) {
      if (seccion) seccion.hidden = true;
      return;
    }
    if (seccion) seccion.hidden = false;

    caja.textContent = '';

    /* Instalaciones sin grupo elegido: no hay fechas que colocar. */
    if (!cal.listo(_asignatura.id)) {
      const aviso = document.createElement('p');
      aviso.className = 'vacio';
      aviso.textContent = 'Elige tu grupo aquí arriba y verás el mes con las fechas de tu grupo.';
      caja.appendChild(aviso);
      return;
    }

    const mapa = eventosPorDia(_asignatura.id);
    const rango = limites(mapa);
    if (!rango) {
      const aviso = document.createElement('p');
      aviso.className = 'vacio';
      aviso.textContent = 'Todavía no hay fechas previstas para esta asignatura.';
      caja.appendChild(aviso);
      return;
    }

    /* Primera vez: se abre el mes de hoy si el curso pasa por él; si
       estamos de vacaciones antes de empezar, el primer mes con clase. */
    if (_anio === null) {
      const hoy = cal.hoyIso().split('-').map(Number);
      const actual = comoNumero(hoy[0], hoy[1] - 1);
      const min = comoNumero(rango.desde.anio, rango.desde.mes);
      const max = comoNumero(rango.hasta.anio, rango.hasta.mes);
      const elegido = Math.min(Math.max(actual, min), max);
      _anio = Math.floor(elegido / 12);
      _mes = elegido % 12;
    }

    caja.appendChild(construirBarra(rango));
    caja.appendChild(construirTabla(mapa));
    caja.appendChild(construirDetalle(mapa));

    if (typeof retraducir === 'function') retraducir();
  }

  /* ---------- barra de arriba: mes + flechas ---------- */

  function construirBarra(rango) {
    const barra = document.createElement('div');
    barra.className = 'rejilla__barra';

    const titulo = document.createElement('p');
    titulo.className = 'rejilla__mes';
    titulo.id = 'rejilla-mes';
    titulo.setAttribute('aria-live', 'polite');
    titulo.textContent = `${MESES[_mes]} de ${_anio}`;
    barra.appendChild(titulo);

    const nav = document.createElement('div');
    nav.className = 'rejilla__nav';

    const actual = comoNumero(_anio, _mes);
    const min = comoNumero(rango.desde.anio, rango.desde.mes);
    const max = comoNumero(rango.hasta.anio, rango.hasta.mes);

    nav.appendChild(botonNav('anterior', 'Mes anterior', actual <= min));
    nav.appendChild(botonNav('siguiente', 'Mes siguiente', actual >= max));
    barra.appendChild(nav);

    return barra;
  }

  /* Flechas dibujadas en SVG con currentColor, no como emoji: así se ven
     igual en Windows, en Android y en los dos temas. */
  function botonNav(sentido, etiqueta, desactivado) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'rejilla__boton';
    boton.title = etiqueta;
    boton.setAttribute('aria-label', etiqueta);
    boton.disabled = desactivado;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', sentido === 'anterior' ? 'M3 10.5 L8 5.5 L13 10.5' : 'M3 5.5 L8 10.5 L13 5.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    boton.appendChild(svg);

    boton.addEventListener('click', () => {
      const salto = sentido === 'anterior' ? -1 : 1;
      const destino = comoNumero(_anio, _mes) + salto;
      _anio = Math.floor(destino / 12);
      _mes = destino % 12;
      _diaAbierto = null;
      pintarRejillaCalendario();
    });

    return boton;
  }

  /* ---------- la cuadrícula ---------- */

  function construirTabla(mapa) {
    const tabla = document.createElement('table');
    tabla.className = 'rejilla__tabla';
    tabla.setAttribute('aria-labelledby', 'rejilla-mes');

    const thead = document.createElement('thead');
    const filaDias = document.createElement('tr');
    DIAS.forEach((dia, i) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = dia;
      /* El lector de pantalla lee el nombre entero, no la abreviatura. */
      th.setAttribute('aria-label', DIAS_LARGO[i]);
      filaDias.appendChild(th);
    });
    thead.appendChild(filaDias);
    tabla.appendChild(thead);

    const tbody = document.createElement('tbody');
    const hoy = cal.hoyIso();
    const total = diasDelMes(_anio, _mes);
    const hueco = diaSemanaLunes(_anio, _mes, 1);

    /* Días del mes anterior y del siguiente, en gris, para que las
       semanas queden completas (como cualquier calendario de papel).
       Siempre 6 semanas: así la rejilla mide lo mismo en todos los meses
       y la página no pega un salto al pasar de mes. */
    const previo = new Date(_anio, _mes, 0).getDate();
    const celdas = [];

    for (let i = hueco - 1; i >= 0; i--) {
      celdas.push({ dia: previo - i, fuera: true });
    }
    for (let d = 1; d <= total; d++) {
      celdas.push({ dia: d, fuera: false, iso: iso(_anio, _mes, d) });
    }
    while (celdas.length < 42) {
      celdas.push({ dia: celdas.length - hueco - total + 1, fuera: true });
    }

    for (let i = 0; i < celdas.length; i += 7) {
      const fila = document.createElement('tr');
      celdas.slice(i, i + 7).forEach(celda => {
        fila.appendChild(construirCelda(celda, mapa, hoy));
      });
      tbody.appendChild(fila);
    }

    tabla.appendChild(tbody);
    return tabla;
  }

  function construirCelda(celda, mapa, hoy) {
    const td = document.createElement('td');
    td.className = 'rejilla__celda';

    if (celda.fuera) {
      td.classList.add('rejilla__celda--fuera');
      td.textContent = celda.dia;
      return td;
    }

    const eventos = mapa[celda.iso] || [];
    const esHoy = celda.iso === hoy;

    /* Con eventos es un botón (se puede pulsar y tabular); sin eventos,
       texto suelto: no hay nada que abrir. */
    if (eventos.length === 0) {
      const span = document.createElement('span');
      span.className = 'rejilla__dia';
      if (esHoy) span.classList.add('rejilla__dia--hoy');
      span.textContent = celda.dia;
      td.appendChild(span);
      return td;
    }

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'rejilla__dia rejilla__dia--con-eventos';
    if (esHoy) boton.classList.add('rejilla__dia--hoy');
    if (celda.iso === _diaAbierto) boton.classList.add('rejilla__dia--abierto');
    if (eventos.some(e => e.tipo === 'examen')) boton.classList.add('rejilla__dia--examen');

    const numero = document.createElement('span');
    numero.textContent = celda.dia;
    boton.appendChild(numero);

    const punto = document.createElement('span');
    punto.className = 'rejilla__punto';
    punto.setAttribute('aria-hidden', 'true');
    boton.appendChild(punto);

    const cuantos = eventos.length === 1
      ? eventos[0].titulo
      : `${eventos.length} cosas`;
    boton.setAttribute('aria-label', `${formatearLargo(celda.iso)}: ${cuantos}`);
    boton.setAttribute('aria-expanded', celda.iso === _diaAbierto ? 'true' : 'false');

    boton.addEventListener('click', () => {
      _diaAbierto = _diaAbierto === celda.iso ? null : celda.iso;
      pintarRejillaCalendario();
    });

    td.appendChild(boton);
    return td;
  }

  /* ---------- el detalle de abajo ---------- */

  function construirDetalle(mapa) {
    const caja = document.createElement('div');
    caja.className = 'rejilla__detalle';
    caja.setAttribute('aria-live', 'polite');

    if (!_diaAbierto) {
      const pista = document.createElement('p');
      pista.className = 'rejilla__pista';
      pista.textContent = 'Los días marcados tienen sesión o examen. Pulsa uno para ver qué toca.';
      caja.appendChild(pista);
      return caja;
    }

    const titulo = document.createElement('p');
    titulo.className = 'rejilla__detalle-titulo';
    titulo.textContent = formatearLargo(_diaAbierto);
    caja.appendChild(titulo);

    const lista = document.createElement('ul');
    lista.className = 'rejilla__lista';

    (mapa[_diaAbierto] || []).forEach(evento => {
      const item = document.createElement('li');

      const etiqueta = document.createElement('span');
      etiqueta.className = 'rejilla__etiqueta';
      etiqueta.textContent = evento.tipo === 'examen' ? 'EXAMEN' : 'SESIÓN';
      if (evento.tipo === 'examen') etiqueta.classList.add('rejilla__etiqueta--examen');
      item.appendChild(etiqueta);

      if (evento.sesionId) {
        const enlace = document.createElement('a');
        enlace.href = urlSesion(evento.sesionId);
        enlace.textContent = evento.titulo;
        item.appendChild(enlace);
      } else {
        const texto = document.createElement('span');
        texto.textContent = evento.titulo;
        item.appendChild(texto);
      }

      lista.appendChild(item);
    });

    caja.appendChild(lista);
    return caja;
  }

  /* ----------------------------------------------------------
     Lo que usan las demás piezas
     ---------------------------------------------------------- */

  /* Al cambiar de grupo (js/calendario.js) cambian todas las fechas:
     se vuelve a pintar el mes que se estaba mirando. */
  function refrescarRejillaCalendario() {
    _diaAbierto = null;
    pintarRejillaCalendario();
  }

  window.pintarRejillaCalendario = pintarRejillaCalendario;
  window.refrescarRejillaCalendario = refrescarRejillaCalendario;
})();
