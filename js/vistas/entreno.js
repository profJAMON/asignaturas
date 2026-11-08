// entreno.js — Pantalla del entreno en curso (o de un entreno pasado para editarlo).
//
// Un entreno (sesión) tiene una lista de ejercicios. Cada ejercicio apunta a una
// máquina (variante) y guarda sus series: { peso, mas, reps, extra, hora }.
//   mas   = sumador de la máquina de placas (0 si no se usa)
//   extra = serie extra tras descansar un poco: { peso, mas, reps, hora } o null
// Los ejercicios de calentamiento solo guardan cuándo se marcó cada serie.

import { estado, guardarObj, borrarObj, ajuste, historialVariante, variantesPorPatron, sesionVacia } from '../estado.js';
import { registrar, pintar, ir, abrirHoja, cerrarHoja, aviso, pitar, OMEGA } from '../ui.js';
import {
  esc, nuevoId, hoyISO, fechaCorta, hora, diasEntre, mmss, num, leerNum, redondear,
  textoPeso, textoSerie, textoReferencia, SUFIJO, romano
} from '../utilidades.js';
import { abrirFormularioMaquina } from './formulario-maquina.js';
import { progresoVariante } from '../progreso.js';
import { insigniaRango } from './maquinas.js';

export const ruta = 'entreno';
export const pestana = 'inicio';

let sesionId = null;           // entreno que se está viendo
const borradores = {};         // valores de la próxima serie de cada ejercicio, aún sin guardar
let ultimoPitido = null;       // para no pitar dos veces por el mismo descanso

// ---------- Crear entrenos (lo usan Inicio y Calendario) ----------

/** Crea un entreno a partir de una plantilla (o vacío si plantillaId es null). */
export async function crearSesion(plantillaId, fecha = hoyISO()) {
  const plantilla = plantillaId ? estado.plantillas[plantillaId] : null;
  const sesion = {
    id: nuevoId('ses'),
    fecha,
    inicio: Date.now(),
    fin: fecha === hoyISO() ? null : Date.now(), // los de días pasados nacen "terminados"
    plantillaId: plantilla?.id ?? null,
    nombre: plantilla?.nombre ?? 'Entreno libre',
    nota: '',
    ejercicios: (plantilla?.huecos ?? [])
      .filter(h => estado.variantes[h.varianteId])
      .map(h => nuevoEjercicio(h.varianteId, {
        hueco: h.nombre,
        opciones: [h.varianteId, ...h.alternativas],
        calentamiento: h.calentamiento,
        opcional: h.opcional,
        objetivo: h.series
      }))
  };
  await guardarObj('sesiones', sesion);
  return sesion;
}

function nuevoEjercicio(varianteId, o = {}) {
  const v = estado.variantes[varianteId];
  return {
    id: nuevoId('ej'),
    hueco: o.hueco ?? estado.patrones[v.patronId]?.nombre ?? '',
    varianteId,
    opciones: o.opciones ?? [varianteId],
    calentamiento: o.calentamiento ?? false,
    opcional: o.opcional ?? false,
    objetivo: o.objetivo ?? 3,
    molestia: 0,
    calentamientos: [],
    series: []
  };
}

/** Al salir de un entreno sin nada apuntado se borra: así no quedan entrenos abiertos sin querer. */
export function descartarSiVacia(id) {
  const s = estado.sesiones[id];
  if (!s || !sesionVacia(s)) return;
  borrarObj('sesiones', id);
  aviso('Entreno vacío: no se ha guardado');
}

/**
 * Multiplica por el factor indicado todos los pesos apuntados en una máquina
 * (al pasarla de peso total a peso por lado, o al revés, con un peso nuevo).
 */
async function reescalarHistorial(v, factor) {
  const ajustar = kg => Math.round(kg * factor * 4) / 4; // al cuarto de kilo
  for (const s of Object.values(estado.sesiones)) {
    let cambiado = false;
    for (const e of s.ejercicios) {
      if (e.varianteId !== v.id) continue;
      for (const serie of e.series) {
        serie.peso = ajustar(serie.peso);
        if (serie.extra) serie.extra.peso = ajustar(serie.extra.peso);
        cambiado = true;
      }
    }
    if (cambiado) await guardarObj('sesiones', s);
  }
  if (v.referencia?.peso) v.referencia.peso = ajustar(v.referencia.peso);
}

// ---------- Ayudantes ----------

const sesion = () => estado.sesiones[sesionId];
const ejercicio = idEj => sesion()?.ejercicios.find(e => e.id === idEj);

/** Cuánto sube o baja el peso al pulsar + / −. */
function paso(v) {
  return v.incremento || (v.carga === 'mancuernas' ? 2 : 2.5);
}

