/* ============================================================
   Simulaciones «arréglalo / hazlo tú» (27/10/2026)
   ============================================================
   Marco común para las simulaciones de las sesiones teóricas: una
   pantalla de mentira (una red social, un Drive, un foro, un
   navegador, una BIOS…) en la que el alumno tiene una MISIÓN que
   cumplir tocando lo que ha visto en el temario. Al lado, la
   misión con sus casillas y «Lo que has hecho». Cuando cumple
   todo, sale «Misión cumplida» y lo que tiene que apuntar en el
   cuaderno (cada simulación va enlazada a una pregunta).

   Va en tema.html DESPUÉS de js/laboratorios.js (usa registrarLab
   y window.LAB). Las simulaciones de cada unidad, en su archivo
   (js/sim-servicios.js…), cargado después de este.

     <div class="lab" data-lab="simulacion" data-sim="perfil"
          aria-label="Arregla este perfil"></div>

   Registrar una:
     registrarSimulacion('perfil', {
       ventana: 'Fotogram',              // título de la barra
       mision: ['Haz la cuenta privada', '…'],
       final: 'Apunta en tu cuaderno…',  // al cumplirlo todo
       etiqueta: 'Web de ejemplo',       // opcional (29/10/2026); si no, «Simulación»
       crear(ctx) { … }                  // monta la pantalla
     });

   ctx (lo que recibe crear):
     ctx.pantalla       el div donde se dibuja
     ctx.barra(t)       cambia el título de la ventana
     ctx.cumple(i, t)   marca la misión i (y apunta t, si se da)
     ctx.deshace(i)     la desmarca (si el alumno lo vuelve a romper)
     ctx.apunta(t)      una línea en «Lo que has hecho»
     ctx.falla(t)       una línea en rojo
     ctx.aviso(t, tipo) un aviso ('cuidado', 'ok' o error)
     ctx.el, ctx.boton  las ayudas de laboratorios.js

   Sin colores nuevos: variables de siempre (ver css/estilos.css,
   «Simulaciones»). No guarda nada en el navegador.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof window.registrarLab !== 'function') return;
  const { el, boton } = window.LAB;
  const SIMS = {};

  function cabecera(caja, etiqueta) {
    const cab = el('div', 'probador__cabecera');
    cab.appendChild(el('span', 'probador__etiqueta', etiqueta || 'Simulación'));
    const t = caja.getAttribute('aria-label');
    if (t) cab.appendChild(el('span', 'probador__titulo', t));
    caja.appendChild(cab);
  }

  function labSimulacion(caja) {
    const def = SIMS[caja.dataset.sim];
    if (!def) { caja.remove(); return; }
    cabecera(caja, def.etiqueta);

    const cuerpo = el('div', 'sim');
    const ventana = el('div', 'sim__ventana');
    const barra = el('div', 'sim__barra');
    const puntos = el('span', 'sim__puntos');
    puntos.setAttribute('aria-hidden', 'true');
    const tituloVentana = el('span', 'sim__barra-titulo');
    barra.appendChild(puntos);
    barra.appendChild(tituloVentana);
    ventana.appendChild(barra);
    const pantalla = el('div', 'sim__pantalla');
    ventana.appendChild(pantalla);

    const mision = el('div', 'sim__mision');
    mision.appendChild(el('p', 'sim__lado-titulo', '🎯 Tu misión'));
    const listaMision = el('ul', 'sim__casillas');
    mision.appendChild(listaMision);
    const registro = el('div', 'sim__registro');
    registro.tabIndex = 0;
    registro.setAttribute('role', 'region');
    registro.setAttribute('aria-label', 'Lo que has hecho');
    registro.appendChild(el('p', 'sim__lado-titulo', 'Lo que has hecho'));
    const hechos = el('ol', 'sim__lista');
    hechos.setAttribute('aria-live', 'polite');
    registro.appendChild(hechos);

    cuerpo.appendChild(mision);
    cuerpo.appendChild(ventana);
    cuerpo.appendChild(registro);
    caja.appendChild(cuerpo);

    const fin = el('div', 'sim__fin');
    fin.setAttribute('aria-live', 'polite');
    caja.appendChild(fin);

    const pie = el('div', 'lab__fila');
    const otra = boton('↺ Empezar otra vez');
    pie.appendChild(otra);
    caja.appendChild(pie);

    let hecho = [];
    const casillas = def.mision.map(t => {
      const li = el('li', 'sim__casilla');
      li.estado = el('span', 'solo-lector', 'Pendiente: ');
      li.appendChild(li.estado);
      li.appendChild(document.createTextNode(t));
      listaMision.appendChild(li);
      return li;
    });

    function apunta(t, mal) {
      hechos.appendChild(el('li', mal ? 'sim__mal' : null, t));
      registro.scrollTop = registro.scrollHeight;
    }
    function pintarFin() {
      fin.innerHTML = '';
      if (hecho.every(Boolean)) {
        const a = el('div', 'sim__cumplida');
        a.appendChild(el('p', 'sim__cumplida-titulo', '✓ ¡Misión cumplida!'));
        if (def.final) a.appendChild(el('p', null, def.final));
        fin.appendChild(a);
      }
    }
    function marcar(i, si) {
      if (hecho[i] === si) return;
      hecho[i] = si;
      casillas[i].classList.toggle('sim__casilla--hecha', si);
      casillas[i].estado.textContent = si ? 'Hecho: ' : 'Pendiente: ';
      pintarFin();
    }

    function empezar() {
      hecho = def.mision.map(() => false);
      casillas.forEach((li, i) => {
        li.classList.remove('sim__casilla--hecha');
        li.estado.textContent = 'Pendiente: ';
      });
      hechos.innerHTML = '';
      fin.innerHTML = '';
      pantalla.innerHTML = '';
      tituloVentana.textContent = def.ventana || '';
      const ctx = {
        pantalla,
        el,
        boton,
        barra: t => { tituloVentana.textContent = t; },
        cumple: (i, t) => { if (!hecho[i] && t) apunta(t); marcar(i, true); },
        deshace: i => marcar(i, false),
        hecho: i => hecho[i],
        apunta: t => apunta(t),
        falla: t => apunta(t, true),
        aviso(t, tipo) {
          const p = el('p', 'sim__aviso' + (tipo ? ' sim__aviso--' + tipo : ''), t);
          p.setAttribute('role', tipo === 'ok' ? 'status' : 'alert');
          return p;
        },
      };
      def.crear(ctx);
    }
    otra.addEventListener('click', empezar);
    empezar();
  }

  window.registrarSimulacion = (nombre, def) => { SIMS[nombre] = def; };
  window.registrarLab('simulacion', labSimulacion);
})();
