/* ============================================================
   Piezas de Operaciones para el laboratorio «piezas» (23/10/2026)
   ============================================================
   Mismo sistema que js/piezas-redes.js (motor js/hairline.js y
   registrarPiezas de js/laboratorios.js), con las figuras de
   Operaciones. Va en tema.html después de piezas-redes.js, que
   define las ayudas PZ.

   Figuras: teclado (U1 S1, los símbolos de programar) y capas
   (U5 S1, hardware, controladores, sistema operativo y
   aplicaciones, una encima de otra) y maquina-virtual (U5 S2,
   un ordenador de mentira encima de uno de verdad).
   ============================================================ */

/* ------------------------------------------------------------
   Teclado español: dónde están Mayús, AltGr, Ctrl y Alt, la
   tecla < > y las combinaciones de # y /. Las teclas no llevan
   nada escrito (nada de letras dentro del dibujo): se reconocen
   por su sitio, que es como lo explica la sesión.
   ------------------------------------------------------------ */
registrarPiezas('teclado', {
  partes: [
    { nombre: 'Mayús', texto: 'Las dos teclas con la flecha hacia arriba, una a cada lado. Mantenla pulsada y te da el símbolo de arriba de la tecla.' },
    { nombre: 'AltGr', texto: 'La tecla justo a la derecha de la barra espaciadora. Mantenla pulsada y te da el símbolo pintado abajo a la derecha de la tecla.' },
    { nombre: 'Ctrl + Alt', texto: 'Si tu teclado no tiene AltGr, pulsa Ctrl y Alt a la vez, abajo a la izquierda: hacen lo mismo.' },
    { nombre: 'Tecla < >', texto: 'Entre la Mayús izquierda y la Z. Sola escribe <; con Mayús, >. Las usarás en todas las etiquetas HTML.' },
    { nombre: '# = AltGr + 3', texto: 'Mantén AltGr y, sin soltarla, pulsa el 3. Lo usarás en los colores, como #ff0000.' },
    { nombre: '/ = Mayús + 7', texto: 'Mantén Mayús y, sin soltarla, pulsa el 7. Cierra las etiquetas, como </p>, y separa carpetas en las rutas.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, facing, prism, rings, tween, tset, tval, tdone, mk, pointer, put, register, solid, disposer } = HL;
    const MAYUS = 0, ALTGR = 1, CTRLALT = 2, MENOR = 3, ALMOHADILLA = 4, BARRA = 5;
    const U = 8, F = 8; // ancho de una tecla normal y fondo de una fila
    // filas de atrás adelante: [anchos en teclas, nombres de las que importan]
    const FILAS = [
      [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], { 3: 'n3', 7: 'n7' }],
      [[1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], {}],
      [[1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.25], {}],
      [[1.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75], { 0: 'mayusI', 1: 'menor', 11: 'mayusD' }],
      [[1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25], { 0: 'ctrl', 2: 'alt', 4: 'altgr' }],
    ];
    const ANCHO = 15 * U, FONDO = FILAS.length * F;
    const bag = disposer();
    const C = Cam(45, 0.5, 2.6);
    fit(C, [[-3, -3, -2], [ANCHO + 3, -3, -2], [-3, FONDO + 3, -2], [ANCHO + 3, FONDO + 3, 3]], 200, 166);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);
    const base = solid(g);
    { const [r, i] = rings(-3, -3, ANCHO + 3, FONDO + 3, 4, 1.4); put(base, prism(P, front, r, i, -2, 0)); }
    const teclas = {}, todas = [];
    FILAS.forEach(([anchos, nombres], fila) => {
      let x = 0;
      anchos.forEach((w, k) => {
        const tc = { x0: x + 0.6, x1: x + w * U - 0.6, y0: fila * F + 0.6, y1: (fila + 1) * F - 0.6, el: solid(g), baja: tween(0), pintado: NaN };
        todas.push(tc);
        if (nombres[k]) teclas[nombres[k]] = tc;
        x += w * U;
      });
    });
    const QUE = {
      [MAYUS]: [['mayusI', 0], ['mayusD', 0]],
      [ALTGR]: [['altgr', 0]],
      [CTRLALT]: [['ctrl', 0], ['alt', 0]],
      [MENOR]: [['menor', 0]],
      [ALMOHADILLA]: [['altgr', 0], ['n3', 380]],
      [BARRA]: [['mayusI', 0], ['n7', 380]],
    };

    function pintar(now) {
      let mueve = false;
      for (const tc of todas) {
        const b = tval(tc.baja, now);
        if (!tdone(tc.baja, now)) mueve = true;
        if (b === tc.pintado) continue;
        tc.pintado = b;
        const [r, i] = rings(tc.x0, tc.y0, tc.x1, tc.y1, 1.4, 1.1);
        put(tc.el, prism(P, front, r, i, 0, 3 - b * 1.6));
      }
      return mueve;
    }
    const B = register(stage, (_dt, now) => pintar(now));
    bag.add(B.unregister);

    const centro = (n) => { const tc = teclas[n]; return [(tc.x0 + tc.x1) / 2, (tc.y0 + tc.y1) / 2, 3]; };
    const ANCLAS = [
      [MAYUS, centro('mayusI')], [MAYUS, centro('mayusD')],
      [ALTGR, centro('altgr')], [CTRLALT, centro('ctrl')], [CTRLALT, centro('alt')],
      [MENOR, centro('menor')], [ALMOHADILLA, centro('n3')], [BARRA, centro('n7')],
    ];
    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      const pulsadas = new Map((QUE[a] || []).map(([n, retraso]) => [teclas[n], retraso]));
      for (const tc of todas) {
        const sale = pulsadas.has(tc);
        tset(tc.baja, sale ? 1 : 0, now, sale ? pulsadas.get(tc) : 0);
        tc.el.sil.classList.toggle('hi', sale);
      }
      B.wake();
    }
    mostrar(-1);
    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 14)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 14)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});