/** La última vez que se usó esta máquina (sin contar el entreno actual). */
function ultimaVez(varianteId) {
  return historialVariante(varianteId, sesionId)[0] ?? null;
}

/** Valores propuestos para la siguiente serie: lo que hiciste la última vez en esa misma serie. */
function propuesta(ej, i = ej.series.length) {
  const v = estado.variantes[ej.varianteId];
  const previa = ultimaVez(ej.varianteId)?.ejercicio.series;
  const base = previa?.[i] ?? ej.series[i - 1] ?? previa?.at(-1) ?? null;
  if (base) return { peso: base.peso, mas: base.mas || 0, reps: base.reps };
  if (v.referencia) return { peso: v.referencia.peso, mas: v.referencia.mas || 0, reps: v.repsMin || 8 };
  return { peso: null, mas: 0, reps: v.repsMin || 8 };
}

/** Último momento en que se apuntó algo, para el cronómetro de descanso. */
function ultimoEvento(s) {
  let ts = 0;
  let corto = false; // descanso corto = entre dos series de calentamiento
  for (const e of s.ejercicios) {
    e.calentamientos.forEach((t, i) => {
      if (t > ts) { ts = t; corto = i + 1 < e.objetivo; }
    });
    for (const serie of e.series) {
      if (serie.hora > ts) { ts = serie.hora; corto = false; }
      if (serie.extra?.hora > ts) { ts = serie.extra.hora; corto = false; }
    }
  }
  return ts ? { ts, corto } : null;
}

/** Borra los valores sin guardar de un ejercicio (se recalculan al pintar). */
function olvidarBorradores(idEj) {
  for (const clave of Object.keys(borradores)) if (clave.startsWith(`${idEj}:`)) delete borradores[clave];
}

async function guardarSesion() {
  await guardarObj('sesiones', sesion());
}

/** Un ejercicio está completo cuando tiene todas sus series (o calentamientos) del objetivo. */
const completo = e => (e.calentamiento ? e.calentamientos.length : e.series.length) >= e.objetivo;

/** Posición del ejercicio que toca ahora: el primero sin completar (-1 si están todos). */
function indiceActual(s) {
  return s.ejercicios.findIndex(e => !completo(e));
}

// ---------- Pintar ----------

export function render(id) {
  const s = estado.sesiones[id];
  if (!s) return `<p class="vacio">Este entreno ya no existe. <a href="#/">Volver a Hoy</a></p>`;
  sesionId = id;

  const actual = indiceActual(s);
  const total = s.ejercicios.length;
  // Una barra por ejercicio: hecha, la que toca ahora o pendiente.
  const barras = s.ejercicios.map((e, i) =>
    `<i class="${completo(e) ? 'hecha' : i === actual ? 'ahora' : ''}"></i>`).join('');

  return `
    <div class="barra-entreno">
      <a class="volver" href="#/">Hoy</a>
      <span class="duracion" id="duracion" aria-label="Tiempo de entreno">${s.fin ? duracion(s.fin - s.inicio) : ''}</span>
      <div id="descanso" class="descanso" role="timer" aria-label="Descanso" hidden>
        <span class="descanso-tiempo"></span>
        <span class="descanso-texto"></span>
      </div>
      ${s.fin ? '<span class="etiqueta">terminado</span>' : '<button class="boton pequeno primario" data-accion="terminarSesion">Terminar</button>'}
    </div>
    <header class="cabecera-entreno">
      <h1>${esc(s.nombre)}</h1>
      <div class="cabecera-datos">
        <label class="fecha-entreno"><span class="sr">Fecha del entreno</span>
          <input type="date" value="${s.fecha}" data-cambio="fechaSesion"></label>
        <span class="ejercicio-n">${!total ? 'Sin ejercicios' : actual < 0 ? 'Todo hecho' : `Ejercicio ${actual + 1} de ${total}`}</span>
      </div>
      ${total ? `<div class="barras-ejercicios" aria-hidden="true">${barras}</div>` : ''}
    </header>

    ${s.ejercicios.map((e, i) => pintarEjercicio(e, i === actual)).join('')}

    <button class="boton bloque" data-accion="elegirMaquinaNueva">Añadir ejercicio</button>

    <label class="nota-sesion">Notas del día
      <textarea rows="2" data-cambio="notaSesion" placeholder="Cómo te has encontrado, molestias…">${esc(s.nota)}</textarea>
    </label>

    <div class="pie-entreno">
      ${s.fin
        ? `<p class="terminado">Terminado a las ${hora(s.fin)}. Puedes seguir editándolo cuando quieras.</p>
           <button class="boton bloque" data-accion="reabrirSesion">Seguir entrenando</button>`
        : `<button class="boton primario bloque" data-accion="terminarSesion">Terminar entreno</button>`}
      <button class="boton-texto peligro" data-accion="borrarSesion">Borrar este entreno</button>
    </div>`;
}

