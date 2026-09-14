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
    cargarUnidades(_asignaturaPortada);
  } else {
    pintarCabecera(
      'Material de clase',
      'Apuntes y Actividades',
      'Elige la asignatura con la que quieres trabajar.',
      false
    );
    pintarAsignaturas();
  }
}

function pintarCabecera(badge, titulo, descripcion, conVolver) {
  const elBadge = document.getElementById('portada-badge');
  const elTitulo = document.getElementById('portada-titulo');
  const elDesc = document.getElementById('portada-descripcion');
  const elVolver = document.getElementById('portada-volver');

  if (elBadge) elBadge.textContent = badge;
  if (elTitulo) elTitulo.textContent = titulo;
  if (elDesc) elDesc.textContent = descripcion;
  if (elVolver) elVolver.hidden = !conVolver;

  document.title = conVolver ? `${badge} · Material de clase` : 'Material de clase';
}

/* ---------- Estado 1: elegir asignatura ---------- */

function pintarAsignaturas() {
  const contenedor = document.getElementById('indice-portada');
  if (!contenedor) return;

  ASIGNATURAS.forEach(async asignatura => {
    const tarjeta = document.createElement('a');
    tarjeta.className = 'asignatura-card';
    tarjeta.href = urlPortadaAsignatura(asignatura);

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
