/* ============================================================
   Asignaturas del sitio.

   La web aloja más de una asignatura. Cada una tiene su propio
  archivo de curso y su propia carpeta de unidades, a propósito:
   si un archivo se rompe, solo cae esa asignatura y la otra sigue
   funcionando.

   Para añadir una asignatura nueva:
   1. Crea data/curso-<loquesea>.json con { "unidades": [...] }
   2. Crea su carpeta de unidades (la que indiques en "base")
   3. Añade aquí su objeto. Nada más.

   Importante: los id de sesión tienen que ser únicos en TODO el
   sitio, no solo dentro de su asignatura, porque tema.html?id=
   los busca en todas. Por eso las sesiones de instalaciones
   empiezan por "inst-" y las de proyecto por "proy-".
   ============================================================ */

const ASIGNATURAS = [
  {
    id: 'operaciones',
    nombre: 'Operaciones Básicas',
    /* Nombre corto, para donde no cabe el largo (botones Continuar). */
    corto: 'Operaciones',
    descripcion: 'Aprendes a manejar el ordenador, cómo funciona Internet por dentro y los sistemas operativos, y al final creas tu propia web con HTML y CSS.',
    curso: 'data/curso-operaciones.json',
    base: 'data/operaciones'
  },
  {
    id: 'instalaciones',
    nombre: 'Instalación y mantenimiento de redes',
    corto: 'Instalaciones',
    descripcion: 'Cómo se monta la red de una oficina: cables, dispositivos, direcciones y seguridad en el taller.',
    curso: 'data/curso-instalaciones.json',
    base: 'data/instalaciones'
  },
  {
    id: 'proyecto',
    nombre: 'Proyecto Intermodular',
    corto: 'Proyecto',
    descripcion: 'Construyes y publicas una web por parejas con HTML, CSS y JavaScript, conectando lo aprendido en las demás asignaturas.',
    curso: 'data/curso-proyecto.json',
    base: 'data/proyecto'
  }
];

const ASIGNATURA_POR_DEFECTO = 'operaciones';

/* ============================================================
   Caché de la página
   ============================================================
   Se guarda la PROMESA, no el resultado. La diferencia importa: en
   index.html?a=<id> el listado de unidades y la barra lateral
   arrancan a la vez y piden lo mismo, y si se guardara solo el
   resultado ninguna de las dos lo encontraría todavía puesto y las
   dos lanzarían su petición. Guardando la promesa, la segunda se
   engancha a la que ya está en marcha.

   Medido antes de esto: esa página hacía 63 peticiones a /data/, de
   las que 30 eran el mismo archivo pedido dos veces (las 29 sesiones
   de la asignatura, una vez para el listado y otra para el menú, más
   el propio curso.json). Ahora hace 33.

   Dura lo que la página: al navegar se vacía sola. De la caché entre
   visitas ya se ocupa el navegador.
   ============================================================ */

const _cursosCargados = {};
const _sesionesCargadas = {};

function asignaturaPorId(id) {
  return ASIGNATURAS.find(a => a.id === id) || null;
}

/* El color de una asignatura: su posición en la lista entre 3, igual
   que las tarjetas de la portada (js/main.js). Lo usa también la barra
   superior para teñir toda la página del color de la asignatura
   abierta, así que la tarjeta y la página que abre son del mismo color. */
function colorDeAsignatura(asignatura) {
  const indice = ASIGNATURAS.findIndex(a => a.id === asignatura.id);
  return String(Math.max(indice, 0) % 3);
}

/* Lee ?a=... de la URL. Si no viene o no existe, devuelve null. */
function asignaturaDeLaUrl() {
  const params = new URLSearchParams(window.location.search);
  return asignaturaPorId(params.get('a'));
}

function cargarCurso(asignatura) {
  if (!_cursosCargados[asignatura.id]) {
    _cursosCargados[asignatura.id] = fetch(asignatura.curso)
      .then(resp => {
        if (!resp.ok) throw new Error(`No se ha podido cargar ${asignatura.curso}`);
        return resp.json();
      })
      .catch(error => {
        /* Una petición fallida no se queda guardada: si el alumno
           estaba sin cobertura un momento, el siguiente intento tiene
           que volver a pedirla de verdad. */
        delete _cursosCargados[asignatura.id];
        throw error;
      });
  }
  return _cursosCargados[asignatura.id];
}

