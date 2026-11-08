// estado.js — Los datos se cargan enteros en memoria al abrir la app
// (son pocos) y cada cambio se guarda a la vez en IndexedDB.

import * as db from './db.js';
import { crearDatosIniciales } from './datos-iniciales.js';
import { hoyISO, lunesDe, sumarDias } from './utilidades.js';

export const estado = {
  patrones: {},
  variantes: {},
  plantillas: {},
  sesiones: {},
  actividades: {},
  ajustes: {},
  medidas: {}
};

// Valores por defecto de los ajustes.
const AJUSTES_DEFECTO = {
  descanso: 180,              // segundos entre series
  descansoCalentamiento: 60,  // segundos entre series de calentamiento
  diasObjetivo: 5,            // días de gimnasio por semana
  diasMinimo: 3,              // días mínimos para mantener la racha
  ultimaCopia: null,          // fecha de la última copia de seguridad
  sexo: 'hombre'              // para el rango de fuerza
};

export async function cargarEstado() {
  await db.abrirBD();
  for (const nombre of db.ALMACENES) {
    estado[nombre] = {};
    for (const obj of await db.leerTodos(nombre)) estado[nombre][obj.id] = obj;
  }
  estado.ajustes = estado.ajustes.general ?? { id: 'general' };

  // Máquinas creadas con una versión anterior: añadir los campos nuevos del catálogo.
  const catalogo = crearDatosIniciales().variantes;
  for (const v of Object.values(estado.variantes)) {
    if (!('estandar' in v)) {
      v.estandar = catalogo.find(c => c.id === v.id)?.estandar ?? null;
      await db.guardar('variantes', v);
    }
  }

  // Entrenos vacíos de días anteriores (abiertos sin querer, sin nada apuntado): se borran.
  for (const s of Object.values(estado.sesiones)) {
    if (s.fecha < hoyISO() && sesionVacia(s)) await borrarObj('sesiones', s.id);
  }

  // Primera vez: no hay plantillas → cargar el catálogo inicial.
  if (Object.keys(estado.plantillas).length === 0 && Object.keys(estado.variantes).length === 0) {
    const iniciales = crearDatosIniciales();
    for (const nombre of ['patrones', 'variantes', 'plantillas']) {
      for (const obj of iniciales[nombre]) await guardarObj(nombre, obj);
    }
  }
}

export async function guardarObj(almacen, obj) {
  estado[almacen][obj.id] = obj;
  await db.guardar(almacen, obj);
}

export async function borrarObj(almacen, id) {
  delete estado[almacen][id];
  await db.borrar(almacen, id);
}

export function ajuste(clave) {
  return estado.ajustes[clave] ?? AJUSTES_DEFECTO[clave];
}

export async function fijarAjuste(clave, valor) {
  estado.ajustes[clave] = valor;
  await db.guardar('ajustes', estado.ajustes);
}

/** Recarga todo desde la base de datos (tras importar una copia). */
export async function reemplazarDatos(datos) {
  await db.reemplazarTodo(datos);
  await cargarEstado();
}

// ---------- Consultas ----------

export const lista = almacen => Object.values(estado[almacen]);

/** ¿El entreno tiene algo apuntado? (los vacíos no cuentan en el calendario) */
export function tieneDatos(sesion) {
  return sesion.ejercicios.some(e => e.series.length || e.calentamientos?.length);
}

/** Entreno vacío: sin series, sin calentamientos y sin nota. Estos no se guardan. */
export function sesionVacia(sesion) {
  return !tieneDatos(sesion) && !sesion.nota?.trim();
}

/** Sesiones de más reciente a más antigua. */
export function sesionesOrdenadas() {
  return lista('sesiones').sort((a, b) =>
    a.fecha === b.fecha ? b.inicio - a.inicio : (a.fecha < b.fecha ? 1 : -1));
}

/** Todas las veces que se ha usado una máquina, de la más reciente a la más antigua. */
export function historialVariante(varianteId, excluirSesionId = null) {
  const resultado = [];
  for (const sesion of sesionesOrdenadas()) {
    if (sesion.id === excluirSesionId) continue;
    for (const ejercicio of sesion.ejercicios) {
      if (ejercicio.varianteId === varianteId && ejercicio.series.length) resultado.push({ sesion, ejercicio });
    }
  }
  return resultado;
}

export function ultimaSesionDePlantilla(plantillaId) {
  return sesionesOrdenadas().find(s => s.plantillaId === plantillaId && tieneDatos(s)) ?? null;
}

export function plantillasOrdenadas() {
  return lista('plantillas').sort((a, b) => a.orden - b.orden);
}

/** Máquinas agrupadas por tipo de ejercicio, ordenadas por nombre. */
export function variantesPorPatron({ incluirArchivadas = false } = {}) {
  const grupos = lista('patrones')
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .map(patron => ({
      patron,
      variantes: lista('variantes')
        .filter(v => v.patronId === patron.id && (incluirArchivadas || !v.archivada))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    }));
  return grupos.filter(g => g.variantes.length);
}

/** Días con gimnasio entre el lunes indicado y el domingo de esa semana. */
export function diasGimnasioSemana(lunes, fechas = new Set(lista('sesiones').filter(tieneDatos).map(s => s.fecha))) {
  let n = 0;
  for (let i = 0; i < 7; i++) if (fechas.has(sumarDias(lunes, i))) n++;
  return n;
}

/**
 * Racha: semanas seguidas llegando al mínimo de días.
 * La semana actual suma si ya llega al mínimo, pero no rompe la racha mientras está en curso.
 */
export function rachaSemanas() {
  const fechas = new Set(lista('sesiones').filter(tieneDatos).map(s => s.fecha));
  const minimo = ajuste('diasMinimo');
  let lunes = lunesDe(hoyISO());
  let racha = diasGimnasioSemana(lunes, fechas) >= minimo ? 1 : 0;
  lunes = sumarDias(lunes, -7);
  while (diasGimnasioSemana(lunes, fechas) >= minimo) {
    racha++;
    lunes = sumarDias(lunes, -7);
  }
  return racha;
}
