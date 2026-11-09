/* ============================================================
   Animaciones de prevención de riesgos (Instalaciones UT2)
   js/anim-riesgos.js — cargado DESPUÉS de js/anim-iso.js.
   Estilo isométrico (ISO.animacion), desde el 09/11/2026.

   diferencial     UT2 riesgo eléctrico · sale = vuelve; la fuga por
                   una persona hace saltar el diferencial; con toma de
                   tierra, la fuga va por el cable de tierra.
   triangulo-fuego UT2 incendios · los tres lados y las cuatro formas
                   de apagar un fuego.
   ============================================================ */

(function () {
  'use strict';
  if (!window.ISO || !window.ANIM) return;
  const ISO = window.ISO;
  const el = window.ANIM.el;
  const ruta = (...p) => p;

  /* Persona sencilla, de pie, con un brazo hacia la derecha. */
  function persona(g, x, y) {
    const p = el('g', {}, g);
    el('ellipse', { cx: x, cy: y + 4, rx: 22, ry: 8, class: 'i-sombra' }, p);
    el('rect', { x: x - 13, y: y - 70, width: 26, height: 56, rx: 12, class: 'i-cara-izq' }, p);
    el('line', { x1: x - 6, y1: y - 18, x2: x - 8, y2: y, class: 'i-pierna' }, p);
    el('line', { x1: x + 6, y1: y - 18, x2: x + 8, y2: y, class: 'i-pierna' }, p);
    el('line', { x1: x + 8, y1: y - 60, x2: x + 44, y2: y - 70, class: 'i-pierna' }, p);
    el('circle', { cx: x, cy: y - 86, r: 15, class: 'i-cara-sup' }, p);
    return p;
  }

  /* ============================================================
     diferencial
     ============================================================ */
  (function () {
    const C = [112, 236];                   // cuadro
    const AP = [500, 214];                  // aparato
    const fase = ruta([152, 160], [456, 160]);
    const neutro = ruta([456, 262], [152, 262]);
    const fuga = ruta([468, 200], [440, 214], [402, 222], [398, 300], [398, 336]);
    const tierra = ruta([540, 252], [578, 270], [588, 300], [588, 330]);

    ISO.animacion('diferencial', {
      titulo: 'El diferencial compara la corriente que sale y la que vuelve y salta si se escapa por una persona',
      msMovimiento: 1500,
      dibujar(k) {
        el('rect', { x: 0, y: 336, width: 640, height: 24, class: 'i-suelo' }, k.svg);
        k.texto(k.svg, 300, 354, 'Suelo', 'i-t i-tenue');
        k.cable('fase', [152, 160], [456, 160]);
        k.cable('neutro', [152, 262], [456, 262]);
        const ct = k.cable('tierra', [540, 252], [588, 330], [588, 262]);
        const gt = k.nombre('cableTierra', el('g', {}, k.svg));
        gt.appendChild(ct.base); gt.appendChild(ct.luz);
        [[570, 606], [577, 599], [583, 593]].forEach(([a, b], i) =>
          el('line', { x1: a, y1: 330 + i * 6, x2: b, y2: 330 + i * 6, class: 'i-antena' }, gt));
        k.texto(gt, 632, 355, 'Tierra', 'i-t i-negrita', 'end');
        /* cuadro */
        k.caja(k.svg, C[0], C[1] + 40, 46, 23, 150);
        k.texto(k.svg, C[0], C[1] + 90, 'Cuadro', 'i-t i-negrita');
        const arriba = k.nombre('palArriba', el('g', {}, k.svg));
        el('rect', { x: C[0] - 16, y: C[1] - 70, width: 22, height: 40, rx: 4, class: 'i-cara-sup-l' }, arriba);
        const abajo = k.nombre('palAbajo', el('g', {}, k.svg));
        el('rect', { x: C[0] - 16, y: C[1] - 30, width: 22, height: 40, rx: 4, class: 'i-cara-sup-r' }, abajo);
        k.pastilla(k.svg, C[0] + 96, C[1] - 26, 'Diferencial');
        /* aparato */
        k.caja(k.svg, AP[0], AP[1] + 50, 44, 22, 92);
        k.texto(k.svg, AP[0] + 8, AP[1] + 104, 'Aparato', 'i-t i-negrita');
        k.nombre('fallo', k.bocadillo(k.svg, 520, 76, 'Cable pelado dentro', [500, 120]));
        /* lo que sale y lo que vuelve */
        k.nombre('sale', k.pastilla(k.svg, 300, 130, 'Sale: 10 A', { claseTexto: 'i-mono-a' }));
        k.nombre('vuelve', k.pastilla(k.svg, 300, 292, 'Vuelve: 10 A', { claseTexto: 'i-mono-a' }));
        k.nombre('persona', persona(k.svg, 398, 336));
        k.nombre('salvada', k.marca(k.svg, 360, 220, true));
        k.nombre('corta', k.marca(k.svg, C[0] + 50, C[1] - 70, false));
      },
      pasos: [
        { texto: 'El <strong>diferencial</strong> compara la corriente que sale por un cable con la que vuelve por el otro. Si todo va bien, son iguales.',
          ver: ['palArriba', 'sale', 'vuelve'], luz: ['fase', 'neutro'],
          paq: [{ id: 'i1', ruta: fase, color: 'azul' }, { id: 'v1', ruta: neutro, color: 'azul' }] },
        { texto: 'Dentro del aparato se pela un cable y toca la carcasa metálica. Por fuera <strong>no se nota nada</strong>.',
          ver: ['palArriba', 'sale', 'vuelve', 'fallo'] },
        { texto: 'Alguien toca la carcasa: parte de la corriente <strong>se escapa por su cuerpo</strong> hasta el suelo. Ya no vuelve toda.',
          ver: ['palArriba', 'sale', 'vuelve', 'fallo', 'persona'], luz: ['fase', 'neutro'],
          textos: { vuelve: 'Vuelve: 9,97 A' },
          paq: [{ id: 'f1', ruta: fuga, color: 'rosa', chips: ['30 mA'] }] },
        { texto: 'Faltan unos <strong>30 mA</strong>: el diferencial salta y corta la corriente en milisegundos.',
          ver: ['palAbajo', 'fallo', 'persona', 'salvada', 'corta'], textos: { vuelve: 'Vuelve: 9,97 A' } },
        { texto: 'Con <strong>toma de tierra</strong>, la fuga se va por el cable de tierra y no por ti. El diferencial salta aunque nadie toque el aparato.',
          ver: ['palAbajo', 'fallo', 'cableTierra', 'corta'], luz: ['tierra'],
          paq: [{ id: 't1', ruta: tierra, color: 'lima', chips: ['fuga'] }] }
      ]
    });
  })();

  /* ============================================================
     triangulo-fuego
     ============================================================ */
  (function () {
    const V = { calor: [320, 58], comb: [150, 300], oxi: [490, 300] };
    const LLAMA = [320, 222];
    const LADOS = { sQ: ['comb', 'calor'], sO: ['calor', 'oxi'], sC: ['oxi', 'comb'] };
    const todos = ['sQ', 'sO', 'sC', 'llama'];

    function llama(g, x, y) {
      const f = el('g', {}, g);
      el('path', { d: `M${x},${y - 70} C${x + 34},${y - 30} ${x + 40},${y + 6} ${x},${y + 18} C${x - 40},${y + 6} ${x - 34},${y - 30} ${x},${y - 70}Z`, class: 'i-llama-fuera' }, f);
      el('path', { d: `M${x},${y - 32} C${x + 18},${y - 10} ${x + 20},${y + 8} ${x},${y + 14} C${x - 20},${y + 8} ${x - 18},${y - 10} ${x},${y - 32}Z`, class: 'i-llama-dentro' }, f);
      return f;
    }

    ISO.animacion('triangulo-fuego', {
      titulo: 'El triángulo del fuego: combustible, oxígeno y calor, y las cuatro formas de apagarlo',
      msMovimiento: 1200,
      dibujar(k) {
        Object.keys(LADOS).forEach(n => {
          const [a, b] = LADOS[n].map(v => V[v]);
          el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'i-cable' }, k.svg);
          const g = k.nombre(n, el('g', {}, k.svg));
          el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'i-cable-luz es-on i-luz-ambar' }, g);
        });
        k.nombre('llama', llama(k.svg, LLAMA[0], LLAMA[1]));
        /* vértices */
        k.caja(k.svg, V.comb[0], V.comb[1] + 14, 30, 15, 26);
        k.pastilla(k.svg, V.comb[0], V.comb[1] + 46, 'Combustible');
        el('circle', { cx: V.oxi[0], cy: V.oxi[1] - 2, r: 22, class: 'i-cristal' }, k.svg);
        k.texto(k.svg, V.oxi[0], V.oxi[1] + 5, 'O₂', 'i-t i-negrita');
        k.pastilla(k.svg, V.oxi[0], V.oxi[1] + 46, 'Oxígeno');
        el('circle', { cx: V.calor[0], cy: V.calor[1], r: 22, class: 'i-cristal' }, k.svg);
        k.texto(k.svg, V.calor[0], V.calor[1] + 7, '°C', 'i-t i-negrita');
        k.pastilla(k.svg, V.calor[0] + 92, V.calor[1], 'Calor');
        k.nombre('xC', k.marca(k.svg, V.comb[0] + 46, V.comb[1] - 30, false));
        k.nombre('xO', k.marca(k.svg, V.oxi[0] - 46, V.oxi[1] - 30, false));
        k.nombre('xQ', k.marca(k.svg, V.calor[0] - 46, V.calor[1] + 6, false));
        /* manta ignífuga */
        const m = k.nombre('manta', el('g', {}, k.svg));
        el('path', { d: `M${LLAMA[0] - 56},${LLAMA[1] + 22} Q${LLAMA[0]},${LLAMA[1] - 84} ${LLAMA[0] + 56},${LLAMA[1] + 22}Z`, class: 'i-manta' }, m);
        k.texto(m, LLAMA[0], LLAMA[1] - 6, 'Manta', 'i-t i-negrita');
        k.nombre('noAgua', k.bocadillo(k.svg, 466, 150, 'Nunca en un fuego eléctrico', [372, 196]));
      },
      pasos: [
        { texto: 'Para que haya fuego hacen falta <strong>tres cosas a la vez</strong>: combustible, oxígeno (el comburente) y calor.',
          ver: todos },
        { texto: '<strong>Eliminación</strong>: quitas el combustible. Apartas las cajas de cartón de lo que arde.',
          ver: ['sO', 'xC'] },
        { texto: '<strong>Sofocación</strong>: quitas el oxígeno. Tapas con una manta ignífuga o usas un extintor de CO₂.',
          ver: ['sQ', 'manta', 'xO'] },
        { texto: '<strong>Enfriamiento</strong>: quitas el calor, con agua. Nunca en un fuego eléctrico: el agua conduce la corriente.',
          ver: ['sC', 'xQ', 'noAgua'],
          paq: [{ id: 'agua', ruta: ruta([600, 110], [LLAMA[0] + 10, LLAMA[1] - 20]), chips: ['agua'], color: 'azul' }] },
        { texto: '<strong>Inhibición</strong>: el extintor de polvo corta la reacción en cadena, aunque los tres lados sigan ahí.',
          ver: ['sQ', 'sO', 'sC'],
          paq: [{ id: 'polvo', ruta: ruta([40, 160], [LLAMA[0] - 10, LLAMA[1] - 20]), chips: ['polvo'], color: 'lima' }] }
      ]
    });
  })();
})();
