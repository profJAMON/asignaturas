/* ============================================================
   Piezas de redes para el laboratorio «piezas» (23/10/2026)
   ============================================================
   Dibujos isométricos de trazo, hechos con el motor Hairline
   (js/hairline.js), en los que el alumno toca una pieza y la ve
   salir y encenderse, con su explicación debajo.
   Figuras: rack, roseta y rj45 (UT3 S7); switch y tarjeta (UT3, tarjeta de
   red y enlace); cable-utp (UT3 S5); comprobador (UT3 herramientas);
   coaxial (UT3 coaxial); sfp (UT4 conectores y empalmes). El marco, los
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

/* ------------------------------------------------------------
   Ayudas para cables (eje y): anillos en el plano x-z alrededor
   de un centro, y hélices que solo pintan la cara que se ve.
   ------------------------------------------------------------ */
PZ.aro = (cx, cz, R, n) => HL.circ(R, n || 40).map((q) => ({ u: q.u + cx, v: q.v + cz, nu: q.nu, nv: q.nv }));
PZ.tubo = (P, cx, cz, R, y0, y1) => PZ.bloqueY(P, PZ.aro(cx, cz, R), PZ.aro(cx, cz, R), y0, y1);
// una hélice de radio r alrededor de (cx, cz), de y0 a y1, con paso «paso»; si soloDelante, corta la parte de detrás
PZ.helice = (P, cx, cz, r, y0, y1, paso, fase, soloDelante) => {
  let d = '', tramo = [];
  const pasos = Math.max(8, Math.round((y1 - y0) / Math.abs(paso) * 16));
  for (let i = 0; i <= pasos; i++) {
    const y = y0 + (y1 - y0) * i / pasos, a = fase + 2 * Math.PI * (y - y0) / paso;
    const x = cx + r * Math.cos(a), z = cz + r * Math.sin(a);
    const delante = Math.cos(a) + Math.sin(a) > -0.15;
    if (soloDelante && !delante) { if (tramo.length > 1) d += HL.open(tramo); tramo = []; continue; }
    tramo.push(P(x, y, z));
  }
  if (tramo.length > 1) d += HL.open(tramo);
  return d;
};

/* ------------------------------------------------------------
   Cable de par trenzado (UT3 S5): un F/UTP de categoría alta,
   pelado por la punta. Al elegir una capa, las de fuera se
   retiran para que se vea entera.
   ------------------------------------------------------------ */