/* Igual que cargarCurso pero sin lanzar error: si una asignatura
   tiene el json roto, devuelve una lista vacía y el resto del sitio
   sigue funcionando. */
async function cargarCursoSeguro(asignatura) {
  try {
    return await cargarCurso(asignatura);
  } catch (error) {
    console.error(`Asignatura "${asignatura.id}": ${error.message}`);
    return { unidades: [] };
  }
}

function rutaSesionJson(asignatura, unidadId, sesionId) {
  return `${asignatura.base}/${unidadId}/${sesionId}.json`;
}

function rutaSesionHtml(asignatura, unidadId, sesionId) {
  return `${asignatura.base}/${unidadId}/${sesionId}.html`;
}

/* ============================================================
   Adelantar el cuerpo de una sesión
   ============================================================
   Al pasar por encima de un enlace de sesión se va pidiendo su .html.
   Es lo ÚNICO que le falta al navegador para pintarla: el .json ya se
   descargó al montar el menú, y la hoja de estilos y los scripts
   están en caché desde la primera página.

   No se guarda nada aquí: al pulsar se cambia de documento y esta
   memoria se pierde. Lo que queda es la caché HTTP del navegador, que
   es justo lo que se está calentando.

   Se hace en el hover, y no al cargar la página, para no pedir de
   golpe las 29 lecciones de una asignatura: desde una conexión de
   móvil eso es peor que la espera que se quería evitar. */

const _cuerposPedidos = new Set();

function adelantarCuerpoSesion(asignatura, unidadId, sesionId) {
  const url = rutaSesionHtml(asignatura, unidadId, sesionId);
  if (_cuerposPedidos.has(url)) return;
  _cuerposPedidos.add(url);
  /* Sin await y con el error tragado: esto es un lujo, no una
     dependencia. Si falla, la sesión se abre como siempre. */
  fetch(url).catch(() => {});
}

function urlPortadaAsignatura(asignatura) {
  return `index.html?a=${encodeURIComponent(asignatura.id)}`;
}

function urlSesion(sesionId) {
  return `tema.html?id=${encodeURIComponent(sesionId)}`;
}

/* ============================================================
   La última sesión abierta, UNA POR ASIGNATURA
   ============================================================
   La guarda tema.js al abrir una sesión. La leen la portada general
   (una línea por asignatura en la terminal) y la portada de cada
   asignatura (su propio "Continuar"). Vive aquí porque es el único
   archivo que cargan las tres páginas.

   Desde el 04/10/2026 se guarda una por asignatura: los grupos llevan
   dos asignaturas a la vez (un día una, al siguiente la otra) y con
   una sola se pisaban.

   Formato de ob-ultimas-sesiones:
     { "<id asignatura>": { id, titulo, unidad, fecha, t }, ... }
   t = Date.now(), solo para ordenar las de un mismo día.

   La clave antigua ob-ultima-sesion (una sola sesión) se lee una vez
   para no perder lo que ya tenía el alumno, y se borra.

   Misma convención que el resto de lo que se recuerda del alumno:
   prefijo "ob-" y todo envuelto en try/catch, porque en modo incógnito
   o con las cookies bloqueadas localStorage lanza excepción y la web
   tiene que seguir funcionando igual.
   ============================================================ */

const CLAVE_ULTIMAS_SESIONES = 'ob-ultimas-sesiones';
const CLAVE_ULTIMA_SESION_ANTIGUA = 'ob-ultima-sesion';

function _leerMapaUltimas() {
  let mapa = {};
  try {
    const crudo = localStorage.getItem(CLAVE_ULTIMAS_SESIONES);
    if (crudo) mapa = JSON.parse(crudo) || {};
    const antiguo = localStorage.getItem(CLAVE_ULTIMA_SESION_ANTIGUA);
    if (antiguo) {
      const viejo = JSON.parse(antiguo);
      if (viejo && viejo.asignatura && viejo.id && !mapa[viejo.asignatura]) {
        const { asignatura, ...resto } = viejo;
        mapa[asignatura] = { ...resto, t: 0 };
      }
      localStorage.removeItem(CLAVE_ULTIMA_SESION_ANTIGUA);
      localStorage.setItem(CLAVE_ULTIMAS_SESIONES, JSON.stringify(mapa));
    }
  } catch (e) { /* sin memoria, pero funciona */ }
  return (mapa && typeof mapa === 'object') ? mapa : {};
}

