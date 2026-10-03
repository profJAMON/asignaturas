/* ============================================================
   Iconos de las asignaturas
   ============================================================

   Un dibujo por asignatura, para que las tarjetas de la portada se
   distingan de un vistazo sin leer el título. Era lo que le faltaba a
   la portada: todo lo que había en ella era texto.

   Van por id y no por posición (el color sí va por posición, ver
   js/main.js) porque un icono SIGNIFICA algo: el navegador es la web,
   el conector RJ-45 son las redes y las capas son juntar lo de las
   demás asignaturas. Una asignatura nueva coge el icono de por
   defecto hasta que le dibujemos el suyo, y no pasa nada.

   Son SVG de trazo, sin relleno y con stroke="currentColor": cogen el
   color de la tarjeta solos y valen igual en claro y en oscuro. Nada
   de emoji, que cambia de dibujo en cada sistema operativo.
   ============================================================ */

const ICONOS_ASIGNATURA = {
  /* Una ventana de navegador con las etiquetas dentro. */
  operaciones: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="40" height="32" rx="3"></rect><path d="M4 17h40"></path><circle cx="9.5" cy="12.5" r="1.2" fill="currentColor" stroke="none"></circle><circle cx="14" cy="12.5" r="1.2" fill="currentColor" stroke="none"></circle><path d="M18 24l-4 5 4 5M30 24l4 5-4 5M26 22l-4 14"></path></svg>',

  /* Un conector RJ-45 con sus ocho pines y el cable. */
  instalaciones: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 6h6v4h8V6h6v14H14z" opacity="0.55"></path><rect x="12" y="18" width="24" height="20" rx="2"></rect><path d="M16 18v7M20 18v7M24 18v7M28 18v7M32 18v7"></path><path d="M18 38v4h12v-4"></path><path d="M20 42h8"></path></svg>',

  /* Tres capas apiladas: lo de las otras asignaturas, montado. */
  proyecto: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M24 6L42 15 24 24 6 15z"></path><path d="M6 24l18 9 18-9" opacity="0.7"></path><path d="M6 33l18 9 18-9" opacity="0.4"></path></svg>',
};

/* Para una asignatura que todavía no tenga el suyo: una carpeta. */
const ICONO_POR_DEFECTO = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14l4 5h22v23H4z"></path><path d="M4 22h40" opacity="0.5"></path></svg>';

function iconoDeAsignatura(id) {
  return ICONOS_ASIGNATURA[id] || ICONO_POR_DEFECTO;
}

/* ============================================================
   Iconos de las unidades (03/10/2026)
   ============================================================
   Mismo criterio que los de asignatura: trazo, sin relleno,
   currentColor. Salen en las tarjetas de unidad de la portada de
   cada asignatura y en el menú lateral de las unidades sin número
   ("Antes de empezar"). Van por id de unidad; una unidad nueva sin
   dibujo coge el de su asignatura y no se rompe nada.
   ============================================================ */

const _SVG = (d) => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const _ICONO_EMPEZAR = _SVG('<rect x="10" y="8" width="28" height="34" rx="3"></rect><path d="M18 8V5h12v3"></path><path d="M16 20l3 3 5-6M16 31l3 3 5-6M28 21h5M28 32h5"></path>');

