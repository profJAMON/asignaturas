/* Portada (index.html). Tiene dos estados:

   - Sin ?a= en la URL: muestra una tarjeta por asignatura.
   - Con ?a=<id>: muestra las unidades de esa asignatura, cada una
     desplegable con sus sesiones dentro (título, descripción y cuántos
     materiales/actividades tiene).

   La barra lateral la pinta js/sidebar.js. */

const _asignaturaPortada = asignaturaDeLaUrl();

cargarBarraLateral(null, _asignaturaPortada);
arrancarPortada();

function arrancarPortada() {
  if (_asignaturaPortada) {
    pintarCabecera(
      _asignaturaPortada.nombre,
      'Apuntes y Actividades',
      `${_asignaturaPortada.descripcion} Elige una unidad para ver sus sesiones.`,
      true
    );
    /* El selector 1r/2n vive aquí, en la cabecera de la asignatura, y no
       en la barra lateral: solo afecta a Instalaciones. En las demás
       asignaturas pintarSelectorGrupo esconde la caja y no pinta nada. */
    if (typeof pintarSelectorGrupo === 'function') pintarSelectorGrupo(_asignaturaPortada.id);
    cargarUnidades(_asignaturaPortada);
  } else {
    pintarCabecera(
      'Material de clase',
      'Apuntes y Actividades',
      'Elige la asignatura con la que quieres trabajar.',
      false
    );
    pintarAsignaturas();
    /* Los dos bloques de contexto de la portada general. Cada uno se
       esconde solo si no tiene nada que decir. */
    pintarTerminal();
    pintarSemana();
  }
}

function pintarCabecera(badge, titulo, descripcion, conVolver) {
  const elBadge = document.getElementById('portada-badge');
  const elTitulo = document.getElementById('portada-titulo');
  const elDesc = document.getElementById('portada-descripcion');
  const elVolver = document.getElementById('portada-volver');
  const elCalendario = document.getElementById('portada-calendario');

  if (elBadge) elBadge.textContent = badge;
  if (elTitulo) elTitulo.textContent = titulo;
  if (elDesc) elDesc.textContent = descripcion;
  if (elVolver) elVolver.hidden = !conVolver;
  /* Enlace al calendario de ritmo, solo si esta asignatura tiene uno
     cargado (ver js/calendario.js). */
  if (elCalendario) {
    const conCalendario = !!(_asignaturaPortada && window.calendarioRitmo && window.calendarioRitmo.datos(_asignaturaPortada.id));
    elCalendario.hidden = !conCalendario;
    if (conCalendario) elCalendario.href = `calendario.html?a=${encodeURIComponent(_asignaturaPortada.id)}`;
  }

  document.title = conVolver ? `${badge} · Material de clase` : 'Material de clase';
}

/* ---------- Estado 1: elegir asignatura ---------- */

function pintarAsignaturas() {
  const contenedor = document.getElementById('indice-portada');
  if (!contenedor) return;

  ASIGNATURAS.forEach(async (asignatura, indice) => {
    const tarjeta = document.createElement('a');
    tarjeta.className = 'asignatura-card';
    tarjeta.href = urlPortadaAsignatura(asignatura);
    /* El color de la tarjeta sale de su posición, no de su id: así una
       asignatura nueva coge uno de los tres acentos sin tocar el CSS.
       Ver [data-color] en css/estilos.css. */
    tarjeta.dataset.color = String(indice % 3);

    const numero = document.createElement('p');
    numero.className = 'asignatura-card__numero';
    numero.setAttribute('aria-hidden', 'true');
    numero.textContent = String(indice + 1).padStart(2, '0');
    tarjeta.appendChild(numero);

    /* El dibujo de la asignatura (js/iconos.js). Es lo que hace que las
       tres tarjetas se distingan sin leerlas. innerHTML con una
       constante del propio sitio, no con nada que venga de fuera. */
    if (typeof iconoDeAsignatura === 'function') {
      const icono = document.createElement('div');
      icono.className = 'asignatura-card__icono';
      icono.innerHTML = iconoDeAsignatura(asignatura.id);
      tarjeta.appendChild(icono);
    }

    const titulo = document.createElement('p');
    titulo.className = 'asignatura-card__titulo';
    titulo.textContent = asignatura.nombre;

    const descripcion = document.createElement('p');
    descripcion.className = 'asignatura-card__descripcion';
    descripcion.textContent = asignatura.descripcion;

    const meta = document.createElement('p');
    meta.className = 'asignatura-card__meta';
    meta.textContent = 'Cargando…';

    tarjeta.appendChild(titulo);
    tarjeta.appendChild(descripcion);
    tarjeta.appendChild(meta);
    contenedor.appendChild(tarjeta);

    const curso = await cargarCursoSeguro(asignatura);
    const unidades = curso.unidades || [];
    const nSesiones = unidades.reduce((total, u) => total + (u.sesiones || []).length, 0);
    meta.textContent = unidades.length === 0
      ? 'Todavía sin contenido publicado'
      : `${unidades.length} unidad(es) · ${nSesiones} sesión(es)`;

    if (typeof retraducir === 'function') retraducir();
  });
}

