// cuerpo.js — Cálculos del cuerpo: series semanales por músculo, objetivos,
// peso corporal y rango de fuerza orientativo en ejercicios de peso libre.

import { estado, lista, ajuste, tieneDatos } from './estado.js';
import { MUSCULOS } from './datos-iniciales.js';
import { sumarDias } from './utilidades.js';
import { progresoVariante, rmEstimado, RANGOS } from './progreso.js';

// ---------- Objetivos de series semanales ----------
// [mínimo, máximo]. Pierna en prioridad; el resto en mantenimiento.
export const OBJETIVOS_DEFECTO = {
  pecho: [6, 12], dorsales: [6, 12], trapecio: [4, 10], lumbar: [2, 8],
  hombro_ant: [4, 10], hombro_lat: [6, 12], hombro_post: [6, 12],
  biceps: [6, 12], triceps: [6, 12], antebrazo: [0, 8], abdominales: [4, 10],
  cuadriceps: [12, 20], gluteos: [12, 20], isquios: [10, 16], aductores: [6, 12], gemelos: [6, 12]
};

export function objetivoMusculo(id) {
  return ajuste('objetivosMusculo')?.[id] ?? OBJETIVOS_DEFECTO[id] ?? [6, 12];
}

/**
 * Series de una semana (de lunes a domingo) por músculo.
 * Cada serie cuenta según el peso del músculo en ese tipo de ejercicio:
 * 1 principal, 0,5 secundario, 0,25 menor. La serie extra no cuenta aparte.
 * Devuelve { pecho: { total, detalle: [{ variante, series, peso }] }, ... }
 */
export function volumenSemana(lunes) {
  const domingo = sumarDias(lunes, 6);
  const resultado = Object.fromEntries(MUSCULOS.map(m => [m.id, { total: 0, detalle: [] }]));
  for (const sesion of lista('sesiones')) {
    if (sesion.fecha < lunes || sesion.fecha > domingo || !tieneDatos(sesion)) continue;
    for (const e of sesion.ejercicios) {
      if (e.calentamiento || !e.series.length) continue;
      const v = estado.variantes[e.varianteId];
      const musculos = estado.patrones[v?.patronId]?.musculos ?? {};
      for (const [m, peso] of Object.entries(musculos)) {
        if (!resultado[m]) continue;
        resultado[m].total += e.series.length * peso;
        const fila = resultado[m].detalle.find(d => d.variante === v.id);
        if (fila) fila.series += e.series.length;
        else resultado[m].detalle.push({ variante: v.id, series: e.series.length, peso });
      }
    }
  }
  return resultado;
}

/** "sin" (nada), "bajo" (por debajo), "ok" (dentro) o "alto" (te pasas). */
export function estadoMusculo(total, [min, max]) {
  if (total <= 0) return 'sin';
  if (total < min) return 'bajo';
  if (total > max) return 'alto';
  return 'ok';
}

// ---------- Peso corporal ----------

export function medidasOrdenadas() {
  return lista('medidas').sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function pesoActual() {
  return medidasOrdenadas().filter(m => m.peso).at(-1)?.peso ?? null;
}

// ---------- Rango de fuerza (peso libre) ----------
// Multiplicadores de peso corporal orientativos para hombres, a partir de los que
// se suelen usar como referencia. No son una tabla oficial: sirven para motivarte.
// Cada valor es el RM estimado / tu peso a partir del cual entras en
// Plata, Oro, Platino, Diamante y Élite (por debajo del primero, Bronce).
export const ESTANDARES = {
  press_banca: { nombre: 'Press de banca con barra', umbrales: [0.75, 1.0, 1.25, 1.5, 1.9] },
  sentadilla: { nombre: 'Sentadilla con barra', umbrales: [1.0, 1.35, 1.7, 2.1, 2.6] },
  peso_muerto: { nombre: 'Peso muerto con barra', umbrales: [1.25, 1.6, 2.0, 2.5, 3.0] },
  press_militar: { nombre: 'Press militar con barra', umbrales: [0.5, 0.65, 0.8, 1.0, 1.25] },
  press_militar_mancuerna: { nombre: 'Press militar con mancuernas (por mano)', umbrales: [0.2, 0.28, 0.36, 0.45, 0.55] },
  remo_barra: { nombre: 'Remo con barra', umbrales: [0.65, 0.9, 1.1, 1.35, 1.65] },
  curl_barra: { nombre: 'Curl con barra', umbrales: [0.4, 0.55, 0.7, 0.85, 1.05] },
  curl_mancuerna: { nombre: 'Curl con mancuerna (por mano)', umbrales: [0.2, 0.28, 0.36, 0.46, 0.58] },
  hip_thrust: { nombre: 'Hip thrust con barra', umbrales: [1.0, 1.5, 2.0, 2.5, 3.0] },
  dominadas_lastre: { nombre: 'Dominadas (peso corporal + lastre)', umbrales: [1.0, 1.15, 1.35, 1.55, 1.8] }
};
const FACTOR_MUJER = 0.65;

/** Rango de fuerza de una máquina con estándar asignado. null si no aplica o falta el peso. */
export function rangoFuerza(varianteId) {
  const v = estado.variantes[varianteId];
  const estandar = ESTANDARES[v?.estandar];
  const peso = pesoActual();
  const prog = progresoVariante(varianteId);
  if (!estandar || !peso || !prog) return null;
  // En las máquinas apuntadas por lado, el peso total es el doble.
  const kilos = prog.mejor * (v.carga === 'discos_lado' ? 2 : 1);
  return calcularRango(estandar, v.estandar, kilos, peso);
}

/** Rango de fuerza de una marca apuntada a mano (Cuerpo → Marcas en peso libre). */
export function rangoMarca(marca) {
  const estandar = ESTANDARES[marca.estandar];
  const peso = pesoActual();
  if (!estandar || !peso || !marca.kg) return null;
  return calcularRango(estandar, marca.estandar, rmEstimado(marca.kg, marca.reps || 1), peso);
}

/** Compara el RM con el peso corporal: rango alcanzado y lo que falta para el siguiente. */
function calcularRango(estandar, estandarId, rmKilos, peso) {
  const factor = ajuste('sexo') === 'mujer' ? FACTOR_MUJER : 1;
  // En dominadas se mueve el propio cuerpo: se suma el peso corporal al lastre.
  const rm = estandarId === 'dominadas_lastre' ? rmKilos + peso : rmKilos;
  const ratio = rm / peso;
  let i = 0;
  while (i < estandar.umbrales.length && ratio >= estandar.umbrales[i] * factor) i++;
  const siguiente = estandar.umbrales[i] ? { rango: RANGOS[i + 1], kg: estandar.umbrales[i] * factor * peso - rm } : null;
  return { rango: RANGOS[i], ratio, estandar, siguiente };
}
