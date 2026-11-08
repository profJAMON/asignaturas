// ajustes.js — Copias de seguridad (exportar / importar), exportar a CSV
// y ajustes de descansos y objetivo semanal.

import { estado, lista, ajuste, fijarAjuste, reemplazarDatos, sesionesOrdenadas } from '../estado.js';
import { ALMACENES } from '../db.js';
import { registrar, pintar, aviso } from '../ui.js';
import { hoyISO, fechaCorta, diasEntre, num } from '../utilidades.js';
import { nombreActividad } from './actividades.js';

export const ruta = 'ajustes';
export const pestana = 'ajustes';

export const VERSION_APP = '1.4.0';

let persistente = null; // ¿iOS ha prometido no borrar los datos?

export function render() {
  const ultima = ajuste('ultimaCopia');
  const numSesiones = lista('sesiones').length;
  return `
    <header class="cabecera"><h1>Ajustes</h1></header>

    <section aria-labelledby="t-copia">
      <h2 id="t-copia">Copia de seguridad</h2>
      <p class="ayuda">Tus datos solo están en este iPhone. Guarda la copia en iCloud Drive o en Archivos
        con el menú de compartir. Si cambias de móvil o borras la app, la importas y lo recuperas todo.</p>
      <p class="estado-copia">${ultima
        ? `Última copia: ${fechaCorta(ultima)} (${diasEntre(ultima, hoyISO()) === 0 ? 'hoy' : `hace ${diasEntre(ultima, hoyISO())} días`})`
        : 'Todavía no has hecho ninguna copia.'}</p>
      <button class="boton primario bloque" data-accion="exportarCopia">Hacer copia de seguridad</button>
      <label class="boton bloque boton-archivo">Importar una copia
        <input type="file" accept=".json,application/json" data-cambio="importarCopia">
      </label>
    </section>

    <section aria-labelledby="t-csv">
      <h2 id="t-csv">Exportar a Excel</h2>
      <p class="ayuda">Archivos CSV para abrir en Excel o Google Sheets. Una fila por serie.</p>
      <div class="fila-botones">
        <button class="boton" data-accion="exportarSeriesCSV">Series (${numSesiones} entrenos)</button>
        <button class="boton" data-accion="exportarActividadesCSV">Actividades</button>
      </div>
    </section>

    <section aria-labelledby="t-entreno">
      <h2 id="t-entreno">Entreno</h2>
      <div class="fila-campos">
        <label>Descanso entre series (s)
          <input inputmode="numeric" value="${ajuste('descanso')}" data-cambio="ajusteNumero" data-clave="descanso">
        </label>
        <label>Entre calentamientos (s)
          <input inputmode="numeric" value="${ajuste('descansoCalentamiento')}" data-cambio="ajusteNumero" data-clave="descansoCalentamiento">
        </label>
      </div>
      <label>Días de gimnasio por semana (objetivo)
        <input inputmode="numeric" value="${ajuste('diasObjetivo')}" data-cambio="ajusteNumero" data-clave="diasObjetivo">
      </label>
      <label>Mínimo de días por semana (para la racha)
        <input inputmode="numeric" value="${ajuste('diasMinimo')}" data-cambio="ajusteNumero" data-clave="diasMinimo">
      </label>
      <p class="ayuda">El cronómetro solo puede sonar con la app abierta en pantalla. Para el aviso con el móvil bloqueado, sigue usando el reloj.</p>
    </section>

    <section aria-labelledby="t-perfil">
      <h2 id="t-perfil">Perfil</h2>
      <p class="ayuda">Para el rango de fuerza en peso libre. Se guarda solo en este iPhone. El peso se apunta en la pestaña Cuerpo.</p>
      <div class="fila-campos">
        <label>Sexo
          <select data-cambio="ajusteTexto" data-clave="sexo">
            <option value="hombre" ${ajuste('sexo') === 'hombre' ? 'selected' : ''}>Hombre</option>
            <option value="mujer" ${ajuste('sexo') === 'mujer' ? 'selected' : ''}>Mujer</option>
          </select>
        </label>
        <label>Año de nacimiento
          <input inputmode="numeric" value="${ajuste('anyoNacimiento') ?? ''}" placeholder="1996" data-cambio="ajusteNumero" data-clave="anyoNacimiento">
        </label>
        <label>Altura (cm)
          <input inputmode="numeric" value="${ajuste('altura') ?? ''}" placeholder="179" data-cambio="ajusteNumero" data-clave="altura">
        </label>
      </div>
    </section>

    <section aria-labelledby="t-acerca">
      <h2 id="t-acerca">Acerca de</h2>
      <p class="ayuda">Versión ${VERSION_APP}. ${persistente === true
        ? 'iOS ha marcado tus datos como permanentes.'
        : persistente === false ? 'iOS no ha confirmado que tus datos sean permanentes: haz copias a menudo.' : ''}</p>
    </section>`;
}

