/* Pinta tema.html a partir del parámetro ?id=.
   1. Pinta la barra lateral (Temario), marcando esta sesión como activa.
   2. Busca en data/curso.json a qué unidad pertenece.
   3. Carga los datos desde data/unidades/<unidad>/<id>.json.
   4. El contenido de la lección vive en un archivo .html hermano
      (data/unidades/<unidad>/<id>.html) — así se puede editar como HTML
      normal, con saltos de línea reales. Si ese archivo no existe,
      se usa el campo "contenido" del json como respaldo (formato antiguo).
   5. Agrupa cada h3 y su contenido en un contenedor "subseccion" (sangría visual).
   6. Genera el índice "En esta página" a partir de los h2/h3 del contenido. */

const ICONOS = { pdf: 'PDF', enlace: 'WEB', video: 'VID' };

async function cargarTema() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const raiz = document.getElementById('tema-raiz');

  if (!id) {
    cargarBarraLateral(null, asignaturaDeLaUrl());
    raiz.innerHTML = '<p class="vacio">No se ha especificado ninguna sesión.</p>';
    return;
  }

  try {
    /* La sesión puede ser de cualquier asignatura: se busca en todas,
       así los enlaces antiguos (sin ?a=) siguen funcionando. */
    const ubicacion = await localizarSesion(id, asignaturaDeLaUrl());

    if (!ubicacion) {
      cargarBarraLateral(null, asignaturaDeLaUrl());
      raiz.innerHTML = '<p class="vacio">No se ha encontrado esta sesión.</p>';
      return;
    }

    const { asignatura, unidad: unidadDeLaSesion } = ubicacion;
    cargarBarraLateral(id, asignatura);

    /* Ahora ya se sabe de qué asignatura es esta sesión, así que la
       barra de arriba puede dejar de enseñar la versión neutra.
       Ver js/barra.js. */
    if (typeof pintarBarra === 'function') pintarBarra(asignatura);

    const enlaceVolver = document.getElementById('tema-volver');
    if (enlaceVolver) {
      enlaceVolver.href = urlPortadaAsignatura(asignatura);
      enlaceVolver.textContent = `← ${asignatura.nombre}`;
    }

    const sesionResp = await fetch(rutaSesionJson(asignatura, unidadDeLaSesion.id, id));

    if (!sesionResp.ok) {
      raiz.innerHTML = '<p class="vacio">No se ha encontrado esta sesión.</p>';
      return;
    }
    const tema = await sesionResp.json();

    let contenidoHtml = tema.contenido || '';
    if (!contenidoHtml) {
      // Formato nuevo: el contenido vive en un archivo .html hermano del .json.
      const leccionResp = await fetch(rutaSesionHtml(asignatura, unidadDeLaSesion.id, id));
      if (leccionResp.ok) contenidoHtml = await leccionResp.text();
    }

    document.title = `${tema.titulo} · ${asignatura.nombre}`;
    document.getElementById('tema-unidad').textContent = unidadDeLaSesion.titulo;
    document.getElementById('tema-titulo').textContent = pintarCabeceraSesion(tema.titulo);
    document.getElementById('tema-descripcion').textContent = tema.descripcion || '';

    /* Para el "sigue donde lo dejaste" de la portada general.
       Ver js/asignaturas.js y js/main.js. */
    guardarUltimaSesion({
      id,
      titulo: tema.titulo,
      asignatura: asignatura.id,
      unidad: unidadDeLaSesion.titulo,
      /* El día, para poder decir "lo dejaste aquí el jueves". Se guarda
         en ISO local, no con toISOString(), que se va a UTC y de noche
         cambia de día. */
      fecha: typeof calendarioRitmo !== 'undefined' && calendarioRitmo
        ? calendarioRitmo.hoyIso()
        : null,
    });

    /* Qué sesión es esta, a la vista de todos. Lo usan las actividades
       para recordar lo contestado (ver js/actividades.js) y el resto
       de este archivo. */
    window.SESION_ACTUAL = id;

    pintarLeccion(contenidoHtml);
    pintarMateriales(tema.materiales || []);
    pintarActividades(tema.actividades || []);
    pintarIndicePagina();

    /* Por aquí ya pasó. Se marca al abrirla, no al terminarla: la web
       no sabe cuándo se ha terminado una sesión. Ver js/progreso.js. */
    if (window.progreso) window.progreso.marcarVisitada(id);

    /* El pie con la anterior y la siguiente, y la oferta de volver
       donde lo dejó. Los dos van al final a propósito: necesitan la
       página ya montada para medirla. */
    await pintarPasos(asignatura, id);
    vigilarLectura(id);

    /* Fecha prevista de esta sesión (asignaturas con calendario, ver js/calendario.js).
       Si ese archivo no está cargado en esta página, no hace nada. */
    /* El selector 1r/2n vive en la cabecera de la asignatura, no en la
       barra lateral: solo se pinta si ESTA asignatura tiene grupos. */
    if (typeof pintarSelectorGrupo === 'function') pintarSelectorGrupo(asignatura.id);
    if (typeof pintarFechaPrevista === 'function') {
      pintarFechaPrevista(asignatura.id, id, unidadDeLaSesion.id);
    }

    /* La sesión se ha cargado por fetch, después de la primera pasada del
       traductor: hay que avisarle de que hay texto nuevo en pantalla. */
    if (typeof protegerCodigo === 'function') protegerCodigo(document.body);
    if (typeof retraducir === 'function') retraducir();
  } catch (error) {
    raiz.innerHTML = '<p class="vacio">No se ha podido cargar la sesión. Si estás probando el sitio en tu ordenador, recuerda abrirlo con un servidor local (ver README).</p>';
    console.error(error);
  }
}