function pintarEjercicio(ej, esActual = false) {
  const v = estado.variantes[ej.varianteId];
  if (!v) return '';
  // El ejercicio que toca ahora lleva la cabecera en placa de bronce.
  const placa = esActual && !ej.calentamiento;
  return `
    <section class="ejercicio ${ej.calentamiento ? 'es-calentamiento' : ''} ${placa ? 'actual' : ''} ${completo(ej) ? 'completo' : ''}" id="ej-${ej.id}">
      <div class="ej-cabecera">
        <div class="ej-titulo">
          <p class="ej-hueco">${esc(ej.hueco)}${ej.opcional ? ' <span class="etiqueta">opcional</span>' : ''}</p>
          <h2 class="ej-nombre"><a href="#/maquina/${v.id}">${esc(v.nombre)}</a></h2>
          ${insigniasEjercicio(ej)}
        </div>
        <div class="ej-botones">
          ${ej.calentamiento ? '' : `<button class="boton pequeno" data-accion="elegirMaquinaCambio" data-ej="${ej.id}">Cambiar</button>`}
          <button class="boton pequeno icono" data-accion="menuEjercicio" data-ej="${ej.id}" aria-label="Más opciones de ${esc(v.nombre)}">•••</button>
        </div>
      </div>
      ${ej.calentamiento ? pintarCalentamiento(ej) : pintarSeries(ej, v, placa)}
    </section>`;
}

/** Rango de la máquina y aviso de "prueba a subir" junto al nombre del hueco. */
function insigniasEjercicio(ej) {
  if (ej.calentamiento) return '';
  const p = progresoVariante(ej.varianteId);
  if (!p) return '';
  return `<p class="insignias">${insigniaRango(p.rango, 'pequeno')}${p.estancado ? ` <span class="level-up-mini">${OMEGA}Prueba a subir</span>` : ''}</p>`;
}

function pintarCalentamiento(ej) {
  const hechas = ej.calentamientos.length;
  const botones = Array.from({ length: ej.objetivo }, (_, i) => `
    <button class="disco ${i < hechas ? 'hecho' : ''}" aria-pressed="${i < hechas}"
      data-accion="calentar" data-ej="${ej.id}" data-i="${i}">
      <span class="sr">Calentamiento </span>${i + 1}
    </button>`).join('');
  return `<div class="calentamiento"><p>Series ligeras, unas 12 reps. Toca cada una al terminarla.</p>
    <div class="discos">${botones}</div></div>`;
}