/* ---------- Estado 2: unidades de una asignatura ---------- */

async function cargarUnidades(asignatura) {
  const contenedor = document.getElementById('indice-portada');
  if (!contenedor) return;

  try {
    const curso = await cargarCurso(asignatura);
    const unidades = curso.unidades || [];

    if (unidades.length === 0) {
      contenedor.innerHTML = '<p class="vacio">Todavía no hay unidades publicadas. Vuelve pronto.</p>';
      return;
    }

    unidades.forEach(unidad => {
      const detalles = document.createElement('details');
      detalles.className = 'unidad-card';

      const resumen = document.createElement('summary');

      const cabecera = document.createElement('div');
      const tituloUnidad = document.createElement('p');
      tituloUnidad.className = 'unidad-card__titulo';
      tituloUnidad.textContent = unidad.titulo;
      cabecera.appendChild(tituloUnidad);
      if (unidad.descripcion) {
        const descUnidad = document.createElement('p');
        descUnidad.className = 'unidad-card__descripcion';
        descUnidad.textContent = unidad.descripcion;
        cabecera.appendChild(descUnidad);
      }
      resumen.appendChild(cabecera);
      detalles.appendChild(resumen);

      const lista = document.createElement('div');
      lista.className = 'sesiones-portada';

      if ((unidad.sesiones || []).length === 0) {
        const vacio = document.createElement('p');
        vacio.className = 'vacio';
        vacio.textContent = 'Todavía no hay sesiones publicadas en esta unidad.';
        lista.appendChild(vacio);
      }

      detalles.appendChild(lista);
      contenedor.appendChild(detalles);

      cargarSesionesDeUnidad(asignatura, unidad).then(sesiones => {
        sesiones.forEach((sesion, i) => {
          if (!sesion) {
            console.error(`No se ha podido cargar la sesión "${unidad.sesiones[i]}"`);
            return;
          }
          lista.appendChild(crearFilaSesionPortada(sesion));
        });
        /* Las sesiones llegan por fetch: hay que avisar al traductor
           de que hay texto nuevo. Ver js/idioma.js. */
        if (typeof retraducir === 'function') retraducir();
      });
    });
  } catch (error) {
    contenedor.innerHTML = '<p class="vacio">No se ha podido cargar el listado de unidades. Si estás probando el sitio en tu ordenador, recuerda abrirlo con un servidor local (ver README).</p>';
    console.error(error);
  }
}

function crearFilaSesionPortada(sesion) {
  const fila = document.createElement('a');
  fila.className = 'sesion-portada';
  fila.href = urlSesion(sesion.id);

  const cuerpo = document.createElement('div');
  const tituloSesion = document.createElement('p');
  tituloSesion.className = 'sesion-portada__titulo';
  tituloSesion.textContent = sesion.titulo;
  const descripcionSesion = document.createElement('p');
  descripcionSesion.className = 'sesion-portada__descripcion';
  descripcionSesion.textContent = sesion.descripcion || '';

  const meta = document.createElement('p');
  meta.className = 'sesion-portada__meta';
  const nMateriales = (sesion.materiales || []).length;
  const nActividades = (sesion.actividades || []).length;
  meta.textContent = `${nMateriales} material(es) · ${nActividades} actividad(es)`;

  cuerpo.appendChild(tituloSesion);
  cuerpo.appendChild(descripcionSesion);
  cuerpo.appendChild(meta);
  fila.appendChild(cuerpo);
  return fila;
}

