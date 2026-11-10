/* ============================================================
   Animaciones de fibra óptica (Instalaciones UT4)
   js/anim-fibra.js — cargado DESPUÉS de js/anim-iso.js.
   Estilo isométrico (ISO.animacion), desde el 10/11/2026.

   fibra-edificios  UT4 S1 · dos edificios a 300 m: el cobre no
                    llega y lleva la descarga de un rayo; la fibra
                    llega y no conduce electricidad.
   fibra-modos      UT4 S2 · multimodo (muchos caminos, la luz llega
                    a destiempo: dispersión modal) frente a monomodo
                    (un camino, llega junta).
   fibra-polaridad  UT4 S3 · TX con RX en cada extremo (polaridad
                    A-B); TX con TX no enlaza; se arregla dando la
                    vuelta al conector en un extremo.
   fibra-presupuesto UT4 S4 · la luz va «pagando» dB por cada
                    conexión, kilómetro y empalme; lo que sobra de lo
                    que aguanta el módulo es el margen.
   ============================================================ */

(function () {
  'use strict';
  if (!window.ISO || !window.ANIM) return;
  const ISO = window.ISO;
  const el = window.ANIM.el;
  const ruta = (...p) => p;

  /* Edificio: caja alta con ventanas. */
  function edificio(k, x, y, rotulo) {
    const g = el('g', {}, k.svg);
    k.sombra(g, x, y + 18, 70, 22);
    k.caja(g, x, y + 8, 56, 28, 120);
    for (let f = 0; f < 3; f++) {
      for (let c = 0; c < 2; c++) {
        const vx = x - 44 + c * 20, vy = y - 92 + f * 30 + c * 10;
        el('polygon', { points: `${vx},${vy} ${vx + 12},${vy + 6} ${vx + 12},${vy + 20} ${vx},${vy + 14}`, class: 'i-pantalla' }, g);
      }
    }
    k.texto(g, x, y + 56, rotulo, 'i-t i-negrita');
    return g;
  }

  /* ============================================================
     fibra-edificios · UT4 S1
     ============================================================ */
  (function () {
    const A = 110, B = 530;
    const yCu = 226, yFo = 300;
    ISO.animacion('fibra-edificios', {
      titulo: 'Dos edificios a 300 m: por qué se unen con fibra y no con cobre',
      msMovimiento: 1500,
      dibujar(k) {
        k.cable('cu', [A + 50, yCu], [B - 50, yCu]);
        k.cable('fo', [A + 50, yFo], [B - 50, yFo]);
        const fin = B - 95;
        k.pastilla(k.svg, 320, yCu - 40, 'Cobre (par trenzado)', { claseTexto: 'i-t' });
        k.pastilla(k.svg, 320, yFo + 36, 'Fibra', { claseTexto: 'i-t i-negrita' });
        el('line', { x1: A + 190, y1: yCu - 14, x2: A + 190, y2: yCu + 14, class: 'i-limite' }, k.svg);
        k.nombre('m100', k.texto(k.svg, A + 190, yCu + 36, '100 m', 'i-t i-tenue'));
        edificio(k, A, 210, 'Edificio A');
        edificio(k, B, 210, 'Edificio B');
        k.nombre('distancia', k.pastilla(k.svg, 320, 40, '300 m de distancia', { claseTexto: 'i-t i-negrita' }));
        const rayo = el('polyline', { points: `${A + 30},10 ${A + 8},52 ${A + 26},52 ${A + 2},96`, class: 'i-rayo' }, k.svg);
        k.nombre('rayo', rayo);
        k.nombre('noCu', k.marca(k.svg, A + 210, yCu - 24, false));
        k.nombre('okFo', k.marca(k.svg, B - 40, yFo + 34, true));
        k.nombre('quemaB', k.bocadillo(k.svg, B - 20, 46, '¡Descarga en B!', [B, 110]));
        k.nombre('salvoB', k.bocadillo(k.svg, B - 20, 46, 'B, a salvo', [B, 110]));
      },
      pasos: [
        { texto: 'Dos edificios a <strong>300 m</strong>. Hay que unirlos. ¿Con cobre o con fibra?', ver: ['distancia'] },
        { texto: 'Por <strong>cobre</strong>, la señal se va apagando: a los <strong>100 m</strong> ya no se entiende y se pierde.',
          ver: ['distancia', 'm100', 'noCu'], luz: ['cu'],
          paq: [{ id: 'c1', ruta: ruta([A + 50, yCu], [A + 50 + (140 / 0.55), yCu]), chips: ['datos'], cae: true }] },
        { texto: 'Por <strong>fibra</strong>, la luz pierde muy poco: llega de punta a punta, y podría llegar a kilómetros.',
          ver: ['distancia', 'okFo'], luz: ['fo'],
          paq: [{ id: 'f1', ruta: ruta([A + 50, yFo], [B - 95, yFo]), chips: ['luz'], color: 'lima' }] },
        { texto: 'Cae un <strong>rayo</strong> en el edificio A. El cobre conduce electricidad: la descarga viaja hasta B.',
          ver: ['rayo', 'quemaB'], luz: ['cu'],
          paq: [{ id: 'r1', ruta: ruta([A + 50, yCu], [B - 95, yCu]), chips: ['rayo'], color: 'rosa' }] },
        { texto: 'La fibra es <strong>vidrio</strong>: no conduce electricidad. Con fibra, el edificio B queda a salvo.',
          ver: ['rayo', 'salvoB', 'okFo'], luz: ['fo'],
          paq: [{ id: 'f2', ruta: ruta([A + 50, yFo], [B - 95, yFo]), chips: ['luz'], color: 'lima' }] }
      ]
    });
  })();

  /* ============================================================
     fibra-modos · UT4 S2
     ============================================================ */
  (function () {
    const X1 = 110, X2 = 560;
    const yM = 110, yS = 290;               // multimodo, monomodo
    const zig = (y, alto, n, hasta) => {
      const p = [[X1, y]];
      const paso = (hasta - X1) / n;
      for (let i = 1; i <= n; i++) p.push([X1 + i * paso, y + (i % 2 ? -alto : alto)]);
      p.push([hasta, y]);
      return p;
    };
    ISO.animacion('fibra-modos', {
      titulo: 'Multimodo y monomodo: muchos caminos o uno solo',
      msMovimiento: 1800,
      dibujar(k) {
        el('rect', { x: X1 - 10, y: yM - 44, width: X2 - X1 + 20, height: 88, rx: 44, class: 'i-cristal' }, k.svg);
        el('rect', { x: X1 - 10, y: yS - 14, width: X2 - X1 + 20, height: 28, rx: 14, class: 'i-cristal' }, k.svg);
        k.cable('m', [X1, yM], [X2, yM]);
        k.cable('s', [X1, yS], [X2, yS]);
        k.pastilla(k.svg, 320, yM - 66, 'Multimodo: núcleo de 50 µm', { claseTexto: 'i-t i-negrita' });
        k.pastilla(k.svg, 320, yS - 38, 'Monomodo: núcleo de 9 µm', { claseTexto: 'i-t i-negrita' });
        k.texto(k.svg, X1 - 30, yM + 6, 'Sale', 'i-t i-tenue', 'end');
        k.texto(k.svg, X2 + 30, yM + 6, 'Llega', 'i-t i-tenue', 'start');
        k.nombre('destiempo', k.bocadillo(k.svg, 450, yM + 72, 'Llegan a destiempo', [X2 - 40, yM + 30]));
        k.nombre('junta', k.bocadillo(k.svg, 300, yS + 44, 'Llega junta', [X2 - 60, yS + 12]));
        k.nombre('okS', k.marca(k.svg, X2 + 24, yS - 30, true));
      },
      pasos: [
        { texto: 'Dos fibras. La <strong>multimodo</strong> tiene el núcleo ancho; la <strong>monomodo</strong>, muy estrecho.' },
        { texto: 'En la multimodo, la luz va por <strong>muchos caminos</strong> a la vez: uno recto y otros rebotando.',
          luz: ['m'], paq: [
            { id: 'a', ruta: ruta([X1, yM], [X2, yM]), chips: [], color: 'lima' },
            { id: 'b', ruta: zig(yM, 26, 5, X2 - 70), chips: [], color: 'azul' },
            { id: 'c', ruta: zig(yM, 36, 8, X2 - 150), chips: [], color: 'ambar' }] },
        { texto: 'Los caminos que rebotan son más largos: esa luz <strong>llega tarde</strong>. Es la <strong>dispersión modal</strong>.',
          ver: ['destiempo'], luz: ['m'], paq: [
            { id: 'a', ruta: ruta([X2, yM]) },
            { id: 'b', ruta: ruta([X2 - 70, yM], [X2, yM]) },
            { id: 'c', ruta: ruta([X2 - 150, yM], [X2 - 75, yM - 30], [X2, yM]) }] },
        { texto: 'Por eso la multimodo llega <strong>menos lejos</strong>: con distancia, los pulsos se mezclan y no se entienden.',
          ver: ['destiempo'] },
        { texto: 'En la monomodo solo cabe <strong>un camino</strong>: la luz llega junta y puede ir a kilómetros.',
          ver: ['junta', 'okS'], luz: ['s'],
          paq: [{ id: 's1', ruta: ruta([X1, yS], [X2, yS]), chips: [], color: 'lima' }] }
      ]
    });
  })();

  /* ============================================================
     fibra-polaridad · UT4 S3
     ============================================================ */
  (function () {
    const XA = 120, XB = 520;
    const y1 = 100, y2 = 170;
    const L = 190, R = 450;                 // donde empiezan y acaban las fibras
    ISO.animacion('fibra-polaridad', {
      titulo: 'TX y RX: por qué la fibra va en parejas y qué es la polaridad A-B',
      msMovimiento: 1500,
      dibujar(k) {
        k.cable('f1', [L, y1], [R, y1]);
        k.cable('f2', [L, y2], [R, y2]);
        k.switch_(k.svg, XA, 270, 2, 'Switch A');
        k.switch_(k.svg, XB, 270, 2, 'Switch B');
        k.pastilla(k.svg, L - 38, y1, 'TX', { claseTexto: 'i-t i-negrita' });
        k.pastilla(k.svg, L - 38, y2, 'RX', { claseTexto: 'i-t i-negrita' });
        k.nombre('bArriba', k.pastilla(k.svg, R + 38, y1, 'RX', { claseTexto: 'i-t i-negrita' }));
        k.nombre('bAbajo', k.pastilla(k.svg, R + 38, y2, 'TX', { claseTexto: 'i-t i-negrita' }));
        k.texto(k.svg, 110, 40, 'Lado A', 'i-t i-tenue');
        k.texto(k.svg, 530, 40, 'Lado B', 'i-t i-tenue');
        k.nombre('ok', k.marca(k.svg, 320, 40, true));
        k.nombre('no', k.marca(k.svg, 320, 40, false));
        k.nombre('sinLink', k.bocadillo(k.svg, 320, 226, 'LINK apagado', [XB - 20, 252]));
        k.nombre('vuelta', k.bocadillo(k.svg, 300, 226, 'Doy la vuelta al LC en B', [R + 30, 186]));
      },
      pasos: [
        { texto: 'Una fibra lleva la luz <strong>en un solo sentido</strong>. Para hablar y escuchar hacen falta <strong>dos</strong>.' },
        { texto: 'Lo que emite A (<strong>TX</strong>) tiene que llegar a lo que escucha B (<strong>RX</strong>)…',
          luz: ['f1'], paq: [{ id: 'a', ruta: ruta([L, y1], [R, y1]), chips: ['TX → RX'], color: 'azul' }] },
        { texto: '…y lo que emite B, a lo que escucha A. Es la <strong>polaridad A-B</strong>: las fibras se cruzan.',
          ver: ['ok'], luz: ['f2'], paq: [{ id: 'b', ruta: ruta([R, y2], [L, y2]), chips: ['TX → RX'], color: 'rosa' }] },
        { texto: 'Si en B está al revés, el TX de A llega a otro <strong>TX</strong>, que no escucha. No enlazan.',
          ver: ['no', 'sinLink'], luz: ['f1'], textos: { bArriba: 'TX', bAbajo: 'RX' },
          paq: [{ id: 'c', ruta: ruta([L, y1], [L + (R - L) / 0.55, y1]), chips: ['TX → TX'], color: 'azul', cae: true }] },
        { texto: 'El arreglo: <strong>dar la vuelta al conector</strong> en un extremo (o cruzar las dos fibras). Vuelve a enlazar.',
          ver: ['ok', 'vuelta'], luz: ['f1', 'f2'], textos: { bArriba: 'RX', bAbajo: 'TX' },
          paq: [{ id: 'a', ruta: ruta([L, y1], [R, y1]) }, { id: 'b', ruta: ruta([R, y2], [L, y2]) }] }
      ]
    });
  })();

  /* ============================================================
     fibra-presupuesto · UT4 S4
     Ejemplo: monomodo de 2 km, 2 conexiones y 1 empalme (no es el de
     ninguna pregunta obligatoria). 0,75 + 1 + 0,3 + 0,75 = 2,8 dB;
     el módulo aguanta 8 dB → margen 5,2 dB (verde).
     ============================================================ */
  (function () {
    const Y = 200;
    const P = { a: 70, c1: 150, e: 330, c2: 490, b: 570 };
    ISO.animacion('fibra-presupuesto', {
      titulo: 'El presupuesto de pérdidas: lo que «paga» la luz por el camino y el margen que sobra',
      msMovimiento: 1500,
      dibujar(k) {
        k.cable('t1', [P.a, Y], [P.c1, Y]);
        k.cable('t2', [P.c1, Y], [P.e, Y]);
        k.cable('t3', [P.e, Y], [P.c2, Y]);
        k.cable('t4', [P.c2, Y], [P.b, Y]);
        k.caja(k.svg, P.a, Y + 22, 30, 15, 30);
        k.caja(k.svg, P.b, Y + 22, 30, 15, 30);
        k.texto(k.svg, P.a, Y + 70, 'SFP A', 'i-t i-negrita');
        k.texto(k.svg, P.b, Y + 70, 'SFP B', 'i-t i-negrita');
        [[P.c1, 'conexión'], [P.c2, 'conexión']].forEach(([x, t]) => {
          el('rect', { x: x - 9, y: Y - 14, width: 18, height: 28, rx: 4, class: 'i-cara-sup' }, k.svg);
          k.texto(k.svg, x, Y + 40, t, 'i-t i-tenue');
        });
        el('circle', { cx: P.e, cy: Y, r: 10, class: 'i-cara-sup' }, k.svg);
        k.texto(k.svg, P.e, Y + 40, 'empalme', 'i-t i-tenue');
        k.texto(k.svg, (P.c1 + P.e) / 2, Y - 24, '2 km de monomodo', 'i-t i-tenue');
        k.nombre('cuenta', k.pastilla(k.svg, 320, 50, 'Perdido: 0 dB', { claseTexto: 'i-t i-negrita', ancho: 300 }));
        k.nombre('aguanta', k.pastilla(k.svg, 320, 306, 'El módulo aguanta 8 dB', { claseTexto: 'i-t' }));
        k.nombre('margen', k.pastilla(k.svg, 320, 306, 'Margen: 8 − 2,8 = 5,2 dB', { claseTexto: 'i-t i-negrita' }));
        k.nombre('ok', k.marca(k.svg, 500, 306, true));
      },
      pasos: [
        { texto: 'Un enlace: <strong>2 conexiones</strong>, 2 km de monomodo y <strong>1 empalme</strong>. La luz sale de A.',
          ver: ['cuenta'], paq: [{ id: 'p', ruta: ruta([P.a, Y]), chips: ['0 dB'], color: 'lima' }] },
        { texto: 'Primera <strong>conexión</strong>: paga 0,75 dB.',
          ver: ['cuenta'], luz: ['t1'], textos: { cuenta: 'Perdido: 0,75 dB', 'p.0': '−0,75 dB' },
          paq: [{ id: 'p', ruta: ruta([P.a, Y], [P.c1, Y]) }] },
        { texto: 'Los <strong>2 km</strong> de monomodo: 0,5 dB cada uno, 1 dB. Ya van 1,75 dB.',
          ver: ['cuenta'], luz: ['t2'], textos: { cuenta: 'Perdido: 1,75 dB', 'p.0': '−1,75 dB' },
          paq: [{ id: 'p', ruta: ruta([P.c1, Y], [P.e, Y]) }] },
        { texto: 'El <strong>empalme</strong>: 0,3 dB. Van 2,05 dB.',
          ver: ['cuenta'], luz: ['t3'], textos: { cuenta: 'Perdido: 2,05 dB', 'p.0': '−2,05 dB' },
          paq: [{ id: 'p', ruta: ruta([P.e, Y], [P.c2, Y]) }] },
        { texto: 'Segunda <strong>conexión</strong>: otros 0,75 dB. En total, el enlace pierde <strong>2,8 dB</strong>.',
          ver: ['cuenta'], luz: ['t4'], textos: { cuenta: 'Perdido: 2,8 dB', 'p.0': '−2,8 dB' },
          paq: [{ id: 'p', ruta: ruta([P.c2, Y], [P.b, Y]) }] },
        { texto: 'El módulo de B aguanta hasta <strong>8 dB</strong> de pérdida.',
          ver: ['cuenta', 'aguanta'], paq: [{ id: 'p', ruta: ruta([P.b, Y]) }] },
        { texto: 'Lo que sobra es el <strong>margen</strong>: 8 − 2,8 = 5,2 dB. Más de 3 dB: verde, enlace bien hecho.',
          ver: ['cuenta', 'margen', 'ok'], paq: [{ id: 'p', ruta: ruta([P.b, Y]) }] }
      ]
    });
  })();
})();