/* La cabecera de la sesión: el número grande y el título ya sin él.

   El número sale del TÍTULO, no del id. Es la única fuente que sirve
   para las tres asignaturas: los id de instalaciones van por unidad
   ("inst-u4-hoja-practica") y no llevan el número de sesión, pero el
   título sí ("Sesión 5 — Práctica en papel"). Conviven dos maneras de
   escribirlo ("Sesión 5 — ..." y "Sesión 1. ..."), así que el
   separador puede ser raya, guion, punto o dos puntos.

   Lo que no empieza así (glosarios, "Formas de evaluar", "Cómo se
   evalúa") se queda sin número: se esconde el hueco y el título se
   pinta entero, que es como estaba antes.

   Devuelve el título que hay que enseñar. */
function pintarCabeceraSesion(titulo) {
  const caja = document.getElementById('tema-numero');
  const cifra = document.getElementById('tema-numero-cifra');
  const texto = titulo || '';
  const encontrado = /^sesi[oó]n\s*(\d+[a-z]?)\s*[—–\-.:]\s*(.+)$/i.exec(texto.trim());

  if (!caja || !cifra) return texto;

  if (!encontrado) {
    caja.hidden = true;
    return texto;
  }

  /* Un solo dígito se escribe con cero delante ("05"), que en
     monoespaciada queda mucho mejor que un "5" suelto. */
  const numero = encontrado[1];
  cifra.textContent = numero.length === 1 ? `0${numero}` : numero;
  caja.hidden = false;

  /* El título pierde su "Sesión 5 —" para no decir dos veces lo mismo
     al lado del número. En la pestaña del navegador se queda entero. */
  return encontrado[2];
}

function pintarLeccion(contenidoHtml) {
  if (!contenidoHtml) return;
  const contenedor = document.getElementById('leccion-contenido');
  contenedor.innerHTML = contenidoHtml;
  agruparSubsecciones(contenedor);
  /* Marca código y salidas como no traducibles ANTES de que el traductor
     automático vea el contenido recién insertado. Ver js/idioma.js. */
  if (typeof protegerCodigo === 'function') protegerCodigo(contenedor);
  document.getElementById('seccion-leccion').hidden = false;
}

function agruparSubsecciones(raiz) {
  let grupoActual = null;
  Array.from(raiz.children).forEach(nodo => {
    if (nodo.tagName === 'H3') {
      grupoActual = document.createElement('div');
      grupoActual.className = 'subseccion';
      nodo.parentNode.insertBefore(grupoActual, nodo);
      grupoActual.appendChild(nodo);
    } else if (nodo.tagName === 'H2') {
      grupoActual = null;
    } else if (grupoActual) {
      grupoActual.appendChild(nodo);
    }
  });
}