registrarPiezas('cable-utp', {
  partes: [
    { nombre: 'Cubierta', texto: 'El plástico de fuera. Protege los pares de golpes y de la humedad. Es de PVC o, mejor, libre de halógenos, que no suelta humo tóxico si arde.' },
    { nombre: 'Pantalla', texto: 'Una lámina de aluminio que envuelve los cuatro pares juntos: hace de escudo contra el ruido eléctrico. Este cable la lleva porque es FTP; un UTP no tiene pantalla.' },
    { nombre: 'Pares', texto: 'Ocho hilos de cobre, cada uno con su aislante de color, agrupados en cuatro pares. Los dos hilos de cada par van enroscados uno sobre otro: así aguantan mejor las interferencias.' },
    { nombre: 'Cruceta', texto: 'Una pieza de plástico en forma de cruz que separa los cuatro pares para que no se molesten entre ellos. La llevan los cables de categorías altas.' },
    { nombre: 'Hilo de rasgado', texto: 'Un hilo fuerte que va por dentro, pegado a la cubierta. Se tira de él para abrir la cubierta a lo largo sin dañar los pares.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, open, tween, tset, tval, tdone, mk, pointer, put, register, solid, disposer } = HL;
    const CUBIERTA = 0, PANTALLA = 1, PARES = 2, CRUCETA = 3, RASGADO = 4;
    const CZ = 7, RC = 6, RP = 5.1, RD = 2.5, RH = 0.8, PASO = 7;
    const bag = disposer();
    const C = Cam(45, 0.5, 4.6);
    fit(C, [[-RC, -46, 0], [RC, -46, 2 * CZ], [-RC, 30, 0], [RC, 30, 2 * CZ], [8, 30, 12]], 200, 168);
    const P = proj(C);
    const g = mk('g', {}, svg);
    const cubierta = solid(g), pantalla = solid(g);
    const ANG = [225, 135, 315, 45].map((a) => (a * Math.PI) / 180); // de atrás adelante
    const pares = ANG.map(() => mk('path', { class: 'nf' }, g));
    const cruzV = solid(g), cruzH = solid(g);
    g.append(pares[3]);
    const rasgado = mk('path', { class: 'nf' }, g);

    const t = { cub: tween(0), pan: tween(0), par: tween(0), cruz: tween(0), ras: tween(0) };
    let pintado = '';
    function pintar(now) {
      const v = Object.fromEntries(Object.entries(t).map(([k, x]) => [k, tval(x, now)]));
      const clave = Object.values(v).map((x) => x.toFixed(3)).join();
      if (clave === pintado) return;
      pintado = clave;
      const fC = -6 - v.cub, fP = 0 - v.pan;
      put(cubierta, PZ.tubo(P, 0, CZ, RC, -46, fC));
      put(pantalla, PZ.tubo(P, 0, CZ, RP, fC, fP));
      ANG.forEach((a, i) => {
        const sale = i === 3 ? v.par : 0;
        const cx = (RD + sale) * Math.cos(a), cz = CZ + (RD + sale) * Math.sin(a);
        pares[i].setAttribute('d', PZ.helice(P, cx, cz, RH, fP, 26, PASO, i, false) + PZ.helice(P, cx, cz, RH, fP, 26, PASO, i + Math.PI, false));
      });
      const c0 = fP + v.cruz, c1 = 9 + v.cruz;
      put(cruzV, PZ.cajaY(P, -0.35, CZ - 3.8, 0.35, CZ + 3.8, 0.15, 0.12, c0, c1));
      put(cruzH, PZ.cajaY(P, -3.8, CZ - 0.35, 3.8, CZ + 0.35, 0.15, 0.12, c0, c1));
      // el hilo de rasgado asoma por la boca de la cubierta, arriba, y se levanta al tirar
      const r0 = [-1.5, fC, CZ + RC - 0.8];
      rasgado.setAttribute('d', open(PZ.curva(P, r0, [-1.5, fC + 6, CZ + RC - 0.6 + v.ras * 0.3], [-1.8, fC + 12, CZ + RC + v.ras], [-2.2, fC + 18, CZ + RC + 1 + v.ras * 1.6], 12)));
    }
    const B = register(stage, (_dt, now) => { pintar(now); return Object.values(t).some((x) => !tdone(x, now)); });
    bag.add(B.unregister);

    const ANCLAS = [
      [CUBIERTA, [RC, -20, CZ]], [CUBIERTA, [0, -30, CZ + RC]], [CUBIERTA, [RC, -38, CZ]],
      [PANTALLA, [RP, -3, CZ]], [PANTALLA, [0, -3, CZ + RP]],
      [PARES, [RD + 1, 18, CZ + 1]], [PARES, [RD, 24, CZ + RD]], [PARES, [-RD, 20, CZ + RD]],
      [CRUCETA, [0, 7, CZ]], [CRUCETA, [3, 6, CZ]],
      [RASGADO, [-2, 6, CZ + RC + 0.6]], [RASGADO, [-2.2, 12, CZ + RC + 1]],
    ];
    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      tset(t.cub, a === PANTALLA || a === PARES || a === CRUCETA ? 7 : 0, now, 0);
      tset(t.pan, a === PARES || a === CRUCETA ? 5 : 0, now, 40);
      tset(t.par, a === PARES ? 2.4 : 0, now, 80);
      tset(t.cruz, a === CRUCETA ? 9 : 0, now, 80);
      tset(t.ras, a === RASGADO ? 4 : 0, now, 0);
      cubierta.sil.classList.toggle('hi', a === CUBIERTA);
      pantalla.sil.classList.toggle('hi', a === PANTALLA);
      pares.forEach((p) => p.classList.toggle('hi', a === PARES));
      cruzV.sil.classList.toggle('hi', a === CRUCETA); cruzH.sil.classList.toggle('hi', a === CRUCETA);
      rasgado.classList.toggle('hi', a === RASGADO);
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
   Cable coaxial (UT3 coaxial): las cuatro capas, una dentro de
   otra. Al elegir una, las de fuera se retiran.
   ------------------------------------------------------------ */
registrarPiezas('coaxial', {
  partes: [
    { nombre: 'Conductor central', texto: 'Un hilo de cobre (o de acero cobreado) en el centro. Por él va la señal.' },
    { nombre: 'Dieléctrico', texto: 'El aislante que separa el centro de la malla y mantiene siempre la misma distancia entre los dos. Normalmente es polietileno.' },
    { nombre: 'Malla', texto: 'El conductor exterior: una malla trenzada de cobre o aluminio, a menudo con una lámina debajo. Hace de retorno de la señal y de pantalla contra las interferencias.' },
    { nombre: 'Cubierta', texto: 'El plástico de fuera: PVC o, mejor, libre de halógenos. Es negra si el cable va por el exterior, porque aguanta el sol.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, tween, tset, tval, tdone, mk, pointer, put, register, solid, disposer } = HL;
    const CENTRO = 0, DIEL = 1, MALLA = 2, CUBIERTA = 3;
    const CZ = 5.5, R = [0.9, 3.2, 4.2, 5.2];
    const bag = disposer();
    const C = Cam(45, 0.5, 5.4);
    fit(C, [[-5.5, -42, 0], [5.5, -42, 11], [-5.5, 18, 0], [5.5, 18, 11]], 200, 166);
    const P = proj(C);
    const g = mk('g', {}, svg);
    const capas = [3, 2, 1, 0].map(() => solid(g)); // de fuera adentro
    const trama = mk('path', { class: 'nf lo' }, g);
    capas[1].g.after(trama);
    const t = [tween(0), tween(0), tween(0)]; // cuánto se retiran cubierta, malla y dieléctrico
    let pintado = '';
    function pintar(now) {
      const v = t.map((x) => tval(x, now));
      const clave = v.map((x) => x.toFixed(3)).join();
      if (clave === pintado) return;
      pintado = clave;
      const fC = -8 - v[0], fM = -1 - v[1], fD = 7 - v[2], fK = 15;
      put(capas[0], PZ.tubo(P, 0, CZ, R[3], -42, fC));
      put(capas[1], PZ.tubo(P, 0, CZ, R[2], fC, fM));
      put(capas[2], PZ.tubo(P, 0, CZ, R[1], fM, fD));
      put(capas[3], PZ.tubo(P, 0, CZ, R[0], fD, fK));
      let d = '';
      for (let i = 0; i < 6; i++) {
        d += PZ.helice(P, 0, CZ, R[2] + 0.05, fC, fM, 9, i * 1.05, true);
        d += PZ.helice(P, 0, CZ, R[2] + 0.05, fC, fM, -9, i * 1.05, true);
      }
      trama.setAttribute('d', d);
    }
    const B = register(stage, (_dt, now) => { pintar(now); return t.some((x) => !tdone(x, now)); });
    bag.add(B.unregister);

    const ANCLAS = [
      [CENTRO, [0, 13, CZ + 1]], [CENTRO, [1, 10, CZ]],
      [DIEL, [R[1], 3, CZ]], [DIEL, [0, 4, CZ + R[1]]],
      [MALLA, [R[2], -4, CZ]], [MALLA, [0, -5, CZ + R[2]]],
      [CUBIERTA, [R[3], -22, CZ]], [CUBIERTA, [0, -32, CZ + R[3]]], [CUBIERTA, [R[3], -36, CZ]],
    ];
    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      // se retiran las capas de fuera de la elegida
      tset(t[0], a >= 0 && a < CUBIERTA ? 7 : 0, now, 0);
      tset(t[1], a >= 0 && a < MALLA ? 6 : 0, now, 40);
      tset(t[2], a >= 0 && a < DIEL ? 5 : 0, now, 80);
      capas.forEach((c, i) => c.sil.classList.toggle('hi', a === 3 - i));
      trama.classList.toggle('hi', a === MALLA);
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
   Comprobador de cables (UT3 herramientas): módulo principal y
   remoto con el cable que se prueba. Al elegir las luces, se
   encienden del 1 al 8, a la par en los dos módulos.
   ------------------------------------------------------------ */
registrarPiezas('comprobador', {
  partes: [
    { nombre: 'Módulo principal', texto: 'El principal (o maestro). Lleva el interruptor y manda un impulso por cada pin del cable, uno detrás de otro.' },
    { nombre: 'Módulo remoto', texto: 'Va al otro extremo del cable, que puede estar en otra sala. Enciende la luz del pin por el que le llega cada impulso.' },
    { nombre: 'Luces 1 a 8', texto: 'Una luz por pin. En un cable directo bien hecho se encienden a la par en los dos módulos: 1-1, 2-2, 3-3… hasta 8-8.' },
    { nombre: 'Luz G', texto: 'La luz de la pantalla (masa) de los cables apantallados. Con un UTP no se enciende, porque no hay pantalla.' },
    { nombre: 'Cable que pruebas', texto: 'Cada extremo va a un módulo. El comprobador dice si cada hilo llega y a qué pin, pero no si el cable aguanta 1 Gbps: eso lo mide un certificador.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, open, tween, tset, tval, tdone, mk, place, pointer, put, register, solid, disposer, reducedMotion, rings, prism, facing, rrect, poly } = HL;
    const PRINCIPAL = 0, REMOTO = 1, LUCES = 2, LUZG = 3, CABLE = 4;
    const bag = disposer();
    const C = Cam(45, 0.5, 3.5);
    fit(C, [[0, 0, 0], [26, 0, 9], [0, 46, 0], [54, 0, 8], [54, 44, 0], [20, 74, 0]], 200, 160);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);
    const principal = solid(g), remoto = solid(g);
    const marcasP = mk('path', { class: 'nf lo' }, g), marcasR = mk('path', { class: 'nf lo' }, g);
    const lucesP = [], lucesR = [];
    for (let i = 0; i < 9; i++) { lucesP.push(mk('circle', { r: 1.15 }, g)); lucesR.push(mk('circle', { r: 1.15 }, g)); }
    const clavP = solid(g), clavR = solid(g), cable = mk('path', { class: 'nf' }, g);
    const t = { sube: tween(0), aparta: tween(0), saca: tween(0) };
    let pintado = '', act = -2;
    const lx = (x0, i) => x0 + 2.2 + i * 2.35;

    function pintar(now) {
      const s = tval(t.sube, now), ap = tval(t.aparta, now), sc = tval(t.saca, now);
      const clave = [s, ap, sc].map((x) => x.toFixed(3)).join();
      if (clave === pintado) return;
      pintado = clave;
      const [pr, pi] = rings(0, 0, 26, 46, 3, 1.2);
      put(principal, prism(P, front, pr, pi, s, 9 + s));
      const rx = 32 + ap;
      const [rr, ri] = rings(rx, 6, rx + 24, 40, 3, 1.2);
      put(remoto, prism(P, front, rr, ri, 0, 8));
      // interruptor y ventanita de luces en el principal; ventanita en el remoto
      marcasP.setAttribute('d', poly(rrect(3, 6, 10, 14, 1.4).map((q) => P(q.u, q.v, 9 + s))) + poly(rrect(1, 27, 25, 31, 1.4).map((q) => P(q.u, q.v, 9 + s))));
      marcasR.setAttribute('d', poly(rrect(rx + 1, 21, rx + 23, 25, 1.4).map((q) => P(q.u, q.v, 8))));
      for (let i = 0; i < 9; i++) { place(lucesP[i], P(lx(0, i), 29, 9 + s)); place(lucesR[i], P(lx(rx, i) - 1, 23, 8)); }
      // el cable: un latiguillo de la boca del principal (delante) a la del remoto
      put(clavP, PZ.cajaY(P, 9, 2 + s, 15, 6 + s, 0.8, 0.4, 46 + sc, 53 + sc));
      put(clavR, PZ.cajaY(P, rx + 9, 2, rx + 15, 6, 0.8, 0.4, 40 + sc, 47 + sc));
      cable.setAttribute('d', open(PZ.curva(P, [12, 53 + sc, 4 + s], [12, 76, 0.5], [rx + 12, 72, 0.5], [rx + 12, 47 + sc, 4], 24)));
    }

    function luces(now) {
      const conectado = act !== CABLE;
      const paso = Math.floor(now / 330) % 9;
      for (let i = 0; i < 9; i++) {
        let c = 'off';
        if (conectado) {
          if (act === LUCES) c = reducedMotion() ? (i < 8 ? '' : 'off') : (i === paso && i < 8 ? '' : 'off');
          else if (act === LUZG) c = i === 8 ? '' : 'off';
          else if (act < 0 && i === 0) c = '';
        }
        lucesP[i].setAttribute('class', 'dot ' + c);
        lucesR[i].setAttribute('class', 'dot ' + (act < 0 ? 'off' : c));
      }
    }

    const B = register(stage, (_dt, now) => {
      pintar(now); luces(now);
      return Object.values(t).some((x) => !tdone(x, now)) || (act === LUCES && !reducedMotion());
    });
    bag.add(B.unregister);

    const ANCLAS = [
      [PRINCIPAL, [26, 20, 5]], [PRINCIPAL, [13, 46, 5]], [PRINCIPAL, [6, 10, 9]], [PRINCIPAL, [20, 12, 9]],
      [REMOTO, [56, 20, 4]], [REMOTO, [44, 40, 4]], [REMOTO, [40, 12, 8]], [REMOTO, [50, 32, 8]],
      [CABLE, [12, 56, 3]], [CABLE, [30, 74, 0.5]], [CABLE, [44, 50, 3]], [CABLE, [12, 70, 1]],
    ];
    for (let i = 0; i < 8; i++) ANCLAS.push([LUCES, [lx(0, i), 29, 9]], [LUCES, [lx(32, i) - 1, 23, 8]]);
    ANCLAS.push([LUZG, [lx(0, 8), 29, 9]], [LUZG, [lx(32, 8) - 1, 23, 8]]);

    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      tset(t.sube, a === PRINCIPAL ? 4 : 0, now, 0);
      tset(t.aparta, a === REMOTO ? 8 : 0, now, 0);
      tset(t.saca, a === CABLE ? 5 : 0, now, 0);
      principal.sil.classList.toggle('hi', a === PRINCIPAL);
      remoto.sil.classList.toggle('hi', a === REMOTO);
      cable.classList.toggle('hi', a === CABLE); clavP.sil.classList.toggle('hi', a === CABLE); clavR.sil.classList.toggle('hi', a === CABLE);
      luces(now);
      B.wake();
    }
    mostrar(-1);
    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 24)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 24)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});

/* ------------------------------------------------------------
   Tarjeta de red de expansión (UT3 tarjeta de red y enlace):
   pinchada en su ranura de la placa base. Al elegir el conector,
   la tarjeta sale de la ranura.
   ------------------------------------------------------------ */
registrarPiezas('tarjeta', {
  partes: [
    { nombre: 'Puerto RJ-45', texto: 'La boca hembra donde se enchufa el latiguillo. Asoma por la parte de atrás de la caja del ordenador.' },
    { nombre: 'Luces', texto: 'Los LED testigo junto al puerto: LINK (hay enlace) y ACT (pasan datos). Son lo primero que se mira.' },
    { nombre: 'Chapa', texto: 'La pieza de metal que se atornilla a la caja del ordenador. Sujeta la tarjeta y deja asomar el puerto por detrás.' },
    { nombre: 'Conector PCI Express', texto: 'Los contactos dorados de abajo. Se pinchan en una ranura PCI Express de la placa base, siempre con el ordenador apagado y desenchufado.' },
    { nombre: 'Chip de red', texto: 'El que hace el trabajo de la tarjeta. En una tarjeta integrada, este chip va soldado directamente en la placa base.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, open, seg, poly, rrect, tween, tset, tval, tdone, mk, place, pointer, put, register, solid, disposer, rings, prism, facing } = HL;
    const PUERTO = 0, LUCES = 1, CHAPA = 2, PCIE = 3, CHIP = 4;
    const Y0 = 20, Y1 = 21.4; // grosor de la tarjeta (en vertical, mirando al alumno)
    const bag = disposer();
    const C = Cam(45, 0.5, 3.4);
    fit(C, [[-6, -4, -2], [62, -4, -2], [-6, 40, -2], [62, 40, -2], [4, 20, 40], [56, 20, 40], [60, 24, 30]], 200, 166);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);
    const placa = solid(g);
    const [br, bi] = rings(-6, -4, 62, 40, 3, 1.4);
    put(placa, prism(P, front, br, bi, -2, 0));
    // otras pistas y una ranura más, para que se lea como placa base
    mk('path', { d: open([P(-2, 34, 0), P(20, 34, 0), P(24, 30, 0)]) + open([P(30, 36, 0), P(58, 36, 0)]) + open([P(-2, 2, 0), P(16, 2, 0)]), class: 'nf lo' }, g);
    const otra = solid(g);
    { const [r, i] = rings(4, 6, 44, 9, 0.8, 0.4); put(otra, prism(P, front, r, i, 0, 3)); }
    const ranuraAtras = solid(g);
    const tarjeta = solid(g), contactos = mk('path', { class: 'nf lo' }, tarjeta.g);
    const chip = solid(g), chapa = solid(g), puerto = solid(g), boca = mk('path', { class: 'nf' }, g);
    const leds = [mk('circle', { r: 1.3 }, g), mk('circle', { r: 1.3 }, g)];
    const ranuraDelante = solid(g);
    const sube = tween(0);
    let pintado = NaN, act = -2;

    function pintar(now) {
      const s = tval(sube, now);
      if (s === pintado) return;
      pintado = s;
      // la ranura: la mitad de atrás antes de la tarjeta y la de delante después, para que la tarjeta quede dentro
      { const [r, i] = rings(4, 17.5, 46, Y0, 0.6, 0.3); put(ranuraAtras, prism(P, front, r, i, 0, 4)); }
      { const [r, i] = rings(4, Y1, 46, 24, 0.6, 0.3); put(ranuraDelante, prism(P, front, r, i, 0, 4)); }
      const z0 = 1 + s, z1 = 25 + s;
      put(tarjeta, PZ.cajaY(P, 6, z0, 48, z1, 1.2, 0.8, Y0, Y1));
      let c = '';
      for (let x = 9; x < 45; x += 1.6) if (Math.abs(x - 20) > 1) c += seg(P(x, Y1, z0 + 0.6), P(x, Y1, z0 + 2.6));
      contactos.setAttribute('d', c);
      put(chip, PZ.cajaY(P, 22, 9 + s, 31, 18 + s, 1, 0.6, Y1, Y1 + 1.4));
      // chapa al extremo derecho, de pie, con su pestaña de tornillo arriba
      put(chapa, { sil: poly(HL.hull([[48, 16, -3], [48, 26, -3], [48, 16, 36], [48, 26, 36], [49, 16, -3], [49, 26, -3], [49, 16, 36], [49, 26, 36], [49, 16, 36], [55, 16, 36], [55, 26, 36], [49, 26, 36]].map(([x, y, z]) => P(x, y, z + s)))), crease: open([P(49, 16, 36 + s), P(49, 26, 36 + s)]) });
      const [pr, pi] = rings(49, 17.2, 54, 24.8, 0.8, 0.4);
      put(puerto, prism(P, front, pr, pi, 14 + s, 22 + s));
      boca.setAttribute('d', poly(rrect(18.6, 15.5, 23.4, 20.5, 0.6).map((q) => P(54, q.u, q.v + s))));
      place(leds[0], P(54, 18.2, 21.3 + s)); place(leds[1], P(54, 23.8, 21.3 + s));
    }
    function luces() {
      leds.forEach((l, i) => l.setAttribute('class', 'dot ' + (act === LUCES ? '' : act < 0 && i === 0 ? '' : 'm')));
    }
    const B = register(stage, (_dt, now) => { pintar(now); return !tdone(sube, now); });
    bag.add(B.unregister);

    const ANCLAS = [
      [PUERTO, [54, 21, 16]], [PUERTO, [52, 21, 22]],
      [LUCES, [54, 18.2, 21.3]], [LUCES, [54, 23.8, 21.3]],
      [CHAPA, [49, 21, 30]], [CHAPA, [52, 21, 36]], [CHAPA, [49, 21, 4]],
      [PCIE, [14, 22, 3]], [PCIE, [30, 22, 3]], [PCIE, [40, 22, 3]],
      [CHIP, [26.5, 22.8, 13.5]],
    ];
    function mostrar(a) {
      if (a === act) return;
      act = a;
      tset(sube, a === PCIE ? 12 : 0, performance.now(), 0);
      tarjeta.sil.classList.toggle('hi', a === PCIE); contactos.classList.toggle('hi', a === PCIE);
      chip.sil.classList.toggle('hi', a === CHIP);
      chapa.sil.classList.toggle('hi', a === CHAPA);
      puerto.sil.classList.toggle('hi', a === PUERTO); boca.classList.toggle('hi', a === PUERTO);
      luces();
      B.wake();
    }
    mostrar(-1);
    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 22)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 22)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});

/* ------------------------------------------------------------
   Módulo SFP con su latiguillo LC (UT4 conectores y empalmes):
   el hueco del switch, el módulo, la palanca, el LC dúplex y sus
   férulas.
   ------------------------------------------------------------ */
registrarPiezas('sfp', {
  partes: [
    { nombre: 'Módulo SFP', texto: 'El transceptor: convierte la señal eléctrica del switch en luz y al revés. Se enchufa en un hueco del switch y se cambia en caliente, sin apagar.' },
    { nombre: 'Palanca', texto: 'El asa para sacar el módulo: se baja y se tira. Su color suele decir para qué fibra y qué distancia es el módulo, igual que su etiqueta.' },
    { nombre: 'Conector LC dúplex', texto: 'Dos conectores LC unidos, porque la fibra va en parejas: por uno sale la luz (TX) y por el otro entra (RX). Llevan pestaña, como un RJ-45.' },
    { nombre: 'Férulas', texto: 'Los cilindros de cerámica con la fibra pegada en el centro y la punta pulida. Al enchufar, quedan punta contra punta con las del otro lado: por eso tienen que estar limpias.' },
    { nombre: 'Latiguillo de fibra', texto: 'Dos fibras de estructura ajustada, una para cada sentido. No se dobla en ángulo cerrado: en una curva muy cerrada, la luz se escapa.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, open, poly, rrect, tween, tset, tval, tdone, mk, pointer, put, register, solid, disposer } = HL;
    const MODULO = 0, PALANCA = 1, LC = 2, FERULA = 3, LATI = 4;
    const D = 24; // cara delantera del switch
    const bag = disposer();
    const C = Cam(45, 0.5, 4.2);
    fit(C, [[0, 0, 0], [44, 0, 12], [0, D, 0], [44, D, 12], [10, 66, 0], [30, 66, 0], [20, 52, 8]], 200, 150);
    const P = proj(C);
    const g = mk('g', {}, svg);
    const sw = solid(g);
    put(sw, PZ.cajaY(P, 0, 0, 44, 12, 2, 1, 0, D));
    const caja = poly(rrect(13.5, 2.8, 26.5, 7.6, 0.6).map((q) => P(q.u, D, q.v)));
    mk('path', { d: caja + poly(rrect(31, 3, 39, 7.4, 0.6).map((q) => P(q.u, D, q.v))), class: 'nf lo' }, g);
    const modulo = solid(g), bocas = mk('path', { class: 'nf' }, g), palanca = mk('path', { class: 'nf' }, g);
    const ferulas = [solid(g), solid(g)];
    const lcs = [solid(g), solid(g)], puente = solid(g), botas = [solid(g), solid(g)];
    const fibras = mk('path', { class: 'nf' }, g);
    const t = { mod: tween(0), pal: tween(0), lc: tween(0) };
    let pintado = '';
    const XC = [17.9, 22.1];

    function pintar(now) {
      const om = tval(t.mod, now), ap = tval(t.pal, now), ol = tval(t.lc, now) + om;
      const clave = [om, ap, ol].map((x) => x.toFixed(3)).join();
      if (clave === pintado) return;
      pintado = clave;
      const m0 = Math.max(D, 2 + om), m1 = 30 + om;
      put(modulo, PZ.cajaY(P, 14, 3.2, 26, 7.2, 0.6, 0.4, m0, m1));
      bocas.setAttribute('d', XC.map((x) => poly(rrect(x - 1.7, 3.8, x + 1.7, 6.6, 0.4).map((q) => P(q.u, m1, q.v)))).join(''));
      // palanca: un alambre en U que va plano sobre la boca; abierta, gira hacia abajo
      const a = ap * 1.3, z = (r) => 7.4 - r * Math.sin(a), y = (r) => m1 - 3 + r * Math.cos(a);
      palanca.setAttribute('d', open([P(14, m1 - 3, 7.4), P(14, y(4.5), z(4.5)), P(26, y(4.5), z(4.5)), P(26, m1 - 3, 7.4)]));
      // LC: el cuerpo, su puente con la pestaña y las botas; las férulas asoman al sacarlo
      const l0 = m1 + ol, l1 = l0 + 8;
      XC.forEach((x, i) => {
        put(ferulas[i], PZ.tubo(P, x, 5.2, 0.7, l0 - 2.4, l0));
        put(lcs[i], PZ.cajaY(P, x - 1.6, 3.8, x + 1.6, 6.6, 0.5, 0.3, l0, l1));
        put(botas[i], PZ.tubo(P, x, 5.2, 1.2, l1, l1 + 6));
      });
      put(puente, PZ.cajaY(P, 15.6, 6.6, 24.4, 7.8, 0.4, 0.25, l0 + 3, l1));
      fibras.setAttribute('d', XC.map((x, i) => open(PZ.curva(P, [x, l1 + 6, 5.2], [x, l1 + 16, 5], [x + (i ? 4 : -4), l1 + 20, 0.4], [x + (i ? 8 : -8), Math.max(66, l1 + 12), 0], 14))).join(''));
      ferulas.forEach((f) => f.g.style.display = ol > 0.6 ? '' : 'none');
    }
    const B = register(stage, (_dt, now) => { pintar(now); return Object.values(t).some((x) => !tdone(x, now)); });
    bag.add(B.unregister);

    const ANCLAS = [
      [MODULO, [26, 27, 5]], [MODULO, [20, 26, 7.2]],
      [PALANCA, [20, 29, 7.4]], [PALANCA, [14, 29, 7.4]],
      [LC, [20, 35, 7.8]], [LC, [24, 34, 5]], [LC, [16, 34, 5]],
      [FERULA, [20, 31, 5]],
      [LATI, [18, 44, 5]], [LATI, [22, 50, 3]], [LATI, [14, 58, 0.5]], [LATI, [28, 58, 0.5]],
    ];
    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      tset(t.pal, a === PALANCA || a === MODULO ? 1 : 0, now, a === PALANCA ? 200 : 0);
      tset(t.mod, a === MODULO ? 12 : 0, now, a === MODULO ? 250 : 0);
      tset(t.lc, a === LC || a === FERULA || a === PALANCA ? 9 : 0, now, 0);
      modulo.sil.classList.toggle('hi', a === MODULO);
      palanca.classList.toggle('hi', a === PALANCA);
      lcs.forEach((s) => s.sil.classList.toggle('hi', a === LC)); puente.sil.classList.toggle('hi', a === LC);
      ferulas.forEach((s) => s.sil.classList.toggle('hi', a === FERULA));
      fibras.classList.toggle('hi', a === LATI); botas.forEach((s) => s.sil.classList.toggle('hi', a === LATI));
      B.wake();
    }
    mostrar(-1);
    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 24)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 24)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});