/* ------------------------------------------------------------
   Un ordenador por capas (U5 S1): cuatro bloques apilados, de
   abajo arriba hardware, controladores, sistema operativo y
   aplicaciones. La capa elegida sale hacia delante como un
   cajón. Se pintan de abajo arriba, como los cajones del rack:
   así la de arriba tapa bien a la de abajo cuando sale.
   ------------------------------------------------------------ */
registrarPiezas('capas', {
  partes: [
    { nombre: 'Aplicaciones', texto: 'Los programas que usas para hacer cosas: Chrome, Word, un juego. Nunca tocan el hardware: todo se lo piden al sistema operativo.' },
    { nombre: 'Sistema operativo', texto: 'El que manda en el ordenador. Reparte la memoria y el procesador entre los programas, guarda los archivos, controla quién entra y te da el escritorio. Por ejemplo, Windows o Linux.' },
    { nombre: 'Controladores', texto: 'Programas pequeños que le explican al sistema operativo cómo se usa cada aparato: la impresora, el wifi, la tarjeta gráfica. Sin su controlador, el aparato no funciona.' },
    { nombre: 'Hardware', texto: 'Lo que se puede tocar: el procesador, la memoria RAM, el disco, la pantalla, el teclado. Sin software no hace nada.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, facing, prism, rings, rrect, poly, seg, tween, tset, tval, tdone, mk, pointer, put, register, solid, disposer } = HL;
    const APPS = 0, SO = 1, CTRL = 2, HW = 3;
    const W = 56, D = 34, PULL = 16, HUECO = 1.4;
    // de abajo arriba: parte y alto
    const PISOS = [[HW, 10], [CTRL, 6], [SO, 10], [APPS, 8]];
    const ALTO = PISOS.reduce((a, [, h]) => a + h + HUECO, 0);

    const bag = disposer();
    const C = Cam(45, 0.5, 3.0);
    fit(C, [[0, 0, 0], [W, 0, 0], [0, D + PULL, 0], [W, D + PULL, 0], [0, 0, ALTO], [W, D + PULL, ALTO]], 200, 160);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);

    const capas = [];
    let z = 0;
    for (const [parte, alto] of PISOS) {
      const c = { parte, z0: z, z1: z + alto, grp: mk('g', {}, g), out: tween(0), pintado: NaN };
      z += alto + HUECO;
      c.cuerpo = solid(c.grp);
      c.cara = mk('path', { class: 'nf' }, c.grp);
      capas.push(c);
    }
    const porParte = {};
    capas.forEach((c) => { porParte[c.parte] = c; });

    function cajon(c, o) {
      const y1 = D + o, [r, ir] = rings(0, o, W, y1, 1.6, 0.8);
      put(c.cuerpo, prism(P, front, r, ir, c.z0, c.z1));
      const F = (x, zz) => P(x, y1, zz);
      const caja = (a, b, cc, d, rr) => poly(rrect(a, b, cc, d, rr, 3).map((q) => F(q.u, q.v)));
      const m = c.z0 + 2, M = c.z1 - 2;
      let d = '';
      if (c.parte === HW) {
        // puertos a la izquierda y rejilla de ventilación a la derecha
        for (let k = 0; k < 3; k++) d += caja(5 + k * 6, m, 9 + k * 6, M, 0.6);
        for (let k = 0; k < 6; k++) d += seg(F(34 + k * 3, m), F(34 + k * 3, M));
      } else if (c.parte === CTRL) {
        // una fila de patillas, como las de un conector
        for (let k = 0; k < 10; k++) d += seg(F(8 + k * 4.4, m + 0.4), F(8 + k * 4.4, M - 0.4));
      } else if (c.parte === SO) {
        // una ventana con su barra de título
        d += caja(10, m, 46, M, 1);
        d += seg(F(10, M - 2), F(46, M - 2));
      } else if (c.parte === APPS) {
        // tres iconos de programa
        for (let k = 0; k < 3; k++) d += caja(11 + k * 13, m, 19 + k * 13, M, 1);
      }
      c.cara.setAttribute('d', d);
    }

    function pintar(now) {
      let mueve = false;
      for (const c of capas) {
        const o = tval(c.out, now);
        if (!tdone(c.out, now)) mueve = true;
        if (o === c.pintado) continue;
        c.pintado = o;
        cajon(c, o);
      }
      return mueve;
    }
    const B = register(stage, (_dt, now) => pintar(now));
    bag.add(B.unregister);

    // anclas: el centro de la cara de delante de cada capa, en reposo
    const ANCLAS = capas.map((c) => [c.parte, [W / 2, D, (c.z0 + c.z1) / 2]]);
    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      for (const c of capas) {
        const sale = c.parte === a;
        tset(c.out, sale ? PULL : 0, now, 0);
        c.cuerpo.sil.classList.toggle('hi', sale);
      }
      B.wake();
    }
    mostrar(-1);
    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 40)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 40)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});


