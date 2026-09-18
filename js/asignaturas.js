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
    descripcion: 'Construyes tu propia web con HTML y CSS, y aprendes cómo funciona Internet por dentro.',
    curso: 'data/curso-operaciones.json',
    base: 'data/operaciones'
  },
  {
    id: 'instalaciones',
    nombre: 'Instalación y mantenimiento de redes',
    descripcion: 'Cómo se monta la red de una oficina: cables, dispositivos, direcciones y seguridad en el taller.',
    curso: 'data/curso-instalaciones.json',
    base: 'data/instalaciones'
  },
  {
    id: 'proyecto',
    nombre: 'Proyecto Intermodular',
    descripcion: 'Construyes y publicas una web por parejas con HTML, CSS y JavaScript, conectando lo aprendido en las demás asignaturas.',
    curso: 'data/curso-proyecto.json',
    base: 'data/proyecto'
  }
];

const ASIGNATURA_POR_DEFECTO = 'operaciones';

/* Cache de los archivos de curso ya descargados, para no pedir el mismo
   archivo varias veces en la misma página. */
const _cursosCargados = {};

function asignaturaPorId(id) {
  return ASIGNATURAS.find(a => a.id === id) || null;
}

/* Lee ?a=... de la URL. Si no viene o no existe, devuelve null. */
function asignaturaDeLaUrl() {
  const params = new URLSearchParams(window.location.search);
  return asignaturaPorId(params.get('a'));
}

async function cargarCurso(asignatura) {
  if (_cursosCargados[asignatura.id]) return _cursosCargados[asignatura.id];
  const resp = await fetch(asignatura.curso);
  if (!resp.ok) throw new Error(`No se ha podido cargar ${asignatura.curso}`);
  const curso = await resp.json();
  _cursosCargados[asignatura.id] = curso;
  return curso;
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

function urlPortadaAsignatura(asignatura) {
  return `index.html?a=${encodeURIComponent(asignatura.id)}`;
}

function urlSesion(sesionId) {
  return `tema.html?id=${encodeURIComponent(sesionId)}`;
}

/* ============================================================
   La última sesión abierta
   ============================================================
   La guarda tema.js al abrir una sesión y la lee la portada general
   para ofrecer "sigue donde lo dejaste". Vive aquí porque es el único
   archivo que cargan las tres páginas.

   Misma convención que el resto de lo que se recuerda del alumno
   (ob-aspecto, ob-idioma, ob-grupo-*): clave con prefijo "ob-" y todo
   envuelto en try/catch, porque en modo incógnito o con las cookies
   bloqueadas localStorage lanza excepción y la web tiene que seguir
   funcionando igual.
   ============================================================ */

const CLAVE_ULTIMA_SESION = 'ob-ultima-sesion';

function guardarUltimaSesion(datos) {
  try {
    localStorage.setItem(CLAVE_ULTIMA_SESION, JSON.stringify(datos));
  } catch (e) { /* sin memoria, pero funciona */ }
}

/* Devuelve { id, titulo, asignatura } o null. Comprueba que la
   asignatura siga existiendo: si se borra del sitio, lo guardado
   apunta a ninguna parte y es mejor no ofrecerlo. */
function leerUltimaSesion() {
  try {
    const crudo = localStorage.getItem(CLAVE_ULTIMA_SESION);
    if (!crudo) return null;
    const datos = JSON.parse(crudo);
    if (!datos || !datos.id || !datos.titulo) return null;
    if (!asignaturaPorId(datos.asignatura)) return null;
    return datos;
  } catch (e) {
    return null;
  }
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
   Devuelve un array del mismo tamaño, con null en las que fallen. */
function cargarSesionesDeUnidad(asignatura, unidad) {
  const ids = unidad.sesiones || [];
  return Promise.all(
    ids.map(id =>
      fetch(rutaSesionJson(asignatura, unidad.id, id))
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  );
}
