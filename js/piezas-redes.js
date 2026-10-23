/* ============================================================
   Piezas de redes para el laboratorio «piezas» (23/10/2026)
   ============================================================
   Dibujos isométricos de trazo, hechos con el motor Hairline
   (js/hairline.js), en los que el alumno toca una pieza y la ve
   salir y encenderse, con su explicación debajo. El marco, los
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