/* ============================================================
   La terminal de la cabecera
   ============================================================
   Ocupa la derecha de la portada general y hace dos papeles según
   quién llegue:

   - Si ya ha abierto alguna sesión en este navegador, enseña cuál y
     cuándo, y debajo (fuera de la terminal, como botón de verdad) el
     "Continuar".
   - Si es la primera vez, enseña un ls de las asignaturas. Así la
     cabecera nunca se queda coja por un lado.

   La orden se teclea sola y la respuesta va apareciendo. Con
   prefers-reduced-motion las animaciones duran nada y se ve todo
   escrito de golpe, que es justo lo que se quiere. */

function pintarTerminal() {
  const caja = document.getElementById('portada-terminal');
  if (!caja) return;

  const ultima = leerUltimaSesion();
  const asignatura = ultima ? asignaturaPorId(ultima.asignatura) : null;

  caja.appendChild(_marcoTerminal(ultima, asignatura));
  if (ultima && asignatura) caja.appendChild(_accionesTerminal(ultima, asignatura));
  caja.hidden = false;
}

function _marcoTerminal(ultima, asignatura) {
  const marco = document.createElement('div');
  marco.className = 'terminal';

  /* Barra de título de la ventana. */
  const barra = document.createElement('div');
  barra.className = 'terminal__barra';
  ['uno', 'dos', 'tres'].forEach(() => {
    const punto = document.createElement('span');
    punto.className = 'terminal__punto';
    barra.appendChild(punto);
  });
  const ruta = document.createElement('span');
  ruta.className = 'terminal__ruta';
  ruta.setAttribute('translate', 'no');
  ruta.classList.add('notranslate');
  ruta.textContent = asignatura
    ? `alumno@profesorjamon: ~/${asignatura.id}`
    : 'alumno@profesorjamon: ~';
  barra.appendChild(ruta);
  marco.appendChild(barra);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'terminal__cuerpo';
  cuerpo.appendChild(_lineaOrden(ultima ? 'ultima-sesion' : 'ls asignaturas/'));

  if (ultima && asignatura) {
    cuerpo.appendChild(_lineaSalida(_cuandoLoDejaste(ultima.fecha), 'sale'));

    const sesion = document.createElement('p');
    sesion.className = 'terminal__sesion sale2';
    sesion.textContent = ultima.titulo;
    cuerpo.appendChild(sesion);

    cuerpo.appendChild(_lineaSalida(ultima.unidad || asignatura.nombre, 'sale3'));
  } else {
    const lista = _lineaSalida(ASIGNATURAS.map(a => a.id).join('   '), 'sale');
    lista.setAttribute('translate', 'no');
    lista.classList.add('notranslate', 'terminal__lista');
    cuerpo.appendChild(lista);
    cuerpo.appendChild(_lineaSalida('elige una abajo ↓', 'sale3'));
  }

  cuerpo.appendChild(_lineaPrompt());
  marco.appendChild(cuerpo);
  return marco;
}

function _lineaOrden(orden) {
  const linea = document.createElement('p');
  linea.className = 'terminal__linea';
  const prompt = document.createElement('span');
  prompt.className = 'terminal__prompt';
  prompt.textContent = '$';
  const texto = document.createElement('span');
  texto.className = 'terminal__teclea';
  texto.setAttribute('translate', 'no');
  texto.classList.add('notranslate');
  texto.textContent = orden;
  /* El ancho final de la animación, en caracteres. Sin esto la
     animación acaba en width:100%, que es el ancho de la línea entera
     y empuja la orden al renglón de abajo, lejos del $. */
  texto.style.setProperty('--largo', `${orden.length}ch`);
  linea.appendChild(prompt);
  linea.appendChild(document.createTextNode(' '));
  linea.appendChild(texto);
  return linea;
}