function pintarSeries(ej, v, esActual = false) {
  const previa = ultimaVez(v.id);
  let aviso = '';
  if (previa) {
    const dias = diasEntre(previa.sesion.fecha, sesion().fecha);
    if (dias > 35) aviso = `<p class="aviso-paron">Hace ${Math.floor(dias / 7)} semanas que no la haces: el peso de entonces puede no valer.</p>`;
  }
  const unidad = SUFIJO[v.carga] ? `kg ${SUFIJO[v.carga]}` : 'kg';
  const filas = Math.max(ej.objetivo, ej.series.length);
  const anteriores = previa?.ejercicio.series ?? [];

  let html = '';
  for (let i = 0; i < filas; i++) {
    const hecha = ej.series[i];
    // "Previa" = esa misma serie el último día (o el peso de referencia si es la primera vez).
    const textoPrevia = anteriores[i] ? textoSerie(anteriores[i])
      : (!anteriores.length && v.referencia ? `${textoReferencia(v.referencia)} ref.` : '—');
    if (hecha) {
      const esUltima = i === ej.series.length - 1;
      html += `
        <div class="fila-serie hecha" role="row">
          <button class="celda-n" role="cell" data-accion="editarSerie" data-ej="${ej.id}" data-i="${i}" aria-label="Serie ${i + 1}: editar, añadir extra o borrar">${romano(i + 1)}</button>
          <span class="celda-previa" role="cell">${textoPrevia}</span>
          <span class="celda-campo" role="cell"><input inputmode="decimal" value="${num(hecha.peso)}" aria-label="Kilos serie ${i + 1}"
            data-cambio="campoSerie" data-ej="${ej.id}" data-i="${i}" data-campo="peso">${hecha.mas ? `<small>+ ${num(hecha.mas)}</small>` : ''}</span>
          <span class="celda-campo" role="cell"><input inputmode="numeric" value="${hecha.reps}" aria-label="Repeticiones serie ${i + 1}"
            data-cambio="campoSerie" data-ej="${ej.id}" data-i="${i}" data-campo="reps"></span>
          <button class="celda-check marcada" role="cell" data-accion="desmarcarSerie" data-ej="${ej.id}" data-i="${i}"
            aria-pressed="true" aria-label="Serie ${i + 1} hecha${esUltima ? '. Toca para desmarcarla' : ''}" ${esUltima ? '' : 'disabled'}>✓</button>
        </div>
        ${hecha.extra ? `<p class="fila-extra">+ extra: ${textoPeso(hecha.extra.peso, hecha.extra.mas)} × ${hecha.extra.reps}</p>` : ''}`;
    } else {
      const b = (borradores[`${ej.id}:${i}`] ??= propuesta(ej, i));
      html += `
        <div class="fila-serie" role="row">
          <span class="celda-n" role="cell" aria-label="Serie ${i + 1}">${romano(i + 1)}</span>
          <span class="celda-previa" role="cell">${textoPrevia}</span>
          <span class="celda-campo" role="cell"><input inputmode="decimal" value="${b.peso === null ? '' : num(b.peso)}" aria-label="Kilos serie ${i + 1}"
            data-cambio="borrador" data-ej="${ej.id}" data-i="${i}" data-campo="peso">${b.mas ? `<small>+ ${num(b.mas)}</small>` : ''}</span>
          <span class="celda-campo" role="cell"><input inputmode="numeric" value="${b.reps ?? ''}" aria-label="Repeticiones serie ${i + 1}"
            data-cambio="borrador" data-ej="${ej.id}" data-i="${i}" data-campo="reps"></span>
          <button class="celda-check" role="cell" data-accion="guardarSerie" data-ej="${ej.id}" data-i="${i}"
            aria-pressed="false" aria-label="Marcar serie ${i + 1} como hecha">✓</button>
        </div>`;
    }
  }

  const siguiente = borradores[`${ej.id}:${ej.series.length}`];
  // En la placa del ejercicio actual, la próxima serie en grande.
  const grande = esActual && siguiente && ej.series.length < filas ? `
    <div class="proxima" aria-live="polite">
      <span class="proxima-n">Serie ${romano(ej.series.length + 1)}</span>
      <span class="proxima-peso" id="proxima-peso-${ej.id}">${siguiente.peso === null ? '—' : num(siguiente.peso)}</span>
      <span class="proxima-unidad">${unidad}</span>
      <span class="proxima-reps">× <span id="proxima-reps-${ej.id}">${siguiente.reps ?? '—'}</span></span>
    </div>` : '';
  return `
    ${grande}
    ${aviso}
    <div class="tabla-series" role="table" aria-label="Series de ${esc(v.nombre)}">
      <div class="fila-serie cabeza" role="row">
        <span role="columnheader">Serie</span><span role="columnheader">Previa</span>
        <span role="columnheader">${unidad}</span><span role="columnheader">Reps</span>
        <span role="columnheader"><span class="sr">Hecha</span></span>
      </div>
      ${html}
    </div>
    <div class="bajo-tabla">
      <button class="boton pequeno" data-accion="cambiarObjetivo" data-ej="${ej.id}" data-d="1" data-sin-cerrar="1">+ Serie</button>
      ${v.sumador && siguiente ? `<button class="chip" aria-pressed="${siguiente.mas > 0}" data-accion="alternarSumador" data-ej="${ej.id}">+ ${num(v.sumador)} sumador</button>` : ''}
      <button class="chip" aria-pressed="${v.carga === 'discos_lado'}" data-accion="porLado" data-ej="${ej.id}">Por lado</button>
      <span class="objetivo">${v.repsMin}–${v.repsMax} reps</span>
    </div>
    ${pintarMolestia(ej)}`;
}

function pintarMolestia(ej) {
  const opciones = [['0', 'Ninguna'], ['1', 'Leve'], ['2', 'Fuerte']];
  return `
    <div class="molestia" role="group" aria-label="Molestia en este ejercicio">
      <span>Molestia</span>
      ${opciones.map(([valor, texto]) => `
        <button class="chip molestia-${valor}" aria-pressed="${String(ej.molestia) === valor}"
          data-accion="molestia" data-ej="${ej.id}" data-valor="${valor}">${texto}</button>`).join('')}
    </div>`;
}

// ---------- Cronómetro de descanso ----------
// Se calcula desde la hora de la última serie guardada, así siempre es correcto
// aunque cierres la app y vuelvas.

export function despues() {
  tic(true);
}

/** 754 s → "12:34"; 3754 s → "1:02:34" */
function duracion(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  return h ? `${h}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` : mmss(t);
}