const ICONOS_UNIDAD = {
  'antes-de-empezar': _ICONO_EMPEZAR,
  'proy-antes-de-empezar': _ICONO_EMPEZAR,
  /* Una diana: ver de dónde partimos. */
  'evaluacion-inicial': _SVG('<circle cx="24" cy="24" r="17"></circle><circle cx="24" cy="24" r="10" opacity="0.7"></circle><circle cx="24" cy="24" r="3"></circle><path d="M24 24l14-14M33 10h5v5"></path>'),
  /* Pantalla con una carpeta dentro. */
  'el-ordenador-y-tus-archivos': _SVG('<rect x="5" y="7" width="38" height="26" rx="2"></rect><path d="M18 41h12M24 33v8"></path><path d="M15 15h7l2 3h9v9H15z" opacity="0.8"></path>'),
  /* Un globo terráqueo. */
  'fundamentos-internet': _SVG('<circle cx="24" cy="24" r="18"></circle><ellipse cx="24" cy="24" rx="8" ry="18"></ellipse><path d="M6 24h36M9 14h30M9 34h30" opacity="0.7"></path>'),
  /* Una nube con un servidor. */
  'publicacion-web': _SVG('<path d="M14 30a8 8 0 0 1 1-16 11 11 0 0 1 21 3 7 7 0 0 1-1 13z"></path><rect x="17" y="34" width="14" height="8" rx="1.5"></rect><path d="M24 30v4M20 38h1" ></path>'),
  /* Lupa y sobre. */
  'navegador-servicios-internet': _SVG('<circle cx="19" cy="19" r="11"></circle><path d="M27 27l6 6"></path><rect x="26" y="30" width="18" height="12" rx="1.5"></rect><path d="M26 31l9 6 9-6" opacity="0.8"></path>'),
  /* Tres equipos unidos. */
  'introduccion-redes': _SVG('<rect x="18" y="5" width="12" height="9" rx="1.5"></rect><rect x="4" y="33" width="12" height="9" rx="1.5"></rect><rect x="32" y="33" width="12" height="9" rx="1.5"></rect><path d="M24 14v9M10 33v-6h28v6M24 23v4"></path>'),
  /* Casco de obra. */
  'prevencion-riesgos': _SVG('<path d="M7 32a17 17 0 0 1 34 0z"></path><path d="M4 32h40v4H4z"></path><path d="M20 16v-4h8v4M24 12v20" opacity="0.7"></path>'),
  /* Par trenzado. */
  'medios-cobre': _SVG('<path d="M4 18c6 0 8 12 14 12s8-12 14-12 8 12 12 12"></path><path d="M4 30c6 0 8-12 14-12s8 12 14 12 8-12 12-12" opacity="0.6"></path>'),
  /* Un rayo de luz rebotando dentro de la fibra. */
  'fibra-optica': _SVG('<path d="M4 14h40M4 34h40"></path><path d="M4 30l8-16 8 20 8-20 8 20 8-16" opacity="0.8"></path>'),
  /* Un armario rack. */
  'cableado-estructurado': _SVG('<rect x="10" y="4" width="28" height="40" rx="2"></rect><path d="M14 11h20M14 18h20M14 25h20M14 32h20"></path><path d="M30 11h1M30 18h1M30 25h1"></path><path d="M14 44v-2M34 44v-2"></path>'),
  /* Botón de encendido. */
  'proy-arranque': _SVG('<path d="M24 6v16"></path><path d="M15 12a15 15 0 1 0 18 0"></path>'),
  /* Etiquetas de HTML. */
  'proy-html': _SVG('<path d="M16 14L5 24l11 10M32 14l11 10-11 10M27 9l-6 30"></path>'),
  /* Un pincel pintando. */
  'proy-css': _SVG('<path d="M38 6L22 26l4 4L42 10z"></path><path d="M22 26c-5 0-8 3-8 7 0 3-3 6-8 6 8 4 18 2 20-5z"></path>'),
  /* Llaves de código con un rayo. */
  'proy-javascript': _SVG('<path d="M14 8c-5 0-5 4-5 8s-3 8-5 8c2 0 5 4 5 8s0 8 5 8M34 8c5 0 5 4 5 8s3 8 5 8c-2 0-5 4-5 8s0 8-5 8"></path><path d="M26 12l-6 13h8l-6 13" opacity="0.8"></path>'),
  /* Bandera de meta. */
  'proy-cierre': _SVG('<path d="M10 44V6"></path><path d="M10 7h28l-5 8 5 8H10"></path>'),
};

function iconoDeUnidad(idUnidad, idAsignatura) {
  return ICONOS_UNIDAD[idUnidad] || iconoDeAsignatura(idAsignatura);
}

/* Parte "Unidad 3. Medios de transmisión: cobre" en el número corto
   ("U3") y el nombre ("Medios de transmisión: cobre"). Lo que no
   empiece por Unidad/Unidades/Bloque se devuelve entero sin número. */
function partirTituloUnidad(titulo) {
  const m = /^(Unidad(?:es)?|Bloque)\s+(\d+(?:\s*(?:y|-|,)\s*\d+)*)\.\s*(.+)$/i.exec(titulo || '');
  if (!m) return { prefijo: '', corto: '', numero: '', nombre: titulo || '' };
  const nums = m[2].split(/\s*(?:y|-|,)\s*/);
  const letra = /^bloque/i.test(m[1]) ? 'B' : 'U';
  return {
    prefijo: `${m[1]} ${m[2]}. `,
    corto: letra + nums.join('-'),
    numero: nums.map(n => n.padStart(2, '0')).join('-'),
    nombre: m[3],
  };
}

/* Igual con las sesiones: "Sesión 2 — El sistema binario". */
function partirTituloSesion(titulo) {
  const m = /^Sesi[oó]n\s+(\w+)\s*(?:[—–-]|\.)\s*(.+)$/.exec(titulo || '');
  if (!m) return { prefijo: '', numero: '', nombre: titulo || '' };
  return { prefijo: `Sesión ${m[1]} — `, numero: m[1], nombre: m[2] };
}