function _lineaSalida(texto, clase) {
  const p = document.createElement('p');
  p.className = `terminal__salida ${clase}`;
  p.textContent = texto;
  return p;
}

function _lineaPrompt() {
  const linea = document.createElement('p');
  linea.className = 'terminal__linea sale3';
  const prompt = document.createElement('span');
  prompt.className = 'terminal__prompt';
  prompt.textContent = '$';
  const cursor = document.createElement('span');
  cursor.className = 'terminal__cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.textContent = '▊';
  linea.appendChild(prompt);
  linea.appendChild(document.createTextNode(' '));
  linea.appendChild(cursor);
  return linea;
}

function _accionesTerminal(ultima, asignatura) {
  const fila = document.createElement('div');
  fila.className = 'terminal__acciones sale3';

  const boton = document.createElement('a');
  boton.className = 'boton-continuar';
  /* Con ?a= además de ?id=: así la sesión se localiza a la primera,
     sin recorrer las demás asignaturas. */
  boton.href = `${urlSesion(ultima.id)}&a=${encodeURIComponent(asignatura.id)}`;
  boton.textContent = 'Continuar →';

  const otra = document.createElement('a');
  otra.className = 'terminal__otra';
  otra.href = '#indice-portada';
  otra.textContent = 'o empieza otra cosa ↓';

  fila.appendChild(boton);
  fila.appendChild(otra);
  return fila;
}

/* "el jueves", "ayer", "hoy" o la fecha, según lo lejos que quede.
   Si lo guardado es de antes de que existiera este campo, no se
   enseña ninguna línea de cuándo. */
function _cuandoLoDejaste(iso) {
  if (!iso) return 'lo dejaste aquí';

  const hoy = window.calendarioRitmo ? window.calendarioRitmo.hoyIso() : null;
  if (iso === hoy) return 'lo dejaste aquí hoy mismo';

  const [a, m, d] = iso.split('-').map(Number);
  const fecha = new Date(a, m - 1, d);
  const ahora = new Date();
  const dias = Math.round((new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()) - fecha) / 86400000);

  if (dias === 1) return 'lo dejaste aquí ayer';
  if (dias > 1 && dias < 7) {
    const nombres = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'];
    return `lo dejaste aquí ${nombres[fecha.getDay()]}`;
  }
  const formateada = window.calendarioRitmo ? window.calendarioRitmo.formatearFecha(iso) : iso;
  return `lo dejaste aquí el ${formateada}`;
}

/* ============================================================
   Bloque "Esta semana"
   ============================================================
   De lunes a viernes de la semana en curso, con lo que toca en cada
   asignatura que tenga calendario cargado (ver js/calendario.js).
   Los exámenes van en la misma lista, marcados.

   En vacaciones o en una semana de puente no habrá nada que enseñar:
   el bloque lo dice en una línea en vez de desaparecer, que en
   Navidad es justo la información que el alumno quiere. */

