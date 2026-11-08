// calendario.js — Calendario mensual con los días de gimnasio y actividades,
// y el recuento de días por semana frente al objetivo.

import { estado, lista, ajuste, tieneDatos, plantillasOrdenadas, borrarObj } from '../estado.js';
import { registrar, abrirHoja, cerrarHoja, ir, pintar, aviso, acciones } from '../ui.js';
import { esc, hoyISO, aISO, deISO, lunesDe, sumarDias, MESES, fechaLarga } from '../utilidades.js';
import { nombreActividad } from './actividades.js';
import { crearSesion } from './entreno.js';
import { TIPOS_ACTIVIDAD } from '../datos-iniciales.js';

export const ruta = 'calendario';
export const pestana = 'calendario';

export function render(param) {
  const hoy = hoyISO();
  const [anyo, mes] = (param || hoy.slice(0, 7)).split('-').map(Number);
  const primero = aISO(new Date(anyo, mes - 1, 1));
  const ultimo = aISO(new Date(anyo, mes, 0));
  const anterior = aISO(new Date(anyo, mes - 2, 1)).slice(0, 7);
  const siguiente = aISO(new Date(anyo, mes, 1)).slice(0, 7);

  const gimnasio = new Set(lista('sesiones').filter(tieneDatos).map(s => s.fecha));
  const actividades = lista('actividades');
  const objetivo = ajuste('diasObjetivo');

  // Semanas completas (lunes a domingo) que tocan este mes.
  let filas = '';
  for (let lunes = lunesDe(primero); lunes <= ultimo; lunes = sumarDias(lunes, 7)) {
    let celdas = '';
    let enSemana = 0;
    for (let i = 0; i < 7; i++) {
      const d = sumarDias(lunes, i);
      const fuera = d < primero || d > ultimo;
      const acts = actividades.filter(a => a.fecha === d);
      if (gimnasio.has(d)) enSemana++;
      celdas += `
        <td>
          <button class="dia ${fuera ? 'fuera' : ''} ${d === hoy ? 'hoy' : ''} ${gimnasio.has(d) ? 'con-gimnasio' : ''}"
            data-accion="verDia" data-f="${d}" aria-label="${fechaLarga(d)}${gimnasio.has(d) ? ', gimnasio' : ''}${acts.length ? ', ' + acts.map(nombreActividad).join(', ') : ''}">
            <span class="numero">${deISO(d).getDate()}</span>
            <span class="marcas">${gimnasio.has(d) ? '<i class="m-gimnasio"></i>' : ''}${acts.map(a => `<i class="m-act act-${a.tipo}"></i>`).join('')}</span>
          </button>
        </td>`;
    }
    filas += `<tr>${celdas}<td class="total-semana ${enSemana >= objetivo ? 'cumplido' : enSemana >= ajuste('diasMinimo') ? 'minimo' : ''}">${enSemana}/${objetivo}</td></tr>`;
  }

  const diasMes = [...gimnasio].filter(d => d >= primero && d <= ultimo).length;
  const actsMes = actividades.filter(a => a.fecha >= primero && a.fecha <= ultimo);

  return `
    <header class="cabecera cabecera-mes">
      <a class="boton pequeno icono" href="#/calendario/${anterior}" aria-label="Mes anterior">‹</a>
      <h1>${MESES[mes - 1][0].toUpperCase() + MESES[mes - 1].slice(1)} <span class="anyo">${anyo}</span></h1>
      <a class="boton pequeno icono" href="#/calendario/${siguiente}" aria-label="Mes siguiente">›</a>
    </header>

    <table class="calendario">
      <thead><tr>${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(l => `<th scope="col">${l}</th>`).join('')}<th scope="col"><span class="sr">Días de gimnasio en la semana</span></th></tr></thead>
      <tbody>${filas}</tbody>
    </table>

    <ul class="leyenda">
      <li><i class="m-gimnasio"></i> Gimnasio</li>
      ${TIPOS_ACTIVIDAD.map(t => `<li><i class="m-act act-${t.id}"></i> ${t.nombre}</li>`).join('')}
    </ul>

    <section class="resumen-mes">
      <p><strong>${diasMes}</strong> ${diasMes === 1 ? 'día' : 'días'} de gimnasio este mes</p>
      <p><strong>${actsMes.length}</strong> ${actsMes.length === 1 ? 'actividad' : 'actividades'} fuera del gimnasio</p>
    </section>`;
}

// ---------- Deslizar para borrar ----------
// En la hoja del día, un entreno deslizado a la izquierda deja ver el botón rojo «Borrar».
// Tocar «Borrar» lo borra; tocar la fila abierta la vuelve a cerrar.

const ANCHO_BORRAR = 96;

