/* ============================================================
   Animaciones de dispositivos de interconexión (Instalaciones UT6)
   js/anim-dispositivos.js — cargado DESPUÉS de js/anim-iso.js.
   Estilo isométrico (ISO.animacion), 13/11/2026.

   hub-colision       UT6 S2 · el hub repite a todos; dos a la vez
                      chocan y lo tienen que repetir.
   switch-aprende     UT6 S3 · tabla MAC vacía; aprende el origen,
                      inunda si no conoce el destino, entrega solo al
                      que toca si lo conoce; broadcast a todos.
   router-redes       UT6 S8 · dos redes y un router: dentro de la red
                      no pasa por él; a la otra red, por la puerta de
                      enlace; el broadcast se queda en su red.
   cortafuegos        UT6 S9 · lo que pides vuelve; lo que entra sin
                      pedirlo se bloquea; el servidor solo por su
                      puerto; la VPN entra por un túnel cifrado.
   viaje-dispositivos UT6 S10 · hub (capa 1), switch (capa 2) y router
                      (capa 3): qué mira cada uno.

   Notación de la unidad: MAC cortas (0A, 0B…) y puertos Fa1, Fa2…
   ============================================================ */

(function () {
  'use strict';
  if (!window.ISO || !window.ANIM) return;
  const ISO = window.ISO;
  const el = window.ANIM.el;
  const ruta = (...p) => p;

  /* ---------- Estrella: 4 PC alrededor de un aparato ---------- */
  const PC4 = { A: [95, 112], B: [95, 292], C: [545, 112], D: [545, 292] };
  const LADO = { A: [150, 147], B: [150, 269], C: [490, 147], D: [490, 269] };
  const BOCA = { A: [272, 219], B: [292, 237], C: [368, 219], D: [348, 237] };
  const CENTRO = [320, 222];
  function estrella(k, rotulos, aparato) {
    ['A', 'B', 'C', 'D'].forEach(n => k.cable('c' + n, [PC4[n][0], PC4[n][1] + 14], BOCA[n]));
    ['A', 'B', 'C', 'D'].forEach(n => k.pc(k.svg, PC4[n][0], PC4[n][1], rotulos[n]));
    k.switch_(k.svg, CENTRO[0], CENTRO[1], 4, aparato);
  }
  const ida = n => ruta(LADO[n], BOCA[n]);
  const vuelta = n => ruta(BOCA[n], LADO[n]);

  /* ============================================================
     hub-colision · UT6 S2
     ============================================================ */
  ISO.animacion('hub-colision', {
    titulo: 'El hub repite cada trama por todas sus bocas y, si dos ordenadores envían a la vez, chocan',
    msMovimiento: 1300,
    dibujar(k) {
      estrella(k, { A: 'A', B: 'B', C: 'C', D: 'D' }, 'Hub');
      k.nombre('noB', k.marca(k.svg, PC4.B[0] + 52, PC4.B[1] - 52, false));
      k.nombre('noD', k.marca(k.svg, PC4.D[0] - 52, PC4.D[1] - 52, false));
      k.nombre('siC', k.marca(k.svg, PC4.C[0] - 52, PC4.C[1] - 52, true));
      k.nombre('choque', k.bocadillo(k.svg, 320, 112, '¡Colisión!', [320, 186]));
      k.nombre('lento', k.pastilla(k.svg, 320, 34, 'Más equipos, más choques: más lento', { claseTexto: 'i-t i-negrita' }));
    },
    pasos: [
      { texto: 'Cuatro ordenadores conectados a un <strong>hub</strong>. A quiere enviar algo a C.' },
      { texto: 'La trama de A llega al hub.',
        luz: ['cA'], paq: [{ id: 'a', ruta: ida('A'), chips: ['para C'] }] },
      { texto: 'El hub no mira a quién va: la <strong>repite por todas las bocas</strong> menos por la que ha entrado.',
        luz: ['cB', 'cC', 'cD'],
        paq: [{ id: 'aB', ruta: vuelta('B'), chips: ['para C'] },
              { id: 'aC', ruta: vuelta('C'), chips: ['para C'] },
              { id: 'aD', ruta: vuelta('D'), chips: ['para C'] }] },
      { texto: 'B y D la reciben aunque no es para ellos, y la tiran. Solo C se la queda. Todos han oído lo de A.',
        ver: ['noB', 'noD', 'siC'] },
      { texto: 'Ahora A y D envían a la vez. Por el hub solo puede pasar uno cada vez…',
        luz: ['cA', 'cD'],
        paq: [{ id: 'x', ruta: ida('A'), chips: ['de A'], color: 'ambar' },
              { id: 'y', ruta: ida('D'), chips: ['de D'], color: 'rosa' }] },
      { texto: '…y las dos tramas <strong>chocan</strong>: se estropean las dos. Eso es una <strong>colisión</strong>.',
        ver: ['choque'],
        paq: [{ id: 'x', ruta: ruta(BOCA.A, CENTRO), cae: true },
              { id: 'y', ruta: ruta(BOCA.D, CENTRO), cae: true }] },
      { texto: 'Cada uno espera un rato distinto y lo vuelve a enviar. Primero A…',
        luz: ['cA', 'cB', 'cC', 'cD'],
        paq: [{ id: 'x2', ruta: ruta(LADO.A, BOCA.A, CENTRO, BOCA.C, LADO.C), chips: ['de A'], color: 'ambar', va: true }] },
      { texto: 'Con muchos equipos, los choques se repiten y la red va <strong>cada vez más lenta</strong>. Por eso hoy se usa el switch.',
        ver: ['lento'] }
    ]
  });

  /* ============================================================
     switch-aprende · UT6 S3
     ============================================================ */
  (function () {
    const fila = (k, n, y, t) => k.nombre(n, k.texto(k.svg, 320, y, t, 'i-mono-a'));
    ISO.animacion('switch-aprende', {
      titulo: 'El switch apunta en su tabla MAC quién está en cada boca y entrega cada trama solo a quien toca',
      msMovimiento: 1300,
      dibujar(k) {
        estrella(k, { A: '0A · Fa1', B: '0B · Fa2', C: '0C · Fa3', D: '0D · Fa4' }, 'Switch');
        k.cartel(k.svg, 225, 6, 190, 130, 'Tabla MAC');
        k.nombre('vacia', k.texto(k.svg, 320, 80, '(vacía)', 'i-t i-tenue'));
        fila(k, 'f1', 66, '0A → Fa1');
        fila(k, 'f2', 90, '0C → Fa3');
        fila(k, 'f3', 114, '0B → Fa2');
        k.nombre('noB', k.marca(k.svg, PC4.B[0] + 52, PC4.B[1] - 52, false));
        k.nombre('noD', k.marca(k.svg, PC4.D[0] - 52, PC4.D[1] - 52, false));
      },
      pasos: [
        { texto: 'Un <strong>switch</strong> recién encendido: su <strong>tabla MAC</strong> está vacía. No sabe quién está en cada boca.',
          ver: ['vacia'] },
        { texto: '0A envía una trama a 0C. Entra por Fa1. El switch mira el <strong>origen</strong> y apunta: 0A está en Fa1.',
          ver: ['f1'], luz: ['cA'],
          paq: [{ id: 'a', ruta: ida('A'), chips: [{ t: '0A → 0C', c: 'rosa' }] }] },
        { texto: 'Ahora mira el <strong>destino</strong>: 0C no está en la tabla. Lo envía por todas las bocas menos Fa1: es una <strong>inundación</strong>.',
          ver: ['f1'], luz: ['cB', 'cC', 'cD'],
          paq: [{ id: 'aB', ruta: vuelta('B'), chips: [{ t: '0A → 0C', c: 'rosa' }] },
                { id: 'aC', ruta: vuelta('C'), chips: [{ t: '0A → 0C', c: 'rosa' }] },
                { id: 'aD', ruta: vuelta('D'), chips: [{ t: '0A → 0C', c: 'rosa' }] }] },
        { texto: 'B y D la tiran. C contesta a 0A. Su trama entra por Fa3: el switch apunta 0C en Fa3.',
          ver: ['f1', 'f2', 'noB', 'noD'], luz: ['cC'],
          paq: [{ id: 'c', ruta: ida('C'), chips: [{ t: '0C → 0A', c: 'rosa' }], color: 'lima' }] },
        { texto: '0A sí está en la tabla: la trama sale <strong>solo por Fa1</strong>. B y D ni se enteran.',
          ver: ['f1', 'f2'], luz: ['cA'],
          paq: [{ id: 'c2', ruta: vuelta('A'), chips: [{ t: '0C → 0A', c: 'rosa' }], color: 'lima', va: true }] },
        { texto: '0B envía un <strong>broadcast</strong> (destino FF): es para todos. Apunta 0B en Fa2…',
          ver: ['f1', 'f2', 'f3'], luz: ['cB'],
          paq: [{ id: 'b', ruta: ida('B'), chips: [{ t: '0B → FF', c: 'ambar' }], color: 'ambar' }] },
        { texto: '…y lo envía por todas las bocas menos por la que ha entrado.',
          ver: ['f1', 'f2', 'f3'], luz: ['cA', 'cC', 'cD'],
          paq: [{ id: 'bA', ruta: vuelta('A'), chips: [{ t: '0B → FF', c: 'ambar' }], color: 'ambar', va: true },
                { id: 'bC', ruta: vuelta('C'), chips: [{ t: '0B → FF', c: 'ambar' }], color: 'ambar', va: true },
                { id: 'bD', ruta: vuelta('D'), chips: [{ t: '0B → FF', c: 'ambar' }], color: 'ambar', va: true }] },
        { texto: 'Así, trama a trama, el switch <strong>aprende</strong> dónde está cada equipo. Nadie le configura la tabla.',
          ver: ['f1', 'f2', 'f3'] }
      ]
    });
  })();

  /* ============================================================
     router-redes · UT6 S8
     ============================================================ */
  (function () {
    const SI = [170, 236], SD = [470, 236], R = [320, 140], I = [320, 44];
    const PA = [60, 320], PB = [210, 330], PC = [430, 330], PD = [580, 320];
    const bocaSI = [SI[0], SI[1] - 10], bocaSD = [SD[0], SD[1] - 10];
    ISO.animacion('router-redes', {
      titulo: 'Un router une dos redes: dentro de una red no pasa por él, y el broadcast no cruza al otro lado',
      msMovimiento: 1400,
      dibujar(k) {
        k.cable('ri', [R[0], R[1] - 20], [I[0], I[1] + 26]);
        k.cable('rl', [R[0] - 30, R[1] + 16], bocaSI);
        k.cable('rr', [R[0] + 30, R[1] + 16], bocaSD);
        k.cable('la', bocaSI, [PA[0] + 20, PA[1] - 20]);
        k.cable('lb', bocaSI, [PB[0] - 10, PB[1] - 24]);
        k.cable('rc', bocaSD, [PC[0] + 10, PC[1] - 24]);
        k.cable('rd', bocaSD, [PD[0] - 20, PD[1] - 20]);
        k.nube(k.svg, I[0], I[1], 'Internet');
        k.router(k.svg, R[0], R[1], 'Router');
        k.switch_(k.svg, SI[0], SI[1], 4, ' ');
        k.switch_(k.svg, SD[0], SD[1], 4, ' ');
        k.pc(k.svg, PA[0], PA[1] - 30, null);
        k.pc(k.svg, PB[0], PB[1] - 30, null);
        k.pc(k.svg, PC[0], PC[1] - 30, null);
        k.pc(k.svg, PD[0], PD[1] - 30, null);
        k.texto(k.svg, PA[0], 352, 'A · .1.10', 'i-mono');
        k.texto(k.svg, PB[0], 352, 'B · .1.11', 'i-mono');
        k.texto(k.svg, PC[0], 352, 'C · .2.20', 'i-mono');
        k.texto(k.svg, PD[0], 352, 'D · .2.21', 'i-mono');
        k.pastilla(k.svg, 92, 168, 'Red 192.168.1.0', { claseTexto: 'i-t i-negrita' });
        k.pastilla(k.svg, 548, 168, 'Red 192.168.2.0', { claseTexto: 'i-t i-negrita' });
        k.nombre('pe', k.bocadillo(k.svg, 150, 104, 'Puerta de enlace: .1.1', [R[0] - 40, R[1] - 6]));
        k.nombre('mira', k.bocadillo(k.svg, 490, 104, '.2.20 → otra boca', [R[0] + 40, R[1] - 6]));
        k.nombre('para', k.marca(k.svg, R[0] - 70, R[1] + 30, false));
        k.nombre('ok', k.marca(k.svg, PC[0] + 44, PC[1] - 86, true));
      },
      pasos: [
        { texto: 'Dos redes: la <strong>192.168.1.0</strong> (A y B) y la <strong>192.168.2.0</strong> (C y D). En medio, un <strong>router</strong> con una boca en cada red.' },
        { texto: 'A envía algo a B. Están en la <strong>misma red</strong>: va por el switch y el router ni se entera.',
          luz: ['la', 'lb'],
          paq: [{ id: 'ab', ruta: ruta([PA[0] + 20, PA[1] - 20], bocaSI, [PB[0] - 10, PB[1] - 24]), chips: ['para .1.11'], va: true }] },
        { texto: 'Ahora A envía a C, que está en <strong>otra red</strong>. A no puede llegar sola: se lo da a su <strong>puerta de enlace</strong>, el router.',
          ver: ['pe'], luz: ['la', 'rl'],
          paq: [{ id: 'ac', ruta: ruta([PA[0] + 20, PA[1] - 20], bocaSI, [R[0] - 30, R[1] + 16]), chips: [{ t: 'IP → .2.20', c: 'ambar' }] }] },
        { texto: 'El router mira la <strong>IP de destino</strong>: es de la red 2. La saca por su otra boca.',
          ver: ['mira'], luz: ['rr'],
          paq: [{ id: 'ac', ruta: ruta([R[0] - 30, R[1] + 16], R, [R[0] + 30, R[1] + 16], bocaSD) }] },
        { texto: 'El switch de la derecha la entrega a C.',
          ver: ['ok'], luz: ['rc'],
          paq: [{ id: 'ac', ruta: ruta(bocaSD, [PC[0] + 10, PC[1] - 24]), va: true }] },
        { texto: 'B envía un <strong>broadcast</strong>. Llega a todos los de su red, también al router…',
          luz: ['la', 'rl', 'lb'],
          paq: [{ id: 'b1', ruta: ruta([PB[0] - 10, PB[1] - 24], bocaSI, [PA[0] + 20, PA[1] - 20]), chips: [{ t: 'FF', c: 'ambar' }], color: 'ambar', va: true },
                { id: 'b2', ruta: ruta([PB[0] - 10, PB[1] - 24], bocaSI, [R[0] - 30, R[1] + 16]), chips: [{ t: 'FF', c: 'ambar' }], color: 'ambar' }] },
        { texto: '…pero el router <strong>no lo pasa</strong> a la otra red. El router separa los broadcast.',
          ver: ['para'],
          paq: [{ id: 'b2', ruta: ruta([R[0] - 30, R[1] + 16], R), cae: true }] },
        { texto: 'Y cuando A pide una web, el router la saca a <strong>Internet</strong>: también es una red distinta.',
          luz: ['la', 'rl', 'ri'],
          paq: [{ id: 'w', ruta: ruta([PA[0] + 20, PA[1] - 20], bocaSI, [R[0] - 30, R[1] + 16], R, [I[0], I[1] + 26]), chips: ['google.es'], color: 'lima', va: true }] }
      ]
    });
  })();

  /* ============================================================
     cortafuegos · UT6 S9
     ============================================================ */
  (function () {
    const I = [320, 60], R = [320, 190], S = [470, 290], P = [170, 280], CASA = [560, 70];
    ISO.animacion('cortafuegos', {
      titulo: 'El cortafuegos deja pasar lo que pide la empresa y lo que permiten sus reglas, bloquea lo demás y la VPN entra por un túnel cifrado',
      msMovimiento: 1400,
      dibujar(k) {
        k.cable('ri', [R[0], R[1] - 20], [I[0], I[1] + 26]);
        k.cable('rp', [R[0] - 30, R[1] + 16], [P[0] + 20, P[1] - 22]);
        k.cable('rs', [R[0] + 30, R[1] + 16], [S[0] - 20, S[1] - 26]);
        k.cable('tunel', [CASA[0] - 20, CASA[1] + 30], [R[0] + 34, R[1] - 12], [520, 170]);
        k.nube(k.svg, I[0], I[1], 'Internet');
        k.router(k.svg, R[0], R[1], 'Router con cortafuegos');
        k.pc(k.svg, P[0], P[1], 'PC de la oficina');
        k.servidor(k.svg, S[0], S[1], 'Servidor web');
        k.pc(k.svg, CASA[0], CASA[1], 'Casa');
        k.cartel(k.svg, 10, 8, 220, 124, 'Reglas');
        k.texto(k.svg, 120, 68, 'Respuestas: sí', 'i-t');
        k.texto(k.svg, 120, 94, 'Entrar sin pedir: no', 'i-t');
        k.texto(k.svg, 120, 120, 'Servidor, 443: sí', 'i-t');
        k.nombre('ok1', k.marca(k.svg, P[0] - 62, P[1] - 50, true));
        k.nombre('ok2', k.marca(k.svg, S[0] + 44, S[1] - 84, true));
        k.nombre('ok3', k.marca(k.svg, P[0] - 62, P[1] - 50, true));
        k.nombre('vpn', k.pastilla(k.svg, 430, 140, 'Túnel VPN cifrado', { claseTexto: 'i-t i-negrita' }));
      },
      pasos: [
        { texto: 'La red de una empresa. Entre la oficina e Internet, el router lleva un <strong>cortafuegos</strong> con sus reglas.' },
        { texto: 'Un empleado pide una web. La petición sale…',
          luz: ['rp', 'ri'],
          paq: [{ id: 'p', ruta: ruta([P[0] + 20, P[1] - 22], [R[0] - 30, R[1] + 16], R, [I[0], I[1] + 26]), chips: ['pido una web'], color: 'lima' }] },
        { texto: '…y la respuesta entra, porque <strong>la ha pedido alguien de dentro</strong>.',
          ver: ['ok1'], luz: ['rp', 'ri'],
          paq: [{ id: 'p2', ruta: ruta([I[0], I[1] + 26], R, [R[0] - 30, R[1] + 16], [P[0] + 20, P[1] - 22]), chips: ['respuesta'], color: 'lima', va: true }] },
        { texto: 'Alguien de Internet intenta entrar en el PC sin que nadie lo haya pedido. El cortafuegos lo <strong>bloquea</strong>.',
          luz: ['ri'],
          paq: [{ id: 'x', ruta: ruta([I[0], I[1] + 26], R), chips: ['entrar al PC'], color: 'rosa', cae: true }] },
        { texto: 'Una visita a la web de la empresa: va al servidor por el puerto <strong>443</strong>, que la regla deja abierto.',
          ver: ['ok2'], luz: ['ri', 'rs'],
          paq: [{ id: 's', ruta: ruta([I[0], I[1] + 26], R, [R[0] + 30, R[1] + 16], [S[0] - 20, S[1] - 26]), chips: ['puerto 443'], color: 'azul', va: true }] },
        { texto: 'Alguien prueba otro puerto del servidor. No está en las reglas: <strong>bloqueado</strong>.',
          luz: ['ri'],
          paq: [{ id: 's2', ruta: ruta([I[0], I[1] + 26], R), chips: ['puerto 3389'], color: 'rosa', cae: true }] },
        { texto: 'Una trabajadora entra desde casa con una <strong>VPN</strong>: un túnel <strong>cifrado</strong> hasta el router. Por dentro, es como si estuviera en la oficina.',
          ver: ['vpn', 'ok3'], luz: ['tunel', 'rp'],
          paq: [{ id: 'v', ruta: ruta([CASA[0] - 20, CASA[1] + 30], [520, 170], [R[0] + 34, R[1] - 12], R, [R[0] - 30, R[1] + 16], [P[0] + 20, P[1] - 22]), chips: [{ t: 'cifrado', c: 'ambar' }], color: 'ambar', va: true }] }
      ]
    });
  })();

  /* ============================================================
     viaje-dispositivos · UT6 S10
     ============================================================ */
  (function () {
    const A = [55, 290], B = [55, 120], H = [175, 215], SW = [325, 215], R = [475, 190], WEB = [590, 100];
    const pA = [A[0] + 26, A[1] - 22], pB = [B[0] + 26, B[1] + 6];
    const bH = [H[0], H[1] - 6], bS = [SW[0], SW[1] - 6], bR = [R[0] - 30, R[1] + 14], sR = [R[0] + 20, R[1] - 24], w = [WEB[0] - 20, WEB[1] + 20];
    ISO.animacion('viaje-dispositivos', {
      titulo: 'Un paquete pasa por un hub, un switch y un router: cada uno mira una cosa distinta',
      msMovimiento: 1300,
      dibujar(k) {
        k.cable('ah', pA, bH);
        k.cable('bh', pB, bH);
        k.cable('hs', bH, bS);
        k.cable('sr', bS, bR);
        k.cable('rw', sR, w);
        k.pc(k.svg, A[0], A[1] - 20, 'A');
        k.pc(k.svg, B[0], B[1] - 20, 'B');
        k.switch_(k.svg, H[0], H[1], 3, 'Hub');
        k.switch_(k.svg, SW[0], SW[1], 4, 'Switch');
        k.router(k.svg, R[0], R[1], 'Router');
        k.servidor(k.svg, WEB[0], WEB[1], 'Web');
        k.nombre('c1', k.pastilla(k.svg, H[0], 130, 'Capa 1', { claseTexto: 'i-t i-negrita' }));
        k.nombre('c2', k.pastilla(k.svg, SW[0], 130, 'Capa 2: MAC', { claseTexto: 'i-t i-negrita' }));
        k.nombre('c3', k.pastilla(k.svg, R[0], 102, 'Capa 3: IP', { claseTexto: 'i-t i-negrita' }));
        k.nombre('noB', k.marca(k.svg, B[0] + 50, B[1] - 66, false));
        k.nombre('ok', k.marca(k.svg, WEB[0] + 40, WEB[1] - 78, true));
      },
      pasos: [
        { texto: 'A pide una web. Su paquete lleva dos direcciones: la <strong>IP</strong> de la web y la <strong>MAC</strong> del router, su puerta de enlace.',
          paq: [{ id: 'p', ruta: ruta(pA), chips: [{ t: 'IP → web', c: 'ambar' }, { t: 'MAC → router', c: 'rosa' }] }] },
        { texto: 'El <strong>hub</strong> no lee nada: repite los bits por todas sus bocas. A B también le llega, y lo tira.',
          ver: ['c1', 'noB'], luz: ['ah', 'bh', 'hs'],
          paq: [{ id: 'p', ruta: ruta(pA, bH) },
                { id: 'pb', ruta: ruta(bH, pB), chips: [{ t: 'MAC → router', c: 'rosa' }], va: true }] },
        { texto: 'El <strong>switch</strong> lee la <strong>MAC</strong> de destino: es la del router. Lo envía solo por esa boca.',
          ver: ['c1', 'c2'], luz: ['hs', 'sr'],
          paq: [{ id: 'p', ruta: ruta(bH, bS, bR) }] },
        { texto: 'El <strong>router</strong> lee la <strong>IP</strong> de destino: no es de su red. Le pone una MAC nueva y lo saca hacia Internet.',
          ver: ['c1', 'c2', 'c3'], luz: ['rw'],
          textos: { 'p.1': 'MAC nueva' },
          paq: [{ id: 'p', ruta: ruta(bR, R, sR) }] },
        { texto: 'Llega a la web. La respuesta vuelve por el mismo camino, y cada aparato vuelve a mirar lo suyo.',
          ver: ['c1', 'c2', 'c3', 'ok'], luz: ['rw'],
          paq: [{ id: 'p', ruta: ruta(sR, w), va: true }] }
      ]
    });
  })();
})();