function pintarMateriales(materiales) {
  const seccion = document.getElementById('seccion-materiales');
  const lista = document.getElementById('lista-materiales');

  if (materiales.length === 0) {
    seccion.hidden = true;
    return;
  }

  materiales.forEach(m => {
    const item = document.createElement('li');
    const enlace = document.createElement('a');
    enlace.className = 'material';
    enlace.href = m.url;
    enlace.target = '_blank';
    enlace.rel = 'noopener';

    const icono = document.createElement('span');
    icono.className = 'material__icono';
    icono.textContent = ICONOS[m.tipo] || 'DOC';

    const titulo = document.createElement('span');
    titulo.className = 'material__titulo';
    titulo.textContent = m.titulo;

    enlace.appendChild(icono);
    enlace.appendChild(titulo);
    item.appendChild(enlace);
    lista.appendChild(item);
  });
}

/* Coloca cada actividad en su sitio.

   Una actividad puede ir PEGADA al punto de la lección al que
   pertenece, en vez de amontonada al final. Para eso el .html de la
   sesión deja un hueco donde la quiere:

     <div data-actividad="practica-cidr"></div>

   y el .json le pone ese mismo id a la actividad:

     { "id": "practica-cidr", "tipo": "generador", ... }

   Si el id casa, la actividad se pinta ahí dentro. Si la actividad no
   lleva id, o su hueco no existe (por ejemplo porque se editó el json
   y no el html), cae al bloque "Actividades" del final: nunca se pierde
   una actividad por un id mal escrito.

   Los huecos que se queden sin actividad se borran, para no dejar un
   agujero en medio del texto. */
function pintarActividades(actividades) {
  const seccion = document.getElementById('seccion-actividades');
  const contenedor = document.getElementById('lista-actividades');
  const leccion = document.getElementById('leccion-contenido');

  let alFinal = 0;

  actividades.forEach((actividad, indice) => {
    /* Con qué nombre se recuerda lo contestado en esta actividad.
       No vale usar "id" a secas: muchas actividades no lo llevan (solo
       lo necesitan las que van incrustadas en la lección), y entonces
       dos tests de la misma sesión compartirían sitio y se pisarían
       las respuestas. La posición dentro del json sirve de apaño y es
       estable mientras no se reordene la sesión. */
    actividad._clave = actividad.id || `act-${indice}`;

    const hueco = actividad.id && leccion
      ? leccion.querySelector(`[data-actividad="${CSS.escape(actividad.id)}"]`)
      : null;

    if (hueco) {
      hueco.classList.add('actividad-incrustada');
      renderActividad(hueco, actividad);
    } else {
      renderActividad(contenedor, actividad);
      alFinal++;
    }
  });

  /* Huecos que han quedado vacíos: sobran. */
  if (leccion) {
    leccion.querySelectorAll('[data-actividad]').forEach(hueco => {
      if (hueco.children.length === 0) hueco.remove();
    });
  }

  /* La sección del final solo se enseña si algo ha caído en ella. */
  seccion.hidden = alFinal === 0;
}

/* ============================================================
   Anterior y siguiente
   ============================================================
   Al acabar una sesión el alumno se quedaba sin salida: volver al
   menú y acordarse de cuál tocaba. Ahora el pie lleva las dos, con
   su título de verdad ("Siguiente: Modelo de caja"), porque "→
   Siguiente" a secas no dice a dónde se va.

   La lista va de corrido por TODO el temario, no por unidad: la
   siguiente sesión de la última de una unidad es la primera de la
   siguiente, que es como se dan las clases.
   ============================================================ */

async function pintarPasos(asignatura, idActual) {
  const raiz = document.getElementById('tema-raiz');
  const pie = raiz ? raiz.querySelector('.pie') : null;
  if (!raiz) return;

  let todas;
  try {
    todas = await cargarSesionesDeAsignatura(asignatura);
  } catch (e) {
    return; // sin lista no hay pie; no es motivo para romper la sesión
  }

  const donde = todas.findIndex(e => e.sesion.id === idActual);
  if (donde === -1) return;

  const anterior = todas[donde - 1];
  const siguiente = todas[donde + 1];

  const caja = document.createElement('nav');
  caja.className = 'pasos';
  caja.setAttribute('aria-label', 'Sesión anterior y siguiente');

  if (anterior) caja.appendChild(crearPaso('Anterior', anterior, 'anterior'));
  if (siguiente) caja.appendChild(crearPaso('Siguiente', siguiente, 'siguiente'));

  if (!anterior && !siguiente) return;

  /* Última del temario: decirlo, en vez de dejar media fila vacía que
     parece que falta algo. */
  if (!siguiente) {
    const fin = document.createElement('p');
    fin.className = 'pasos__fin';
    fin.textContent = 'Es la última sesión publicada de esta asignatura.';
    caja.appendChild(fin);
  }

  if (pie) raiz.insertBefore(caja, pie);
  else raiz.appendChild(caja);

  if (typeof retraducir === 'function') retraducir();
}

