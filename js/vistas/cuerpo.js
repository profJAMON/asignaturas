// cuerpo.js (vista) — Pestaña "Cuerpo": mapa muscular de la semana con las series
// por músculo, composición corporal y rango de fuerza en peso libre.

import { estado, lista, ajuste, fijarAjuste, guardarObj, borrarObj } from '../estado.js';
import { MUSCULOS } from '../datos-iniciales.js';
import { registrar, pintar, abrirHoja, cerrarHoja, aviso } from '../ui.js';
import { esc, num, leerNum, nuevoId, hoyISO, lunesDe, sumarDias, deISO, fechaCorta, MESES } from '../utilidades.js';
import { volumenSemana, objetivoMusculo, estadoMusculo, OBJETIVOS_DEFECTO, medidasOrdenadas, rangoFuerza, rangoMarca, ESTANDARES } from '../cuerpo.js';
import { mapaCuerpo } from './mapa-cuerpo.js';
import { insigniaRango } from './maquinas.js';

export const ruta = 'cuerpo';
export const pestana = 'cuerpo';

const TEXTO_ESTADO = { sin: 'sin trabajo', bajo: 'por debajo', ok: 'en objetivo', alto: 'te pasas' };
const nombreMusculo = id => MUSCULOS.find(m => m.id === id)?.nombre ?? id;
const r1 = n => num(Math.round(n * 10) / 10);

let lunesVisto = null; // semana que se está viendo

