/* ============================================================
   Estilo isométrico para las animaciones — js/anim-iso.js
   (09/11/2026). Cargado DESPUÉS de js/animaciones.js y ANTES de los
   js/anim-<tema>.js que lo usan.

   Aparatos con volumen (caras de arriba, izquierda y derecha), cables
   que se encienden al pasar un paquete y paquetes que son una bola de
   luz con sus etiquetas encima. Colores: variables --iso-* (iguales
   en los dos temas, como la pizarra). Escena: viewBox 0 0 640 360.

   Una animación isométrica se declara con ISO.animacion(nombre, def):
     ISO.animacion('arp', {
       titulo: '…',
       msMovimiento: 1300,            // opcional
       dibujar(k) { … }               // dibuja lo fijo con el kit k
                                      // (k.pc, k.switch_, k.router…) y
                                      // pone nombre a lo que cambia:
                                      // k.nombre('tabla1', elemento)
       pasos: [
         { texto: 'frase del paso (html corto)',
           ver: ['tabla1', …],        // lo que se ve en este paso
                                      // (lo nuevo aparece poco a poco;
                                      // lo que deja de estar, se va)
           luz: ['cable-A'],          // cables encendidos al moverse
           textos: { tabla1: '…' },   // cambia el texto de un nombre
                                      // (se queda hasta que otro paso
                                      // lo cambie)
           paq: [ { id: 'p1', ruta: [[x,y], [x,y], …],
                    color: 'azul' | 'rosa' | 'lima' | 'ambar',
                    chips: ['IP A → B', {t: 'MAC', c: 'rosa'}],  // encima
                    cae: true,        // se pierde a mitad (sale ✕)
                    va: true } ]      // desaparece al llegar
         }, … ]
     });
   Lo que no sale en «ver» de un paso no se ve en ese paso (salvo lo
   dibujado sin nombre, que está siempre). Un paquete solo se ve en
   los pasos donde aparece en «paq»; con una ruta de un solo punto se
   queda quieto ahí.
   ============================================================ */