export function tic(silencio = false) {
  const caja = document.getElementById('descanso');
  const s = sesion();
  if (!caja || !s) return;
  const reloj = document.getElementById('duracion');
  if (reloj && !s.fin && s.fecha === hoyISO()) reloj.textContent = duracion(Date.now() - s.inicio);
  const u = !s.fin && s.fecha === hoyISO() ? ultimoEvento(s) : null;
  if (!u) { caja.hidden = true; return; }

  const objetivo = u.corto ? ajuste('descansoCalentamiento') : ajuste('descanso');
  const pasados = (Date.now() - u.ts) / 1000;
  const quedan = objetivo - pasados;
  if (quedan < -600) { caja.hidden = true; return; } // tras 10 min, se oculta

  caja.hidden = false;
  caja.classList.toggle('listo', quedan <= 0);
  // El anillo se vacía a medida que pasa el descanso.
  caja.style.setProperty('--queda', Math.max(0, quedan / objetivo).toFixed(3));
  caja.querySelector('.descanso-texto').textContent = quedan > 0 ? 'descanso' : 'a por ella';
  caja.querySelector('.descanso-tiempo').textContent = quedan > 0 ? mmss(quedan) : `+${mmss(-quedan)}`;

  if (quedan <= 0 && ultimoPitido !== u.ts) {
    ultimoPitido = u.ts;
    if (!silencio && quedan > -5) pitar();
  }
}

// ---------- Hojas (diálogos) ----------

function hojaSerie(ej, i, conExtra) {
  const v = estado.variantes[ej.varianteId];
  const s = ej.series[i];
  const extra = s.extra ?? (conExtra ? { peso: redondear(Math.max(0, s.peso - paso(v))), mas: s.mas, reps: '' } : null);
  const campoSumador = (nombre, valor) => v.sumador
    ? `<label>Sumador <input name="${nombre}" inputmode="decimal" value="${valor ? num(valor) : ''}" placeholder="${num(v.sumador)}"></label>` : '';

  abrirHoja(`
    <form class="formulario" data-envio="guardarEdicionSerie">
      <h2>Serie ${i + 1}: ${esc(v.nombre)}</h2>
      <input type="hidden" name="ej" value="${ej.id}">
      <input type="hidden" name="i" value="${i}">
      <div class="fila-campos">
        <label>Peso (kg) <input name="peso" inputmode="decimal" value="${num(s.peso)}"></label>
        ${campoSumador('mas', s.mas)}
        <label>Reps <input name="reps" inputmode="numeric" value="${s.reps}"></label>
      </div>
      <fieldset class="caja-extra">
        <legend><label class="casilla"><input type="checkbox" name="conExtra" ${extra ? 'checked' : ''}> Serie extra tras descansar</label></legend>
        <p class="ayuda">Para cuando no llegas a las reps, descansas un minuto y terminas con menos peso. Cuenta como una sola serie.</p>
        <div class="fila-campos">
          <label>Peso (kg) <input name="exPeso" inputmode="decimal" value="${num(extra?.peso)}" ${conExtra ? 'autofocus' : ''}></label>
          ${campoSumador('exMas', extra?.mas)}
          <label>Reps <input name="exReps" inputmode="numeric" value="${extra?.reps ?? ''}"></label>
        </div>
      </fieldset>
      <div class="botones-hoja">
        <button type="button" class="boton peligro" data-accion="borrarSerie" data-ej="${ej.id}" data-i="${i}">Borrar serie</button>
        <button class="boton primario">Guardar</button>
      </div>
    </form>`);
}

/** Resumen al terminar: tiempo, series y ejercicios completados. */
function hojaVictoria(s) {
  const trabajo = s.ejercicios.filter(e => !e.calentamiento);
  const series = trabajo.reduce((n, e) => n + e.series.length, 0);
  const hechos = trabajo.filter(completo).length;
  abrirHoja(`
    <div class="victoria">
      ${OMEGA}
      <h2>Victoria</h2>
      <p class="victoria-nombre">${esc(s.nombre)}</p>
      <div class="victoria-cifras">
        <p><strong>${duracion(s.fin - s.inicio)}</strong> tiempo</p>
        <p><strong>${series}</strong> ${series === 1 ? 'serie' : 'series'}</p>
        <p><strong>${hechos}/${trabajo.length}</strong> ejercicios</p>
      </div>
      <button class="boton primario bloque" data-accion="cerrarHoja">Hecho</button>
    </div>`);
}

