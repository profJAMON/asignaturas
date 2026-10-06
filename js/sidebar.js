/* Pinta la barra lateral (Temario), compartida por index.html,
   tema.html y calendario.html.

   Un solo nivel de desplegable:
     unidad  →  sesiones

   Solo enseña la asignatura en la que está el alumno. Antes enseñaba
   las tres, una dentro de otra, y eso tenía dos problemas: el árbol
   de dos niveles (asignatura → unidad → sesión) era demasiado para
   orientarse, y para saber cuál abrir había que descargar el
   curso.json de TODAS las asignaturas en cada página, aunque las
   otras dos estuvieran plegadas. Ahora se descarga uno.

   Para volver a elegir asignatura hay dos caminos: el enlace de
   arriba de esta misma barra y la marca de la barra superior
   (ver js/barra.js).

   idActivo:   id de la sesión que se está viendo (null en la portada).
   asigActiva: asignatura de la que hay que enseñar el temario. Si es
               null, se busca la que contiene la sesión activa; si
               tampoco la hay, la barra se queda vacía (es el caso de
               la portada general, donde además el CSS la esconde). */

async function cargarBarraLateral(idActivo, asigActiva) {
  const contenedor = document.getElementById('indice-temas');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  try {
    const asignatura = asigActiva || (idActivo ? await _asignaturaDeLaSesion(idActivo) : null);

    if (!asignatura) {
      _pintarCabecera(contenedor, null);
      return;
    }

    _pintarCabecera(contenedor, asignatura);

    const curso = await cargarCursoSeguro(asignatura);
    const unidades = curso.unidades || [];

    if (unidades.length === 0) {
      contenedor.insertAdjacentHTML('beforeend', '<p class="vacio">Todavía no hay unidades publicadas.</p>');
      return;
    }

    for (const unidad of unidades) {
      const sesiones = await cargarSesionesDeUnidad(asignatura, unidad);
      const contieneActiva = sesiones.some(s => s && s.id === idActivo);

      const detalles = document.createElement('details');
      detalles.className = 'unidad';
      if (contieneActiva) detalles.open = true;

      const resumenUnidad = document.createElement('summary');
      _pintarResumenUnidad(resumenUnidad, unidad, asignatura);
      detalles.appendChild(resumenUnidad);

      /* Las sesiones van dentro de un div y no sueltas dentro del
         <details> para poder animar el despliegue: la animación se
         aplica a este contenedor (ver .unidad__cuerpo en el CSS). */
      const cuerpo = document.createElement('div');
      cuerpo.className = 'unidad__cuerpo';

      sesiones.forEach(sesion => {
        if (!sesion) return;
        const enlace = document.createElement('a');
        enlace.href = urlSesion(sesion.id);
        enlace.className = 'sesion';
        _pintarTituloSesion(enlace, sesion.titulo);
        if (sesion.id === idActivo) enlace.classList.add('activa');
        /* Un punto si ya la ha abierto alguna vez. VISTA, no hecha:
           la web no sabe si ha trabajado la sesión. Ver js/progreso.js. */
        if (window.progreso && window.progreso.estaVisitada(sesion.id)) {
          enlace.classList.add('sesion--vista');
          /* El punto es decoración; para quien no lo ve, esto. */
          enlace.title = 'Ya has abierto esta sesión';
        }
        /* Fecha prevista (asignaturas con calendario, ver js/calendario.js).
           Si ese archivo no está cargado en esta página, no hace nada. */
        if (typeof decorarEnlaceSesion === 'function') decorarEnlaceSesion(enlace, asignatura, sesion.id);

        /* Al pasar por encima se va pidiendo la lección, que es lo
           único que le falta al navegador para pintarla. Cuando el
           alumno llega a pulsar, suele estar ya. Ver js/asignaturas.js. */
        const adelantar = () => adelantarCuerpoSesion(asignatura, unidad.id, sesion.id);
        enlace.addEventListener('pointerenter', adelantar, { once: true });
        enlace.addEventListener('focus', adelantar, { once: true });

        cuerpo.appendChild(enlace);
      });

      detalles.appendChild(cuerpo);
      contenedor.appendChild(detalles);
      /* Al desplegarla el alumno, la unidad sube arriba del menú para que
         vea sus sesiones (06/10/2026). Solo con clic o teclado, no con la
         apertura automática de la unidad de la sesión activa. */
      resumenUnidad.addEventListener('click', () => {
        requestAnimationFrame(() => { if (detalles.open) _subirUnidad(resumenUnidad); });
      });
    }

    /* El temario se ha construido por fetch: avisar al traductor. */
    if (typeof retraducir === 'function') retraducir();
  } catch (error) {
    contenedor.innerHTML = '<p class="vacio">No se ha podido cargar el temario.</p>';
    console.error(error);
  }
}

/* Sube la unidad recién desplegada al principio de lo que se ve.
   En escritorio el menú tiene su propio desplazamiento (.sidebar con
   overflow-y: auto): se mueve solo el menú, no la página. En móvil el
   menú va en la página, así que se mueve la página. */