function activarDeslizar(raiz) {
  raiz.querySelectorAll('.fila-deslizable').forEach(fila => {
    const frente = fila.querySelector('.fila-dia');
    const boton = fila.querySelector('.borrar-detras');
    let x0 = null, y0 = 0, base = 0, dx = 0, arrastrando = false, ignorarClic = false;

    const abrir = (f, abierta) => {
      f.classList.toggle('abierta', abierta);
      f.querySelector('.borrar-detras').tabIndex = abierta ? 0 : -1;
    };

    frente.addEventListener('pointerdown', e => {
      x0 = e.clientX; y0 = e.clientY; dx = 0; arrastrando = false;
      base = fila.classList.contains('abierta') ? -ANCHO_BORRAR : 0;
    });

    frente.addEventListener('pointermove', e => {
      if (x0 === null) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!arrastrando) {
        if (Math.abs(my) > 10 && Math.abs(my) > Math.abs(mx)) { x0 = null; return; } // es scroll
        if (Math.abs(mx) < 8) return;
        arrastrando = true;
        fila.classList.add('moviendo');
        frente.setPointerCapture(e.pointerId);
        // Solo una fila abierta a la vez.
        raiz.querySelectorAll('.fila-deslizable.abierta').forEach(otra => { if (otra !== fila) abrir(otra, false); });
      }
      dx = Math.min(0, Math.max(-ANCHO_BORRAR * 1.3, base + mx));
      frente.style.transform = `translateX(${dx}px)`;
    });

    const soltar = () => {
      if (x0 === null || !arrastrando) { x0 = null; return; }
      x0 = null;
      fila.classList.remove('moviendo');
      frente.style.transform = '';
      abrir(fila, dx < -ANCHO_BORRAR / 2);
      ignorarClic = true; // el toque que acaba el deslizamiento no abre el entreno
      setTimeout(() => { ignorarClic = false; }, 350);
    };
    frente.addEventListener('pointerup', soltar);
    frente.addEventListener('pointercancel', soltar);

    // Con la fila abierta, tocarla la cierra en vez de abrir el entreno.
    frente.addEventListener('click', e => {
      if (!ignorarClic && !fila.classList.contains('abierta')) return;
      e.preventDefault();
      e.stopPropagation();
      if (!ignorarClic) abrir(fila, false);
    }, true);
  });
}

registrar({
  verDia({ f }) {
    const sesiones = lista('sesiones').filter(s => s.fecha === f);
    const acts = lista('actividades').filter(a => a.fecha === f);
    const contenido = [
      ...sesiones.map(s => {
        const series = s.ejercicios.reduce((n, e) => n + e.series.length, 0);
        return `<div class="fila-deslizable">
          <button class="borrar-detras" data-accion="borrarEntrenoDia" data-id="${s.id}" data-f="${f}" tabindex="-1">Borrar</button>
          <a class="fila-dia" href="#/entreno/${s.id}" data-accion="cerrarHoja">
            <span>${esc(s.nombre)}</span><span class="opcion-detalle">${series} series</span></a>
        </div>`;
      }),
      ...acts.map(a => `<button class="fila-dia" data-accion="editarActividad" data-id="${a.id}">
          <span><i class="m-act act-${a.tipo}"></i> ${esc(nombreActividad(a))}</span>
          <span class="opcion-detalle">${a.minutos ? a.minutos + ' min' : ''}</span></button>`)
    ].join('');

    abrirHoja(`
      <div class="menu">
        <h2>${fechaLarga(f)}</h2>
        ${contenido || '<p class="ayuda">Nada apuntado este día.</p>'}
        ${sesiones.length ? '<p class="ayuda">Desliza un entreno a la izquierda para borrarlo.</p>' : ''}
        <button class="boton bloque" data-accion="nuevaActividad" data-fecha="${f}">Apuntar actividad</button>
        <button class="boton bloque" data-accion="elegirPlantillaDia" data-f="${f}">Añadir entreno este día</button>
      </div>`);
    activarDeslizar(document.getElementById('hoja-contenido'));
  },

  // Botón rojo que aparece al deslizar un entreno.
  async borrarEntrenoDia({ id, f }) {
    await borrarObj('sesiones', id);
    aviso('Entreno borrado');
    pintar();
    acciones.verDia({ f });
  },

  elegirPlantillaDia({ f }) {
    abrirHoja(`
      <div class="menu">
        <h2>Entreno del ${fechaLarga(f)}</h2>
        ${plantillasOrdenadas().map(p => `<button class="boton bloque" data-accion="crearEntrenoDia" data-f="${f}" data-p="${p.id}">${esc(p.nombre)}</button>`).join('')}
        <button class="boton bloque" data-accion="crearEntrenoDia" data-f="${f}" data-p="">Entreno libre</button>
      </div>`);
  },

  async crearEntrenoDia({ f, p }) {
    const sesion = await crearSesion(p || null, f);
    cerrarHoja();
    ir(`#/entreno/${sesion.id}`);
  }
});