(function () {
  'use strict';
  if (!window.ANIM || typeof registrarAnimacion !== 'function') return;

  const A = window.ANIM;
  const el = A.el;
  let contador = 0;

  /* ---------- piezas de dibujo ---------- */

  function puntos(a) { return a.map(p => p[0] + ',' + p[1]).join(' '); }

  /* Caja isométrica. (cx, cy) = centro de la base; w = medio ancho del
     rombo; h = medio alto; alto = altura de la caja. */
  function caja(g, cx, cy, w, h, alto, clases) {
    const c = clases || {};
    const arriba = [[cx, cy - alto - h], [cx + w, cy - alto], [cx, cy - alto + h], [cx - w, cy - alto]];
    const izq = [[cx - w, cy - alto], [cx, cy - alto + h], [cx, cy + h], [cx - w, cy]];
    const der = [[cx + w, cy - alto], [cx, cy - alto + h], [cx, cy + h], [cx + w, cy]];
    const grupo = el('g', {}, g);
    el('polygon', { points: puntos(izq), class: c.izq || 'i-cara-izq' }, grupo);
    el('polygon', { points: puntos(der), class: c.der || 'i-cara-der' }, grupo);
    const tapa = el('polygon', { points: puntos(arriba), class: c.arriba || 'i-cara-sup' }, grupo);
    return { grupo, tapa };
  }

  function sombra(g, x, y, rx, ry) {
    return el('ellipse', { cx: x, cy: y, rx, ry, class: 'i-sombra' }, g);
  }

  function texto(g, x, y, t, clase, ancla) {
    const e = el('text', { x, y, 'text-anchor': ancla || 'middle', class: clase || 'i-t' }, g);
    e.textContent = t;
    return e;
  }

  /* Pastilla de cristal con texto (rótulos de los aparatos). */
  function pastilla(g, x, y, t, opc) {
    const o = opc || {};
    const grupo = el('g', {}, g);
    const ancho = o.ancho || Math.max(46, String(t).length * 11.2 + 24);
    const r = el('rect', { x: x - ancho / 2, y: y - 16, width: ancho, height: 32, rx: 16, class: o.clase || 'i-cristal' }, grupo);
    const tx = texto(grupo, x, y + 7, t, o.claseTexto || 'i-t');
    grupo.ajustar = nuevo => {
      tx.textContent = nuevo;
      const an = o.ancho || Math.max(46, String(nuevo).length * 11.2 + 24);
      r.setAttribute('x', x - an / 2);
      r.setAttribute('width', an);
    };
    return grupo;
  }

  /* Ordenador de sobremesa: mesa, monitor con pantalla que se enciende
     y rótulo debajo. Devuelve {pantalla, rotulo}. */
  function pc(g, x, y, rotulo) {
    const grupo = el('g', {}, g);
    sombra(grupo, x, y + 22, 46, 15);
    caja(grupo, x, y + 14, 38, 19, 12);
    el('polygon', { points: `${x - 26},${y - 2} ${x + 2},${y + 12} ${x + 2},${y - 28} ${x - 26},${y - 42}`, class: 'i-cara-izq' }, grupo);
    el('polygon', { points: `${x + 2},${y + 12} ${x + 7},${y + 9} ${x + 7},${y - 31} ${x + 2},${y - 28}`, class: 'i-cara-der' }, grupo);
    const pantalla = el('polygon', { points: `${x - 23},${y - 3} ${x - 1},${y + 8} ${x - 1},${y - 26} ${x - 23},${y - 37}`, class: 'i-pantalla' }, grupo);
    const r = rotulo ? pastilla(grupo, x, y + 52, rotulo) : null;
    return { grupo, pantalla, rotulo: r };
  }

  /* Switch: caja plana y ancha con una luz por boca. */
  function switch_(g, x, y, bocas, rotulo) {
    const grupo = el('g', {}, g);
    sombra(grupo, x, y + 24, 82, 24);
    caja(grupo, x, y + 10, 64, 32, 18);
    const n = bocas || 4;
    const luces = [];
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const lx = x - 40 + u * 80, ly = y - 8 + Math.abs(u - 0.5) * -16 + 4;
      luces.push(el('circle', { cx: lx, cy: ly, r: 4.5, class: 'i-led' }, grupo));
    }
    texto(grupo, x, y + 58, rotulo || 'Switch', 'i-t i-negrita');
    return { grupo, luces };
  }

  /* Router: caja con dos antenas y una luz. */
  function router(g, x, y, rotulo) {
    const grupo = el('g', {}, g);
    sombra(grupo, x, y + 22, 58, 18);
    el('line', { x1: x - 24, y1: y - 18, x2: x - 30, y2: y - 52, class: 'i-antena' }, grupo);
    el('line', { x1: x + 24, y1: y - 18, x2: x + 30, y2: y - 52, class: 'i-antena' }, grupo);
    caja(grupo, x, y + 10, 46, 23, 22);
    const luz = el('circle', { cx: x, cy: y - 12, r: 5, class: 'i-led' }, grupo);
    if (rotulo) texto(grupo, x, y + 56, rotulo, 'i-t i-negrita');
    return { grupo, luz };
  }

  /* Servidor: torre alta. */
  function servidor(g, x, y, rotulo) {
    const grupo = el('g', {}, g);
    sombra(grupo, x, y + 20, 40, 13);
    caja(grupo, x, y + 12, 30, 15, 66);
    for (let i = 0; i < 3; i++) {
      el('line', { x1: x - 24, y1: y - 44 + i * 16, x2: x - 6, y2: y - 35 + i * 16, class: 'i-ranura' }, grupo);
    }
    const luz = el('circle', { cx: x - 15, cy: y - 2, r: 4, class: 'i-led' }, grupo);
    if (rotulo) texto(grupo, x, y + 50, rotulo, 'i-t i-negrita');
    return { grupo, luz };
  }

  /* Nube de Internet. */
  function nube(g, x, y, rotulo) {
    const grupo = el('g', {}, g);
    [[-34, 6, 26], [-8, -8, 32], [24, -2, 28], [44, 12, 18], [6, 14, 26]].forEach(c =>
      el('circle', { cx: x + c[0], cy: y + c[1], r: c[2], class: 'i-nube' }, grupo));
    texto(grupo, x + 4, y + 12, rotulo || 'Internet', 'i-t i-negrita');
    return { grupo };
  }

  /* Cable: trazo grueso apagado y, encima, la luz que se enciende. */
  function cable(g, a, b, curva) {
    const d = curva
      ? `M${a[0]},${a[1]} Q${curva[0]},${curva[1]} ${b[0]},${b[1]}`
      : `M${a[0]},${a[1]} L${b[0]},${b[1]}`;
    const base = el('path', { d, class: 'i-cable' }, g);
    const luz = el('path', { d, class: 'i-cable-luz' }, g);
    return { base, luz };
  }

  /* Cartel de cristal con título y filas (tablas que se van llenando). */
  function cartel(g, x, y, ancho, alto, titulo) {
    const grupo = el('g', {}, g);
    el('rect', { x, y, width: ancho, height: alto, rx: 14, class: 'i-cristal' }, grupo);
    if (titulo) {
      texto(grupo, x + ancho / 2, y + 26, titulo, 'i-t i-titulo');
      el('line', { x1: x + 14, y1: y + 36, x2: x + ancho - 14, y2: y + 36, class: 'i-raya' }, grupo);
    }
    return grupo;
  }

  /* Marca ✓ o ✕ en un círculo. */
  function marca(g, x, y, bien) {
    const grupo = el('g', { class: bien ? 'i-marca i-marca--si' : 'i-marca i-marca--no' }, g);
    el('circle', { cx: x, cy: y, r: 15 }, grupo);
    el('path', { d: bien ? `M${x - 7},${y} l5,5 l9,-10` : `M${x - 6},${y - 6} l12,12 M${x + 6},${y - 6} l-12,12` }, grupo);
    return grupo;
  }

  /* Bocadillo (lo que «dice» un aparato). cola: punto al que apunta. */
  function bocadillo(g, x, y, t, cola) {
    const grupo = el('g', {}, g);
    const ancho = String(t).length * 10.8 + 30;
    const r = el('rect', { x: x - ancho / 2, y: y - 18, width: ancho, height: 36, rx: 18, class: 'i-bocadillo' }, grupo);
    if (cola) el('path', { d: `M${x - 8},${y + 16} L${cola[0]},${cola[1]} L${x + 8},${y + 16}`, class: 'i-bocadillo' }, grupo);
    const tx = texto(grupo, x, y + 6, t, 'i-t i-bocadillo-texto');
    grupo.ajustar = nuevo => {
      tx.textContent = nuevo;
      const an = String(nuevo).length * 10.8 + 30;
      r.setAttribute('x', x - an / 2);
      r.setAttribute('width', an);
    };
    return grupo;
  }

  /* Paquete: bola de luz con etiquetas (chips) encima. */
  function paquete(g, ids, color, chips) {
    const grupo = el('g', { class: 'i-paq i-paq--' + (color || 'azul') }, g);
    el('circle', { r: 17, fill: `url(#${ids}-orbe-${color || 'azul'})` }, grupo);
    el('circle', { r: 5.5, class: 'i-paq-nucleo' }, grupo);
    const listaChips = (chips || []).map((c, i) => {
      /* Un chip es un texto o {t: texto, c: 'rosa'} para darle otro color. */
      const t = typeof c === 'string' ? c : c.t;
      const cg = el('g', {}, grupo);
      const y = -30 - (chips.length - 1 - i) * 30;
      const r = el('rect', { y: y - 14, height: 28, rx: 14, class: 'i-chip' + (c.c ? ' i-chip-' + c.c : '') }, cg);
      const tx = texto(cg, 0, y + 6, t, 'i-chip-texto');
      cg.ajustar = nuevo => {
        tx.textContent = nuevo;
        const an = String(nuevo).length * 10.4 + 22;
        r.setAttribute('x', -an / 2);
        r.setAttribute('width', an);
      };
      cg.ajustar(t);
      return cg;
    });
    const cruz = marca(grupo, 0, 0, false);
    cruz.style.display = 'none';
    return { grupo, chips: listaChips, cruz };
  }

  /* El filtro va en coordenadas de la escena (userSpaceOnUse): con las
     de cada objeto, una línea recta (alto 0) desaparecería. */
  function defs(svg, ids) {
    const d = el('defs', {}, svg);
    d.innerHTML =
      `<filter id="${ids}-brillo" filterUnits="userSpaceOnUse" x="-40" y="-40" width="720" height="440"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
      ['azul', 'rosa', 'lima', 'ambar'].map(c =>
        `<radialGradient id="${ids}-orbe-${c}"><stop offset="0" stop-color="var(--iso-nucleo)"/><stop offset=".45" stop-color="var(--iso-${c})"/><stop offset="1" stop-color="var(--iso-${c})" stop-opacity="0"/></radialGradient>`).join('');
    svg.style.setProperty('--iso-filtro', `url(#${ids}-brillo)`);
  }

  /* ---------- recorrer una ruta ---------- */

  function enRuta(ruta, u) {
    if (ruta.length === 1) return ruta[0];
    const tramos = [];
    let total = 0;
    for (let i = 1; i < ruta.length; i++) {
      const l = Math.hypot(ruta[i][0] - ruta[i - 1][0], ruta[i][1] - ruta[i - 1][1]);
      tramos.push(l);
      total += l;
    }
    let falta = u * total;
    for (let i = 0; i < tramos.length; i++) {
      if (falta <= tramos[i] || i === tramos.length - 1) {
        const v = tramos[i] ? Math.min(1, falta / tramos[i]) : 1;
        return [A.mezcla(ruta[i][0], ruta[i + 1][0], v), A.mezcla(ruta[i][1], ruta[i + 1][1], v)];
      }
      falta -= tramos[i];
    }
    return ruta[ruta.length - 1];
  }

  /* ---------- animación declarada ---------- */

  function animacion(nombre, def) {
    registrarAnimacion(nombre, {
      titulo: def.titulo,
      estilo: 'iso',
      msMovimiento: def.msMovimiento || 1300,
      pasos: def.pasos,
      crear(svg) {
        const ids = 'iso' + (++contador);
        svg.setAttribute('viewBox', '0 0 640 360');
        svg.classList.add('i-svg');
        defs(svg, ids);
        const fondo = el('g', {}, svg);
        const nombres = {};
        const cables = {};
        const k = {
          svg: fondo,
          caja, sombra, texto, pastilla, pc, switch_, router, servidor, nube, cartel, marca, bocadillo,
          cable(nombreCable, a, b, curva) { const c = cable(fondo, a, b, curva); cables[nombreCable] = c; return c; },
          nombre(n, e) { nombres[n] = e; return e; }
        };
        def.dibujar(k);

        /* Paquetes: uno por id, en una capa encima de todo. */
        const capaPaq = el('g', {}, svg);
        const paqs = {};
        def.pasos.forEach(p => (p.paq || []).forEach(q => {
          if (!paqs[q.id]) {
            const primero = def.pasos.map(x => (x.paq || []).find(y => y.id === q.id)).find(Boolean);
            paqs[q.id] = paquete(capaPaq, ids, q.color || primero.color, q.chips || primero.chips);
            nombres[q.id] = paqs[q.id].grupo;
            (paqs[q.id].chips).forEach((c, i) => { nombres[q.id + '.' + i] = c; });
          }
        }));

        /* Textos acumulados: los de cada paso valen hasta que otro los cambie. */
        const textosHasta = [];
        let acum = {};
        def.pasos.forEach((p, i) => { acum = Object.assign({}, acum, p.textos || {}); textosHasta[i] = acum; });
        const textosIniciales = {};
        Object.keys(nombres).forEach(n => {
          const t = nombres[n].querySelector && nombres[n].querySelector('text');
          if (t) textosIniciales[n] = t.textContent;
        });

        function opacidad(n, i, p) {
          const ahora = (def.pasos[i].ver || []).includes(n);
          const antes = i > 0 && (def.pasos[i - 1].ver || []).includes(n);
          if (ahora && antes) return 1;
          if (ahora) return p;
          if (antes) return 1 - p;
          return 0;
        }

        return function pintar(i, p) {
          const paso = def.pasos[i];
          /* elementos con nombre que se encienden y apagan */
          Object.keys(nombres).forEach(n => {
            if (paqs[n] || n.includes('.')) return;
            /* Lo que tiene nombre se ve solo en los pasos que lo ponen en
               «ver». Excepción: lo que solo se nombra para cambiarle el
               texto (filas de una tabla), que se ve siempre. */
            const enVer = def.pasos.some(x => (x.ver || []).includes(n));
            const enTextos = def.pasos.some(x => x.textos && x.textos[n] !== undefined);
            if (!enVer && enTextos) return;
            nombres[n].style.opacity = opacidad(n, i, p);
          });
          /* textos */
          const t = textosHasta[i];
          Object.keys(nombres).forEach(n => {
            const nuevo = t[n] !== undefined ? t[n] : textosIniciales[n];
            if (nuevo === undefined) return;
            const e = nombres[n];
            if (e.ajustar) e.ajustar(nuevo);
            else { const tx = e.tagName === 'text' ? e : e.querySelector('text'); if (tx) tx.textContent = nuevo; }
          });
          /* cables */
          Object.keys(cables).forEach(c => {
            const on = (paso.luz || []).includes(c) && p < 1;
            cables[c].luz.classList.toggle('es-on', on);
          });
          /* paquetes */
          Object.keys(paqs).forEach(id => {
            const q = (paso.paq || []).find(x => x.id === id);
            const pq = paqs[id];
            if (!q) { pq.grupo.style.opacity = 0; return; }
            let u = p;
            let op = 1;
            if (q.cae) {
              u = Math.min(p, 0.55);
              op = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.6;
            } else if (q.va) {
              op = p < 0.85 ? 1 : Math.max(0, 1 - (p - 0.85) / 0.15);
            }
            const pos = enRuta(q.ruta, u);
            pq.grupo.setAttribute('transform', `translate(${pos[0].toFixed(1)},${pos[1].toFixed(1)})`);
            pq.grupo.style.opacity = Math.max(0, op);
            pq.cruz.style.display = q.cae && p > 0.5 ? '' : 'none';
          });
          if (def.pintar) def.pintar(i, p, nombres);
        };
      }
    });
  }

  window.ISO = { animacion, caja, enRuta };
})();