export function despues() {
  if (persistente === null && navigator.storage?.persisted) {
    navigator.storage.persisted().then(v => { persistente = v; pintar(); });
  }
}

// ---------- Compartir / descargar un archivo ----------

async function entregarArchivo(nombre, contenido, tipo) {
  const archivo = new File([contenido], nombre, { type: tipo });
  // En el iPhone, el menú de compartir permite "Guardar en Archivos".
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo] });
      return true;
    } catch (error) {
      if (error.name === 'AbortError') return false; // el usuario canceló
    }
  }
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 5000);
  return true;
}

// ---------- CSV ----------
// Separador ";" y coma decimal, que es lo que entiende Excel en español.

function celda(valor) {
  const t = typeof valor === 'number' ? num(valor) : String(valor ?? '');
  return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

function csv(filas) {
  return '﻿' + filas.map(f => f.map(celda).join(';')).join('\r\n');
}

const MOLESTIA = ['', 'leve', 'fuerte'];

registrar({
  async exportarCopia() {
    const datos = {};
    for (const nombre of ALMACENES) datos[nombre] = nombre === 'ajustes' ? [estado.ajustes] : lista(nombre);
    const copia = { app: 'entreno', version: 1, exportado: new Date().toISOString(), datos };
    const ok = await entregarArchivo(`entreno-copia-${hoyISO()}.json`, JSON.stringify(copia, null, 1), 'application/json');
    if (ok) {
      await fijarAjuste('ultimaCopia', hoyISO());
      aviso('Copia hecha');
      pintar();
    }
  },

  async importarCopia(_d, el) {
    const archivo = el.files[0];
    if (!archivo) return;
    try {
      const copia = JSON.parse(await archivo.text());
      if (copia.app !== 'entreno' || !copia.datos) throw new Error('formato');
      const n = copia.datos.sesiones?.length ?? 0;
      if (!confirm(`La copia tiene ${n} entrenos. Sustituirá TODO lo que hay ahora en la app. ¿Seguir?`)) return;
      await reemplazarDatos(copia.datos);
      aviso('Copia importada');
      pintar();
    } catch {
      aviso('Ese archivo no es una copia de esta app');
    } finally {
      el.value = '';
    }
  },

  async exportarSeriesCSV() {
    const filas = [['fecha', 'entreno', 'hueco', 'tipo_ejercicio', 'maquina', 'serie', 'peso', 'sumador', 'total',
      'reps', 'extra_peso', 'extra_sumador', 'extra_reps', 'molestia', 'notas_dia']];
    for (const s of sesionesOrdenadas().reverse()) {
      for (const e of s.ejercicios) {
        if (e.calentamiento) continue;
        const v = estado.variantes[e.varianteId];
        const tipo = estado.patrones[v?.patronId]?.nombre ?? '';
        e.series.forEach((x, i) => filas.push([
          s.fecha, s.nombre, e.hueco, tipo, v?.nombre ?? '', i + 1, x.peso, x.mas || '', x.peso + (x.mas || 0),
          x.reps, x.extra?.peso ?? '', x.extra?.mas || '', x.extra?.reps ?? '', MOLESTIA[e.molestia], i === 0 ? s.nota : ''
        ]));
      }
    }
    await entregarArchivo(`entreno-series-${hoyISO()}.csv`, csv(filas), 'text/csv');
  },

  async exportarActividadesCSV() {
    const filas = [['fecha', 'actividad', 'minutos', 'notas']];
    lista('actividades').sort((a, b) => a.fecha.localeCompare(b.fecha))
      .forEach(a => filas.push([a.fecha, nombreActividad(a), a.minutos ?? '', a.nota]));
    await entregarArchivo(`entreno-actividades-${hoyISO()}.csv`, csv(filas), 'text/csv');
  },

  async ajusteTexto({ clave }, el) {
    await fijarAjuste(clave, el.value);
    aviso('Guardado');
  },

  async ajusteNumero({ clave }, el) {
    const n = parseInt(el.value, 10);
    if (!(n > 0)) { aviso('Pon un número mayor que cero'); el.value = ajuste(clave); return; }
    await fijarAjuste(clave, n);
    aviso('Guardado');
  }
});
