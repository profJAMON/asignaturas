/* ============================================================
   Piezas de Operaciones para el laboratorio «piezas» (23/10/2026)
   ============================================================
   Mismo sistema que js/piezas-redes.js (motor js/hairline.js y
   registrarPiezas de js/laboratorios.js), con las figuras de
   Operaciones. Va en tema.html después de piezas-redes.js, que
   define las ayudas PZ.

   Figuras: teclado (U1 S1, los símbolos de programar).
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
