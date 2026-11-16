/* ============================================================
   Windows 11 de mentira para las simulaciones (15/11/2026)
   ============================================================
   Lo pidió Carles el 15/11/2026: los alumnos quieren simulaciones
   «lo más reales posible». Antes los atajos eran botones que ya
   decían el atajo («Ctrl + Shift + T»): ahora se pulsan con el
   teclado de verdad o con un teclado en pantalla sin pistas, y
   las cosas se hacen como en Windows: clic derecho con su menú,
   doble clic, arrastrar, el menú Inicio, la barra de tareas…

   Va en tema.html DESPUÉS de js/simulador.js y ANTES de los
   sim-*.js que lo usan. Lo completa js/win11-archivos.js (el
   explorador de archivos y el escritorio con sus iconos).

   Uso, dentro del crear(ctx) de una simulación:
     const W = WIN11.escritorio(ctx, {
       fs: …,                      // opcional: el disco (win11-archivos.js)
       apps: { id: { n, icono, abrir(W, op), enInicio, enBarra } },
       barra: ['explorador', …],   // ancladas a la barra de tareas
       hora: '16:05', fecha: '07/01/2027',
     });
     W.on('app', d => …)           // { id, origen: 'atajo'|'raton'|… }
     W.on('atajo', d => …)         // { combo, hecho }
     W.abrir({ titulo, icono, crear(cuerpo, v), onTecla(combo) })
     W.menu(x, y, items, { fila })  // clic derecho
     W.dialogo({ titulo, texto, botones })
     W.notificacion(titulo, texto)
     W.aviso(texto, tipo)          // debajo de la pantalla

   El teclado: WIN11.teclado(caja, enviar, soltar) es un teclado
   español en pantalla. Ctrl, Shift, Alt y Windows se quedan
   pulsadas hasta la siguiente tecla (como las «teclas especiales»
   de Windows); Windows sola, tocándola dos veces. Los atajos que
   se queda tu ordenador de verdad (Windows, Alt + Tab, Alt + F4,
   Ctrl + T, Ctrl + W…) solo funcionan con el de la pantalla.

   Todo inventado; nada se guarda ni toca el ordenador de verdad.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.LAB) return;
  const { el, boton } = window.LAB;

  /* ---------- Iconos (SVG de trazo y relleno con clases) ---------- */
  const S = c => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${c}</svg>`;
  const HOJA = 'M6 2.5h8.5L19 7v14a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 21z';
  const ICONOS = {
    carpeta: S('<path class="w11i-carpeta-2" d="M2 6a1.5 1.5 0 0 1 1.5-1.5h5.4l2 2h9.6A1.5 1.5 0 0 1 22 8v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><path class="w11i-carpeta" d="M2 9.5A1.5 1.5 0 0 1 3.5 8h17A1.5 1.5 0 0 1 22 9.5V19a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/>'),
    documento: S(`<path class="w11i-hoja" d="${HOJA}"/><path class="w11i-raya" d="M9 11h7M9 14h7M9 17h5"/>`),
    texto: S(`<path class="w11i-hoja" d="${HOJA}"/><path class="w11i-azul" d="M6 2.5h8.5L16 4H6z"/><path class="w11i-raya" d="M9 9h7M9 12h7M9 15h7M9 18h4"/>`),
    word: S(`<path class="w11i-hoja" d="${HOJA}"/><rect class="w11i-azul" x="3" y="9" width="9" height="9" rx="1.5"/><path class="w11i-blanco" d="M4.8 11l1 5 1.2-3.5 1.2 3.5 1-5"/>`),
    pdf: S(`<path class="w11i-hoja" d="${HOJA}"/><rect class="w11i-rojo" x="3" y="10" width="11" height="7" rx="1.5"/><path class="w11i-blanco" d="M5 15.5v-4h1.4a1.2 1.2 0 0 1 0 2.4H5M9 11.5v4h1a2 2 0 0 0 0-4z"/>`),
    imagen: S(`<path class="w11i-hoja" d="${HOJA}"/><path class="w11i-verde" d="M8 19l3-4 2 2.5 1.5-2L17 19z"/><circle class="w11i-ambar" cx="10.5" cy="10.5" r="1.6"/>`),
    video: S(`<path class="w11i-hoja" d="${HOJA}"/><path class="w11i-morado" d="M10 10.5v6l5-3z"/>`),
    musica: S(`<path class="w11i-hoja" d="${HOJA}"/><path class="w11i-rojo" d="M11 18.5a1.6 1.6 0 1 1-1.6-1.6H11V10l5-1v7.5a1.6 1.6 0 1 1-1.6-1.6H16"/>`),
    zip: S('<path class="w11i-carpeta-2" d="M2 6a1.5 1.5 0 0 1 1.5-1.5h5.4l2 2h9.6A1.5 1.5 0 0 1 22 8v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><path class="w11i-carpeta" d="M2 9.5A1.5 1.5 0 0 1 3.5 8h17A1.5 1.5 0 0 1 22 9.5V19a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><path class="w11i-zip" d="M11 8h2v1.5h-2zM13 9.5h-2V11h2zM11 11h2v1.5h-2zM13 12.5h-2V14h2z"/><rect class="w11i-zip" x="10.4" y="14" width="3.2" height="3.4" rx=".6"/>'),
    exe: S('<rect class="w11i-hoja" x="3" y="4" width="18" height="16" rx="2"/><path class="w11i-azul" d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3z"/><circle class="w11i-trazo" cx="12" cy="14" r="3"/><path class="w11i-trazo" d="M12 9.5v1.2M12 17.3v1.2M7.5 14h1.2M15.3 14h1.2"/>'),
    presentacion: S(`<path class="w11i-hoja" d="${HOJA}"/><rect class="w11i-naranja" x="3" y="9" width="9" height="9" rx="1.5"/><path class="w11i-blanco" d="M6 16v-5h1.6a1.5 1.5 0 0 1 0 3H6"/>`),
    disco: S('<rect class="w11i-gris" x="2.5" y="7" width="19" height="10" rx="2"/><path class="w11i-trazo" d="M5 14h8"/><circle class="w11i-verde" cx="18" cy="14" r="1.1"/>'),
    sistema: S('<rect class="w11i-gris" x="2.5" y="7" width="19" height="10" rx="2"/><path class="w11i-trazo" d="M5 14h8"/><path class="w11i-azul" d="M15.5 9.5h2v2h-2zM18 9.5h2v2h-2zM15.5 12h2v2h-2zM18 12h2v2h-2z"/>'),
    usb: S('<rect class="w11i-gris" x="4" y="8.5" width="13" height="7" rx="1.5"/><path class="w11i-trazo" d="M17 10h4v4h-4z"/><path class="w11i-azul" d="M6.5 11h6v2h-6z"/>'),
    equipo: S('<rect class="w11i-azul" x="2.5" y="4" width="19" height="12.5" rx="1.6"/><rect class="w11i-pantalla" x="4" y="5.5" width="16" height="9.5" rx=".6"/><path class="w11i-trazo" d="M9 20h6M12 16.5V20"/>'),
    papelera: S('<path class="w11i-papelera" d="M6 7h12l-1.1 13a1.5 1.5 0 0 1-1.5 1.4H8.6a1.5 1.5 0 0 1-1.5-1.4z"/><path class="w11i-trazo" d="M4.5 7h15M9.5 7V4.8h5V7M10 10.5v7.5M14 10.5v7.5"/>'),
    'papelera-llena': S('<path class="w11i-papelera" d="M6 7h12l-1.1 13a1.5 1.5 0 0 1-1.5 1.4H8.6a1.5 1.5 0 0 1-1.5-1.4z"/><path class="w11i-hoja" d="M8 3.5l5 .8-.5 3.2-5-.8zM12.5 2.8l4 2.2-1.6 2.4-4-2.2z"/><path class="w11i-trazo" d="M4.5 7h15M10 10.5v7.5M14 10.5v7.5"/>'),
    explorador: S('<path class="w11i-carpeta-2" d="M2 6a1.5 1.5 0 0 1 1.5-1.5h5.4l2 2h9.6A1.5 1.5 0 0 1 22 8v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><path class="w11i-carpeta" d="M2 9.5A1.5 1.5 0 0 1 3.5 8h17A1.5 1.5 0 0 1 22 9.5V19a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><path class="w11i-azul" d="M2 16h20v3a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/>'),
    bloc: S('<rect class="w11i-hoja" x="4.5" y="3" width="15" height="18.5" rx="1.6"/><path class="w11i-azul" d="M4.5 4.6A1.6 1.6 0 0 1 6.1 3h11.8a1.6 1.6 0 0 1 1.6 1.6V7h-15z"/><path class="w11i-raya" d="M7.5 10.5h9M7.5 13.5h9M7.5 16.5h6"/>'),
    calculadora: S('<rect class="w11i-gris-osc" x="5" y="2.5" width="14" height="19" rx="2"/><rect class="w11i-pantalla" x="7" y="4.5" width="10" height="4" rx=".6"/><path class="w11i-blanco" d="M7.5 11h2v2h-2zM11 11h2v2h-2zM14.5 11h2v2h-2zM7.5 14.5h2v2h-2zM11 14.5h2v2h-2zM7.5 18h2v1.5h-2zM11 18h2v1.5h-2z"/><path class="w11i-azul" d="M14.5 14.5h2v5h-2z"/>'),
    navegador: S('<circle class="w11i-azul" cx="12" cy="12" r="9.5"/><path class="w11i-blanco-trazo" d="M2.5 12h19M12 2.5c-3.5 3.8-3.5 15.2 0 19M12 2.5c3.5 3.8 3.5 15.2 0 19M4.5 7h15M4.5 17h15"/>'),
    configuracion: S('<path class="w11i-gris-osc" d="M12 2l1.8 2.4 2.9-.7.4 3 2.7 1.2-1.1 2.8 1.6 2.6-2.6 1.4-.1 3-3-.2-1.6 2.6-2.2-2L9.8 20l-1.5-2.6-3-.1.1-3-2.6-1.5 1.6-2.6-1.1-2.8L6 6.2l.4-3 2.9.7z"/><circle class="w11i-pantalla" cx="12" cy="12" r="3.2"/>'),
    tareas: S('<rect class="w11i-hoja" x="3" y="4" width="18" height="16" rx="2"/><path class="w11i-verde-trazo" d="M5.5 15l3-3.5 2.5 2 3.5-5 2.5 3 1.5-1.5"/><path class="w11i-raya" d="M5.5 17.5h13"/>'),
    terminal: S('<rect class="w11i-gris-osc" x="2.5" y="4" width="19" height="16" rx="2"/><path class="w11i-blanco-trazo" d="M6 9l3 3-3 3M11 15h5"/>'),
    fotos: S('<rect class="w11i-azul" x="3" y="4" width="18" height="16" rx="2.5"/><path class="w11i-blanco" d="M6 17l4-5 3 3.5 2-2.5 3 4z"/><circle class="w11i-ambar" cx="15.5" cy="8.5" r="1.7"/>'),
    correo: S('<rect class="w11i-azul" x="2.5" y="5" width="19" height="14" rx="2"/><path class="w11i-blanco-trazo" d="M3.5 6.5l8.5 7 8.5-7"/>'),
    inicio: S('<path class="w11i-inicio" d="M3 3h8.5v8.5H3zM12.5 3H21v8.5h-8.5zM3 12.5h8.5V21H3zM12.5 12.5H21V21h-8.5z"/>'),
    buscar: S('<circle class="w11i-trazo" cx="10.5" cy="10.5" r="6"/><path class="w11i-trazo" d="M15 15l5.5 5.5"/>'),
    vistas: S('<rect class="w11i-trazo" x="3" y="5" width="11" height="9" rx="1.5"/><rect class="w11i-trazo" x="10" y="10" width="11" height="9" rx="1.5"/>'),
    apagar: S('<path class="w11i-trazo" d="M12 3v8M7 6.3a7.5 7.5 0 1 0 10 0"/>'),
    usuario: S('<circle class="w11i-gris" cx="12" cy="12" r="10"/><circle class="w11i-blanco" cx="12" cy="9.5" r="3.4"/><path class="w11i-blanco" d="M5.5 18.5a7.5 7.5 0 0 1 13 0A9.8 9.8 0 0 1 12 22a9.8 9.8 0 0 1-6.5-3.5z"/>'),
    wifi: S('<path class="w11i-trazo" d="M3 9.5a13 13 0 0 1 18 0M6 12.8a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle class="w11i-relleno" cx="12" cy="19" r="1.3"/>'),
    volumen: S('<path class="w11i-relleno" d="M4 9h4l5-4v14l-5-4H4z"/><path class="w11i-trazo" d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'),
    cortar: S('<circle class="w11i-trazo" cx="7" cy="17" r="3"/><circle class="w11i-trazo" cx="17" cy="17" r="3"/><path class="w11i-trazo" d="M9 15L18 3M15 15L6 3"/>'),
    copiar: S('<rect class="w11i-trazo" x="8" y="8" width="12" height="13" rx="2"/><path class="w11i-trazo" d="M5 16V5a2 2 0 0 1 2-2h9"/>'),
    pegar: S('<rect class="w11i-trazo" x="5" y="5" width="14" height="16" rx="2"/><path class="w11i-trazo" d="M9 5V3.5h6V5M9 11h6M9 15h4"/>'),
    renombrar: S('<rect class="w11i-trazo" x="3" y="7" width="14" height="10" rx="1.5"/><path class="w11i-trazo" d="M20 5v14M18 5h4M18 19h4M6.5 12h5"/>'),
    compartir: S('<path class="w11i-trazo" d="M14 4l6 6-6 6M20 10h-8a7 7 0 0 0-7 7v2"/>'),
    eliminar: S('<path class="w11i-trazo" d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13M10.5 11v6M13.5 11v6"/>'),
    propiedades: S('<rect class="w11i-trazo" x="4" y="3" width="16" height="18" rx="2"/><path class="w11i-trazo" d="M8 8h8M8 12h8M8 16h5"/>'),
    nuevo: S('<circle class="w11i-azul" cx="12" cy="12" r="9"/><path class="w11i-blanco-trazo" d="M12 7.5v9M7.5 12h9"/>'),
    ordenar: S('<path class="w11i-trazo" d="M7 4v16M3.5 16.5L7 20l3.5-3.5M17 20V4M13.5 7.5L17 4l3.5 3.5"/>'),
    ver: S('<rect class="w11i-trazo" x="3" y="4" width="18" height="16" rx="2"/><path class="w11i-trazo" d="M3 9h18M9 9v11"/>'),
    mas: S('<circle class="w11i-relleno" cx="5" cy="12" r="1.6"/><circle class="w11i-relleno" cx="12" cy="12" r="1.6"/><circle class="w11i-relleno" cx="19" cy="12" r="1.6"/>'),
    atras: S('<path class="w11i-trazo" d="M20 12H5M11 5.5L4.5 12l6.5 6.5"/>'),
    adelante: S('<path class="w11i-trazo" d="M4 12h15M13 5.5l6.5 6.5-6.5 6.5"/>'),
    arriba: S('<path class="w11i-trazo" d="M12 20V5M5.5 11L12 4.5l6.5 6.5"/>'),
    recargar: S('<path class="w11i-trazo" d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v5h-5"/>'),
    restaurar: S('<path class="w11i-trazo" d="M10 18L4 12l6-6M4 12h10a6 6 0 0 1 6 6"/>'),
    expulsar: S('<path class="w11i-relleno" d="M12 4l7 8H5z"/><path class="w11i-relleno" d="M5 15h14v3H5z"/>'),
    acceso: S('<rect class="w11i-acceso-fondo" x="1" y="13" width="10" height="10" rx="1.5"/><path class="w11i-acceso" d="M4 20.5c0-3 1.8-4.5 5-4.5M7 14l2 2-2 2"/>'),
    aviso: S('<path class="w11i-ambar" d="M12 2.5l10 18H2z"/><path class="w11i-negro-trazo" d="M12 9v5.5"/><circle class="w11i-negro" cx="12" cy="17.3" r="1.1"/>'),
    error: S('<circle class="w11i-rojo" cx="12" cy="12" r="10"/><path class="w11i-blanco-trazo" d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>'),
    info: S('<circle class="w11i-azul" cx="12" cy="12" r="10"/><path class="w11i-blanco-trazo" d="M12 11v6"/><circle class="w11i-blanco" cx="12" cy="7.5" r="1.3"/>'),
    pregunta: S('<circle class="w11i-azul" cx="12" cy="12" r="10"/><path class="w11i-blanco-trazo" d="M9.3 9.2a2.8 2.8 0 1 1 3.6 2.7c-.7.3-.9.8-.9 1.6v.6"/><circle class="w11i-blanco" cx="12" cy="17.4" r="1.2"/>'),
    escudo: S('<path class="w11i-azul" d="M12 2.5l8 3v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6z"/><path class="w11i-blanco-trazo" d="M8.5 12l2.5 2.5 4.5-5"/>'),
    impresora: S('<rect class="w11i-gris" x="3" y="9" width="18" height="8" rx="2"/><path class="w11i-hoja" d="M7 4h10v5H7zM7 14h10v6H7z"/><circle class="w11i-verde" cx="18" cy="12" r=".9"/>'),
    candado: S('<rect class="w11i-ambar" x="5" y="10.5" width="14" height="10.5" rx="2"/><path class="w11i-trazo" d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    juego: S('<rect class="w11i-verde" x="3" y="3" width="18" height="18" rx="2.5"/><path class="w11i-verde-osc" d="M3 9h18v3H3z"/><path class="w11i-negro" d="M7.5 13.5h3v3h-3zM13.5 13.5h3v3h-3zM10.5 16.5h3v3h-3z"/>'),
    app: S('<rect class="w11i-azul" x="3" y="3" width="18" height="18" rx="4"/><path class="w11i-blanco" d="M7 7h4v4H7zM13 7h4v4h-4zM7 13h4v4H7zM13 13h4v4h-4z"/>'),
  };
  const icono = (nombre, clase) => {
    const s = el('span', 'w11-ico' + (clase ? ' ' + clase : ''));
    s.innerHTML = ICONOS[nombre] || ICONOS.app;
    return s;
  };

  /* ---------- Teclas ---------- */
  // orden de los modificadores al escribir un atajo: Windows + Ctrl + Alt + Shift + tecla
  const MODS = ['Windows', 'Ctrl', 'Alt', 'Shift'];
  const ESPECIALES = {
    ' ': 'Espacio', Escape: 'Esc', Esc: 'Esc', Delete: 'Supr', Backspace: 'Retroceso', Enter: 'Intro', Tab: 'Tab',
    ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', ContextMenu: 'Menú', Home: 'Inicio', End: 'Fin',
  };
  function teclaDeEvento(e) {
    if (['Control', 'Shift', 'Alt', 'Meta', 'OS', 'AltGraph'].indexOf(e.key) !== -1) return null;
    if (ESPECIALES[e.key]) return ESPECIALES[e.key];
    if (/^F\d{1,2}$/.test(e.key)) return e.key;
    if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3);
    if (e.code === 'Semicolon' || e.key === 'ñ' || e.key === 'Ñ') return 'Ñ';
    if (/^Digit\d$/.test(e.code)) return e.code.slice(5);
    if (e.code === 'NumpadAdd' || e.key === '+') return '+';
    if (e.code === 'NumpadSubtract' || e.code === 'Slash' || e.key === '-') return '-';
    if (/^Numpad\d$/.test(e.code)) return e.code.slice(6);
    return e.key && e.key.length === 1 ? e.key.toUpperCase() : null;
  }
  const combo = (mods, tecla) => MODS.filter(m => mods.indexOf(m) !== -1).concat(tecla ? [tecla] : []).join(' + ');
  const comboDeEvento = e => {
    const t = teclaDeEvento(e);
    if (!t) return null;
    const m = [];
    if (e.metaKey) m.push('Windows');
    if (e.ctrlKey && !(e.getModifierState && e.getModifierState('AltGraph'))) m.push('Ctrl');
    if (e.altKey && !(e.getModifierState && e.getModifierState('AltGraph'))) m.push('Alt');
    if (e.shiftKey && (t.length > 1 || m.length)) m.push('Shift');
    return combo(m, t);
  };

  /* ---------- Teclado en pantalla (español) ---------- */
  // [etiqueta, nombre de la tecla, ancho]
  const FILAS = [
    [['Esc', 'Esc'], ['F1'], ['F2'], ['F3'], ['F4'], ['F5'], ['F6'], ['F7'], ['F8'], ['F9'], ['F10'], ['F11'], ['F12'], ['Supr', 'Supr', 1.4]],
    [['º'], ['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9'], ['0'], ["'"], ['¡'], ['⟵', 'Retroceso', 1.6]],
    [['Tab', 'Tab', 1.4], ['Q'], ['W'], ['E'], ['R'], ['T'], ['Y'], ['U'], ['I'], ['O'], ['P'], ['`'], ['+'], ['Intro', 'Intro', 1.2]],
    [['⇪', 'BloqMayus', 1.7], ['A'], ['S'], ['D'], ['F'], ['G'], ['H'], ['J'], ['K'], ['L'], ['Ñ'], ['´'], ['Ç']],
    [['⇧ Shift', 'Shift', 1.3], ['<'], ['Z'], ['X'], ['C'], ['V'], ['B'], ['N'], ['M'], [','], ['.'], ['-'], ['⇧ Shift', 'Shift', 2]],
    [['Ctrl', 'Ctrl', 1.3], ['⊞', 'Windows', 1.2], ['Alt', 'Alt', 1.2], ['', 'Espacio', 5.2], ['Alt Gr', 'AltGr', 1.2], ['Ctrl', 'Ctrl', 1.2], ['←'], ['↑'], ['↓'], ['→']],
  ];
  function teclado(caja, enviar, soltar) {
    const tk = el('div', 'w11-kbd');
    tk.setAttribute('role', 'group');
    tk.setAttribute('aria-label', 'Teclado en pantalla');
    tk.setAttribute('translate', 'no');
    const pulsadas = new Set();
    const botones = [];
    FILAS.forEach(fila => {
      const f = el('div', 'w11-kbd__fila');
      fila.forEach(([et, nom, ancho]) => {
        const nombre = nom || et;
        const b = boton(et, 'w11-kbd__tecla');
        b.dataset.k = nombre;
        b.style.flexGrow = ancho || 1;
        if (nombre === 'Windows') { b.textContent = ''; b.appendChild(icono('inicio')); b.setAttribute('aria-label', 'Windows'); }
        if (nombre === 'Espacio') b.setAttribute('aria-label', 'Espacio');
        if (nombre === 'Retroceso') b.setAttribute('aria-label', 'Retroceso');
        if (nombre === 'BloqMayus') b.setAttribute('aria-label', 'Bloq Mayús');
        if (MODS.indexOf(nombre) !== -1) { b.classList.add('w11-kbd__mod'); b.setAttribute('aria-pressed', 'false'); }
        b.addEventListener('pointerdown', e => e.preventDefault()); // que no quite el foco al campo de texto
        b.addEventListener('click', () => pulsar(nombre));
        botones.push(b);
        f.appendChild(b);
      });
      tk.appendChild(f);
    });
    function pinta() {
      botones.forEach(b => {
        if (MODS.indexOf(b.dataset.k) === -1) return;
        const on = pulsadas.has(b.dataset.k);
        b.classList.toggle('w11-kbd__tecla--on', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }
    function suelta() { const m = Array.from(pulsadas); pulsadas.clear(); pinta(); m.forEach(x => soltar && soltar(x)); }
    let soloWin = false;
    function pulsar(nombre) {
      if (nombre === 'AltGr' || nombre === 'BloqMayus') return;
      if (MODS.indexOf(nombre) !== -1) {
        if (pulsadas.has(nombre)) {
          // Windows dos veces, sin nada entre medias: Windows sola
          if (nombre === 'Windows' && soloWin && pulsadas.size === 1) { suelta(); enviar('Windows', { pantalla: true }); return; }
          pulsadas.delete(nombre); pinta(); if (soltar) soltar(nombre); return;
        }
        pulsadas.add(nombre);
        soloWin = nombre === 'Windows' && pulsadas.size === 1;
        pinta();
        return;
      }
      soloWin = false;
      const c = combo(Array.from(pulsadas), nombre);
      // Alt + Tab: el Alt se queda pulsado mientras eliges ventana
      if (nombre === 'Tab' && pulsadas.has('Alt')) { enviar(c, { pantalla: true }); return; }
      const m = Array.from(pulsadas);
      pulsadas.clear(); pinta();
      enviar(c, { pantalla: true, texto: m.length ? null : textoDe(nombre) });
      m.forEach(x => soltar && soltar(x, true));
    }
    function textoDe(n) {
      if (n === 'Espacio') return ' ';
      return n.length === 1 ? n.toLowerCase() : null;
    }
    caja.appendChild(tk);
    return { el: tk, soltarTodo: suelta, pulsadas: () => Array.from(pulsadas) };
  }

  /* ---------- Escritorio ---------- */
  const APPS_BASE = {
    explorador: { n: 'Explorador de archivos', icono: 'explorador', enInicio: true },
    navegador: { n: 'Google Chrome', icono: 'navegador', enInicio: true },
    bloc: { n: 'Bloc de notas', icono: 'bloc', enInicio: true },
    calculadora: { n: 'Calculadora', icono: 'calculadora', enInicio: true, unica: true },
    configuracion: { n: 'Configuración', icono: 'configuracion', enInicio: true, unica: true },
    fotos: { n: 'Fotos', icono: 'fotos', enInicio: true },
    tareas: { n: 'Administrador de tareas', icono: 'tareas', unica: true },
    terminal: { n: 'Terminal', icono: 'terminal' },
  };

  function escritorio(ctx, op) {
    op = op || {};
    const pantalla = ctx.pantalla;
    pantalla.classList.add('sim__pantalla--w11');
    const W = { ctx, op, icono, ICONOS, ventanas: [], apps: {}, est: { verExt: !!op.extensiones, verOcultos: false } };
    const eventos = {};
    W.on = (n, f) => { (eventos[n] = eventos[n] || []).push(f); };
    W.emit = (n, d) => { (eventos[n] || []).forEach(f => f(d || {})); };

    Object.keys(APPS_BASE).forEach(k => { W.apps[k] = Object.assign({ id: k }, APPS_BASE[k]); });
    Object.keys(op.apps || {}).forEach(k => { W.apps[k] = Object.assign({ id: k }, W.apps[k] || {}, op.apps[k]); });
    let anclados = (op.barra || ['explorador', 'navegador']).slice();

    const raiz = el('div', 'w11');
    raiz.tabIndex = 0;
    raiz.setAttribute('role', 'region');
    raiz.setAttribute('aria-label', op.etiqueta || 'Pantalla de Windows 11 de mentira. Toca aquí para usar el teclado de verdad.');
    const escena = el('div', 'w11__escena');
    const fondo = el('div', 'w11__fondo');
    const iconos = el('div', 'w11__iconos');
    const capaVentanas = el('div', 'w11__ventanas');
    const capaMenus = el('div', 'w11__capa');
    const toasts = el('div', 'w11__toasts');
    toasts.setAttribute('aria-live', 'polite');
    const barra = el('div', 'w11__barra');
    escena.append(fondo, iconos, capaVentanas, toasts, barra, capaMenus);
    raiz.appendChild(escena);
    const avisos = el('div', 'w11__avisos');
    avisos.setAttribute('aria-live', 'polite');
    const ayudaTeclado = el('div', 'w11__teclado');
    pantalla.append(raiz, avisos, ayudaTeclado);
    W.raiz = raiz; W.escena = escena; W.capaVentanas = capaVentanas;

    W.aviso = (t, tipo) => { avisos.innerHTML = ''; if (t) avisos.appendChild(ctx.aviso(t, tipo)); };

    /* ---- barra de tareas ---- */
    const centro = el('div', 'w11__centro');
    const bandeja = el('div', 'w11__bandeja');
    barra.append(centro, bandeja);
    const bInicio = boton('', 'w11__tb w11__tb--inicio');
    bInicio.appendChild(icono('inicio'));
    bInicio.setAttribute('aria-label', 'Inicio');
    bInicio.addEventListener('click', () => toggleInicio('raton'));
    bInicio.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); menuWinX(e); });
    const bBuscar = boton('', 'w11__tb');
    bBuscar.appendChild(icono('buscar'));
    bBuscar.setAttribute('aria-label', 'Buscar');
    bBuscar.addEventListener('click', () => abrirInicio('raton', true));
    const appsBarra = el('div', 'w11__apps');
    centro.append(bInicio, bBuscar, appsBarra);
    const reloj = el('div', 'w11__reloj');
    reloj.setAttribute('translate', 'no');
    reloj.append(el('span', null, op.hora || '16:05'), el('span', null, op.fecha || '07/01/2027'));
    const idioma = el('span', 'w11__idioma', 'ESP');
    bandeja.append(idioma, icono('wifi', 'w11__bandeja-ico'), icono('volumen', 'w11__bandeja-ico'), reloj);
    const bEscritorio = boton('', 'w11__mostrar');
    bEscritorio.setAttribute('aria-label', 'Mostrar el escritorio');
    bEscritorio.addEventListener('click', () => mostrarEscritorio('raton'));
    bandeja.appendChild(bEscritorio);
    barra.addEventListener('contextmenu', e => {
      if (e.target.closest('.w11__tb')) return;
      e.preventDefault();
      W.menu(e.clientX, e.clientY, [
        { t: 'Administrador de tareas', icono: 'tareas', f: () => W.abrirApp('tareas', { origen: 'barra' }) },
        { t: 'Configuración de la barra de tareas', icono: 'configuracion', f: () => W.abrirApp('configuracion', { origen: 'barra', pagina: 'personalizacion' }) },
      ]);
    });

    function pintarBarra() {
      appsBarra.innerHTML = '';
      const abiertas = [];
      W.ventanas.forEach(v => { if (abiertas.indexOf(v.app) === -1) abiertas.push(v.app); });
      const lista = anclados.concat(abiertas.filter(a => anclados.indexOf(a) === -1));
      lista.forEach(id => {
        const a = W.apps[id];
        if (!a) return;
        const vs = W.ventanas.filter(v => v.app === id);
        const b = boton('', 'w11__tb w11__tb--app');
        b.appendChild(icono(a.icono));
        b.setAttribute('aria-label', a.n + (vs.length ? ' (abierta)' : ''));
        b.title = a.n;
        if (vs.length) b.classList.add('w11__tb--abierta');
        if (vs.some(v => v === W.activa && v.estado !== 'min')) b.classList.add('w11__tb--activa');
        b.addEventListener('click', () => {
          cerrarCapas();
          if (!vs.length) { W.abrirApp(id, { origen: 'barra' }); return; }
          const v = vs.filter(x => x.estado !== 'min').pop() || vs[vs.length - 1];
          if (v === W.activa && v.estado !== 'min') v.minimizar();
          else v.enfocar();
        });
        b.addEventListener('contextmenu', e => {
          e.preventDefault(); e.stopPropagation();
          const anc = anclados.indexOf(id) !== -1;
          const items = [{ t: a.n, icono: a.icono, f: () => W.abrirApp(id, { origen: 'barra', nueva: true }) }];
          items.push(anc ? { t: 'Desanclar de la barra de tareas', icono: 'eliminar', f: () => W.anclar(id, false, 'barra') }
            : { t: 'Anclar a la barra de tareas', icono: 'nuevo', f: () => W.anclar(id, true, 'barra') });
          if (vs.length) items.push({ t: vs.length > 1 ? 'Cerrar todas las ventanas' : 'Cerrar ventana', icono: 'eliminar', f: () => vs.slice().forEach(v => v.cerrar()) });
          W.menu(e.clientX, e.clientY, items);
        });
        appsBarra.appendChild(b);
      });
    }
    W.anclar = (id, si, donde) => {
      const i = anclados.indexOf(id);
      if (si && i === -1) anclados.push(id);
      if (!si && i !== -1) anclados.splice(i, 1);
      pintarBarra();
      W.emit('anclar', { id, si, donde });
    };
    W.anclados = () => anclados.slice();

    /* ---- ventanas ---- */
    let z = 10;
    const estrecho = () => escena.clientWidth < 560;
    W.abrir = def => {
      const v = { def, app: def.app || def.id || 'app', estado: 'normal' };
      const n = W.ventanas.length;
      v.rect = def.rect || { x: 6 + n * 4, y: 5 + n * 4, w: def.ancho || 64, h: def.alto || 70 };
      const nodo = el('div', 'w11-v');
      nodo.setAttribute('role', 'group');
      const cab = el('div', 'w11-v__barra');
      const ico = icono(def.icono || 'app', 'w11-v__ico');
      const tit = el('span', 'w11-v__titulo', def.titulo || '');
      if (def.tituloNoTraducir) tit.setAttribute('translate', 'no');
      const btns = el('div', 'w11-v__botones');
      const bMin = boton('', 'w11-v__b'); bMin.setAttribute('aria-label', 'Minimizar'); bMin.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 5h8"/></svg>';
      const bMax = boton('', 'w11-v__b'); bMax.setAttribute('aria-label', 'Maximizar'); bMax.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" rx="1"/></svg>';
      const bCer = boton('', 'w11-v__b w11-v__b--cerrar'); bCer.setAttribute('aria-label', 'Cerrar'); bCer.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>';
      btns.append(bMin, bMax, bCer);
      cab.append(ico, tit, btns);
      const cuerpo = el('div', 'w11-v__cuerpo');
      nodo.append(cab, cuerpo);
      capaVentanas.appendChild(nodo);
      Object.assign(v, { el: nodo, cuerpo, cab });
      v.titulo = t => { tit.textContent = t; nodo.setAttribute('aria-label', t); def.titulo = t; };
      v.titulo(def.titulo || '');
      v.colocar = () => {
        nodo.hidden = v.estado === 'min';
        nodo.dataset.estado = v.estado;
        const r = v.estado === 'max' ? { x: 0, y: 0, w: 100, h: 100 } : v.estado === 'izq' ? { x: 0, y: 0, w: 50, h: 100 }
          : v.estado === 'der' ? { x: 50, y: 0, w: 50, h: 100 } : v.rect;
        Object.assign(nodo.style, { left: r.x + '%', top: r.y + '%', width: r.w + '%', height: r.h + '%' });
        bMax.setAttribute('aria-label', v.estado === 'max' ? 'Restaurar' : 'Maximizar');
        bMax.innerHTML = v.estado === 'max' ? '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="3" width="6" height="6" rx="1"/><path d="M3 3V1.8a.8.8 0 0 1 .8-.8H8.2a.8.8 0 0 1 .8.8v4.4a.8.8 0 0 1-.8.8H7"/></svg>' : '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" rx="1"/></svg>';
      };
      v.enfocar = () => {
        if (v.estado === 'min') v.estado = v.antesMin || 'normal';
        nodo.style.zIndex = ++z;
        W.activa = v;
        W.ventanas.forEach(x => x.el.classList.toggle('w11-v--activa', x === v));
        v.colocar();
        pintarBarra();
        W.emit('foco', { v });
      };
      v.minimizar = () => {
        if (v.estado !== 'min') v.antesMin = v.estado;
        v.estado = 'min';
        v.colocar();
        if (W.activa === v) W.activa = W.ventanas.filter(x => x.estado !== 'min').sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0] || null;
        pintarBarra();
        W.emit('min', { v });
      };
      v.maximizar = () => { v.estado = v.estado === 'max' ? 'normal' : 'max'; v.enfocar(); W.emit('max', { v }); };
      v.ajustar = (lado, origen) => { v.estado = lado; v.enfocar(); W.emit('ajustar', { v, lado, origen }); };
      v.cerrar = () => {
        if (def.alCerrar && def.alCerrar(v) === false) return;
        nodo.remove();
        W.ventanas.splice(W.ventanas.indexOf(v), 1);
        if (W.activa === v) {
          W.activa = null;
          const otra = W.ventanas.filter(x => x.estado !== 'min').sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
          if (otra) otra.enfocar();
        }
        pintarBarra();
        W.emit('cerrar', { v, app: v.app });
      };
      bMin.addEventListener('click', e => { e.stopPropagation(); v.minimizar(); });
      bMax.addEventListener('click', e => { e.stopPropagation(); v.maximizar(); });
      bCer.addEventListener('click', e => { e.stopPropagation(); v.cerrar(); });
      cab.addEventListener('dblclick', e => { if (!e.target.closest('.w11-v__b')) v.maximizar(); });
      nodo.addEventListener('pointerdown', () => { if (W.activa !== v) v.enfocar(); }, true);
      arrastrable(v, cab);
      W.ventanas.push(v);
      if (def.estado) v.estado = def.estado;
      else if (estrecho()) v.estado = 'max';
      if (def.crear) def.crear(cuerpo, v);
      v.enfocar();
      return v;
    };
    function arrastrable(v, cab) {
      let ini = null;
      cab.addEventListener('pointerdown', e => {
        if (e.button !== 0 || e.target.closest('.w11-v__b')) return;
        const r = capaVentanas.getBoundingClientRect();
        ini = { x: e.clientX, y: e.clientY, r, rect: Object.assign({}, v.rect), movido: false, estado: v.estado };
        cab.setPointerCapture(e.pointerId);
      });
      cab.addEventListener('pointermove', e => {
        if (!ini) return;
        const dx = e.clientX - ini.x, dy = e.clientY - ini.y;
        if (!ini.movido && Math.abs(dx) + Math.abs(dy) < 6) return;
        if (!ini.movido && ini.estado !== 'normal') {
          // al arrastrar una ventana ajustada o maximizada, vuelve a su tamaño
          v.estado = 'normal';
          const px = (e.clientX - ini.r.left) / ini.r.width * 100;
          ini.rect.x = Math.max(0, Math.min(100 - v.rect.w, px - v.rect.w / 2));
          ini.rect.y = 0;
        }
        ini.movido = true;
        v.rect.x = Math.max(-v.rect.w + 12, Math.min(96, ini.rect.x + dx / ini.r.width * 100));
        v.rect.y = Math.max(0, Math.min(92, ini.rect.y + dy / ini.r.height * 100));
        v.colocar();
        escena.dataset.ajuste = e.clientX - ini.r.left < 8 ? 'izq' : ini.r.right - e.clientX < 8 ? 'der' : e.clientY - ini.r.top < 4 ? 'max' : '';
      });
      const fin = e => {
        if (!ini) return;
        const lado = escena.dataset.ajuste;
        escena.dataset.ajuste = '';
        if (ini.movido && lado) v.ajustar(lado, 'arrastrar');
        ini = null;
        try { cab.releasePointerCapture(e.pointerId); } catch (_) { /* nada */ }
      };
      cab.addEventListener('pointerup', fin);
      cab.addEventListener('pointercancel', fin);
    }
    W.ventana = app => W.ventanas.filter(v => v.app === app).pop() || null;
    W.abrirApp = (id, o) => {
      o = o || {};
      cerrarCapas();
      const a = W.apps[id];
      if (!a) return null;
      const ya = W.ventana(id);
      let v;
      if (ya && (a.unica || (!o.nueva && o.origen === 'barra'))) { ya.enfocar(); v = ya; if (a.irA) a.irA(W, ya, o); }
      else if (a.abrir) v = a.abrir(W, o);
      else v = W.abrir({ app: id, titulo: a.n, icono: a.icono, crear: c => crearBase(id, c, o) });
      W.emit('app', { id, origen: o.origen || 'raton', v });
      return v;
    };
    function crearBase(id, c, o) {
      if (id === 'bloc') return blocDeNotas(c, o);
      if (id === 'calculadora') return calculadora(c);
      c.appendChild(el('div', 'w11-vacia', 'En esta simulación no hace falta esta aplicación.'));
    }
    function blocDeNotas(c, o) {
      const menu = el('div', 'w11-bloc__menu');
      ['Archivo', 'Editar', 'Ver'].forEach(t => menu.appendChild(el('span', null, t)));
      const t = document.createElement('textarea');
      t.className = 'w11-bloc__texto';
      t.spellcheck = false;
      t.value = o.texto || '';
      t.setAttribute('aria-label', 'Texto del Bloc de notas');
      c.append(menu, t);
      c.classList.add('w11-bloc');
    }
    function calculadora(c) {
      c.classList.add('w11-calc');
      const pant = el('div', 'w11-calc__pantalla', '0');
      pant.setAttribute('translate', 'no');
      pant.setAttribute('aria-live', 'polite');
      const teclas = el('div', 'w11-calc__teclas');
      let a = null, opr = null, cur = '0', nuevo = true;
      const calc = () => { const x = parseFloat(a), y = parseFloat(cur); return opr === '+' ? x + y : opr === '−' ? x - y : opr === '×' ? x * y : y === 0 ? NaN : x / y; };
      ['C', '÷', '×', '−', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0'].forEach(k => {
        const b = boton(k, 'w11-calc__t' + (/\d/.test(k) ? '' : ' w11-calc__t--op'));
        b.addEventListener('click', () => {
          if (/\d/.test(k)) { cur = nuevo ? k : (cur === '0' ? k : cur + k); nuevo = false; }
          else if (k === 'C') { a = null; opr = null; cur = '0'; nuevo = true; }
          else if (k === '=') { if (opr) { cur = String(+calc().toFixed(6)); a = null; opr = null; nuevo = true; } }
          else { if (opr && !nuevo) cur = String(+calc().toFixed(6)); a = cur; opr = k; nuevo = true; }
          pant.textContent = cur === 'NaN' ? 'No se puede dividir entre cero' : cur.replace('.', ',');
        });
        teclas.appendChild(b);
      });
      c.append(pant, teclas);
    }

    /* ---- menú Inicio ---- */
    let capaInicio = null;
    function cerrarCapas() {
      capaMenus.innerHTML = '';
      capaInicio = null;
      bInicio.classList.remove('w11__tb--activa');
    }
    W.cerrarCapas = cerrarCapas;
    function toggleInicio(origen) { if (capaInicio) cerrarCapas(); else abrirInicio(origen); }
    function abrirInicio(origen, buscando) {
      cerrarCapas();
      W.emit('inicio', { origen });
      bInicio.classList.add('w11__tb--activa');
      const m = el('div', 'w11-inicio');
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-label', 'Menú Inicio');
      const busca = document.createElement('input');
      busca.type = 'search';
      busca.className = 'w11-inicio__buscar';
      busca.placeholder = 'Buscar aplicaciones, configuración y documentos';
      busca.setAttribute('aria-label', 'Buscar en Inicio');
      const cuerpo = el('div', 'w11-inicio__cuerpo');
      let todas = false;
      function pintar() {
        cuerpo.innerHTML = '';
        const q = busca.value.trim().toLowerCase();
        if (q) {
          cuerpo.appendChild(el('p', 'w11-inicio__titulo', 'Mejor coincidencia'));
          const res = Object.values(W.apps).filter(a => a.n.toLowerCase().indexOf(q) !== -1 || (a.buscar || []).some(x => x.indexOf(q) !== -1));
          if (!res.length) cuerpo.appendChild(el('p', 'w11-inicio__nada', 'No hay resultados para «' + busca.value + '».'));
          res.forEach(a => cuerpo.appendChild(filaApp(a, 'busqueda')));
          return;
        }
        const cab = el('div', 'w11-inicio__cab');
        cab.appendChild(el('p', 'w11-inicio__titulo', todas ? 'Todas las aplicaciones' : 'Anclado'));
        const bt = boton(todas ? '‹ Atrás' : 'Todas ›', 'w11-inicio__todas');
        bt.addEventListener('click', () => { todas = !todas; pintar(); });
        cab.appendChild(bt);
        cuerpo.appendChild(cab);
        if (todas) {
          let letra = '';
          Object.values(W.apps).sort((a, b) => a.n.localeCompare(b.n)).forEach(a => {
            const l = a.n[0].toUpperCase();
            if (l !== letra) { letra = l; cuerpo.appendChild(el('p', 'w11-inicio__letra', l)); }
            cuerpo.appendChild(filaApp(a, 'inicio'));
          });
        } else {
          const rej = el('div', 'w11-inicio__rejilla');
          Object.values(W.apps).filter(a => a.enInicio).forEach(a => {
            const b = boton('', 'w11-inicio__app');
            b.append(icono(a.icono), el('span', null, a.n));
            b.addEventListener('click', () => W.abrirApp(a.id, { origen: 'inicio' }));
            b.addEventListener('contextmenu', e => menuApp(e, a));
            rej.appendChild(b);
          });
          cuerpo.appendChild(rej);
        }
      }
      function filaApp(a, origen) {
        const b = boton('', 'w11-inicio__fila');
        b.append(icono(a.icono), el('span', null, a.n));
        b.addEventListener('click', () => W.abrirApp(a.id, { origen }));
        b.addEventListener('contextmenu', e => menuApp(e, a));
        return b;
      }
      function menuApp(e, a) {
        e.preventDefault(); e.stopPropagation();
        const anc = anclados.indexOf(a.id) !== -1;
        W.menu(e.clientX, e.clientY, [
          { t: 'Abrir', icono: a.icono, f: () => W.abrirApp(a.id, { origen: 'inicio' }) },
          a.enInicio ? { t: 'Desanclar de Inicio', icono: 'eliminar', f: () => { a.enInicio = false; pintar(); W.emit('anclar', { id: a.id, si: false, donde: 'inicio' }); } }
            : { t: 'Anclar a Inicio', icono: 'nuevo', f: () => { a.enInicio = true; pintar(); W.emit('anclar', { id: a.id, si: true, donde: 'inicio' }); } },
          anc ? { t: 'Desanclar de la barra de tareas', icono: 'eliminar', f: () => W.anclar(a.id, false, 'inicio') }
            : { t: 'Anclar a la barra de tareas', icono: 'nuevo', f: () => W.anclar(a.id, true, 'inicio') },
        ], { encima: true });
      }
      busca.addEventListener('input', pintar);
      busca.addEventListener('keydown', e => {
        if (e.key === 'Enter') { const b = cuerpo.querySelector('button.w11-inicio__fila'); if (b) b.click(); }
        if (e.key === 'Escape') { e.stopPropagation(); cerrarCapas(); raiz.focus(); }
      });
      const pie = el('div', 'w11-inicio__pie');
      const usu = el('span', 'w11-inicio__usuario');
      usu.append(icono('usuario'), el('span', null, op.usuario || 'alumno'));
      const bApagar = boton('', 'w11__tb');
      bApagar.appendChild(icono('apagar'));
      bApagar.setAttribute('aria-label', 'Iniciar/Apagar');
      bApagar.addEventListener('click', e => {
        const r = bApagar.getBoundingClientRect();
        W.menu(r.left, r.top, ['Suspender', 'Apagar', 'Reiniciar'].map(t => ({ t, f: () => W.notificacion('Simulación', 'Aquí no hace falta apagar: sigue con la misión.') })), { encima: true });
        e.stopPropagation();
      });
      pie.append(usu, bApagar);
      m.append(busca, cuerpo, pie);
      capaMenus.appendChild(m);
      capaInicio = m;
      pintar();
      busca.focus();
    }
    W.abrirInicio = abrirInicio;
    function menuWinX(e) {
      W.emit('winx', {});
      const ir = (id, o) => () => W.abrirApp(id, Object.assign({ origen: 'winx' }, o));
      const r = bInicio.getBoundingClientRect();
      const x = e && e.clientX ? e.clientX : r.left, y = e && e.clientY ? e.clientY : r.top;
      W.menu(x, y, [
        { t: 'Aplicaciones instaladas', f: ir('configuracion', { pagina: 'apps' }) },
        { t: 'Opciones de energía', f: ir('configuracion', { pagina: 'sistema' }) },
        { t: 'Sistema', f: ir('configuracion', { pagina: 'sistema' }) },
        { t: 'Administrador de dispositivos', f: ir('dispositivos') },
        { t: 'Administración de discos', f: ir('discos') },
        { sep: true },
        { t: 'Terminal', f: ir('terminal') },
        { t: 'Administrador de tareas', f: ir('tareas') },
        { t: 'Configuración', f: ir('configuracion') },
        { t: 'Explorador de archivos', f: ir('explorador') },
        { t: 'Buscar', f: () => abrirInicio('winx', true) },
        { sep: true },
        { t: 'Escritorio', f: () => mostrarEscritorio('winx') },
      ], { encima: true });
    }

    /* ---- menú contextual ---- */
    W.menu = (x, y, items, o) => {
      o = o || {};
      if (!o.sub) { capaMenus.querySelectorAll('.w11-menu').forEach(m => m.remove()); if (!o.encima) { const ini = capaMenus.querySelector('.w11-inicio'); if (ini) cerrarCapas(); } }
      const m = el('div', 'w11-menu');
      m.setAttribute('role', 'menu');
      if (o.fila && o.fila.length) {
        const f = el('div', 'w11-menu__fila');
        o.fila.forEach(it => {
          const b = boton('', 'w11-menu__ico');
          b.appendChild(icono(it.icono));
          b.setAttribute('aria-label', it.t);
          b.title = it.t;
          b.setAttribute('role', 'menuitem');
          if (it.off) b.disabled = true;
          b.addEventListener('click', ev => { ev.stopPropagation(); cerrarMenus(); it.f && it.f(); });
          f.appendChild(b);
        });
        m.appendChild(f);
      }
      items.forEach(it => {
        if (!it) return;
        if (it.sep) { m.appendChild(el('div', 'w11-menu__sep')); return; }
        const b = boton('', 'w11-menu__item');
        b.setAttribute('role', 'menuitem');
        const ic = el('span', 'w11-menu__icono');
        if (it.icono) ic.appendChild(icono(it.icono));
        if (it.marca) ic.textContent = '✓';
        b.append(ic, el('span', 'w11-menu__texto', it.t));
        if (it.noTraducir) b.lastChild.setAttribute('translate', 'no');
        if (it.atajo) { const a = el('span', 'w11-menu__atajo', it.atajo); a.setAttribute('translate', 'no'); b.appendChild(a); }
        if (it.sub) { b.appendChild(el('span', 'w11-menu__flecha', '›')); b.setAttribute('aria-haspopup', 'true'); }
        if (it.off) b.disabled = true;
        b.addEventListener('click', ev => {
          ev.stopPropagation();
          if (it.sub) { abrirSub(b, it.sub); return; }
          cerrarMenus();
          if (it.f) it.f();
        });
        if (it.sub) b.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') abrirSub(b, it.sub); });
        else b.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') m.querySelectorAll(':scope ~ .w11-menu--sub').forEach(s => { if (s.dataset.de === m.dataset.n) s.remove(); }); });
        m.appendChild(b);
      });
      m.dataset.n = String(Math.random()).slice(2, 8);
      if (o.sub) m.classList.add('w11-menu--sub');
      capaMenus.appendChild(m);
      const caja = escena.getBoundingClientRect();
      const ancho = m.offsetWidth, alto = m.offsetHeight;
      let left = x - caja.left, top = y - caja.top;
      if (o.sub) { left = x; top = y; }
      if (left + ancho > caja.width - 4) left = o.sub ? o.izq - ancho : Math.max(4, caja.width - ancho - 4);
      if (top + alto > caja.height - 4) top = Math.max(4, (o.encima && !o.sub ? top - alto : caja.height - alto - 4));
      m.style.left = Math.max(4, left) + 'px';
      m.style.top = Math.max(4, top) + 'px';
      const primero = m.querySelector('button:not(:disabled)');
      if (primero && !o.sinFoco) primero.focus({ preventScroll: true });
      function abrirSub(b, sub) {
        capaMenus.querySelectorAll('.w11-menu--sub').forEach(s => { if (s.dataset.de === m.dataset.n || s.dataset.raiz === m.dataset.n) s.remove(); });
        const r = b.getBoundingClientRect();
        const sm = W.menu(r.right - caja.left - 2, r.top - caja.top - 4, sub, { sub: true, izq: r.left - caja.left + 2 });
        sm.dataset.de = m.dataset.n;
      }
      m.addEventListener('keydown', ev => {
        const bs = Array.from(m.querySelectorAll('button:not(:disabled)'));
        const i = bs.indexOf(document.activeElement);
        if (ev.key === 'ArrowDown') { ev.preventDefault(); ev.stopPropagation(); (bs[i + 1] || bs[0]).focus(); }
        else if (ev.key === 'ArrowUp') { ev.preventDefault(); ev.stopPropagation(); (bs[i - 1] || bs[bs.length - 1]).focus(); }
        else if (ev.key === 'ArrowRight' && document.activeElement.getAttribute('aria-haspopup')) { ev.preventDefault(); ev.stopPropagation(); document.activeElement.click(); }
        else if (ev.key === 'ArrowLeft' && o.sub) { ev.preventDefault(); ev.stopPropagation(); m.remove(); }
        else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); cerrarMenus(); raiz.focus(); }
      });
      return m;
    };
    function cerrarMenus() { capaMenus.querySelectorAll('.w11-menu').forEach(m => m.remove()); }
    W.cerrarMenus = cerrarMenus;
    escena.addEventListener('pointerdown', e => {
      if (!e.target.closest('.w11-menu')) cerrarMenus();
      if (capaInicio && !e.target.closest('.w11-inicio') && !e.target.closest('.w11__tb--inicio') && !e.target.closest('.w11-menu')) cerrarCapas();
    });

    /* ---- diálogos, notificaciones ---- */
    W.dialogo = d => {
      const velo = el('div', 'w11-dlg__velo');
      const caja = el('div', 'w11-dlg');
      caja.setAttribute('role', 'alertdialog');
      caja.setAttribute('aria-modal', 'true');
      const cab = el('div', 'w11-dlg__cab');
      cab.appendChild(el('span', null, d.titulo || 'Windows'));
      const cerrarX = boton('', 'w11-v__b w11-v__b--cerrar');
      cerrarX.setAttribute('aria-label', 'Cerrar');
      cerrarX.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>';
      cab.appendChild(cerrarX);
      const cuerpo = el('div', 'w11-dlg__cuerpo');
      if (d.icono) cuerpo.appendChild(icono(d.icono, 'w11-dlg__icono'));
      const txt = el('div', 'w11-dlg__texto');
      if (d.texto) (Array.isArray(d.texto) ? d.texto : [d.texto]).forEach(t => txt.appendChild(el('p', null, t)));
      cuerpo.appendChild(txt);
      if (d.crear) d.crear(txt);
      const pie = el('div', 'w11-dlg__pie');
      const cerrar = () => { velo.remove(); raiz.focus(); };
      const bots = (d.botones || [{ t: 'Aceptar', primario: true }]).map(b => {
        const x = boton(b.t, 'w11-btn' + (b.primario ? ' w11-btn--primario' : ''));
        x.addEventListener('click', () => { if (b.f && b.f(txt) === false) return; cerrar(); });
        pie.appendChild(x);
        return x;
      });
      cerrarX.addEventListener('click', () => { const ult = (d.botones || [])[d.botones ? d.botones.length - 1 : 0]; if (d.alCerrar) d.alCerrar(); else if (ult && ult.cancelar && ult.f) ult.f(txt); cerrar(); });
      caja.append(cab, cuerpo, pie);
      velo.appendChild(caja);
      velo.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); cerrarX.click(); } });
      escena.appendChild(velo);
      const pf = bots.find((b, i) => (d.botones || [])[i] && d.botones[i].primario) || bots[0];
      if (pf) pf.focus({ preventScroll: true });
      return { cerrar, caja: txt };
    };
    W.notificacion = (titulo, texto, ico) => {
      const t = el('div', 'w11-toast');
      t.setAttribute('role', 'status');
      t.append(icono(ico || 'info', 'w11-toast__ico'));
      const c = el('div');
      c.append(el('p', 'w11-toast__titulo', titulo), el('p', 'w11-toast__texto', texto || ''));
      t.appendChild(c);
      toasts.innerHTML = '';
      toasts.appendChild(t);
      clearTimeout(W._toast);
      W._toast = setTimeout(() => t.remove(), 6000);
    };

    /* ---- escritorio ---- */
    function mostrarEscritorio(origen) {
      const visibles = W.ventanas.filter(v => v.estado !== 'min');
      if (visibles.length) { W._escondidas = visibles; visibles.forEach(v => v.minimizar()); }
      else if (W._escondidas) { W._escondidas.filter(v => W.ventanas.indexOf(v) !== -1).forEach(v => v.enfocar()); W._escondidas = null; }
      W.emit('escritorio', { origen, ocultas: visibles.length });
    }
    W.mostrarEscritorio = mostrarEscritorio;
    W.pintarIconos = () => {
      iconos.innerHTML = '';
      const lista = W.iconosEscritorio ? W.iconosEscritorio() : (op.iconos || []);
      lista.forEach(it => {
        const b = boton('', 'w11-icono' + (it.elegido ? ' w11-icono--elegido' : '') + (it.oculto ? ' w11-icono--oculto' : ''));
        const ic = icono(it.icono);
        if (it.acceso) ic.appendChild(icono('acceso', 'w11-ico__acceso'));
        b.append(ic);
        const n = el('span', 'w11-icono__n', it.n);
        n.setAttribute('translate', 'no');
        b.appendChild(n);
        b.setAttribute('aria-label', it.n + (it.acceso ? ' (acceso directo)' : ''));
        let ultimo = 0;
        b.addEventListener('click', () => {
          const ahora = Date.now();
          if (ahora - ultimo < 450) { ultimo = 0; it.abrir && it.abrir(); return; }
          ultimo = ahora;
          if (it.elegir) it.elegir();
          iconos.querySelectorAll('.w11-icono--elegido').forEach(x => x.classList.remove('w11-icono--elegido'));
          b.classList.add('w11-icono--elegido');
        });
        b.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); it.abrir && it.abrir(); }
          else if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') { e.preventDefault(); e.stopPropagation(); const r = b.getBoundingClientRect(); it.menu && it.menu(r.left + 20, r.top + 20); }
        });
        b.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); b.click(); it.menu && it.menu(e.clientX, e.clientY); });
        if (it.soltar) b.dataset.soltar = '1';
        b._it = it;
        iconos.appendChild(b);
      });
    };
    iconos.addEventListener('contextmenu', e => {
      if (e.target.closest('.w11-icono')) return;
      e.preventDefault();
      if (W.menuEscritorio) W.menuEscritorio(e.clientX, e.clientY);
      else W.menu(e.clientX, e.clientY, [{ t: 'Ver', sub: [{ t: 'Iconos grandes' }, { t: 'Iconos medianos', marca: true }] }, { t: 'Actualizar', icono: 'recargar' }]);
    });
    fondo.addEventListener('contextmenu', e => { e.preventDefault(); iconos.dispatchEvent(new MouseEvent('contextmenu', e)); });

    /* ---- Alt + Tab ---- */
    let altTab = null;
    function pasoAltTab() {
      const orden = W.ventanas.slice().sort((a, b) => (b.el.style.zIndex | 0) - (a.el.style.zIndex | 0));
      if (!orden.length) return;
      if (!altTab) {
        altTab = { orden, i: orden.length > 1 ? 1 : 0, caja: el('div', 'w11-alttab') };
        altTab.caja.setAttribute('role', 'listbox');
        altTab.caja.setAttribute('aria-label', 'Cambiar de ventana');
        capaMenus.appendChild(altTab.caja);
      } else altTab.i = (altTab.i + 1) % altTab.orden.length;
      altTab.caja.innerHTML = '';
      altTab.orden.forEach((v, i) => {
        const b = boton('', 'w11-alttab__v' + (i === altTab.i ? ' w11-alttab__v--elegida' : ''));
        b.setAttribute('role', 'option');
        b.setAttribute('aria-selected', String(i === altTab.i));
        const cab = el('span', 'w11-alttab__cab');
        cab.append(icono(v.def.icono || 'app'), el('span', null, v.def.titulo));
        b.append(cab, el('span', 'w11-alttab__mini'));
        b.addEventListener('click', () => { altTab.i = i; acabaAltTab('raton'); });
        altTab.caja.appendChild(b);
      });
    }
    function acabaAltTab(origen) {
      if (!altTab) return;
      const v = altTab.orden[altTab.i];
      altTab.caja.remove();
      altTab = null;
      if (v) { v.enfocar(); W.emit('alttab', { v, origen: origen || 'atajo' }); }
    }

    /* ---- bloquear ---- */
    function bloquear(origen) {
      const capa = el('div', 'w11-bloqueo');
      capa.append(el('p', 'w11-bloqueo__hora', op.hora || '16:05'), el('p', 'w11-bloqueo__fecha', 'jueves, 7 de enero'));
      const b = boton('Iniciar sesión', 'w11-btn w11-btn--primario');
      b.addEventListener('click', () => { capa.remove(); raiz.focus(); });
      capa.appendChild(b);
      escena.appendChild(capa);
      b.focus({ preventScroll: true });
      W.emit('bloquear', { origen });
    }
    function seguridad() {
      const capa = el('div', 'w11-bloqueo w11-bloqueo--opciones');
      [['Bloquear', () => { capa.remove(); bloquear('ctrl-alt-supr'); }], ['Cambiar de usuario'], ['Cerrar sesión'], ['Cambiar una contraseña'], ['Administrador de tareas', () => { capa.remove(); W.abrirApp('tareas', { origen: 'ctrl-alt-supr' }); }]].forEach(([t, f]) => {
        const b = boton(t, 'w11-bloqueo__op');
        b.addEventListener('click', () => { if (f) f(); else W.notificacion('Simulación', 'Aquí no hace falta: elige otra opción o Cancelar.'); });
        capa.appendChild(b);
      });
      const c = boton('Cancelar', 'w11-btn');
      c.addEventListener('click', () => { capa.remove(); raiz.focus(); });
      capa.appendChild(c);
      escena.appendChild(capa);
      capa.querySelector('button').focus({ preventScroll: true });
    }

    /* ---- atajos ---- */
    const SISTEMA = {
      'Windows': () => toggleInicio('atajo'),
      'Ctrl + Esc': () => toggleInicio('atajo'),
      'Windows + S': () => abrirInicio('atajo', true),
      'Windows + D': () => mostrarEscritorio('atajo'),
      'Windows + M': () => { W.ventanas.forEach(v => v.minimizar()); W.emit('escritorio', { origen: 'atajo' }); },
      'Windows + E': () => W.abrirApp('explorador', { origen: 'atajo', nueva: true }),
      'Windows + I': () => W.abrirApp('configuracion', { origen: 'atajo' }),
      'Windows + X': () => menuWinX(),
      'Windows + L': () => bloquear('atajo'),
      'Windows + R': () => W.notificacion('Ejecutar', 'En esta simulación no hace falta el cuadro Ejecutar.'),
      'Windows + ←': () => W.activa && W.activa.ajustar(W.activa.estado === 'der' ? 'normal' : 'izq', 'atajo'),
      'Windows + →': () => W.activa && W.activa.ajustar(W.activa.estado === 'izq' ? 'normal' : 'der', 'atajo'),
      'Windows + ↑': () => W.activa && (W.activa.estado = 'max', W.activa.enfocar(), W.emit('max', { v: W.activa, origen: 'atajo' })),
      'Windows + ↓': () => W.activa && (W.activa.estado === 'max' ? (W.activa.estado = 'normal', W.activa.enfocar()) : W.activa.minimizar()),
      'Alt + Tab': () => pasoAltTab(),
      'Alt + F4': () => {
        if (W.activa && W.activa.estado !== 'min') { const v = W.activa; v.cerrar(); W.emit('altf4', { v }); return; }
        W.dialogo({ titulo: 'Apagar Windows', icono: 'apagar', texto: '¿Qué quieres que haga el equipo?', botones: [{ t: 'Aceptar', primario: true, f: () => W.notificacion('Simulación', 'Aquí no hace falta apagar.') }, { t: 'Cancelar' }] });
      },
      'Ctrl + Shift + Esc': () => W.abrirApp('tareas', { origen: 'atajo' }),
      'Ctrl + Alt + Supr': () => seguridad(),
      'Esc': () => { if (capaMenus.childNodes.length) { cerrarMenus(); cerrarCapas(); return true; } return false; },
    };
    W.pulsar = (c, info) => {
      info = info || {};
      if (altTab && c !== 'Alt + Tab' && c !== 'Alt + Shift + Tab') acabaAltTab();
      // texto escrito con el teclado en pantalla en un campo
      if (info.texto && W._campo && document.body.contains(W._campo) && !W._campo.disabled) {
        const t = W._campo, i = t.selectionStart != null ? t.selectionStart : t.value.length;
        t.value = t.value.slice(0, i) + info.texto + t.value.slice(t.selectionEnd != null ? t.selectionEnd : i);
        try { t.setSelectionRange(i + 1, i + 1); } catch (_) { /* nada */ }
        t.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      if (c === 'Retroceso' && W._campo && info.pantalla && document.body.contains(W._campo)) {
        const t = W._campo, i = t.selectionStart, j = t.selectionEnd;
        if (i != null) { const a = i === j ? Math.max(0, i - 1) : i; t.value = t.value.slice(0, a) + t.value.slice(j); t.setSelectionRange(a, a); t.dispatchEvent(new Event('input', { bubbles: true })); return true; }
      }
      // Ctrl + C / X / V / A del teclado en pantalla en un campo (16/11/2026).
      // Lo copiado con el teclado de verdad también llega aquí (evento copy).
      if (info.pantalla && W._campo && document.body.contains(W._campo) && /^Ctrl \+ [CXVA]$/.test(c)) {
        const t = W._campo, i = t.selectionStart, j = t.selectionEnd;
        const k = c.slice(-1);
        if (k === 'A') { t.focus(); t.select(); return true; }
        if (k === 'C' || k === 'X') {
          if (i != null && j > i) W._portapapeles = t.value.slice(i, j);
          if (k === 'X' && i != null && j > i && !t.readOnly) { t.value = t.value.slice(0, i) + t.value.slice(j); t.setSelectionRange(i, i); t.dispatchEvent(new Event('input', { bubbles: true })); }
          return true;
        }
        if (k === 'V' && W._portapapeles && !t.readOnly && i != null) {
          t.value = t.value.slice(0, i) + W._portapapeles + t.value.slice(j);
          const p = i + W._portapapeles.length;
          t.setSelectionRange(p, p);
          t.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return true;
      }
      if (c === 'Intro' && W._campo && info.pantalla && document.body.contains(W._campo)) {
        W._campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        return true;
      }
      let hecho = false;
      if (W._capturar && W._capturar(c, info)) hecho = true;
      if (!hecho && W.activa && W.activa.estado !== 'min' && W.activa.def.onTecla && W.activa.def.onTecla(c, info) === true) hecho = true;
      if (!hecho && op.onTecla && op.onTecla(c, info) === true) hecho = true;
      if (!hecho && SISTEMA[c]) { const r = SISTEMA[c](info); hecho = r !== false; }
      W.emit('atajo', { combo: c, hecho, pantalla: !!info.pantalla });
      return hecho;
    };
    raiz.addEventListener('focusin', e => {
      if (e.target.matches('input[type=text], input[type=search], input:not([type]), textarea')) W._campo = e.target;
    });
    raiz.addEventListener('keydown', e => {
      const c = comboDeEvento(e);
      if (!c) return;
      const enCampo = e.target.matches('input, textarea, select');
      if (enCampo && !e.ctrlKey && !e.altKey && !e.metaKey && ['Esc', 'Tab'].indexOf(c) === -1) return;
      if (enCampo && e.ctrlKey && /^Ctrl \+ [ACVXZY]$/.test(c)) return;
      if (!enCampo && e.target !== raiz && ['Intro', 'Espacio'].indexOf(c) !== -1 && e.target.matches('button')) return; // los botones se pulsan solos
      if (!enCampo && c === 'Tab') return; // Tab mueve el foco, como siempre
      if (W.pulsar(c, { fisico: true })) e.preventDefault();
    });
    const copia = () => { const t = W._campo; if (t && t.selectionEnd > t.selectionStart) W._portapapeles = t.value.slice(t.selectionStart, t.selectionEnd); };
    raiz.addEventListener('copy', copia);
    raiz.addEventListener('cut', copia);
    raiz.addEventListener('keyup', e => { if (e.key === 'Alt' && altTab) acabaAltTab(); });
    raiz.addEventListener('pointerdown', e => {
      if (!e.target.closest('input, textarea, select, button, [tabindex]:not(.w11)')) raiz.focus({ preventScroll: true });
    });

    /* ---- teclado en pantalla ---- */
    const cabT = el('div', 'w11__teclado-cab');
    const bTec = boton('⌨️ Teclado en pantalla', 'lab__boton');
    bTec.setAttribute('aria-expanded', 'true');
    cabT.appendChild(bTec);
    cabT.appendChild(el('p', 'w11__teclado-ayuda', 'Puedes usar el teclado de tu ordenador después de tocar la pantalla de Windows. Los atajos con la tecla Windows, Alt + Tab, Alt + F4, Ctrl + Alt + Supr, Ctrl + Shift + Esc y los de las pestañas de Chrome se los queda tu ordenador de verdad: púlsalos en este teclado. Ctrl, Shift, Alt y Windows se quedan pulsadas hasta la siguiente tecla; Windows sola, tócala dos veces.'));
    ayudaTeclado.appendChild(cabT);
    const T = teclado(ayudaTeclado, (c, info) => W.pulsar(c, info), (m, conOtra) => { if (m === 'Alt' && altTab) acabaAltTab(); });
    W.teclado = T;
    if (op.teclado === false) { T.el.hidden = true; bTec.setAttribute('aria-expanded', 'false'); }
    bTec.addEventListener('click', () => {
      T.el.hidden = !T.el.hidden;
      bTec.setAttribute('aria-expanded', String(!T.el.hidden));
    });

    pintarBarra();
    W.pintarBarra = pintarBarra;
    if (op.fs && WIN11.archivos) WIN11.archivos(W, op);
    W.pintarIconos();
    return W;
  }

  window.WIN11 = { escritorio, teclado, icono, ICONOS, comboDeEvento, combo };
})();
