/* ============================================================
   Piezas de redes para el laboratorio «piezas» (23/10/2026)
   ============================================================
   Dibujos isométricos de trazo, hechos con el motor Hairline
   (js/hairline.js), en los que el alumno toca una pieza y la ve
   salir y encenderse, con su explicación debajo.
   Figuras: rack, roseta y rj45 (UT3 S7) y switch (UT3, tarjeta de red y
   enlace). El marco, los
   botones y el texto los pone js/laboratorios.js (tipo «piezas»).

     <div class="lab" data-lab="piezas" data-figura="rack"
          aria-label="Un rack por dentro"></div>

   Cada figura se registra con
     registrarPiezas(nombre, { partes: [{ nombre, texto }],
                               montar({ stage, svg }, avisos) })
   montar devuelve { mostrar(i), destroy }: mostrar(-1) es el
   reposo. avisos = { encima(i), toca(i), fuera() } lo llama la
   figura con el puntero; i es el índice de la parte (-1, nada).

   Reglas del dibujo (las de la skill hairline-create): solo trazo,
   sin texto dentro, una sola pieza iluminada, el reposo ya dice
   qué es, la zona que se toca no se mueve, y nada de temporizadores
   propios (todo va por register, que se para fuera de pantalla y
   respeta prefers-reduced-motion).
   ============================================================ */

/* Ayudas comunes de las figuras. Los sólidos del motor se levantan en
   vertical (eje z); una placa que mira al alumno (una tapa, un conector)
   se extruye hacia delante (eje y): para eso es bloqueY, con el anillo
   dibujado en el plano x-z (u = x, v = z). */
const PZ = {
  anillo(P, ring, y) { return ring.map((q) => P(q.u, y, q.v)); },
  // silueta de un bloque que va de y0 a y1, y su cara de delante como pliegue
  bloqueY(P, ring, inner, y0, y1) {
    return {
      sil: HL.poly(HL.hull(PZ.anillo(P, ring, y0).concat(PZ.anillo(P, ring, y1)))),
      crease: inner ? HL.poly(PZ.anillo(P, inner, y1)) : '',
    };
  },
  // bloque redondeado con su pliegue a b unidades del borde
  cajaY(P, x0, z0, x1, z1, r, b, y0, y1) {
    const ri = Math.max(0.3, r - b);
    return PZ.bloqueY(P, HL.rrect(x0, z0, x1, z1, r), HL.rrect(x0 + b, z0 + b, x1 - b, z1 - b, ri), y0, y1);
  },
  // curva de cuatro puntos del mundo, ya proyectada
  curva(P, a, b, c, d, n) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, s = 1 - t;
      const q = [0, 1, 2].map((j) => s * s * s * a[j] + 3 * s * s * t * b[j] + 3 * s * t * t * c[j] + t * t * t * d[j]);
      out.push(P(q[0], q[1], q[2]));
    }
    return out;
  },
  // la parte cuya ancla (en reposo) está más cerca del puntero; -1 si ninguna está a menos de radio
  cerca(P, anclas, p, radio) {
    let mejor = -1, dist = radio;
    for (const [parte, punto] of anclas) {
      const s = P(punto[0], punto[1], punto[2]);
      const d = Math.hypot(s[0] - p[0], s[1] - p[1]);
      if (d < dist) { dist = d; mejor = parte; }
    }
    return mejor;
  },
};

