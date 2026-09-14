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
    document.getElementById('tema-titulo').textContent = tema.titulo;
    document.getElementById('tema-descripcion').textContent = tema.descripcion || '';

    pintarLeccion(contenidoHtml);
    pintarMateriales(tema.materiales || []);
    /* El índice se arma ANTES de meter actividades dentro de la lección,
       para que los títulos de los ejercicios no salgan en "En esta página". */
    pintarIndicePagina();
    const yaColocadas = colocarActividadesEnLeccion(tema.actividades || []);
    pintarActividades((tema.actividades || []).filter(a => !yaColocadas.has(a)));

    /* La sesión se ha cargado por fetch, después de la primera pasada del
       traductor: hay que avisarle de que hay texto nuevo en pantalla. */
    if (typeof protegerCodigo === 'function') protegerCodigo(document.body);
    if (typeof retraducir === 'function') retraducir();
  } catch (error) {
    raiz.innerHTML = '<p class="vacio">No se ha podido cargar la sesión. Si estás probando el sitio en tu ordenador, recuerda abrirlo con un servidor local (ver README).</p>';
    console.error(error);
  }
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

/* Actividades dentro de la lección.

   Por defecto todas las actividades del json se pintan juntas al final,
   en la sección "Actividades". Pero muchas veces se aprende mejor si el
   ejercicio viene justo después de la explicación a la que corresponde.

   Para eso, en el .html de la sesión se deja un hueco:

       <div data-actividad="practica-decimal-binario"></div>

   y en el .json esa actividad lleva el mismo "id". La actividad se pinta
   en el hueco y deja de aparecer al final, así que no se duplica. Las que
   no tengan hueco siguen saliendo abajo, como siempre. */

function colocarActividadesEnLeccion(actividades) {
  const colocadas = new Set();
  const huecos = document.querySelectorAll('#leccion-contenido [data-actividad]');

  huecos.forEach(hueco => {
    const id = hueco.getAttribute('data-actividad');
    const actividad = actividades.find(a => a.id === id);
    if (!actividad) {
      console.warn(`No hay ninguna actividad con id "${id}" en el json de esta sesión.`);
      hueco.remove();
      return;
    }
    if (colocadas.has(actividad)) {
      console.warn(`La actividad "${id}" está pedida más de una vez; solo se pinta la primera.`);
      hueco.remove();
      return;
    }
    renderActividad(hueco, actividad);
    colocadas.add(actividad);
  });

  return colocadas;
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

function pintarActividades(actividades) {
  const seccion = document.getElementById('seccion-actividades');
  const contenedor = document.getElementById('lista-actividades');

  if (actividades.length === 0) {
    seccion.hidden = true;
    return;
  }

  actividades.forEach(actividad => renderActividad(contenedor, actividad));
}

function pintarIndicePagina() {
  const aside = document.getElementById('indice-pagina');
  if (!aside) return;

  const encabezados = document.querySelectorAll('#leccion-contenido h2:not(.actividad__titulo), #leccion-contenido h3:not(.actividad__titulo)');
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