/** Lista de máquinas para cambiar la del ejercicio o añadir uno nuevo. */
function hojaElegirMaquina(modo, ej = null) {
  const actual = ej?.varianteId;
  const boton = v => `
    <button class="opcion-maquina ${v.id === actual ? 'actual' : ''}" data-accion="elegirMaquina"
      data-modo="${modo}" data-ej="${ej?.id ?? ''}" data-v="${v.id}" ${v.id === actual ? 'aria-current="true"' : ''}>
      <span>${esc(v.nombre)}</span>
      <span class="opcion-detalle">${detalleUltimo(v)}</span>
    </button>`;

  let secciones = '';
  let yaListadas = new Set();
  if (ej) {
    const opciones = ej.opciones.map(id => estado.variantes[id]).filter(Boolean);
    secciones += `<h3>Alternativas de la plantilla</h3>${opciones.map(boton).join('')}`;
    opciones.forEach(v => yaListadas.add(v.id));
    const patronId = estado.variantes[actual].patronId;
    const mismoTipo = Object.values(estado.variantes)
      .filter(v => v.patronId === patronId && !v.archivada && !yaListadas.has(v.id));
    if (mismoTipo.length) {
      secciones += `<h3>Mismo tipo de ejercicio</h3>${mismoTipo.map(boton).join('')}`;
      mismoTipo.forEach(v => yaListadas.add(v.id));
    }
  }
  const grupos = variantesPorPatron()
    .map(g => ({ ...g, variantes: g.variantes.filter(v => !yaListadas.has(v.id)) }))
    .filter(g => g.variantes.length);
  const todas = grupos.map(g => `<h4>${esc(g.patron.nombre)}</h4>${g.variantes.map(boton).join('')}`).join('');

  abrirHoja(`
    <div class="selector">
      <h2>${ej ? 'Cambiar máquina' : 'Añadir ejercicio'}</h2>
      ${ej?.series.length ? `<p class="ayuda">${ej.series.length === 1 ? 'La serie ya hecha se queda' : `Las ${ej.series.length} series ya hechas se quedan`} en ${esc(estado.variantes[actual].nombre)} y la nueva máquina se añade debajo.</p>` : ''}
      ${secciones}
      ${ej ? `<details><summary>Todas las máquinas</summary>${todas}</details>` : todas}
      <button class="boton bloque" data-accion="nuevaMaquinaDesdeEntreno" data-modo="${modo}" data-ej="${ej?.id ?? ''}">Crear máquina nueva</button>
    </div>`);
}

function detalleUltimo(v) {
  const u = historialVariante(v.id, sesionId)[0];
  if (u) return `${textoSerie(u.ejercicio.series[0])} · ${fechaCorta(u.sesion.fecha)}`;
  if (v.referencia) return `ref. ${textoReferencia(v.referencia)}`;
  return 'sin usar';
}

// ---------- Acciones ----------

