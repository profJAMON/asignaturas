/* Pinta tema.html a partir del parámetro ?id=.
   1. Pinta la barra lateral (Temario), marcando esta sesión como activa.
   2. Busca en data/curso.json a qué unidad pertenece.
   3. Carga los datos desde data/unidades/<unidad>/<id>.json.
   4. El contenido de la lección vive en un archivo .html hermano
      (data/unidades/<unidad>/<id>.html) — así se puede editar como HTML
      normal, con saltos de línea reales. Si ese archivo no existe,
      se usa el campo "contenido" del json como respaldo (formato antiguo).
   5. Agrupa cada h3 y su contenido en un contenedor "subseccion" (sangría visual).
   6. Genera el índice "En esta página" a partir de los h2/h3 del contenido.
   7. Al final, botones de sesión anterior / siguiente dentro de la misma
      asignatura (cruzan de unidad si hace falta). */

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
    pintarActividades(tema.actividades || []);
    pintarIndicePagina();
    pintarNavegacionSesiones(asignatura, id);

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

  const encabezados = document.querySelectorAll('#leccion-contenido h2, #leccion-contenido h3');
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

/* Botones "anterior / siguiente" al final de la sesión.
   Recorre todas las sesiones de la asignatura en orden (unidad a unidad),
   así desde la última sesión de una unidad se pasa a la primera de la
   siguiente. Si una sesión del curso no existe (404), se salta y se prueba
   la de más allá, para no dejar al alumno en un enlace roto. */
async function pintarNavegacionSesiones(asignatura, sesionId) {
  const nav = document.getElementById('nav-sesiones');
  if (!nav) return;

  try {
    const curso = await cargarCursoSeguro(asignatura);
    const lista = [];
    (curso.unidades || []).forEach(u =>
      (u.sesiones || []).forEach(s => lista.push({ id: s, unidad: u }))
    );

    const pos = lista.findIndex(s => s.id === sesionId);
    if (pos === -1) return;
    const unidadActual = lista[pos].unidad;

    async function buscar(paso) {
      for (let i = pos + paso; i >= 0 && i < lista.length; i += paso) {
        const s = lista[i];
        try {
          const r = await fetch(rutaSesionJson(asignatura, s.unidad.id, s.id));
          if (r.ok) return { ...s, datos: await r.json() };
        } catch (e) { /* se salta y se prueba la siguiente */ }
      }
      return null;
    }

    const [anterior, siguiente] = await Promise.all([buscar(-1), buscar(1)]);
    if (!anterior && !siguiente) return;

    function crearEnlace(s, tipo) {
      if (!s) {
        const hueco = document.createElement('span');
        hueco.className = 'nav-sesiones__hueco';
        hueco.setAttribute('aria-hidden', 'true');
        return hueco;
      }
      const a = document.createElement('a');
      a.className = `nav-sesiones__enlace nav-sesiones__enlace--${tipo}`;
      a.href = urlSesion(s.id);
      a.rel = tipo === 'anterior' ? 'prev' : 'next';

      const etiqueta = document.createElement('span');
      etiqueta.className = 'nav-sesiones__etiqueta';
      let texto = tipo === 'anterior' ? '← Anterior' : 'Siguiente →';
      /* Si se cambia de unidad, se avisa para que no pille por sorpresa. */
      if (s.unidad !== unidadActual) texto += ` · ${s.unidad.titulo}`;
      etiqueta.textContent = texto;

      const titulo = document.createElement('span');
      titulo.className = 'nav-sesiones__titulo';
      titulo.textContent = (s.datos && s.datos.titulo) || s.id;

      a.appendChild(etiqueta);
      a.appendChild(titulo);
      return a;
    }

    nav.appendChild(crearEnlace(anterior, 'anterior'));
    nav.appendChild(crearEnlace(siguiente, 'siguiente'));
    nav.hidden = false;
    if (typeof retraducir === 'function') retraducir();
  } catch (error) {
    console.error(error);
  }
}

cargarTema();