function pintarSemana() {
  const caja = document.getElementById('portada-semana');
  if (!caja || !window.calendarioRitmo) return;

  const dias = _diasDeEstaSemana();
  const entradas = _entradasDeLaSemana(dias[0], dias[dias.length - 1]);
  const avisos = _asignaturasSinGrupo();
  const periodoEntero = window.sinClase ? window.sinClase.periodoDeTodos(dias) : null;

  /* La pulla se elige una vez para toda la semana, no una por día: con
     un puente de dos días, dos frases distintas seguidas parecen un
     error. Sale del primer día sin clase que haya. */
  const primerPeriodo = window.sinClase
    ? dias.map(d => window.sinClase.periodoDe(d)).find(Boolean)
    : null;
  const frase = primerPeriodo ? window.sinClase.pulla(primerPeriodo) : '';

  const titulo = document.createElement('h2');
  titulo.className = 'seccion__titulo';
  titulo.textContent = 'Esta semana';
  caja.appendChild(titulo);

  /* Semana entera sin clase: no hay rejilla que pintar, solo el cartel. */
  if (periodoEntero) {
    caja.appendChild(_bloqueSinClase(periodoEntero, true, frase));
    caja.hidden = false;
    if (typeof retraducir === 'function') retraducir();
    return;
  }

  /* Con una sola asignatura en toda la semana, poner su nombre encima de
     cada sesión es ruido: el color del filo ya la distingue. */
  const variasAsignaturas = new Set(entradas.map(e => e.asignatura.id)).size > 1;

  const rejilla = document.createElement('div');
  rejilla.className = 'semana';

  const linea = document.createElement('div');
  linea.className = 'semana__linea';
  rejilla.appendChild(linea);

  dias.forEach(iso => {
    rejilla.appendChild(_columnaDia(iso, entradas.filter(e => e.fecha === iso), variasAsignaturas, frase));
  });

  caja.appendChild(rejilla);

  if (entradas.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.textContent = 'Esta semana no hay sesiones previstas.';
    caja.appendChild(vacio);
  }

  avisos.forEach(asignatura => {
    const aviso = document.createElement('p');
    aviso.className = 'semana__aviso';
    const enlace = document.createElement('a');
    enlace.href = urlPortadaAsignatura(asignatura);
    enlace.textContent = asignatura.nombre;
    aviso.appendChild(enlace);
    aviso.appendChild(document.createTextNode(': elige tu grupo para ver sus fechas.'));
    caja.appendChild(aviso);
  });

  caja.hidden = false;
  if (typeof retraducir === 'function') retraducir();
}

/* Una columna de la semana: el punto de la línea, el día y lo que toca.
   Un día puede estar sin clase él solo (un puente suelto) aunque el
   resto de la semana sí la haya. */
function _columnaDia(iso, entradas, conAsignatura, frase) {
  const ritmo = window.calendarioRitmo;
  const columna = document.createElement('div');
  columna.className = 'semana__dia';

  const esHoy = iso === ritmo.hoyIso();
  if (esHoy) columna.classList.add('semana__dia--hoy');

  const punto = document.createElement('span');
  punto.className = 'semana__punto';
  columna.appendChild(punto);

  const fecha = document.createElement('p');
  fecha.className = 'semana__fecha';
  /* "lun 21 sep · hoy": el día de la semana y el número bastan cuando
     están los cinco seguidos, pero el mes evita dudas a fin de mes. */
  fecha.textContent = esHoy
    ? `${ritmo.formatearFecha(iso)} · hoy`
    : ritmo.formatearFecha(iso);
  columna.appendChild(fecha);

  const periodo = window.sinClase ? window.sinClase.periodoDe(iso) : null;
  if (periodo) {
    columna.classList.add('semana__dia--sin-clase');
    columna.appendChild(_bloqueSinClase(periodo, false, frase));
    return columna;
  }

  if (entradas.length === 0) {
    const raya = document.createElement('p');
    raya.className = 'semana__nada';
    raya.textContent = '—';
    columna.appendChild(raya);
    return columna;
  }

  entradas.forEach(entrada => columna.appendChild(_crearItemSemana(entrada, conAsignatura)));
  return columna;
}

/* El cartel de los días sin clase.

   Lo que se lee tachado ("Venir a clase") va con aria-hidden: para
   quien usa lector de pantalla, un texto tachado y su desmentido
   seguidos no se entienden. La pulla y el nombre del periodo sí se
   leen, y con eso la broma y la información llegan igual. */
function _bloqueSinClase(periodo, grande, frase) {
  const ritmo = window.calendarioRitmo;
  const caja = document.createElement('div');
  caja.className = grande ? 'sin-clase sin-clase--grande' : 'sin-clase';

  const tachado = document.createElement('p');
  tachado.className = 'sin-clase__tachado';
  tachado.setAttribute('aria-hidden', 'true');
  tachado.textContent = 'Venir a clase';

  const sello = document.createElement('p');
  sello.className = 'sin-clase__sello';
  sello.textContent = frase || window.sinClase.pulla(periodo);

  const nombre = document.createElement('p');
  nombre.className = 'sin-clase__nombre';
  nombre.textContent = periodo.desde === periodo.hasta
    ? `${periodo.titulo} · ${ritmo.formatearFecha(periodo.desde)}`
    : `${periodo.titulo} · del ${ritmo.formatearFecha(periodo.desde)} al ${ritmo.formatearFecha(periodo.hasta)}`;

  caja.appendChild(tachado);
  caja.appendChild(sello);
  caja.appendChild(nombre);
  return caja;
}