registrarPiezas('rack', {
  partes: [
    { nombre: 'Panel de parcheo', texto: 'Una fila de rosetas juntas, normalmente 24. Por detrás le llegan los cables fijos que vienen de las rosetas de todo el edificio. Por delante se enchufan los latiguillos. Ocupa 1 U.' },
    { nombre: 'Latiguillos', texto: 'Cables cortos con un RJ-45 macho en cada punta. Unen cada boca del panel con un puerto del switch. Si un puesto cambia de sitio, solo se cambia su latiguillo: el cable de la pared no se toca.' },
    { nombre: 'Switch', texto: 'Une todos los puestos de la red. Cada puerto tiene su luz: encendida, hay enlace; parpadea, pasan datos. Ocupa 1 U.' },
    { nombre: 'Bandeja', texto: 'Una repisa para lo que no tiene el ancho del rack, como el router de la operadora. Ocupa 2 U.' },
    { nombre: 'Regleta de enchufes', texto: 'Da corriente a todo lo que hay en el armario. Va dentro y con el armario cerrado con llave, para que nadie desenchufe nada sin querer.' },
    { nombre: 'Bastidores', texto: 'Los cuatro perfiles con agujeros donde se atornilla todo. Entre ellos siempre hay 19 pulgadas de ancho. La altura se cuenta en unidades U: 1 U = 4,445 cm.' },
  ],

  montar({ stage, svg }, avisos) {
    const {
      Cam, fit, facing, proj, prism, rings, rrect, poly, open, seg,
      tween, tset, tval, tdone, mk, place, pointer, put, register, solid, disposer,
    } = HL;

    const PANEL = 0, CORD = 1, SW = 2, TRAY = 3, PDU = 4, POSTS = 5;
    const U = 9, W = 48, D = 24, PB = 3, HP = 6 * U + 3, PULL = 15;
    // de abajo arriba: parte, alto en U, salida en reposo
    const CAJONES = [[PDU, 1, 0], [TRAY, 2, 5], [SW, 1, 0], [PANEL, 1, 1]];
    const NC = 6; // latiguillos: bocas 0 a 5 del panel a los puertos 0 a 5 del switch

    const bag = disposer();
    const C = Cam(45, 0.5, 2.9);
    fit(C, [[-7, -1, -PB], [W + 7, -1, -PB], [-7, D + 1, -PB], [W + 7, D + 1, -PB], [-7, -1, HP], [W + 7, D + 1, HP], [0, D + PULL, 0], [W, D + PULL, 5 * U]], 200, 166);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);

    // bastidores: los dos de atrás, el zócalo, el delantero izquierdo; el derecho, al final
    const postes = [];
    function poste(x0, y0, padre) {
      const [r, i] = rings(x0, y0, x0 + 4, y0 + 4, 1, 0.6);
      const s = solid(padre);
      put(s, prism(P, front, r, i, -PB, HP));
      postes.push(s);
      return s;
    }
    poste(-6, 0, g); poste(W + 2, 0, g);
    const [zr, zi] = rings(-7, -1, W + 7, D + 1, 3, 1.2);
    put(solid(g), prism(P, front, zr, zi, -PB, 0));
    const agujeros = [];
    function agujerosDe(x0, padre) {
      for (let z = 1.2; z < HP - 1; z += U / 3) {
        const a = mk('circle', { r: 0.55, class: 'dot off' }, padre);
        place(a, P(x0 + 2, D, z));
        agujeros.push(a);
      }
    }
    poste(-6, D - 4, g); agujerosDe(-6, g);

    // cajones
    const cajones = [];
    let z = 0;
    for (const [parte, alto, reposo] of CAJONES) {
      const c = { parte, z0: z + 0.5, z1: z + alto * U - 0.5, reposo, grp: mk('g', {}, g), out: tween(reposo), pintado: NaN };
      z += alto * U;
      c.cuerpo = solid(c.grp);
      c.extra = solid(c.grp); // el router de la bandeja
      c.marcas = mk('path', { class: 'nf lo' }, c.grp);
      c.cara = mk('path', { class: 'nf' }, c.grp);
      c.luces = [];
      if (parte === SW) for (let k = 0; k < 12; k++) c.luces.push(mk('circle', { r: 0.7, class: 'dot ' + (k < NC ? 'm' : 'off') }, c.grp));
      if (parte === TRAY) for (let k = 0; k < 3; k++) c.luces.push(mk('circle', { r: 0.7, class: 'dot m' }, c.grp));
      cajones.push(c);
    }
    const porParte = {};
    cajones.forEach((c) => { porParte[c.parte] = c; });
    const latiguillos = mk('path', { class: 'nf' }, g);
    poste(W + 2, D - 4, g); agujerosDe(W + 2, g);

    const bocaX = (k) => 5 + k * 3.5 + (k >= 6 ? 2.5 : 0);

    function cajon(c, o) {
      const y1 = D + o, [r, ir] = rings(0.5, o, W - 0.5, y1, 1.2, 0.7);
      const F = (x, zz) => P(x, y1, zz);
      const caja = (a, b, cc, d, rr) => poly(rrect(a, b, cc, d, rr, 3).map((q) => F(q.u, q.v)));
      const m = c.z0 + 1.6, M = c.z1 - 1.6;
      let marcas = '', cara = '';
      if (c.parte === TRAY) {
        // la repisa: una placa fina; encima, el router de la operadora
        put(c.cuerpo, prism(P, front, r, ir, c.z0, c.z0 + 1.6));
        const rx0 = 8, rx1 = 32, ry0 = o + 4, ry1 = o + 20, rz0 = c.z0 + 1.6, rz1 = rz0 + 6;
        const [rr2, ri2] = rings(rx0, ry0, rx1, ry1, 1.6, 0.8);
        put(c.extra, prism(P, front, rr2, ri2, rz0, rz1));
        c.luces.forEach((l, k) => place(l, P(rx0 + 5 + k * 3, ry1, rz0 + 3.2)));
        // el labio de delante de la repisa
        marcas = seg(F(1.5, c.z0 + 0.8), F(W - 1.5, c.z0 + 0.8));
      } else {
        put(c.cuerpo, prism(P, front, r, ir, c.z0, c.z1));
        if (c.parte === PANEL) {
          for (let k = 0; k < 12; k++) cara += caja(bocaX(k) - 1.2, m + 0.4, bocaX(k) + 1.2, M - 0.4, 0.4);
          marcas = seg(F(2.5, m - 0.6), F(2.5, M + 0.6)) + seg(F(W - 2.5, m - 0.6), F(W - 2.5, M + 0.6));
        } else if (c.parte === SW) {
          for (let k = 0; k < 12; k++) {
            cara += caja(bocaX(k) - 1.2, m - 0.2, bocaX(k) + 1.2, M - 1.4, 0.4);
            place(c.luces[k], F(bocaX(k), M - 0.2));
          }
        } else if (c.parte === PDU) {
          for (let k = 0; k < 5; k++) cara += caja(6 + k * 7, m, 11 + k * 7, M, 1.2);
          cara += caja(W - 7, m + 0.4, W - 3, M - 0.4, 0.6);
        }
      }
      c.marcas.setAttribute('d', marcas);
      c.cara.setAttribute('d', cara);
    }

    // latiguillos: de la boca k del panel al puerto k del switch, colgando por delante
    function pintarLatiguillos() {
      const pa = porParte[PANEL], sw = porParte[SW];
      const op = tval(pa.out, performance.now()), os = tval(sw.out, performance.now());
      let d = '';
      for (let k = 0; k < NC; k++) {
        const x = bocaX(k), a = [x, D + op + 0.4, (pa.z0 + pa.z1) / 2], b = [x, D + os + 0.4, (sw.z0 + sw.z1) / 2 - 0.6];
        const cA = [x, a[1] + 5 + k * 0.6, a[2] - 1], cB = [x, b[1] + 5 + k * 0.6, b[2] + 1];
        const pts = [];
        for (let i = 0; i <= 10; i++) {
          const t = i / 10, s = 1 - t;
          const q = [0, 1, 2].map((j) => s * s * s * a[j] + 3 * s * s * t * cA[j] + 3 * s * t * t * cB[j] + t * t * t * b[j]);
          pts.push(P(q[0], q[1], q[2]));
        }
        d += open(pts);
      }
      latiguillos.setAttribute('d', d);
    }

    const B = register(stage, (_dt, now) => {
      let mueve = false;
      for (const c of cajones) {
        const o = tval(c.out, now);
        if (o !== c.pintado) { c.pintado = o; cajon(c, o); }
        if (!tdone(c.out, now)) mueve = true;
      }
      pintarLatiguillos();
      return mueve;
    });
    bag.add(B.unregister);

    // zona que se toca: siempre la de reposo (no se mueve con el dibujo)
    const izq = P(-6, D, 0)[0], der = P(W + 6, 0, 0)[0];
    const postIzq = P(-2, D, 0)[0];
    const medio = {};
    cajones.forEach((c) => { medio[c.parte] = P(W / 2, D + c.reposo, (c.z0 + c.z1) / 2)[1]; });
    const arriba = P(W / 2, D, HP)[1] - 6, abajo = P(W / 2, D + 6, 0)[1] + 8;
    const cordX = P(bocaX(NC - 1) + 3, D, 0)[0];

    function zona([x, y]) {
      if (x < izq - 8 || x > der + 8 || y < arriba || y > abajo + 30) return -1;
      if (x < postIzq) return POSTS;
      // entre la mitad del panel y la del switch, en el lado de los latiguillos
      if (x < cordX && y > medio[PANEL] + 2 && y < medio[SW] - 1) return CORD;
      let mejor = -1, dist = Infinity;
      for (const c of cajones) {
        const d = Math.abs(medio[c.parte] - y);
        if (d < dist) { dist = d; mejor = c.parte; }
      }
      return mejor;
    }

    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      const now = performance.now(), desde = a >= 0 ? a : act;
      act = a;
      const idx = (p) => cajones.findIndex((c) => c.parte === p);
      const ia = idx(desde);
      cajones.forEach((c, i) => {
        const dist = ia < 0 ? 0 : Math.abs(i - ia);
        const o = a < 0 || a === POSTS ? c.reposo : c.parte === a ? PULL : a === CORD ? (c.parte === PANEL || c.parte === SW ? 3 : 0) : dist === 1 ? PULL * 0.18 : 0;
        tset(c.out, o, now, dist * 50);
        const hi = c.parte === a;
        c.cuerpo.sil.classList.toggle('hi', hi);
        if (c.parte === TRAY) c.extra.sil.classList.toggle('hi', hi);
      });
      latiguillos.classList.toggle('hi', a === CORD);
      postes.forEach((p) => p.sil.classList.toggle('hi', a === POSTS));
      agujeros.forEach((h) => h.setAttribute('class', 'dot ' + (a === POSTS ? 'm' : 'off')));
      // en reposo, la luz que se mira es la del puerto 3 del switch
      porParte[SW].luces[2].setAttribute('class', 'dot ' + (a < 0 || a === SW ? '' : 'm'));
      B.wake();
    }
    mostrar(-1);

    bag.add(pointer(stage, {
      move: (p) => avisos.encima(zona(p)),
      down: (p) => avisos.toca(zona(p)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());

    return { mostrar, destroy: bag.dispose };
  },
});

/* ------------------------------------------------------------
   Roseta abierta (UT3 S7): las piezas se separan hacia delante
   o hacia atrás, como en un despiece.
   ------------------------------------------------------------ */
registrarPiezas('roseta', {
  partes: [
    { nombre: 'Tapa', texto: 'La placa de delante, la que se ve en la pared. Tiene el hueco por donde asoma el conector y se quita con dos tornillos para llegar a lo de dentro.' },
    { nombre: 'Conector hembra', texto: 'El RJ-45 hembra donde se enchufa el latiguillo. Por detrás lleva una regleta con 8 ranuras: cada hilo del cable de la pared se mete a presión, sin crimpar, con la herramienta de impacto.' },
    { nombre: 'Caja', texto: 'La base que se atornilla a la pared (o va empotrada en ella). Sujeta el conector y guarda el trozo de cable que sobra.' },
    { nombre: 'Cable de la pared', texto: 'El cable fijo y rígido que llega por la pared o el falso techo desde el panel de parcheo del armario. Una vez puesto, no se toca.' },
    { nombre: 'Latiguillo', texto: 'El cable flexible con un RJ-45 macho que va del PC a la roseta. Es lo único que se enchufa y se desenchufa.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, rrect, poly, open, seg, tween, tset, tval, tdone, mk, place, pointer, put, register, solid, disposer } = HL;
    const TAPA = 0, CONECTOR = 1, CAJA = 2, CABLE = 3, LATI = 4;
    // reposo: un despiece suave; elegida: cuánto se separa cada pieza (eje y, hacia el alumno)
    const REPOSO = [1.5, 0, -2, -2, 2];
    const SALE = [[8, 0, 0, 0, 14], [0, 14, 0, 0, 14], [0, 0, -12, -12, 2], [0, 0, 0, -12, 2], [0, 0, 0, 0, 16]];

    const bag = disposer();
    const C = Cam(45, 0.5, 3.7);
    fit(C, [[-2, -26, -2], [32, -26, 48], [32, 14, -2], [-2, 14, 32], [12, 36, 12], [-2, 30, -2], [22, 58, 0]], 200, 166);
    const P = proj(C);
    const g = mk('g', {}, svg);

    const cable = mk('path', { class: 'nf' }, g);
    const caja = solid(g);
    const regleta = solid(g), ranuras = mk('path', { class: 'nf lo' }, regleta.g);
    const tapa = mk('g', {}, g);
    const tapaSil = mk('path', { class: 'sil', 'fill-rule': 'evenodd' }, tapa);
    const tapaCara = mk('path', { class: 'nf lo' }, tapa);
    const tornillos = [mk('circle', { r: 1, class: 'dot m' }, tapa), mk('circle', { r: 1, class: 'dot m' }, tapa)];
    const frente = solid(g), boca = mk('path', { class: 'nf' }, frente.g);
    const clavija = solid(g), bota = solid(g), latiguillo = mk('path', { class: 'nf' }, g);

    const off = REPOSO.map((v) => tween(v));
    let pintado = '', ordenActual = '';

    function pintar(now) {
      const o = off.map((t) => tval(t, now));
      const clave = o.map((v) => v.toFixed(2)).join();
      if (clave === pintado) return;
      pintado = clave;
      const oc = o[CAJA], ok = o[CONECTOR], ot = o[TAPA], op = o[LATI], ow = o[CABLE];
      // el cable de la pared sale por detrás de la caja y sube por la pared
      cable.setAttribute('d', open(PZ.curva(P, [15, 1 + ow, 22], [15, -10 + ow, 22], [15, -24, 24], [15, -24, 46], 14)));
      put(caja, PZ.cajaY(P, 0, 0, 30, 30, 3, 1, oc, 12 + oc));
      // conector: la regleta (detrás) y el frente con la boca
      const k0 = 4 + ok, k1 = 12.5 + ok, k2 = 17 + ok;
      put(regleta, PZ.cajaY(P, 9, 9.5, 21, 20.5, 1.2, 0.6, k0, k1));
      let r = '';
      for (let i = 0; i < 8; i++) r += seg(P(10.4 + i * 1.3, k0 + 1.5, 20.5), P(10.4 + i * 1.3, k1 - 1.5, 20.5));
      ranuras.setAttribute('d', r);
      const t0 = 12 + ot, t1 = 14.5 + ot;
      const f0 = t1 > k1 && t1 < k2 ? t1 : k1;
      put(frente, PZ.cajaY(P, 10, 10.5, 20, 19.5, 1, 0.5, f0, k2));
      let b = poly(rrect(11.5, 12, 18.5, 18, 0.8).map((q) => P(q.u, k2, q.v)));
      for (let i = 0; i < 8; i++) b += seg(P(12.1 + i * 0.83, k2, 17.4), P(12.1 + i * 0.83, k2, 16.4));
      boca.setAttribute('d', b);
      // tapa: placa con hueco (el hueco deja ver lo de detrás)
      const fuera = rrect(-2, -2, 32, 32, 3), hueco = rrect(9.5, 10, 20.5, 20, 1);
      tapaSil.setAttribute('d', poly(HL.hull(PZ.anillo(P, fuera, t0).concat(PZ.anillo(P, fuera, t1)))) + poly(PZ.anillo(P, hueco, t1)));
      tapaCara.setAttribute('d', poly(PZ.anillo(P, rrect(-1, -1, 31, 31, 2.2), t1)) + poly(PZ.anillo(P, hueco, t0)));
      place(tornillos[0], P(15, t1, 26)); place(tornillos[1], P(15, t1, 4));
      // latiguillo: la parte metida en el conector no se dibuja
      const p0 = 13 + op, p1 = 25 + op;
      const desde = p0 < k2 && p1 > k2 ? k2 : p0;
      put(clavija, PZ.cajaY(P, 11, 12, 19, 17.6, 1, 0.5, desde, p1));
      put(bota, PZ.cajaY(P, 12.4, 12.8, 17.6, 16.8, 1.2, 0.5, p1, p1 + 6));
      latiguillo.setAttribute('d', open(PZ.curva(P, [15, p1 + 6, 14.8], [15, p1 + 20, 14], [17, p1 + 24, 2], [20, 58, 0], 14)));
      // orden de pintado de atrás adelante: la tapa va donde esté respecto al conector
      const medio = t0 >= k2 - 0.5 ? [regleta.g, frente.g, tapa] : k0 >= t1 ? [tapa, regleta.g, frente.g] : [regleta.g, tapa, frente.g];
      const orden = [cable, caja.g, ...medio, clavija.g, bota.g, latiguillo];
      const llave = medio.map((e) => (e === tapa ? 't' : e === regleta.g ? 'r' : 'f')).join('');
      if (llave !== ordenActual) { ordenActual = llave; orden.forEach((e) => g.append(e)); }
    }

    const B = register(stage, (_dt, now) => {
      pintar(now);
      return off.some((t) => !tdone(t, now));
    });
    bag.add(B.unregister);

    const ANCLAS = [
      [TAPA, [-1, 14.5, 31]], [TAPA, [31, 14.5, 1]], [TAPA, [31, 14.5, 31]], [TAPA, [-1, 14.5, 1]], [TAPA, [15, 14.5, 30]], [TAPA, [15, 14.5, 1]], [TAPA, [1, 14.5, 15]], [TAPA, [30, 14.5, 15]],
      [CONECTOR, [15, 17, 15]],
      [CAJA, [15, 3, 30]], [CAJA, [30, 3, 12]], [CAJA, [30, 3, 25]],
      [CABLE, [15, -22, 30]], [CABLE, [15, -24, 42]],
      [LATI, [15, 28, 14]], [LATI, [16, 44, 10]], [LATI, [19, 60, 1]],
    ];

    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      off.forEach((t, i) => tset(t, a < 0 ? REPOSO[i] : SALE[a][i], now, 0));
      tapaSil.classList.toggle('hi', a === TAPA);
      frente.sil.classList.toggle('hi', a === CONECTOR); regleta.sil.classList.toggle('hi', a === CONECTOR);
      caja.sil.classList.toggle('hi', a === CAJA);
      cable.classList.toggle('hi', a === CABLE);
      clavija.sil.classList.toggle('hi', a === LATI); bota.sil.classList.toggle('hi', a === LATI); latiguillo.classList.toggle('hi', a === LATI);
      B.wake();
    }
    mostrar(-1);

    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 30)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 30)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});