function textoSemana(lunes) {
  const a = deISO(lunes), b = deISO(sumarDias(lunes, 6));
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()} al ${b.getDate()} de ${MESES[b.getMonth()]}`
    : `${a.getDate()} de ${MESES[a.getMonth()]} al ${b.getDate()} de ${MESES[b.getMonth()]}`;
}

export function render(param) {
  const esta = lunesDe(hoyISO());
  lunesVisto = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? lunesDe(param) : esta;
  const volumen = volumenSemana(lunesVisto);

  const estados = {};
  const nombres = {};
  for (const m of MUSCULOS) {
    estados[m.id] = estadoMusculo(volumen[m.id].total, objetivoMusculo(m.id));
    nombres[m.id] = `${m.nombre}: ${r1(volumen[m.id].total)} series, ${TEXTO_ESTADO[estados[m.id]]}`;
  }

  const filas = MUSCULOS.map(m => {
    const [min, max] = objetivoMusculo(m.id);
    const total = volumen[m.id].total;
    const tope = Math.max(max * 1.25, total, 1);
    return `
      <button class="fila-musculo" data-accion="verMusculo" data-m="${m.id}">
        <span class="fila-musculo-nombre">${m.nombre}</span>
        <span class="fila-musculo-series"><strong>${r1(total)}</strong> / ${min}–${max}</span>
        <span class="barra-musculo" aria-hidden="true">
          <i class="rango-objetivo" style="left:${min / tope * 100}%;width:${(max - min) / tope * 100}%"></i>
          <i class="relleno estado-${estados[m.id]}" style="width:${Math.min(100, total / tope * 100)}%"></i>
        </span>
        <span class="fila-musculo-estado estado-texto-${estados[m.id]}">${TEXTO_ESTADO[estados[m.id]]}</span>
      </button>`;
  }).join('');

  return `
    <header class="cabecera"><h1>Cuerpo</h1></header>

    <section aria-labelledby="t-volumen">
      <div class="nav-semana">
        <a class="boton pequeno icono" href="#/cuerpo/${sumarDias(lunesVisto, -7)}" aria-label="Semana anterior">‹</a>
        <h2 id="t-volumen">Semana del ${textoSemana(lunesVisto)}</h2>
        ${lunesVisto < esta ? `<a class="boton pequeno icono" href="#/cuerpo/${sumarDias(lunesVisto, 7)}" aria-label="Semana siguiente">›</a>` : '<span class="hueco-boton"></span>'}
      </div>
      ${mapaCuerpo(estados, nombres)}
      <ul class="leyenda-cuerpo">
        <li><i class="estado-sin"></i> Sin trabajo</li>
        <li><i class="estado-bajo"></i> Por debajo</li>
        <li><i class="estado-ok"></i> En objetivo</li>
        <li><i class="estado-alto"></i> Te pasas</li>
      </ul>
      <p class="ayuda">Series de la semana por músculo. Las indirectas cuentan menos: media serie si es secundario,
        un cuarto si apenas trabaja. Toca un músculo para ver de dónde salen y cambiar su objetivo.</p>
      <div class="lista-musculos">${filas}</div>
    </section>

    ${seccionComposicion()}
    ${seccionFuerza()}`;
}

// ---------- Composición corporal ----------

function graficaPeso(medidas) {
  const puntos = medidas.filter(m => m.peso);
  if (puntos.length < 2) return '';
  const A = 340, H = 140, izq = 36, der = 10, arr = 10, abj = 22;
  const t0 = deISO(puntos[0].fecha).getTime();
  const t1 = Math.max(deISO(puntos.at(-1).fecha).getTime(), t0 + 86400000);
  let min = Math.min(...puntos.map(p => p.peso)), max = Math.max(...puntos.map(p => p.peso));
  const margen = Math.max(1, (max - min) * 0.2);
  min -= margen; max += margen;
  const x = f => izq + (deISO(f).getTime() - t0) / (t1 - t0) * (A - izq - der);
  const y = v => arr + (1 - (v - min) / (max - min)) * (H - arr - abj);
  const marcas = [min, (min + max) / 2, max].map(v => Math.round(v * 10) / 10);
  return `
    <figure class="grafica">
      <svg viewBox="0 0 ${A} ${H}" role="img" aria-label="Evolución del peso corporal">
        ${marcas.map(v => `<line class="rejilla" x1="${izq}" x2="${A - der}" y1="${y(v)}" y2="${y(v)}"/><text class="eje" x="${izq - 6}" y="${y(v) + 4}" text-anchor="end">${num(v)}</text>`).join('')}
        <text class="eje" x="${x(puntos[0].fecha)}" y="${H - 6}">${fechaCorta(puntos[0].fecha)}</text>
        <text class="eje" x="${x(puntos.at(-1).fecha)}" y="${H - 6}" text-anchor="end">${fechaCorta(puntos.at(-1).fecha)}</text>
        <path class="serie-rm solida" d="${puntos.map((p, i) => `${i ? 'L' : 'M'}${x(p.fecha)},${y(p.peso)}`).join(' ')}"/>
        ${puntos.map(p => `<circle class="punto punto-azul" cx="${x(p.fecha)}" cy="${y(p.peso)}" r="4"><title>${fechaCorta(p.fecha)}: ${num(p.peso)} kg</title></circle>`).join('')}
      </svg>
    </figure>`;
}

function seccionComposicion() {
  const medidas = medidasOrdenadas();
  const ultima = medidas.at(-1);
  const filas = medidas.slice(-6).reverse().map(m => `
    <button class="fila-dia" data-accion="editarMedida" data-id="${m.id}">
      <span>${fechaCorta(m.fecha)}</span>
      <span class="opcion-detalle">${[m.peso ? `${num(m.peso)} kg` : '', m.grasa ? `${num(m.grasa)} % grasa` : '', m.musculo ? `${num(m.musculo)} kg músculo` : ''].filter(Boolean).join(', ')}</span>
    </button>`).join('');
  return `
    <section aria-labelledby="t-composicion">
      <h2 id="t-composicion">Peso y composición</h2>
      ${ultima ? `
        <div class="cifras">
          ${ultima.peso ? `<p><strong>${num(ultima.peso)}</strong> kg</p>` : ''}
          ${ultima.grasa ? `<p><strong>${num(ultima.grasa)}</strong> % grasa</p>` : ''}
          ${ultima.musculo ? `<p><strong>${num(ultima.musculo)}</strong> kg músculo</p>` : ''}
        </div>
        ${graficaPeso(medidas)}
        <div class="lista-medidas">${filas}</div>`
      : '<p class="ayuda">Apunta tu peso cuando te peses. Hace falta para el rango de fuerza.</p>'}
      <button class="boton bloque" data-accion="nuevaMedida">Apuntar medida</button>
    </section>`;
}

function formularioMedida(m = null) {
  const x = m ?? { id: '', fecha: hoyISO(), peso: null, grasa: null, musculo: null, nota: '' };
  abrirHoja(`
    <form class="formulario" data-envio="guardarMedida">
      <h2>${m ? 'Editar medida' : 'Apuntar medida'}</h2>
      <input type="hidden" name="id" value="${x.id}">
      <label>Fecha <input type="date" name="fecha" value="${x.fecha}" required></label>
      <div class="fila-campos">
        <label>Peso (kg) <input name="peso" inputmode="decimal" value="${num(x.peso)}" ${m ? '' : 'autofocus'}></label>
        <label>% grasa <input name="grasa" inputmode="decimal" value="${num(x.grasa)}" placeholder="Opcional"></label>
      </div>
      <label>Masa muscular esquelética (kg) <input name="musculo" inputmode="decimal" value="${num(x.musculo)}" placeholder="Opcional (InBody)"></label>
      <label>Notas <textarea name="nota" rows="2" placeholder="InBody, en ayunas…">${esc(x.nota)}</textarea></label>
      <div class="botones-hoja">
        ${m ? `<button type="button" class="boton peligro" data-accion="borrarMedida" data-id="${m.id}">Borrar</button>`
            : '<button type="button" class="boton" data-accion="cerrarHoja">Cancelar</button>'}
        <button class="boton primario">Guardar</button>
      </div>
    </form>`);
}

// ---------- Rango de fuerza ----------

function seccionFuerza() {
  const conEstandar = lista('variantes').filter(v => v.estandar && !v.archivada);
  const filas = conEstandar.map(v => {
    const r = rangoFuerza(v.id);
    const detalle = r
      ? `${num(Math.round(r.ratio * 100) / 100)} × tu peso${r.siguiente ? `. Te faltan ${r1(r.siguiente.kg)} kg de RM estimado para ${r.siguiente.rango.nombre}` : ''}`
      : 'Sin datos todavía';
    return `
      <a class="fila-maquina" href="#/maquina/${v.id}">
        <span class="fila-maquina-nombre">${esc(v.nombre)} ${r ? insigniaRango(r.rango, 'pequeno') : ''}</span>
        <span class="opcion-detalle">${detalle}</span>
      </a>`;
  }).join('');
  const sinPeso = !medidasOrdenadas().some(m => m.peso);
  return `
    <section aria-labelledby="t-fuerza">
      <h2 id="t-fuerza">Rango de fuerza</h2>
      <p class="ayuda">Solo en peso libre: compara tu RM estimado con tu peso corporal usando multiplicadores orientativos.
        En máquinas no tiene sentido, por eso allí el rango mide tu propia mejora.</p>
      ${sinPeso ? '<p class="aviso-paron">Apunta tu peso para poder calcularlo.</p>' : ''}
      ${filas || '<p class="ayuda">Ninguna máquina tiene estándar. Se asigna en Editar máquina.</p>'}
      ${seccionMarcas()}
    </section>`;
}

// ---------- Marcas en peso libre ----------
// Mejores marcas hechas con barra o mancuerna (p. ej. el RM de press de banca).
// Se guardan en los ajustes, así entran en la copia de seguridad.

const marcas = () => [...(ajuste('marcasLibres') ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha));

function seccionMarcas() {
  const filas = marcas().map(m => {
    const r = rangoMarca(m);
    return `
      <button class="fila-dia" data-accion="editarMarca" data-id="${m.id}">
        <span>${esc(ESTANDARES[m.estandar]?.nombre ?? m.estandar)} ${r ? insigniaRango(r.rango, 'pequeno') : ''}</span>
        <span class="opcion-detalle">${num(m.kg)} kg × ${m.reps} · ${fechaCorta(m.fecha)}</span>
      </button>`;
  }).join('');
  return `
    <h3>Marcas en peso libre</h3>
    ${filas || '<p class="ayuda">Apunta aquí tus mejores marcas con barra o mancuerna, como el press de banca. Cuentan para el rango de fuerza.</p>'}
    <button class="boton bloque" data-accion="nuevaMarca">Apuntar marca</button>`;
}

function formularioMarca(m = null) {
  const x = m ?? { id: '', estandar: 'press_banca', kg: null, reps: 1, fecha: hoyISO(), nota: '' };
  abrirHoja(`
    <form class="formulario" data-envio="guardarMarca">
      <h2>${m ? 'Editar marca' : 'Apuntar marca'}</h2>
      <input type="hidden" name="id" value="${x.id}">
      <label>Ejercicio
        <select name="estandar">
          ${Object.entries(ESTANDARES).map(([id, e]) => `<option value="${id}" ${id === x.estandar ? 'selected' : ''}>${e.nombre}</option>`).join('')}
        </select>
      </label>
      <div class="fila-campos">
        <label>Kilos <input name="kg" inputmode="decimal" value="${num(x.kg)}" ${m ? '' : 'autofocus'}></label>
        <label>Reps <input name="reps" inputmode="numeric" value="${x.reps}"></label>
      </div>
      <p class="ayuda">Con la barra incluida (en mancuernas, lo de una mano). Con 1 repetición es tu RM; con más, se estima.</p>
      <label>Fecha <input type="date" name="fecha" value="${x.fecha}" required></label>
      <label>Notas <textarea name="nota" rows="2">${esc(x.nota)}</textarea></label>
      <div class="botones-hoja">
        ${m ? `<button type="button" class="boton peligro" data-accion="borrarMarca" data-id="${m.id}">Borrar</button>`
            : '<button type="button" class="boton" data-accion="cerrarHoja">Cancelar</button>'}
        <button class="boton primario">Guardar</button>
      </div>
    </form>`);
}

// ---------- Acciones ----------

registrar({
  verMusculo({ m }) {
    const volumen = volumenSemana(lunesVisto ?? lunesDe(hoyISO()))[m];
    const [min, max] = objetivoMusculo(m);
    const detalle = volumen.detalle
      .sort((a, b) => b.series * b.peso - a.series * a.peso)
      .map(d => `<li><span>${esc(estado.variantes[d.variante]?.nombre ?? '')}</span>
        <span class="opcion-detalle">${d.series} ${d.series === 1 ? 'serie' : 'series'}${d.peso < 1 ? ` × ${num(d.peso)} = ${r1(d.series * d.peso)}` : ''}</span></li>`)
      .join('');
    abrirHoja(`
      <form class="formulario" data-envio="guardarObjetivo">
        <h2 tabindex="-1" autofocus>${nombreMusculo(m)}</h2>
        <p><strong>${r1(volumen.total)}</strong> series esta semana (${TEXTO_ESTADO[estadoMusculo(volumen.total, [min, max])]})</p>
        ${detalle ? `<ul class="detalle-musculo">${detalle}</ul>` : '<p class="ayuda">Nada esta semana.</p>'}
        <input type="hidden" name="m" value="${m}">
        <h3>Objetivo semanal de series (por defecto ${OBJETIVOS_DEFECTO[m].join('–')})</h3>
        <div class="fila-campos">
          <label>Mínimo <input name="min" inputmode="decimal" value="${num(min)}"></label>
          <label>Máximo <input name="max" inputmode="decimal" value="${num(max)}"></label>
        </div>
        <div class="botones-hoja">
          <button type="button" class="boton" data-accion="restablecerObjetivo" data-m="${m}">Restablecer</button>
          <button class="boton primario">Guardar</button>
        </div>
      </form>`);
  },

  async guardarObjetivo(datos) {
    const min = leerNum(datos.get('min')), max = leerNum(datos.get('max'));
    if (min === null || max === null || max < min) { aviso('El máximo tiene que ser mayor que el mínimo'); return; }
    await fijarAjuste('objetivosMusculo', { ...(ajuste('objetivosMusculo') ?? {}), [datos.get('m')]: [min, max] });
    cerrarHoja();
    pintar();
  },

  async restablecerObjetivo({ m }) {
    const objetivos = { ...(ajuste('objetivosMusculo') ?? {}) };
    delete objetivos[m];
    await fijarAjuste('objetivosMusculo', objetivos);
    cerrarHoja();
    pintar();
  },

  nuevaMarca() { formularioMarca(); },
  editarMarca({ id }) { formularioMarca(marcas().find(m => m.id === id)); },

  async guardarMarca(datos) {
    const marca = {
      id: datos.get('id') || nuevoId('marca'),
      estandar: datos.get('estandar'),
      kg: leerNum(datos.get('kg')),
      reps: leerNum(datos.get('reps')) || 1,
      fecha: datos.get('fecha') || hoyISO(),
      nota: datos.get('nota').trim()
    };
    if (!marca.kg) { aviso('Pon los kilos'); return; }
    await fijarAjuste('marcasLibres', [...marcas().filter(m => m.id !== marca.id), marca]);
    cerrarHoja();
    aviso('Marca guardada');
    pintar();
  },

  async borrarMarca({ id }) {
    if (!confirm('¿Borrar esta marca?')) return;
    await fijarAjuste('marcasLibres', marcas().filter(m => m.id !== id));
    cerrarHoja();
    pintar();
  },

  nuevaMedida() { formularioMedida(); },
  editarMedida({ id }) { formularioMedida(estado.medidas[id]); },

  async guardarMedida(datos) {
    const medida = {
      id: datos.get('id') || nuevoId('med'),
      fecha: datos.get('fecha') || hoyISO(),
      peso: leerNum(datos.get('peso')),
      grasa: leerNum(datos.get('grasa')),
      musculo: leerNum(datos.get('musculo')),
      nota: datos.get('nota').trim()
    };
    if (medida.peso === null && medida.grasa === null && medida.musculo === null) { aviso('Pon al menos un dato'); return; }
    await guardarObj('medidas', medida);
    cerrarHoja();
    aviso('Medida guardada');
    pintar();
  },

  async borrarMedida({ id }) {
    if (!confirm('¿Borrar esta medida?')) return;
    await borrarObj('medidas', id);
    cerrarHoja();
    pintar();
  }
});
