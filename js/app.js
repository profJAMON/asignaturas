// app.js — Punto de entrada: carga los datos, decide qué pantalla pintar
// según la dirección (#/calendario, #/entreno/123...) y reparte los toques
// a las acciones de cada pantalla.

import { cargarEstado } from './estado.js';
import { acciones, alPintar, desbloquearAudio, cerrarHoja } from './ui.js';
import * as inicio from './vistas/inicio.js';
import * as entreno from './vistas/entreno.js';
import * as calendario from './vistas/calendario.js';
import * as ajustes from './vistas/ajustes.js';
import * as cuerpo from './vistas/cuerpo.js';
import { listaMaquinas, fichaMaquina } from './vistas/maquinas.js';
import { listaPlantillas, editorPlantilla } from './vistas/plantillas.js';
import './vistas/actividades.js';
import './vistas/formulario-maquina.js';

// Pantallas según la primera parte de la ruta.
const PANTALLAS = [inicio, entreno, calendario, cuerpo, ajustes, listaMaquinas, fichaMaquina, listaPlantillas, editorPlantilla];
const rutas = Object.fromEntries(PANTALLAS.map(p => [p.ruta, p]));

const principal = document.getElementById('principal');
let rutaAnterior = null;
let pantallaActual = inicio;

function pintarPantalla() {
  const ruta = location.hash.replace(/^#\/?/, '');
  // Al salir de un entreno sin nada apuntado, no se guarda (salvo para ir a ver una máquina y volver).
  if (rutaAnterior?.startsWith('entreno/') && ruta !== rutaAnterior && !ruta.startsWith('maquina/')) {
    entreno.descartarSiVacia(rutaAnterior.split('/')[1]);
  }
  const [primera, ...resto] = ruta.split('/');
  const pantalla = rutas[primera] ?? inicio;
  const mismaRuta = ruta === rutaAnterior;
  const scroll = window.scrollY;

  principal.innerHTML = pantalla.render(resto.join('/'));
  pantallaActual = pantalla;

  // Marcar la pestaña activa de la barra inferior.
  document.querySelectorAll('.pestanas a').forEach(a =>
    a.toggleAttribute('aria-current', a.dataset.pestana === pantalla.pestana));

  // Al repintar la misma pantalla (p. ej. al guardar una serie) se conserva el scroll.
  window.scrollTo(0, mismaRuta ? scroll : 0);
  if (!mismaRuta) cerrarHoja();
  rutaAnterior = ruta;
  pantalla.despues?.();
}

alPintar(pintarPantalla);
window.addEventListener('hashchange', pintarPantalla);

// ---------- Reparto de eventos ----------

document.addEventListener('click', evento => {
  desbloquearAudio();
  const el = evento.target.closest('[data-accion]');
  if (!el) return;
  const accion = acciones[el.dataset.accion];
  if (!accion) return;
  if (el.tagName !== 'A') evento.preventDefault(); // los enlaces siguen navegando
  accion(el.dataset, el, evento);
});

document.addEventListener('change', evento => {
  const el = evento.target.closest('[data-cambio]');
  if (el) acciones[el.dataset.cambio]?.(el.dataset, el, evento);
});

document.addEventListener('input', evento => {
  const el = evento.target.closest('[data-entrada]');
  if (el) acciones[el.dataset.entrada]?.(el.dataset, el, evento);
});

document.addEventListener('submit', evento => {
  const form = evento.target.closest('form[data-envio]');
  if (!form) return;
  evento.preventDefault();
  acciones[form.dataset.envio]?.(new FormData(form), form, evento);
});

// Cerrar la hoja tocando fuera de ella.
const hoja = document.getElementById('hoja');
hoja.addEventListener('click', e => { if (e.target === hoja) hoja.close(); });

// Cronómetro: cada segundo, la pantalla actual puede actualizarse (solo lo usa el entreno).
setInterval(() => pantallaActual.tic?.(), 1000);
// Al volver a la app tras tenerla en segundo plano, actualizar enseguida.
document.addEventListener('visibilitychange', () => { if (!document.hidden) pantallaActual.tic?.(true); });

// ---------- Arranque ----------

async function arrancar() {
  try {
    await cargarEstado();
  } catch (error) {
    principal.innerHTML = `<p class="vacio">No se han podido abrir los datos (${error.message}). Cierra la app y vuelve a abrirla.</p>`;
    return;
  }
  // Pedir a iOS que no borre los datos aunque falte espacio.
  navigator.storage?.persist?.();
  pintarPantalla();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

arrancar();