/* ------------------------------------------------------------
   RJ-45 por dentro (UT3 S7): un conector antes de crimpar, de
   plástico transparente. Al tocar los contactos o la cuña, bajan
   como al crimpar; la pestaña se aprieta; el capuchón se desliza.
   ------------------------------------------------------------ */
registrarPiezas('rj45', {
  partes: [
    { nombre: 'Carcasa', texto: 'El cuerpo de plástico transparente. Es transparente para que puedas comprobar que los 8 hilos llegan hasta el fondo y en su orden antes de crimpar.' },
    { nombre: 'Contactos', texto: 'Ocho láminas doradas. Al crimpar bajan y atraviesan el aislante de cada hilo hasta tocar el cobre: por eso los hilos no se pelan uno a uno.' },
    { nombre: 'Cuña', texto: 'Al crimpar se hunde y aprieta la cubierta del cable, para que un tirón no arranque los hilos. Tiene que apretar la cubierta, no hilos sueltos.' },
    { nombre: 'Pestaña', texto: 'Engancha el conector en la boca. Se aprieta para soltarlo. Es lo primero que se rompe.' },
    { nombre: 'Capuchón', texto: 'La funda de goma que protege la pestaña. Se mete en el cable antes de crimpar: si se te olvida, después ya no entra.' },
    { nombre: 'Hilos', texto: 'Los 8 hilos del cable, en el orden de la norma y metidos hasta el fondo. La cubierta del cable entra dentro del conector, debajo de la cuña.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, facing, prism, rings, rrect, circ, poly, open, seg, tween, tset, tval, tdone, mk, pointer, put, register, solid, disposer } = HL;
    const CARCASA = 0, CONTACTOS = 1, CUNA = 2, PESTANA = 3, CAPUCHON = 4, HILOS = 5;
    const xk = (k) => 1.6 + k * 1.26;

    const bag = disposer();
    const C = Cam(45, 0.5, 6.4);
    fit(C, [[0, -30, -4], [12, -30, 9], [12, 22, -4], [0, 22, 9], [0, -30, 7], [12, 6, 9]], 200, 168);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);

    const anilloCable = circ(3.1, 32).map((q) => ({ u: q.u + 6, v: q.v + 3.6, nu: q.nu, nv: q.nv }));
    const funda = solid(g);
    put(funda, PZ.bloqueY(P, anilloCable, null, -30, 6));
    const hilos = mk('path', { class: 'nf' }, g);
    let h = '';
    for (let k = 0; k < 8; k++) h += seg(P(xk(k), 5, 3.4), P(xk(k), 21.4, 3.4));
    hilos.setAttribute('d', h);
    const pestana = solid(g); pestana.sil.classList.add('nf');
    const cuerpo = solid(g); cuerpo.sil.classList.add('nf');
    put(cuerpo, PZ.cajaY(P, 0, 0, 12, 8, 1.2, 0.6, 0, 22));
    const cuna = solid(g);
    const contactos = [];
    for (let k = 0; k < 8; k++) contactos.push(solid(g));
    const capuchon = solid(g);

    const t = { contacto: tween(0), cuna: tween(0), pestana: tween(0), capuchon: tween(0) };
    let pintado = '';
    const anilloAncho = rrect(-0.6, -0.6, 12.6, 8.6, 2.4), anilloBota = circ(3.7, 32).map((q) => ({ u: q.u + 6, v: q.v + 3.6 }));

    function pintar(now) {
      const d = tval(t.contacto, now), dc = tval(t.cuna, now), dp = tval(t.pestana, now), db = tval(t.capuchon, now);
      const clave = [d, dc, dp, db].map((v) => v.toFixed(3)).join();
      if (clave === pintado) return;
      pintado = clave;
      // contactos: antes de crimpar asoman un poco; al crimpar bajan hasta los hilos
      contactos.forEach((s, k) => {
        const [r, ri] = rings(xk(k) - 0.26, 15.5, xk(k) + 0.26, 21.3, 0.15, 0.08);
        put(s, prism(P, front, r, ri, 4.6 - d * 0.8, 8.9 - d * 1.1));
      });
      const [cr, ci] = rings(2.5, 3.5, 9.5, 8.5, 0.6, 0.4);
      put(cuna, prism(P, front, cr, ci, 6.2 - dc * 1.6, 8 - dc * 1.6));
      // pestaña: nace delante, abajo, y baja hacia atrás; apretada, se acerca al cuerpo
      const zc = -3.4 + dp * 2.2, pts = [];
      for (const x of [3.5, 8.5]) pts.push(P(x, 21, 0), P(x, 21, -0.9), P(x, 9, zc), P(x, 9, zc - 0.9));
      put(pestana, { sil: poly(HL.hull(pts)), crease: seg(P(3.5, 21, 0), P(3.5, 9, zc)) });
      // capuchón: detrás, en el cable; elegido, se desliza hacia el conector
      const y0 = -17 + db, y1 = -6 + db;
      put(capuchon, {
        sil: poly(HL.hull(PZ.anillo(P, anilloBota, y0).concat(PZ.anillo(P, anilloAncho, y1)))),
        crease: poly(PZ.anillo(P, rrect(0.2, 0.2, 11.8, 7.8, 1.8), y1)),
      });
    }

    const B = register(stage, (_dt, now) => {
      pintar(now);
      return Object.values(t).some((x) => !tdone(x, now));
    });
    bag.add(B.unregister);

    const ANCLAS = [
      [CARCASA, [12, 11, 4]], [CARCASA, [12, 2, 4]], [CARCASA, [0, 21, 4]], [CARCASA, [6, 21, 1]],
      [CONTACTOS, [6, 18.5, 8.9]], [CONTACTOS, [2, 18.5, 8.9]], [CONTACTOS, [10, 18.5, 8.9]],
      [CUNA, [6, 6, 8]], [CUNA, [3, 6, 8]], [CUNA, [9, 6, 8]],
      [PESTANA, [6, 13, -2.6]], [PESTANA, [6, 10, -3.4]],
      [CAPUCHON, [6, -11, 4]], [CAPUCHON, [12, -8, 4]], [CAPUCHON, [6, -14, 8]],
      [HILOS, [6, -24, 3.6]], [HILOS, [6, -28, 6]], [HILOS, [9, -20, 6]],
    ];

    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      tset(t.contacto, a === CONTACTOS ? 1 : 0, now, 0);
      tset(t.cuna, a === CUNA ? 1 : 0, now, a === CUNA ? 0 : 40);
      tset(t.pestana, a === PESTANA ? 1 : 0, now, 0);
      tset(t.capuchon, a === CAPUCHON ? 11 : 0, now, 0);
      cuerpo.sil.classList.toggle('hi', a === CARCASA);
      contactos.forEach((s) => s.sil.classList.toggle('hi', a === CONTACTOS));
      cuna.sil.classList.toggle('hi', a === CUNA);
      pestana.sil.classList.toggle('hi', a === PESTANA);
      capuchon.sil.classList.toggle('hi', a === CAPUCHON);
      hilos.classList.toggle('hi', a === HILOS); funda.sil.classList.toggle('hi', a === HILOS);
      B.wake();
    }
    mostrar(-1);

    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 28)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 28)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});