registrar({
  // Lo que se escribe en una fila aún sin marcar.
  borrador({ ej, i, campo }, el) {
    const valor = leerNum(el.value);
    borradores[`${ej}:${i}`][campo] = valor;
    // Si es la próxima serie, actualizar el número grande de la placa.
    const grande = document.getElementById(`proxima-${campo}-${ej}`);
    if (grande && Number(i) === ejercicio(ej).series.length) grande.textContent = valor === null ? '—' : num(valor);
  },

  // Corregir el peso o las reps de una serie ya marcada.
  async campoSerie({ ej, i, campo }, el) {
    const serie = ejercicio(ej).series[Number(i)];
    const valor = leerNum(el.value);
    if (valor === null || (campo === 'reps' && !valor)) { el.value = num(serie[campo]); return; }
    serie[campo] = valor;
    await guardarSesion();
  },

  // El sumador se aplica a la próxima serie por marcar.
  alternarSumador({ ej }, el) {
    const e = ejercicio(ej);
    const v = estado.variantes[e.varianteId];
    const b = borradores[`${ej}:${e.series.length}`];
    b.mas = b.mas > 0 ? 0 : v.sumador;
    el.setAttribute('aria-pressed', String(b.mas > 0));
    pintar();
  },

  async guardarSerie({ ej, i }) {
    const e = ejercicio(ej);
    const clave = `${ej}:${i}`;
    // Leer lo escrito aunque el campo no haya perdido el foco.
    for (const campo of ['peso', 'reps']) {
      const input = document.querySelector(`input[data-cambio="borrador"][data-ej="${ej}"][data-i="${i}"][data-campo="${campo}"]`);
      if (input) borradores[clave][campo] = leerNum(input.value);
    }
    const b = borradores[clave];
    if (b.peso === null || !b.reps) { aviso('Pon los kilos y las repeticiones'); return; }
    const rangoAntes = progresoVariante(e.varianteId)?.rango;
    e.series.push({ peso: b.peso, mas: b.mas || 0, reps: b.reps, extra: null, hora: Date.now() });
    olvidarBorradores(ej);
    await guardarSesion();
    pintar();
    const rangoAhora = progresoVariante(e.varianteId)?.rango;
    if (rangoAntes && rangoAhora && rangoAhora.desde > rangoAntes.desde) {
      aviso(`¡Subes a ${rangoAhora.nombre} en ${estado.variantes[e.varianteId].nombre}!`);
    }
  },

  // Solo la última serie marcada se puede desmarcar (para deshacer un toque sin querer).
  async desmarcarSerie({ ej, i }) {
    const e = ejercicio(ej);
    if (Number(i) !== e.series.length - 1) return;
    const s = e.series.pop();
    olvidarBorradores(ej);
    borradores[`${ej}:${i}`] = { peso: s.peso, mas: s.mas, reps: s.reps };
    await guardarSesion();
    pintar();
  },

  editarSerie({ ej, i }) { hojaSerie(ejercicio(ej), Number(i), false); },
  extraSerie({ ej, i }) { hojaSerie(ejercicio(ej), Number(i), true); },

  async guardarEdicionSerie(datos) {
    const e = ejercicio(datos.get('ej'));
    const s = e.series[Number(datos.get('i'))];
    const peso = leerNum(datos.get('peso'));
    const reps = leerNum(datos.get('reps'));
    if (peso === null || !reps) { aviso('Pon el peso y las repeticiones'); return; }
    s.peso = peso;
    s.reps = reps;
    s.mas = leerNum(datos.get('mas')) ?? 0;
    const exPeso = leerNum(datos.get('exPeso'));
    const exReps = leerNum(datos.get('exReps'));
    if (datos.get('conExtra') === 'on' && exPeso !== null && exReps) {
      s.extra = { peso: exPeso, mas: leerNum(datos.get('exMas')) ?? 0, reps: exReps, hora: s.extra?.hora ?? Date.now() };
    } else {
      s.extra = null;
    }
    await guardarSesion();
    cerrarHoja();
    pintar();
  },

  async borrarSerie({ ej, i }) {
    ejercicio(ej).series.splice(Number(i), 1);
    olvidarBorradores(ej);
    await guardarSesion();
    cerrarHoja();
    pintar();
  },

  async calentar({ ej, i }) {
    const e = ejercicio(ej);
    if (Number(i) < e.calentamientos.length) e.calentamientos.pop();
    else e.calentamientos.push(Date.now());
    await guardarSesion();
    pintar();
  },

  async molestia({ ej, valor }) {
    ejercicio(ej).molestia = Number(valor);
    await guardarSesion();
    pintar();
  },

  elegirMaquinaCambio({ ej }) { hojaElegirMaquina('cambiar', ejercicio(ej)); },
  elegirMaquinaNueva() { hojaElegirMaquina('anadir'); },

  nuevaMaquinaDesdeEntreno({ modo, ej }) {
    const e = ej ? ejercicio(ej) : null;
    abrirFormularioMaquina(null, { modo, ej, patronId: e ? estado.variantes[e.varianteId].patronId : '' });
  },

  async elegirMaquina({ modo, ej, v }) {
    const s = sesion();
    if (modo === 'anadir') {
      s.ejercicios.push(nuevoEjercicio(v));
    } else {
      const e = ejercicio(ej);
      if (e.varianteId === v) { cerrarHoja(); return; }
      if (!e.opciones.includes(v)) e.opciones.push(v);
      if (e.series.length) {
        // Las series hechas son de la otra máquina: se quedan allí y se añade la nueva debajo.
        const nuevo = nuevoEjercicio(v, {
          hueco: e.hueco, opciones: e.opciones, opcional: e.opcional,
          objetivo: Math.max(1, e.objetivo - e.series.length)
        });
        e.objetivo = e.series.length;
        s.ejercicios.splice(s.ejercicios.indexOf(e) + 1, 0, nuevo);
      } else {
        e.varianteId = v;
        olvidarBorradores(e.id);
      }
    }
    await guardarSesion();
    cerrarHoja();
    pintar();
  },

  // Interruptor «Por lado»: se guarda en la máquina. Antes de cambiar pregunta qué hacer con el peso.
  porLado({ ej }) {
    const e = ejercicio(ej);
    const v = estado.variantes[e.varianteId];
    const aLado = v.carga !== 'discos_lado';
    const actual = propuesta(e).peso;
    const sugerido = actual === null ? '' : num(redondear(aLado ? actual / 2 : actual * 2));
    abrirHoja(`
      <form class="formulario" data-envio="confirmarPorLado">
        <h2>${aLado ? 'Peso por lado' : 'Peso en total'}</h2>
        <p>Vas a cambiar <strong>${esc(v.nombre)}</strong> a ${aLado ? 'peso por lado' : 'peso en total (los dos lados juntos)'}.</p>
        <input type="hidden" name="ej" value="${ej}">
        ${actual === null ? '' : `
          <p>Peso actual: <strong>${num(actual)} kg</strong></p>
          <label class="casilla"><input type="radio" name="opcion" value="mantener" checked> Mantener este peso</label>
          <label class="casilla"><input type="radio" name="opcion" value="nuevo"> Nuevo peso</label>
          <label>Nuevo peso (kg)
            <input name="nuevo" inputmode="decimal" placeholder="${sugerido}" data-entrada="elegirNuevoPeso">
          </label>
          <p class="ayuda">Con un peso nuevo se ajusta todo el historial de esta máquina en la misma proporción, para que la gráfica y el RM sigan cuadrando.</p>`}
        <div class="botones-hoja">
          <button type="button" class="boton" data-accion="cerrarHoja">Cancelar</button>
          <button class="boton primario">Cambiar</button>
        </div>
      </form>`);
  },

  // Escribir un peso nuevo marca la opción «Nuevo peso».
  elegirNuevoPeso(_d, el) {
    el.form.querySelector('input[value="nuevo"]').checked = true;
  },

  async confirmarPorLado(datos) {
    const e = ejercicio(datos.get('ej'));
    const v = estado.variantes[e.varianteId];
    const aLado = v.carga !== 'discos_lado';
    let factor = 1;
    if (datos.get('opcion') === 'nuevo') {
      const nuevo = leerNum(datos.get('nuevo'));
      const actual = propuesta(e).peso;
      if (!nuevo) { aviso('Pon el peso nuevo'); return; }
      if (actual) factor = nuevo / actual;
    }
    if (aLado) {
      v.cargaAntes = v.carga; // para volver a ella si se desmarca
      v.carga = 'discos_lado';
    } else {
      v.carga = v.cargaAntes && v.cargaAntes !== 'discos_lado' ? v.cargaAntes : 'discos_total';
      delete v.cargaAntes;
    }
    if (factor !== 1) await reescalarHistorial(v, factor);
    await guardarObj('variantes', v);
    sesion().ejercicios.filter(x => x.varianteId === v.id).forEach(x => olvidarBorradores(x.id));
    cerrarHoja();
    pintar();
    aviso(aLado ? 'Ahora: peso por lado' : 'Ahora: peso en total');
  },

  menuEjercicio({ ej }) {
    const e = ejercicio(ej);
    const v = estado.variantes[e.varianteId];
    abrirHoja(`
      <div class="menu">
        <h2>${esc(v.nombre)}</h2>
        <a class="boton bloque" href="#/maquina/${v.id}" data-accion="cerrarHoja">Ver historial de la máquina</a>
        <button class="boton bloque" data-accion="moverEjercicio" data-ej="${ej}" data-d="-1">Subir</button>
        <button class="boton bloque" data-accion="moverEjercicio" data-ej="${ej}" data-d="1">Bajar</button>
        <button class="boton bloque" data-accion="cambiarObjetivo" data-ej="${ej}" data-d="1">Una serie más de objetivo (${e.objetivo})</button>
        <button class="boton bloque" data-accion="cambiarObjetivo" data-ej="${ej}" data-d="-1">Una serie menos de objetivo</button>
        <button class="boton bloque peligro" data-accion="quitarEjercicio" data-ej="${ej}">Quitar del entreno</button>
      </div>`);
  },

  async moverEjercicio({ ej, d }) {
    const lista = sesion().ejercicios;
    const i = lista.findIndex(e => e.id === ej);
    const j = i + Number(d);
    if (j < 0 || j >= lista.length) return;
    [lista[i], lista[j]] = [lista[j], lista[i]];
    await guardarSesion();
    cerrarHoja();
    pintar();
    document.getElementById(`ej-${ej}`)?.scrollIntoView({ block: 'center' });
  },

  async cambiarObjetivo({ ej, d }) {
    const e = ejercicio(ej);
    e.objetivo = Math.max(1, e.objetivo + Number(d));
    await guardarSesion();
    cerrarHoja();
    pintar();
  },

  async quitarEjercicio({ ej }) {
    const e = ejercicio(ej);
    if (e.series.length && !confirm('Este ejercicio tiene series apuntadas. ¿Quitarlo igualmente?')) return;
    sesion().ejercicios = sesion().ejercicios.filter(x => x.id !== ej);
    await guardarSesion();
    cerrarHoja();
    pintar();
  },

  async fechaSesion(_d, el) {
    if (!el.value) return;
    sesion().fecha = el.value;
    await guardarSesion();
    pintar();
  },

  async notaSesion(_d, el) {
    sesion().nota = el.value;
    await guardarSesion();
  },

  async terminarSesion() {
    const s = sesion();
    if (sesionVacia(s)) { ir('#/'); return; } // sin nada apuntado: al salir se descarta
    s.fin = Date.now();
    await guardarSesion();
    // La hoja de victoria se abre al llegar a Hoy (al cambiar de pantalla se cierran las hojas).
    window.addEventListener('hashchange', () => setTimeout(() => hojaVictoria(s)), { once: true });
    ir('#/');
  },

  async reabrirSesion() {
    sesion().fin = null;
    await guardarSesion();
    pintar();
  },

  async borrarSesion() {
    if (!confirm('¿Borrar este entreno? No se puede deshacer.')) return;
    await borrarObj('sesiones', sesionId);
    aviso('Entreno borrado');
    ir('#/');
  }
});
