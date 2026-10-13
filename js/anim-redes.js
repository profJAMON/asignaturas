/* ============================================================
   Animaciones de redes (Instalaciones) — js/anim-redes.js
   Cargado DESPUÉS de js/animaciones.js.

   osi-viaje   Un mensaje baja por las 7 capas del ordenador A (cada
               capa le pone su sobre: TCP, IP, MAC), viaja por el cable
               como bits y sube por las 7 capas del ordenador B (cada
               capa quita su sobre). UT1 S5.
   ============================================================ */

(function () {
  'use strict';
  if (typeof registrarAnimacion !== 'function') return;

  const CAPAS = ['Aplicación', 'Presentación', 'Sesión', 'Transporte', 'Red', 'Enlace', 'Física'];
  const ALTO_FILA = 36;
  const Y0 = 26;                       // arriba de la fila de la capa 7
  const A_X = 2, B_X = 258, ANCHO_CAPA = 100;
  const CENTRO = 179;                  // centro de la zona del medio
  const Y_CABLE = 314;

  /* Piezas del mensaje, de fuera adentro (la de fuera va a la izquierda). */
  const PIEZA = {
    mac: { texto: 'MAC', ancho: 32 },
    ip: { texto: 'IP', ancho: 24 },
    tcp: { texto: 'TCP', ancho: 32 },
    datos: { texto: 'datos', ancho: 46 },
    bits: { texto: '10110010 1101…', ancho: 132 }
  };
  const HUECO = 2;

  function yFila(capa) { return Y0 + (7 - capa) * ALTO_FILA; }

  /* Cada paso: dónde está el mensaje y qué lleva.
     lado: 'A' | 'B' | null (en el cable) · capa: 1-7
     piezas: de fuera adentro · nueva: la pieza que acaba de ponerse
     quita: la pieza que esta capa va a quitar (se resalta)
     pos: {x, y} del centro del mensaje · ruta: puntos intermedios */
  function enCapa(lado, capa) { return { x: CENTRO, y: yFila(capa) + 15 }; }
  const P_CABLE_A = { x: 72, y: Y_CABLE - 14 };
  const P_CABLE_B = { x: 286, y: Y_CABLE - 14 };

  const PASOS = [
    { lado: 'A', capa: 7, piezas: ['datos'], nueva: 'datos',
      texto: 'En el ordenador A, una aplicación (capa 7, <strong>aplicación</strong>) prepara el mensaje: los <strong>datos</strong>.' },
    { lado: 'A', capa: 6, piezas: ['datos'],
      texto: 'Capa 6, <strong>presentación</strong>: le da el formato que toca y, si hace falta, lo cifra.' },
    { lado: 'A', capa: 5, piezas: ['datos'],
      texto: 'Capa 5, <strong>sesión</strong>: abre y controla la conversación con el ordenador B.' },
    { lado: 'A', capa: 4, piezas: ['tcp', 'datos'], nueva: 'tcp',
      texto: 'Capa 4, <strong>transporte</strong>: lo mete en un sobre con la etiqueta <strong>TCP</strong> (puertos y número de trozo). Ahora es un <strong>segmento</strong>.' },
    { lado: 'A', capa: 3, piezas: ['ip', 'tcp', 'datos'], nueva: 'ip',
      texto: 'Capa 3, <strong>red</strong>: otro sobre por fuera con la etiqueta <strong>IP</strong>: de qué IP sale y a qué IP va. Es un <strong>paquete</strong>.' },
    { lado: 'A', capa: 2, piezas: ['mac', 'ip', 'tcp', 'datos'], nueva: 'mac',
      texto: 'Capa 2, <strong>enlace de datos</strong>: otro sobre con las direcciones <strong>MAC</strong> de las tarjetas de red. Es una <strong>trama</strong>.' },
    { lado: 'A', capa: 1, piezas: ['bits'], nueva: 'bits',
      texto: 'Capa 1, <strong>física</strong>: la trama entera se convierte en <strong>bits</strong>, señales que salen por el cable.' },
    { lado: null, capa: 0, piezas: ['bits'], pos: P_CABLE_B, ruta: [P_CABLE_A],
      texto: 'Los bits viajan por el <strong>cable</strong> (o por la fibra, o por el aire con el wifi) hasta el ordenador B.' },
    { lado: 'B', capa: 1, piezas: ['bits'],
      texto: 'En el ordenador B, la capa 1 recibe las señales y las vuelve a convertir en bits: la <strong>trama</strong> entera.' },
    { lado: 'B', capa: 2, piezas: ['mac', 'ip', 'tcp', 'datos'], quita: 'mac',
      texto: 'Capa 2: comprueba que la <strong>MAC</strong> de destino es la suya y quita ese sobre.' },
    { lado: 'B', capa: 3, piezas: ['ip', 'tcp', 'datos'], quita: 'ip',
      texto: 'Capa 3: comprueba que la <strong>IP</strong> de destino es la suya y quita su sobre.' },
    { lado: 'B', capa: 4, piezas: ['tcp', 'datos'], quita: 'tcp',
      texto: 'Capa 4: con el <strong>TCP</strong> junta los trozos en orden, pide los que falten y quita su sobre.' },
    { lado: 'B', capa: 5, piezas: ['datos'],
      texto: 'Capa 5: la <strong>sesión</strong> sigue abierta mientras dure la conversación. Los datos pasan arriba.' },
    { lado: 'B', capa: 6, piezas: ['datos'],
      texto: 'Capa 6: deshace el formato (y el cifrado) para que los datos se puedan leer.' },
    { lado: 'B', capa: 7, piezas: ['datos'], fin: true,
      texto: 'Capa 7: la aplicación del ordenador B recibe los <strong>datos</strong> limpios, igual que salieron de A. Cada capa de B ha leído el sobre que puso su misma capa en A.' }
  ];
  PASOS.forEach(p => { if (!p.pos) p.pos = enCapa(p.lado, p.capa); });

  function crear(svg) {
    const A = window.ANIM;
    svg.setAttribute('viewBox', '0 0 360 346');

    A.texto(svg, A_X + ANCHO_CAPA / 2, 16, 'ordenador A', 'd-a d-peq');
    A.texto(svg, B_X + ANCHO_CAPA / 2, 16, 'ordenador B', 'd-a d-peq');

    /* Las dos pilas de capas. */
    const cajas = { A: {}, B: {} };
    ['A', 'B'].forEach(lado => {
      const x = lado === 'A' ? A_X : B_X;
      CAPAS.forEach((nombre, k) => {
        const capa = 7 - k;
        const y = yFila(capa);
        const r = A.el('rect', { x, y, width: ANCHO_CAPA, height: 30, rx: 4, class: 'd-caja' }, svg);
        const t = A.texto(svg, x + ANCHO_CAPA / 2, y + 19.5, capa + ' ' + nombre, 'd-d d-peq');
        cajas[lado][capa] = { r, t };
      });
    });

    /* Flechas de bajar (A) y subir (B), finas, al lado de las pilas. */
    A.el('path', { d: 'M 108 34 L 108 266 M 104 260 L 108 268 L 112 260', class: 'd-linea-d' }, svg);
    A.el('path', { d: 'M 252 266 L 252 34 M 248 40 L 252 32 L 256 40', class: 'd-linea-d' }, svg);

    /* El cable: baja de la capa 1 de A, cruza y sube a la capa 1 de B. */
    const yBajo = yFila(1) + 30;
    A.el('path', {
      d: `M ${A_X + 50} ${yBajo} L ${A_X + 50} ${Y_CABLE} L ${B_X + 50} ${Y_CABLE} L ${B_X + 50} ${yBajo}`,
      class: 'd-linea-d'
    }, svg);
    A.texto(svg, 180, 338, 'cable, fibra o wifi', 'd-d d-peq');

    /* Línea que une la capa activa con el mensaje. */
    const enlace = A.el('path', { d: '', class: 'd-linea-c' }, svg);
    /* El mensaje (se rehace en cada fotograma). */
    const mensaje = A.el('g', {}, svg);

    function resaltarCapa(paso) {
      ['A', 'B'].forEach(lado => {
        for (let c = 1; c <= 7; c++) {
          const on = paso.lado === lado && paso.capa === c;
          cajas[lado][c].r.setAttribute('class', on ? 'd-caja-act' : 'd-caja');
          cajas[lado][c].t.setAttribute('class', (on ? 'd-c' : 'd-d') + ' d-peq');
        }
      });
    }

    /* Posición en una ruta de puntos, con p de 0 a 1 por longitud. */
    function enRuta(puntos, p) {
      const tramos = [];
      let total = 0;
      for (let k = 1; k < puntos.length; k++) {
        const l = Math.hypot(puntos[k].x - puntos[k - 1].x, puntos[k].y - puntos[k - 1].y);
        tramos.push(l);
        total += l;
      }
      if (total === 0) return puntos[puntos.length - 1];
      let falta = p * total;
      for (let k = 0; k < tramos.length; k++) {
        if (falta <= tramos[k] || k === tramos.length - 1) {
          const q = tramos[k] ? Math.min(1, falta / tramos[k]) : 1;
          return { x: A.mezcla(puntos[k].x, puntos[k + 1].x, q), y: A.mezcla(puntos[k].y, puntos[k + 1].y, q) };
        }
        falta -= tramos[k];
      }
      return puntos[puntos.length - 1];
    }

    function dibujarMensaje(centro, piezas) {
      /* piezas: [{id, op (0-1), estilo}] — las que se van o llegan encogen. */
      mensaje.innerHTML = '';
      const anchos = piezas.map(pz => PIEZA[pz.id].ancho * pz.op);
      const total = anchos.reduce((s, a) => s + a, 0) + HUECO * Math.max(0, piezas.length - 1);
      let x = centro.x - total / 2;
      piezas.forEach((pz, k) => {
        const w = anchos[k];
        if (w > 0.5) {
          const g = A.el('g', { opacity: pz.op.toFixed(3) }, mensaje);
          A.el('rect', { x: x.toFixed(1), y: (centro.y - 12).toFixed(1), width: w.toFixed(1), height: 24, rx: 3, class: pz.estilo }, g);
          if (pz.op > 0.6) {
            A.texto(g, (x + w / 2).toFixed(1), (centro.y + 4.5).toFixed(1), PIEZA[pz.id].texto,
              (pz.estilo === 'd-caja-act' ? 'd-c' : pz.estilo === 'd-caja-on' ? 'd-a' : 'd-t') + ' d-peq');
          }
        }
        x += w + HUECO;
      });
      return total;
    }

    return function pintar(i, p) {
      const paso = PASOS[i];
      const antes = PASOS[(i - 1 + PASOS.length) % PASOS.length];
      const vieneDeAntes = i > 0 && p < 1;
      resaltarCapa(p < 0.5 && vieneDeAntes ? antes : paso);

      /* Posición */
      let centro = paso.pos;
      if (vieneDeAntes) {
        centro = enRuta([antes.pos].concat(paso.ruta || [], [paso.pos]), p);
      }

      /* Piezas: unión de las de antes y las de ahora, en orden de fuera adentro. */
      let piezas;
      if (vieneDeAntes && antes.piezas.join() !== paso.piezas.join()) {
        if (paso.piezas[0] === 'bits' || antes.piezas[0] === 'bits') {
          /* cambio de trama a bits (o al revés): una se apaga y otra se enciende */
          const sale = p < 0.5;
          const lista = sale ? antes.piezas : paso.piezas;
          const op = sale ? 1 - p * 2 : (p - 0.5) * 2;
          piezas = lista.map(id => ({ id, op, estilo: id === 'bits' ? 'd-caja-on' : 'd-caja' }));
        } else {
          const orden = ['mac', 'ip', 'tcp', 'datos'];
          piezas = orden.filter(id => antes.piezas.includes(id) || paso.piezas.includes(id)).map(id => {
            const estaba = antes.piezas.includes(id), esta = paso.piezas.includes(id);
            const op = estaba && esta ? 1 : esta ? p : 1 - p;
            const marcada = (!estaba && esta) || (estaba && !esta) || id === paso.quita;
            return { id, op, estilo: marcada ? 'd-caja-act' : 'd-caja' };
          });
        }
      } else {
        piezas = paso.piezas.map(id => ({
          id, op: 1,
          estilo: id === 'bits' ? 'd-caja-on' : (id === paso.nueva || id === paso.quita) && id !== 'datos' ? 'd-caja-act' : id === 'datos' ? 'd-caja-on' : 'd-caja'
        }));
      }
      const ancho = dibujarMensaje(centro, piezas);

      /* Línea de la capa al mensaje (no en el cable ni mientras se mueve). */
      if (paso.lado && (!vieneDeAntes || p > 0.95)) {
        const yMedio = yFila(paso.capa) + 15;
        enlace.setAttribute('d', paso.lado === 'A'
          ? `M ${A_X + ANCHO_CAPA} ${yMedio} L ${(centro.x - ancho / 2 - 1).toFixed(1)} ${yMedio}`
          : `M ${(centro.x + ancho / 2 + 1).toFixed(1)} ${yMedio} L ${B_X} ${yMedio}`);
      } else {
        enlace.setAttribute('d', '');
      }
    };
  }

  registrarAnimacion('osi-viaje', {
    titulo: 'Un mensaje baja por las siete capas del ordenador A añadiendo las etiquetas TCP, IP y MAC, viaja por el cable como bits y sube por las siete capas del ordenador B, que quita las etiquetas hasta dejar los datos.',
    pasos: PASOS.map(p => ({ texto: p.texto })),
    crear
  });
})();