/* ------------------------------------------------------------
   Una máquina virtual por dentro (U5 S2). De abajo arriba: el
   ordenador real, el sistema operativo anfitrión y VirtualBox.
   Encima de VirtualBox, a la izquierda, la máquina virtual con
   su sistema operativo invitado; a la derecha, el disco virtual
   y la ISO (un disco plano). La pieza elegida sale hacia
   delante. Orden de pintado: los pisos de abajo arriba; después
   el disco y la ISO (a la derecha, no se cruzan con la máquina
   al salir) y, al final, la máquina y su invitado.
   ------------------------------------------------------------ */
registrarPiezas('maquina-virtual', {
  partes: [
    { nombre: 'Ordenador real', texto: 'El hardware de verdad: tu PC del aula. Le presta a la máquina virtual un trozo de su RAM, de su procesador y de su disco.' },
    { nombre: 'Sistema operativo anfitrión', texto: 'El que ya tiene el ordenador: Windows. Se llama anfitrión porque recibe en su casa a la máquina virtual.' },
    { nombre: 'VirtualBox', texto: 'El hipervisor: el programa que crea y arranca las máquinas virtuales. Reparte la RAM y el procesador entre Windows y la máquina virtual.' },
    { nombre: 'Máquina virtual', texto: 'Un ordenador de mentira, hecho de software. Tiene RAM, procesador y disco, pero todo son trozos prestados del ordenador real.' },
    { nombre: 'Sistema operativo invitado', texto: 'El que instalas dentro de la máquina virtual: Linux. Lo que pase ahí dentro no toca el Windows de fuera.' },
    { nombre: 'Disco virtual', texto: 'Para Windows es solo un archivo grande, que acaba en .vdi. Para la máquina virtual es su disco duro entero. Si borras el archivo, borras la máquina.' },
    { nombre: 'ISO', texto: 'Un archivo que es la copia exacta de un disco de instalación. Se mete en el lector virtual de la máquina, como si fuera un DVD.' },
  ],

  montar({ stage, svg }, avisos) {
    const { Cam, fit, proj, facing, prism, rings, rrect, poly, seg, tween, tset, tval, tdone, mk, pointer, put, register, solid, disposer } = HL;
    const REAL = 0, ANF = 1, VB = 2, MV = 3, INV = 4, DISCO = 5, ISO = 6;
    const W = 60, D = 40, PULL = 14;
    const bag = disposer();
    const C = Cam(45, 0.5, 3.0);
    fit(C, [[0, 0, 0], [W, 0, 0], [0, D + PULL, 0], [W, D + PULL, 0], [0, 0, 52], [W, D + PULL, 30]], 200, 160);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);

    // cada pieza: caja (x0, y0, x1, y1, z0, z1), radio, y qué dibuja en su cara
    const PIEZAS = [
      { parte: REAL, x0: 0, y0: 0, x1: W, y1: D, z0: 0, z1: 10, r: 1.8 },
      { parte: ANF, x0: 0, y0: 0, x1: W, y1: D, z0: 11.2, z1: 17, r: 1.8 },
      { parte: VB, x0: 0, y0: 0, x1: W, y1: D, z0: 18.2, z1: 24, r: 1.8 },
      { parte: DISCO, x0: 38, y0: 3, x1: 56, y1: 15, z0: 25.2, z1: 31, r: 1.2 },
      { parte: ISO, x0: 39, y0: 21, x1: 55, y1: 37, z0: 25.2, z1: 26.8, r: 99 },
      { parte: MV, x0: 3, y0: 4, x1: 32, y1: 36, z0: 25.2, z1: 41, r: 1.6 },
      { parte: INV, x0: 5, y0: 6, x1: 30, y1: 34, z0: 42.2, z1: 47, r: 1.4 },
    ];
    for (const pz of PIEZAS) {
      pz.grp = mk('g', {}, g);
      pz.cuerpo = solid(pz.grp);
      pz.cara = mk('path', { class: 'nf' }, pz.grp);
      pz.out = tween(0);
      pz.pintado = NaN;
    }
    const por = {};
    PIEZAS.forEach((pz) => { por[pz.parte] = pz; });

    function cara(pz, o) {
      const yf = pz.y1 + o, F = (x, zz) => P(x, yf, zz);
      const caja = (a, b, c, d, rr) => poly(rrect(a, b, c, d, rr, 3).map((q) => F(q.u, q.v)));
      const m = pz.z0 + 1.6, M = pz.z1 - 1.6;
      let d = '';
      if (pz.parte === REAL) {
        for (let k = 0; k < 3; k++) d += caja(5 + k * 6, m, 9 + k * 6, M, 0.6);
        for (let k = 0; k < 7; k++) d += seg(F(36 + k * 3, m), F(36 + k * 3, M));
      } else if (pz.parte === ANF) {
        d += seg(F(6, (m + M) / 2), F(W - 6, (m + M) / 2));
      } else if (pz.parte === VB) {
        for (let k = 0; k < 4; k++) d += caja(6 + k * 13, m, 14 + k * 13, M, 0.8);
      } else if (pz.parte === MV) {
        // una pantalla dentro de la cara: el ordenador de mentira
        d += caja(pz.x0 + 4, m + 1, pz.x1 - 4, M, 1);
      } else if (pz.parte === DISCO) {
        d += seg(F(pz.x0 + 3, (m + M) / 2), F(pz.x1 - 3, (m + M) / 2));
      }
      pz.cara.setAttribute('d', d);
    }
    function pieza(pz, o) {
      const [r, i] = rings(pz.x0, pz.y0 + o, pz.x1, pz.y1 + o, pz.r, pz.parte === ISO ? 5 : 0.8);
      put(pz.cuerpo, prism(P, front, r, i, pz.z0, pz.z1));
      if (pz.parte !== ISO) cara(pz, o);
    }
    // la máquina arrastra a su invitado; el invitado sale solo
    function salida(pz, now) {
      const o = tval(pz.out, now);
      return pz.parte === INV ? o + tval(por[MV].out, now) : o;
    }
    function pintar(now) {
      let mueve = false;
      for (const pz of PIEZAS) {
        const o = salida(pz, now);
        if (!tdone(pz.out, now)) mueve = true;
        if (o === pz.pintado) continue;
        pz.pintado = o;
        pieza(pz, o);
      }
      return mueve;
    }
    const B = register(stage, (_dt, now) => pintar(now));
    bag.add(B.unregister);

    const ANCLAS = PIEZAS.map((pz) => [pz.parte, [(pz.x0 + pz.x1) / 2, pz.parte === ISO ? (pz.y0 + pz.y1) / 2 : pz.y1, (pz.z0 + pz.z1) / 2]]);
    let act = -2;
    function mostrar(a) {
      if (a === act) return;
      act = a;
      const now = performance.now();
      for (const pz of PIEZAS) {
        const sale = pz.parte === a;
        tset(pz.out, sale ? PULL : 0, now, 0);
        pz.cuerpo.sil.classList.toggle('hi', sale);
      }
      B.wake();
    }
    mostrar(-1);
    bag.add(pointer(stage, {
      move: (p) => avisos.encima(PZ.cerca(P, ANCLAS, p, 26)),
      down: (p) => avisos.toca(PZ.cerca(P, ANCLAS, p, 26)),
      leave: () => avisos.fuera(),
    }));
    bag.add(() => svg.replaceChildren());
    return { mostrar, destroy: bag.dispose };
  },
});