/* datos = { id, titulo, asignatura, unidad, fecha } */
function guardarUltimaSesion(datos) {
  if (!datos || !datos.asignatura) return;
  try {
    const mapa = _leerMapaUltimas();
    const { asignatura, ...resto } = datos;
    mapa[asignatura] = { ...resto, t: Date.now() };
    localStorage.setItem(CLAVE_ULTIMAS_SESIONES, JSON.stringify(mapa));
  } catch (e) { /* sin memoria, pero funciona */ }
}

/* La última sesión de UNA asignatura: { id, titulo, asignatura,
   unidad, fecha } o null. */
function leerUltimaSesion(idAsignatura) {
  const datos = _leerMapaUltimas()[idAsignatura];
  if (!datos || !datos.id || !datos.titulo) return null;
  if (!asignaturaPorId(idAsignatura)) return null;
  return { ...datos, asignatura: idAsignatura };
}

/* Todas, la más reciente primero. Se saltan las de asignaturas que ya
   no existen: apuntan a ninguna parte y es mejor no ofrecerlas. */
function leerUltimasSesiones() {
  return Object.keys(_leerMapaUltimas())
    .map(leerUltimaSesion)
    .filter(Boolean)
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.t || 0) - (a.t || 0));
}

/* El enlace a la sesión guardada. Con ?a= además de ?id=: así la
   sesión se localiza a la primera, sin recorrer las demás asignaturas. */
function urlUltimaSesion(ultima) {
  return `${urlSesion(ultima.id)}&a=${encodeURIComponent(ultima.asignatura)}`;
}

/* Busca en qué asignatura y en qué unidad vive una sesión.
   Se busca en todas las asignaturas para que los enlaces antiguos
   (tema.html?id=... sin ?a=) sigan funcionando. Si viene una pista
   de asignatura, se prueba esa primero. */
async function localizarSesion(sesionId, asignaturaPista) {
  const orden = asignaturaPista
    ? [asignaturaPista, ...ASIGNATURAS.filter(a => a.id !== asignaturaPista.id)]
    : ASIGNATURAS;

  for (const asignatura of orden) {
    const curso = await cargarCursoSeguro(asignatura);
    const unidad = (curso.unidades || []).find(u => (u.sesiones || []).includes(sesionId));
    if (unidad) return { asignatura, unidad };
  }
  return null;
}

/* Descarga los .json de todas las sesiones de una unidad.
   Devuelve un array del mismo tamaño, con null en las que fallen.

   Cacheado por unidad: en la portada de una asignatura lo llaman el
   listado y la barra lateral, y antes cada uno se descargaba su
   propia copia de las 29 sesiones. */
function cargarSesionesDeUnidad(asignatura, unidad) {
  const clave = `${asignatura.id}/${unidad.id}`;
  if (!_sesionesCargadas[clave]) {
    const ids = unidad.sesiones || [];
    _sesionesCargadas[clave] = Promise.all(
      ids.map(id =>
        fetch(rutaSesionJson(asignatura, unidad.id, id))
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    );
  }
  return _sesionesCargadas[clave];
}

/* Todas las sesiones de una asignatura, en el orden del temario y ya
   con su unidad al lado. Lo usan el buscador (js/buscador.js) y el
   pie de "anterior / siguiente" (js/tema.js), que necesitan ver la
   asignatura entera de corrido y no unidad a unidad.

   No cuesta ninguna petición extra en las páginas donde la barra
   lateral ya ha pedido lo mismo: lo coge de la caché de arriba. */
async function cargarSesionesDeAsignatura(asignatura) {
  const curso = await cargarCursoSeguro(asignatura);
  const unidades = curso.unidades || [];
  const porUnidad = await Promise.all(unidades.map(u => cargarSesionesDeUnidad(asignatura, u)));

  const lista = [];
  unidades.forEach((unidad, i) => {
    porUnidad[i].forEach(sesion => {
      if (sesion && sesion.id) lista.push({ sesion, unidad, asignatura });
    });
  });
  return lista;
}
