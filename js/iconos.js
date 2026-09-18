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
