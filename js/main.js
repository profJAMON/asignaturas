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
    pintarContinuar();
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
   Bloque "Sigue donde lo dejaste"
   ============================================================
   Solo en la portada general. Si el alumno no ha abierto nunca una
   sesión en este navegador, no aparece nada: más vale un bloque menos
   que un bloque vacío. */

function pintarContinuar() {
  const caja = document.getElementById('portada-continuar');
  if (!caja) return;

  const ultima = leerUltimaSesion();
  if (!ultima) return;

  const asignatura = asignaturaPorId(ultima.asignatura);

  const enlace = document.createElement('a');
  enlace.className = 'continuar';
  /* Con ?a= además de ?id=: así la sesión se localiza a la primera,
     sin recorrer las demás asignaturas. */
  enlace.href = `${urlSesion(ultima.id)}&a=${encodeURIComponent(asignatura.id)}`;

  const etiqueta = document.createElement('p');
  etiqueta.className = 'continuar__etiqueta';
  etiqueta.textContent = 'Sigue donde lo dejaste';

  const titulo = document.createElement('p');
  titulo.className = 'continuar__titulo';
  titulo.textContent = ultima.titulo;

  const pie = document.createElement('p');
  pie.className = 'continuar__pie';
  pie.textContent = ultima.unidad
    ? `${asignatura.nombre} · ${ultima.unidad}`
    : asignatura.nombre;

  enlace.appendChild(etiqueta);
  enlace.appendChild(titulo);
  enlace.appendChild(pie);
  caja.appendChild(enlace);
  caja.hidden = false;
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

  if (entradas.length === 0 && avisos.length === 0) {
    _pintarSemanaVacia(caja);
    return;
  }

  const titulo = document.createElement('h2');
  titulo.className = 'seccion__titulo';
  titulo.textContent = 'Esta semana';
  caja.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'semana';

  dias.forEach(iso => {
    const delDia = entradas.filter(e => e.fecha === iso);
    if (delDia.length === 0) return;

    const bloque = document.createElement('div');
    bloque.className = 'semana__dia';
    if (iso === window.calendarioRitmo.hoyIso()) bloque.classList.add('semana__dia--hoy');

    const fecha = document.createElement('p');
    fecha.className = 'semana__fecha';
    fecha.textContent = window.calendarioRitmo.formatearFecha(iso);
    bloque.appendChild(fecha);

    const items = document.createElement('div');
    items.className = 'semana__items';
    delDia.forEach(entrada => items.appendChild(_crearItemSemana(entrada)));

    bloque.appendChild(items);
    lista.appendChild(bloque);
  });

  if (entradas.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.textContent = 'Esta semana no hay sesiones previstas.';
    lista.appendChild(vacio);
  }

  caja.appendChild(lista);

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

function _pintarSemanaVacia(caja) {
  const titulo = document.createElement('h2');
  titulo.className = 'seccion__titulo';
  titulo.textContent = 'Esta semana';
  const texto = document.createElement('p');
  texto.className = 'vacio';
  texto.textContent = 'Esta semana no hay clase prevista.';
  caja.appendChild(titulo);
  caja.appendChild(texto);
  caja.hidden = false;
}

function _crearItemSemana(entrada) {
  const esExamen = entrada.tipo === 'examen';
  const item = document.createElement(esExamen ? 'div' : 'a');
  item.className = esExamen ? 'semana__item semana__item--examen' : 'semana__item';
  item.dataset.color = entrada.color;
  if (!esExamen) item.href = `${urlSesion(entrada.id)}&a=${encodeURIComponent(entrada.asignatura.id)}`;

  const asig = document.createElement('span');
  asig.className = 'semana__asignatura';
  asig.textContent = window.calendarioRitmo.nombreCorto(entrada.asignatura.id) || entrada.asignatura.nombre;

  const titulo = document.createElement('span');
  titulo.className = 'semana__titulo';
  titulo.textContent = esExamen ? `Examen · ${entrada.titulo}` : entrada.titulo;

  item.appendChild(asig);
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