/* ------------------------------------------------------------
   Switch por delante (UT3, tarjeta de red y enlace): puertos,
   luces LINK y ACT, latiguillos y hueco SFP. Al sacar un
   latiguillo, la luz LINK de su puerto se apaga.
   ------------------------------------------------------------ */
registrarPiezas('switch', {
  partes: [
    { nombre: 'Puertos', texto: 'Las bocas RJ-45 hembra, una por equipo. Este tiene 5; los de un armario suelen tener 24 o 48. Encima de cada boca están sus dos luces.' },
    { nombre: 'Latiguillo', texto: 'Si sacas el latiguillo, la luz LINK de su puerto se apaga: el switch ya no ve a nadie al otro lado. Es la primera prueba de un cable.' },
    { nombre: 'Luz LINK', texto: 'Fija: hay enlace, el cable llega al otro extremo y los dos aparatos se entienden. Apagada: cable roto o mal crimpado, desenchufado en el otro lado o puerto apagado.' },
    { nombre: 'Luz ACT', texto: 'Parpadea cuando pasan datos. Si LINK está encendida pero ACT no parpadea, hay enlace pero no hay tráfico.' },
    { nombre: 'Hueco SFP', texto: 'Un hueco para un módulo de fibra óptica. Con él, el switch se une por fibra con otro armario que está lejos. Lo verás en la unidad de fibra.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, rrect, poly, open, seg, tween, tset, tval, tdone, mk, place, pointer, put, register, solid, disposer, reducedMotion } = HL;
    const PUERTOS = 0, LATI = 1, LINK = 2, ACT = 3, SFP = 4;
    const W = 62, D = 28, H = 12, N = 5;
    const xk = (k) => 6.5 + k * 8.4;
    const CONECTADOS = [0, 1, 3], ACT_REPOSO = 1;

    const bag = disposer();
    const C = Cam(45, 0.5, 3.9);
    fit(C, [[0, 0, 0], [W, 0, H], [0, D, 0], [W, D, H], [-4, 70, 0], [W, 58, 0], [0, 0, H]], 200, 160);
    const P = proj(C);
    const g = mk('g', {}, svg);
    const F = (x, z) => P(x, D, z);
    const cara = (x0, z0, x1, z1, r) => poly(rrect(x0, z0, x1, z1, r, 3).map((q) => F(q.u, q.v)));

    const cuerpo = solid(g);
    put(cuerpo, PZ.cajaY(P, 0, 0, W, H, 2, 1, 0, D));
    // rejilla de ventilación en la tapa
    let rej = '';
    for (let i = 0; i < 7; i++) rej += seg(P(22 + i * 3, 7, H), P(22 + i * 3, 19, H));
    mk('path', { d: rej, class: 'nf lo' }, g);
    let bocas = '';
    for (let k = 0; k < N; k++) bocas += cara(xk(k) - 2.8, 1.8, xk(k) + 2.8, 6.6, 0.6) + seg(F(xk(k) - 1, 6.6), F(xk(k) + 1, 6.6));
    const puertos = mk('path', { d: bocas, class: 'nf' }, g);
    mk('path', { d: cara(48, 2.5, 57, 5.9, 0.5), class: 'nf lo' }, g);
    const link = [], act = [];
    for (let k = 0; k < N; k++) {
      link.push(mk('circle', { r: 1.1 }, g)); place(link[k], F(xk(k) - 1.8, 9.2));
      act.push(mk('circle', { r: 1.1 }, g)); place(act[k], F(xk(k) + 1.8, 9.2));
    }
    const modulo = solid(g), asa = mk('path', { class: 'nf' }, modulo.g);

    const clavijas = {}, cables = {};
    for (const k of CONECTADOS) clavijas[k] = { cuerpo: solid(g), bota: solid(g), out: tween(0), pintado: NaN };
    for (const k of CONECTADOS) cables[k] = mk('path', { class: 'nf' }, g);
    const sfp = tween(0);

    function pintar(now) {
      for (const k of CONECTADOS) {
        const c = clavijas[k], o = tval(c.out, now);
        if (o === c.pintado) continue;
        c.pintado = o;
        const x = xk(k), y0 = Math.max(D, 26 + o), y1 = 36 + o;
        put(c.cuerpo, PZ.cajaY(P, x - 2.4, 2.2, x + 2.4, 6.2, 0.6, 0.4, y0, y1));
        put(c.bota, PZ.cajaY(P, x - 1.6, 2.8, x + 1.6, 5.6, 0.6, 0.3, y1, y1 + 5));
        const dx = (x - 30) * 0.45;
        cables[k].setAttribute('d', open(PZ.curva(P, [x, y1 + 5, 4.2], [x, y1 + 14, 4], [x + dx * 0.4, y1 + 20, 0.4], [x + dx, 70, 0], 14)));
      }
      const os = tval(sfp, now);
      put(modulo, PZ.cajaY(P, 48.6, 3, 56.4, 5.4, 0.4, 0.3, D - 2 + os, D + 1.5 + os));
      asa.setAttribute('d', open([P(49.2, D + 1.5 + os, 4.2), P(49.2, D + 5 + os, 4.2), P(55.8, D + 5 + os, 4.2), P(55.8, D + 1.5 + os, 4.2)]));
    }

    let elegida = -2, sacado = 1, pedido = 1;
    function luces(now) {
      const parpadeo = !reducedMotion() && Math.floor(now / 380) % 2 === 0;
      for (let k = 0; k < N; k++) {
        const conectado = CONECTADOS.includes(k) && !(elegida === LATI && k === sacado);
        link[k].setAttribute('class', 'dot ' + (!conectado ? 'off' : elegida === LINK ? '' : 'm'));
        let a = 'off';
        if (k === ACT_REPOSO && conectado) {
          if (elegida === ACT) a = parpadeo ? '' : 'off';
          else if (elegida < 0) a = '';
        }
        act[k].setAttribute('class', 'dot ' + a);
      }
    }

    const B = register(stage, (_dt, now) => {
      pintar(now);
      luces(now);
      const mueve = Object.values(clavijas).some((c) => !tdone(c.out, now)) || !tdone(sfp, now);
      return mueve || (elegida === ACT && !reducedMotion());
    });
    bag.add(B.unregister);

    const ANCLAS = [[SFP, [52.5, D, 4]], [SFP, [52.5, D + 3, 4]]];
    for (let k = 0; k < N; k++) {
      ANCLAS.push([LINK, [xk(k) - 1.8, D, 9.2]], [ACT, [xk(k) + 1.8, D, 9.2]]);
      if (!CONECTADOS.includes(k)) ANCLAS.push([PUERTOS, [xk(k), D, 4.2]]);
    }
    const ANCLAS_LATI = [];
    for (const k of CONECTADOS) ANCLAS_LATI.push([k, [xk(k), 38, 4.2]], [k, [xk(k), 52, 2.5]]);

    function zona(p) {
      const k = PZ.cerca(P, ANCLAS_LATI, p, 16);
      if (k >= 0) { pedido = k; return LATI; }
      return PZ.cerca(P, ANCLAS, p, 14);
    }

    function mostrar(a) {
      if (a === elegida && !(a === LATI && pedido !== sacado)) return;
      elegida = a;
      if (a === LATI) sacado = pedido;
      const now = performance.now();
      for (const k of CONECTADOS) {
        const c = clavijas[k];
        tset(c.out, a === LATI && k === sacado ? 14 : 0, now, 0);
        c.cuerpo.sil.classList.toggle('hi', a === LATI && k === sacado);
        c.bota.sil.classList.toggle('hi', a === LATI && k === sacado);
        cables[k].classList.toggle('hi', a === LATI && k === sacado);
      }
      tset(sfp, a === SFP ? 10 : 0, now, 0);
      modulo.sil.classList.toggle('hi', a === SFP);
      puertos.classList.toggle('hi', a === PUERTOS);
      luces(now);
      B.wake();
    }
    mostrar(-1);

    bag.add(pointer(stage, {
      move: (p) => avisos.encima(zona(p)),
      down: (p) => avisos.toca(zona(p)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});