function crearPaso(etiqueta, entrada, clase) {
  const enlace = document.createElement('a');
  enlace.className = `paso paso--${clase}`;
  enlace.href = `${urlSesion(entrada.sesion.id)}&a=${encodeURIComponent(entrada.asignatura.id)}`;

  const cual = document.createElement('span');
  cual.className = 'paso__cual';
  cual.textContent = etiqueta;

  const titulo = document.createElement('span');
  titulo.className = 'paso__titulo';
  titulo.textContent = entrada.sesion.titulo || entrada.sesion.id;

  const unidad = document.createElement('span');
  unidad.className = 'paso__unidad';
  unidad.textContent = entrada.unidad.titulo || '';

  enlace.appendChild(cual);
  enlace.appendChild(titulo);
  enlace.appendChild(unidad);
  return enlace;
}

/* ============================================================
   Por dónde iba
   ============================================================
   Se guarda cuánto ha bajado y, al volver, se OFRECE seguir por ahí.
   No se salta solo: una página que se mueve sola nada más cargar
   parece rota, y además pelearía con los enlaces del índice "En esta
   página" cuando se llega con un #ancla.
   ============================================================ */

function vigilarLectura(id) {
  if (!window.progreso) return;

  const guardado = window.progreso.leerLectura(id);
  /* Con un #ancla en la URL el alumno ya ha dicho a dónde quiere ir. */
  if (guardado && !window.location.hash) ofrecerRetomar(id, guardado);

  /* El scroll dispara muchísimo; se apunta la posición y se guarda una
     vez cada segundo y medio, no en cada píxel. */
  let pendiente = null;
  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = setTimeout(() => {
      pendiente = null;
      window.progreso.guardarLectura(id, window.scrollY);
    }, 1500);
  }, { passive: true });

  /* Al salir, la última posición buena. */
  window.addEventListener('pagehide', () => {
    window.progreso.guardarLectura(id, window.scrollY);
  });
}

function ofrecerRetomar(id, y) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'retomar';
  boton.textContent = '↓ Seguías por aquí';

  let fuera = null;
  function quitar() {
    clearTimeout(fuera);
    boton.remove();
  }

  boton.addEventListener('click', () => {
    /* 'instant' y no 'smooth': con el scroll suave del sitio, bajar
       3000 px tarda segundos y parece que se ha colgado. */
    window.scrollTo({ top: y, behavior: 'instant' });
    quitar();
  });

  /* Si el alumno ya se ha puesto a bajar por su cuenta, la oferta
     sobra: sabe dónde está. */
  window.addEventListener('scroll', () => {
    if (Math.abs(window.scrollY - y) < 300 || window.scrollY > y) quitar();
  }, { passive: true, once: false });

  fuera = setTimeout(quitar, 12000);
  document.body.appendChild(boton);
}

function pintarIndicePagina() {
  const aside = document.getElementById('indice-pagina');
  if (!aside) return;

  /* Se excluye el h3 que renderActividad pone como título de cada
     actividad incrustada: el índice es el mapa de la lección, y si
     entraran las actividades una sesión como inst-u1-ip sumaría cinco
     entradas que no son secciones. */
  const encabezados = document.querySelectorAll(
    '#leccion-contenido h2:not(.actividad__titulo), #leccion-contenido h3:not(.actividad__titulo)'
  );
  if (encabezados.length === 0) {
    aside.hidden = true;
    return;
  }

  const titulo = document.createElement('p');
  titulo.className = 'indice__titulo';
  titulo.textContent = 'En esta página';
  aside.appendChild(titulo);

  encabezados.forEach((h, i) => {
    if (!h.id) h.id = `seccion-${i}`;
    const enlace = document.createElement('a');
    enlace.href = `#${h.id}`;
    enlace.textContent = h.textContent;
    if (h.tagName === 'H3') enlace.classList.add('indice__sub');
    aside.appendChild(enlace);
  });
}

cargarTema();