function _subirUnidad(resumen) {
  const menu = resumen.closest('.sidebar');
  const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if (menu && menu.scrollHeight > menu.clientHeight && getComputedStyle(menu).overflowY !== 'visible') {
    const arriba = resumen.getBoundingClientRect().top - menu.getBoundingClientRect().top + menu.scrollTop - 12;
    menu.scrollTo({ top: arriba, behavior: suave });
  } else {
    resumen.scrollIntoView({ block: 'start', behavior: suave });
  }
}

/* El título de la unidad en el menú (03/10/2026): una etiqueta corta
   con el número ("U3") y el nombre en letra normal. Antes era
   "Unidad 3. Medios de transmisión: cobre" en negrita y ocupaba tres
   líneas. Lo que se quita de la vista ("Unidad 3. ") se queda para el
   lector de pantalla. Las unidades sin número llevan su dibujo. */
function _pintarResumenUnidad(resumen, unidad, asignatura) {
  const partes = typeof partirTituloUnidad === 'function'
    ? partirTituloUnidad(unidad.titulo)
    : { prefijo: '', corto: '', nombre: unidad.titulo };
  const chip = document.createElement('span');
  chip.className = 'unidad__chip';
  chip.setAttribute('aria-hidden', 'true');
  if (partes.corto) {
    chip.textContent = partes.corto;
    chip.setAttribute('translate', 'no');
  } else if (typeof iconoDeUnidad === 'function') {
    chip.innerHTML = iconoDeUnidad(unidad.id, asignatura.id);
    chip.classList.add('unidad__chip--icono');
  }
  const nombre = document.createElement('span');
  nombre.className = 'unidad__nombre';
  if (partes.prefijo) {
    const oculto = document.createElement('span');
    oculto.className = 'solo-lector';
    oculto.textContent = partes.prefijo;
    nombre.appendChild(oculto);
  }
  nombre.appendChild(document.createTextNode(partes.nombre));
  resumen.appendChild(chip);
  resumen.appendChild(nombre);
}

/* La sesión, con su número en un círculo y el nombre al lado. El
   círculo se rellena cuando ya la has abierto (ver .sesion--vista). */
function _pintarTituloSesion(enlace, titulo) {
  const partes = typeof partirTituloSesion === 'function'
    ? partirTituloSesion(titulo)
    : { prefijo: '', numero: '', nombre: titulo };
  const num = document.createElement('span');
  num.className = 'sesion__num';
  num.setAttribute('aria-hidden', 'true');
  num.setAttribute('translate', 'no');
  /* Sin número (un glosario, por ejemplo): un punto, para que el
     nombre quede alineado con el de las demás. */
  num.textContent = partes.numero || '·';
  const oculto = document.createElement('span');
  oculto.className = 'solo-lector';
  oculto.textContent = partes.prefijo;
  if (!partes.prefijo) oculto.hidden = true;
  const nombre = document.createElement('span');
  nombre.className = 'sesion__nombre';
  nombre.textContent = partes.nombre;
  enlace.classList.add('sesion--con-numero');
  enlace.append(num, oculto, nombre);
}

/* La cabecera de la barra: en qué asignatura estás y cómo salir de
   ella. El enlace de salir va con palabras a propósito: la marca de
   la barra de arriba hace lo mismo, pero no todo el mundo adivina que
   "~/proyecto" se puede pulsar. */
function _pintarCabecera(contenedor, asignatura) {
  const caja = document.createElement('div');
  caja.className = 'sidebar__asignatura';

  if (!asignatura) {
    /* Portada general: no hay temario que enseñar. El CSS esconde la
       barra entera, así que esto casi nunca se ve; está por si alguien
       llega con una URL rara. */
    caja.innerHTML = '<p class="vacio">Elige una asignatura para ver su temario.</p>';
    contenedor.appendChild(caja);
    return;
  }

  const nombre = document.createElement('p');
  nombre.className = 'sidebar__asignatura-nombre';
  nombre.textContent = asignatura.nombre;

  const cambiar = document.createElement('a');
  cambiar.className = 'sidebar__cambiar';
  cambiar.href = 'index.html';
  cambiar.textContent = '← Cambiar de asignatura';

  caja.appendChild(nombre);
  caja.appendChild(cambiar);
  contenedor.appendChild(caja);
}

/* En qué asignatura vive una sesión. Solo hace falta cuando se llega a
   tema.html?id=... sin ?a=, que es lo normal: los enlaces que se dan a
   los alumnos no llevan la asignatura. Para en la primera que la
   contiene, así que en el caso corriente descarga un solo curso. */
async function _asignaturaDeLaSesion(idSesion) {
  for (const asignatura of ASIGNATURAS) {
    const curso = await cargarCursoSeguro(asignatura);
    const estaAqui = (curso.unidades || []).some(u => (u.sesiones || []).includes(idSesion));
    if (estaAqui) return asignatura;
  }
  return null;
}