function _crearItemSemana(entrada, conAsignatura) {
  const esExamen = entrada.tipo === 'examen';
  const item = document.createElement(esExamen ? 'div' : 'a');
  item.className = esExamen ? 'semana__item semana__item--examen' : 'semana__item';
  item.dataset.color = entrada.color;
  if (!esExamen) item.href = `${urlSesion(entrada.id)}&a=${encodeURIComponent(entrada.asignatura.id)}`;

  if (conAsignatura) {
    const asig = document.createElement('span');
    asig.className = 'semana__asignatura';
    asig.textContent = window.calendarioRitmo.nombreCorto(entrada.asignatura.id) || entrada.asignatura.nombre;
    item.appendChild(asig);
  }

  const titulo = document.createElement('span');
  titulo.className = 'semana__titulo';
  titulo.textContent = esExamen ? `Examen · ${entrada.titulo}` : entrada.titulo;
  item.appendChild(titulo);

  return item;
}

/* Los cinco días (lunes a viernes) de la semana en la que estamos, en
   formato ISO. Si hoy es domingo se enseña la semana que empieza al
   día siguiente, que es lo que le interesa a quien mira la web un
   domingo por la tarde. */
function _diasDeEstaSemana() {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 domingo … 6 sábado
  const haciaElLunes = diaSemana === 0 ? 1 : 1 - diaSemana;

  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + haciaElLunes);

  const dias = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);
    dias.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dias;
}

/* Todas las sesiones y exámenes con fecha dentro del rango, de todas
   las asignaturas que tengan calendario y (si van por grupos) grupo
   elegido. */
function _entradasDeLaSemana(desde, hasta) {
  const ritmo = window.calendarioRitmo;
  const entradas = [];

  ASIGNATURAS.forEach((asignatura, indice) => {
    if (!ritmo.listo(asignatura.id)) return;
    const datos = ritmo.datos(asignatura.id);
    if (!datos) return;
    const color = String(indice % 3);

    Object.keys(datos.sesiones || {}).forEach(idSesion => {
      const fecha = ritmo.fechaSesion(asignatura.id, idSesion);
      if (!fecha || fecha < desde || fecha > hasta) return;
      entradas.push({
        tipo: 'sesion',
        fecha,
        id: idSesion,
        titulo: datos.sesiones[idSesion].titulo || idSesion,
        asignatura,
        color,
      });
    });

    (datos.unidades || []).forEach(unidad => {
      const fecha = ritmo.fechaExamen(asignatura.id, unidad.id);
      if (!fecha || fecha < desde || fecha > hasta) return;
      entradas.push({
        tipo: 'examen',
        fecha,
        titulo: unidad.titulo,
        asignatura,
        color,
      });
    });
  });

  /* Los exámenes al final de su día: primero lo que se da y después lo
     que se examina. */
  return entradas.sort((a, b) =>
    a.fecha === b.fecha
      ? (a.tipo === b.tipo ? 0 : a.tipo === 'examen' ? 1 : -1)
      : (a.fecha < b.fecha ? -1 : 1)
  );
}

/* Asignaturas con calendario y varios grupos en las que el alumno aún
   no ha dicho cuál es el suyo: sin eso no hay fechas que enseñar, así
   que el bloque lo avisa en vez de callarse. */
function _asignaturasSinGrupo() {
  const ritmo = window.calendarioRitmo;
  return ASIGNATURAS.filter(a =>
    ritmo.datos(a.id) && ritmo.tieneGrupos(a.id) && !ritmo.grupoElegido(a.id)
  );
}
