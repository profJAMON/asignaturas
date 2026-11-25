/* ============================================================
   Piezas de Proyecto para el laboratorio «piezas» (25/11/2026)
   ============================================================
   Mismo sistema que js/piezas-redes.js (motor js/hairline.js y
   registrarPiezas de js/laboratorios.js). Va en tema.html después
   de piezas-redes.js, que define las ayudas PZ.

   Figuras: impresora-3d (Bloque 3b, sesión 3D1): una impresora de
   cama móvil con su bobina, el cabezal, la boquilla, la cama
   caliente, los ejes y la pantalla. La parte elegida se mueve como
   lo hace de verdad (la cama hacia delante, el cabezal de lado, la
   boquilla baja).
   ============================================================ */

registrarPiezas('impresora-3d', {
  partes: [
    { nombre: 'Bobina de filamento', texto: 'El rollo de plástico con el que se imprime. En clase usamos PLA, un plástico que se hace con maíz y casi no huele. El hilo baja desde la bobina hasta el cabezal.' },
    { nombre: 'Cabezal', texto: 'Empuja el filamento y lo derrite. Se mueve de lado a lado y va dejando el plástico fundido, línea a línea, como quien dibuja con una manga pastelera.' },
    { nombre: 'Boquilla', texto: 'La punta por donde sale el plástico fundido, a unos 200 °C. Nunca se toca mientras imprime ni justo después: quema.' },
    { nombre: 'Cama caliente', texto: 'La placa donde se pega la pieza. Se calienta a unos 60 °C para que la primera capa no se despegue, y se mueve hacia delante y hacia atrás. La pieza se saca cuando la cama está fría.' },
    { nombre: 'Ejes y motores', texto: 'Los motores suben y bajan el cabezal, lo mueven de lado y llevan la cama adelante y atrás. Así se dibuja cada capa, una encima de otra. Mientras se mueve: las manos fuera y el pelo recogido.' },
    { nombre: 'Pantalla', texto: 'Aquí se elige el archivo que se imprime, se ven las temperaturas y se para la impresora si algo va mal. La toco solo yo.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, facing, prism, rings, tween, tset, tval, tdone, mk, pointer, put, register, solid, disposer } = HL;
    const BOBINA = 0, CABEZAL = 1, BOQUILLA = 2, CAMA = 3, EJES = 4, PANTALLA = 5;
    const W = 60, D = 40, PULL = 12;

    const bag = disposer();
    const C = Cam(45, 0.5, 3.0);
    fit(C, [[0, 0, 0], [W + PULL, 0, 0], [0, D + PULL, 0], [W, D + PULL, 0], [0, 0, 80], [W, D, 80]], 200, 170);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);

    // de atrás adelante y de abajo arriba, para que lo de delante tape bien
    const base = solid(g);
    const piezas = {};
    const nueva = (parte, n) => {
      const p = { parte, out: tween(0), pintado: NaN, els: [] };
      for (let k = 0; k < n; k++) p.els.push(solid(g));
      piezas[parte] = p;
      return p;
    };
    nueva(CAMA, 1);
    nueva(EJES, 3);       // poste izquierdo, poste derecho y barra de arriba
    nueva(BOBINA, 1);
    nueva(CABEZAL, 1);
    nueva(BOQUILLA, 1);
    nueva(PANTALLA, 1);

    const caja = (el, x0, y0, x1, y1, z0, z1, r) => {
      const [ring, inner] = rings(x0, y0, x1, y1, r || 1.2, 0.6);
      put(el, prism(P, front, ring, inner, z0, z1));
    };
    { const [ring, inner] = rings(0, 0, W, D, 2, 1); put(base, prism(P, front, ring, inner, 0, 6)); }

    // la barra donde va el cabezal, a media altura de los postes
    const Z_BARRA = 34;
    function dibujar(parte, o) {
      const p = piezas[parte];
      if (parte === CAMA) caja(p.els[0], 8, 6 + o, 52, 34 + o, 7, 9, 1.5);
      else if (parte === EJES) {
        const s = o * 0.5;
        caja(p.els[0], 2, 18, 6, 22, 6 + s, 58 + s);
        caja(p.els[1], 54, 18, 58, 22, 6 + s, 58 + s);
        caja(p.els[2], 2, 18, 58, 22, 56 + s, 60 + s);
      } else if (parte === BOBINA) {
        const s = o * 0.6;
        put(p.els[0], PZ.cajaY(P, 20, 62 + s, 40, 78 + s, 7.5, 2.5, 18, 22));
      } else if (parte === CABEZAL) caja(p.els[0], 24 + o, 15, 34 + o, 25, Z_BARRA - 4, Z_BARRA + 6, 1.4);
      else if (parte === BOQUILLA) {
        const baja = o * 0.6;
        caja(p.els[0], 27.5, 18.5, 30.5, 21.5, Z_BARRA - 9 - baja, Z_BARRA - 4 - baja, 0.8);
      } else if (parte === PANTALLA) caja(p.els[0], 42, 40 + o, 56, 43 + o, 1, 5, 0.8);
    }

    function pintar(now) {
      let mueve = false;
      for (const k of Object.keys(piezas)) {
        const p = piezas[k];
        const o = tval(p.out, now);
        if (!tdone(p.out, now)) mueve = true;
        if (o === p.pintado) continue;
        p.pintado = o;
        dibujar(p.parte, o);
      }
      return mueve;
    }
    const B = register(stage, (_dt, now) => pintar(now));
    bag.add(B.unregister);

    const ANCLAS = [
      [BOBINA, [30, 20, 70]],
      [CABEZAL, [29, 25, Z_BARRA + 2]],
      [BOQUILLA, [29, 21, Z_BARRA - 7]],
      [CAMA, [14, 32, 8]],
      [EJES, [4, 20, 46]],
      [PANTALLA, [49, 43, 3]],
    ];
    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      for (const k of Object.keys(piezas)) {
        const p = piezas[k];
        const sale = p.parte === a;
        tset(p.out, sale ? PULL : 0, now, 0);
        p.els.forEach((el) => el.sil.classList.toggle('hi', sale));
      }
      B.wake();
    }
    mostrar(-1);
    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 34)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 34)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});
