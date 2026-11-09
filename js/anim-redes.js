/* ============================================================
   Animaciones de redes (Instalaciones) — js/anim-redes.js
   Cargado DESPUÉS de js/animaciones.js y js/anim-iso.js.
   Desde el 09/11/2026, todas en estilo isométrico (ISO.animacion).

   osi-viaje        UT1 S5 · el mensaje baja por las capas de A
                    (TCP, IP, MAC), viaja como bits y sube por B.
   tcp-udp          UT1 S5 · TCP reclama y reenvía lo perdido; UDP no.
   arp              UT1 S5 · «¿Quién tiene la .50?» y la tabla ARP.
   mac-ip-saltos    UT1 S6 · la IP no cambia; la MAC, en cada salto.
   nat              UT1 S7 · la IP privada sale como la pública del router.
   subredes-switch  UT1 S9 · mismo switch, dos subredes: hace falta router.
   dhcp             UT1 S10 · pedir IP y, si nadie contesta, 169.254.
   ping-escalera    UT1 S10 · los cinco peldaños de ping.
   ============================================================ */

(function () {
  'use strict';
  if (!window.ISO) return;
  const ISO = window.ISO;

  /* ---------- Escena de estrella: 4 PC y un switch ---------- */
  const PC4 = { A: [95, 105], B: [95, 285], C: [545, 105], D: [545, 285] };
  const LADO = { A: [150, 140], B: [150, 262], C: [490, 140], D: [490, 262] };
  const BOCA = { A: [272, 212], B: [292, 230], C: [368, 212], D: [348, 230] };
  const SW = [320, 215];

  function estrella(k, rotulos, opc) {
    const o = opc || {};
    ['A', 'B', 'C', 'D'].forEach(n => {
      k.cable('c' + n, [PC4[n][0], PC4[n][1] + 14], BOCA[n]);
    });
    const pcs = {};
    ['A', 'B', 'C', 'D'].forEach(n => { pcs[n] = k.pc(k.svg, PC4[n][0], PC4[n][1], rotulos[n]); });
    const sw = k.switch_(k.svg, SW[0], SW[1], o.bocas || 4);
    return { pcs, sw };
  }
  const ruta = (...p) => p;

  /* ============================================================
     osi-viaje · UT1 S5 (pregunta 3)
     ============================================================ */
  (function () {
    const XA = 118, XB = 522;
    const cy = c => 318 - (c - 1) * 36;           // base de la capa c
    const MA = c => [XA + 108, cy(c) - 14];        // mensaje junto a A
    const MB = c => [XB - 108, cy(c) - 14];        // mensaje junto a B
    const ver = (lado, capa) => [lado + capa];

    ISO.animacion('osi-viaje', {
      titulo: 'Un mensaje baja por las siete capas del ordenador A, viaja por el cable y sube por las del ordenador B',
      msMovimiento: 1100,
      dibujar(k) {
        k.cable('cable', [XA + 58, cy(1)], [XB - 58, cy(1)], [320, 368]);
        [['A', XA], ['B', XB]].forEach(([lado, x]) => {
          for (let c = 1; c <= 7; c++) {
            const y = cy(c);
            k.caja(k.svg, x, y, 58, 29, 12);
            const luz = k.caja(k.svg, x, y, 58, 29, 12, { arriba: 'i-cara-sup-a', izq: 'i-cara-izq', der: 'i-cara-der' });
            k.nombre(lado + c, luz.grupo);
            k.texto(k.svg, lado === 'A' ? x - 82 : x + 82, y - 6, String(c), 'i-t i-negrita');
          }
          k.texto(k.svg, x, 34, 'Ordenador ' + lado, 'i-t i-negrita');
        });
        k.nombre('ok', k.marca(k.svg, XB + 80, cy(7) - 14, true));
      },
      pasos: [
        { texto: 'Capa 7: una aplicación de A prepara el mensaje: los <strong>datos</strong>.',
          ver: ver('A', 7), paq: [{ id: 'm1', ruta: ruta(MA(7)), chips: ['datos'] }] },
        { texto: 'Capas 6 y 5: le dan formato y abren la conversación con B.',
          ver: ver('A', 5), paq: [{ id: 'm1', ruta: ruta(MA(7), MA(5)) }] },
        { texto: 'Capa 4: le pone el sobre <strong>TCP</strong>. Ahora es un segmento.',
          ver: ver('A', 4), paq: [{ id: 'm2', ruta: ruta(MA(5), MA(4)), chips: [{ t: 'TCP', c: 'lima' }, 'datos'] }] },
        { texto: 'Capa 3: otro sobre por fuera, con la <strong>IP</strong> de origen y de destino. Es un paquete.',
          ver: ver('A', 3), paq: [{ id: 'm3', ruta: ruta(MA(4), MA(3)), chips: [{ t: 'IP', c: 'ambar' }, { t: 'TCP', c: 'lima' }, 'datos'] }] },
        { texto: 'Capa 2: otro sobre más, con las <strong>MAC</strong>. Es una trama.',
          ver: ver('A', 2), paq: [{ id: 'm4', ruta: ruta(MA(3), MA(2)), chips: [{ t: 'MAC', c: 'rosa' }, { t: 'IP', c: 'ambar' }, { t: 'TCP', c: 'lima' }, 'datos'] }] },
        { texto: 'Capa 1: la trama entera se convierte en <strong>bits</strong>.',
          ver: ver('A', 1), paq: [{ id: 'mb', ruta: ruta(MA(2), MA(1)), chips: ['0110 1011…'] }] },
        { texto: 'Los bits viajan por el cable hasta B.',
          luz: ['cable'], paq: [{ id: 'mb', ruta: ruta(MA(1), [320, 338], MB(1)) }] },
        { texto: 'Capa 2 de B: la <strong>MAC</strong> de destino es la suya. Quita ese sobre.',
          ver: ver('B', 2), paq: [{ id: 'm3', ruta: ruta(MB(1), MB(2)) }] },
        { texto: 'Capa 3: la <strong>IP</strong> de destino es la suya. Quita su sobre.',
          ver: ver('B', 3), paq: [{ id: 'm2', ruta: ruta(MB(2), MB(3)) }] },
        { texto: 'Capa 4: <strong>TCP</strong> junta los trozos en orden y quita su sobre.',
          ver: ver('B', 4), paq: [{ id: 'm1', ruta: ruta(MB(3), MB(4)) }] },
        { texto: 'Capas 5, 6 y 7: la aplicación de B recibe los datos, igual que salieron de A.',
          ver: ['B7', 'ok'], paq: [{ id: 'm1', ruta: ruta(MB(4), MB(7)) }] }
      ]
    });
  })();

  /* ============================================================
     tcp-udp · UT1 S5 (preguntas 8 y 9)
     ============================================================ */
  (function () {
    const L = { T: 112, U: 282 };                 // altura de cada carril
    const xA = 78, xB = 562;
    const ini = l => [xA + 64, L[l] + 4];
    const fin = l => [xB - 64, L[l] + 4];
    const tramo = (l, atras) => ruta([ini(l)[0] - atras, ini(l)[1]], [fin(l)[0] - atras, fin(l)[1]]);
    const casilla = (k, x, y, n, nombre, clase) => {
      const g = k.nombre(nombre, window.ANIM.el('g', {}, k.svg));
      window.ANIM.el('rect', { x: x - 15, y: y - 15, width: 30, height: 30, rx: 7, class: clase }, g);
      k.texto(g, x, y + 7, n, 'i-mono');
      return g;
    };

    ISO.animacion('tcp-udp', {
      titulo: 'TCP y UDP envían tres trozos; uno se pierde',
      msMovimiento: 1500,
      dibujar(k) {
        ['T', 'U'].forEach(l => {
          k.cable('c' + l, [xA + 40, L[l] + 8], [xB - 40, L[l] + 8]);
          k.pc(k.svg, xA, L[l] - 22);
          k.pc(k.svg, xB, L[l] - 22);
          k.texto(k.svg, xA, L[l] + 36, 'A', 'i-t i-negrita');
          k.texto(k.svg, xB, L[l] + 36, 'B', 'i-t i-negrita');
          k.pastilla(k.svg, 320, L[l] - 58, l === 'T' ? 'TCP' : 'UDP', { claseTexto: 'i-t i-negrita' });
          [1, 2, 3].forEach(n => {
            const x = 420 + (n - 1) * 36;
            casilla(k, x, L[l] - 52, '?', l + n + 'h', 'i-cristal');
            casilla(k, x, L[l] - 52, String(n), l + n, l === 'T' ? 'i-cara-sup-a' : 'i-cara-sup-l');
          });
        });
        k.nombre('okT', k.marca(k.svg, 548, L.T - 52, true));
      },
      pasos: [
        { texto: 'Dos formas de enviar los mismos tres trozos. Arriba, <strong>TCP</strong>; abajo, <strong>UDP</strong>.',
          ver: ['T1h', 'T2h', 'T3h', 'U1h', 'U2h', 'U3h'] },
        { texto: 'TCP envía el 1, el 2 y el 3. ¡El 2 se pierde por el camino!',
          ver: ['T1', 'T2h', 'T3', 'U1h', 'U2h', 'U3h'], luz: ['cT'],
          paq: [{ id: 't1', ruta: tramo('T', -40), chips: ['1'], va: true },
                { id: 't2', ruta: tramo('T', 0), chips: ['2'], cae: true },
                { id: 't3', ruta: tramo('T', 40), chips: ['3'], va: true }] },
        { texto: 'B se da cuenta: «me falta el 2». Se lo pide a A.',
          ver: ['T1', 'T2h', 'T3', 'U1h', 'U2h', 'U3h'], luz: ['cT'],
          paq: [{ id: 'falta', ruta: ruta(fin('T'), ini('T')), chips: ['falta el 2'], color: 'rosa', va: true }] },
        { texto: 'TCP vuelve a enviar el 2. Llega todo y en orden: más lento, pero <strong>seguro</strong>.',
          ver: ['T1', 'T2', 'T3', 'okT', 'U1h', 'U2h', 'U3h'], luz: ['cT'],
          paq: [{ id: 't2b', ruta: tramo('T', 0), chips: ['2'], va: true }] },
        { texto: 'UDP envía el 1, el 2 y el 3 sin esperar. El 2 también se pierde.',
          ver: ['T1', 'T2', 'T3', 'okT', 'U1', 'U2h', 'U3'], luz: ['cU'],
          paq: [{ id: 'u1', ruta: tramo('U', -40), chips: ['1'], color: 'lima', va: true },
                { id: 'u2', ruta: tramo('U', 0), chips: ['2'], color: 'lima', cae: true },
                { id: 'u3', ruta: tramo('U', 40), chips: ['3'], color: 'lima', va: true }] },
        { texto: 'Nadie reclama el 2: B sigue con lo que tiene. Más <strong>rápido</strong>; vale para videollamadas y juegos.',
          ver: ['T1', 'T2', 'T3', 'okT', 'U1', 'U2h', 'U3'] }
      ]
    });
  })();

  /* ============================================================
     arp · UT1 S5 (pregunta 13)
     ============================================================ */
  ISO.animacion('arp', {
    titulo: 'El ordenador A pregunta a todos quién tiene una IP y apunta la MAC que le contestan',
    msMovimiento: 1300,
    dibujar(k) {
      estrella(k, { A: 'A · .10', B: 'B · .30', C: 'C · .50', D: 'D · .40' });
      k.cartel(k.svg, 210, 10, 200, 96, 'Tabla ARP de A');
      k.nombre('vacia', k.texto(k.svg, 310, 80, '(vacía)', 'i-t i-tenue'));
      k.nombre('fila', k.texto(k.svg, 310, 80, '.50 → 1C:39:…:A8', 'i-mono-a'));
      k.nombre('bA', k.bocadillo(k.svg, 122, 28, '¿Quién tiene la .50?', [104, 58]));
      k.nombre('bC', k.bocadillo(k.svg, 528, 28, 'Soy yo: 1C:39:…:A8', [548, 58]));
      k.nombre('noB', k.marca(k.svg, 150, 260, false));
      k.nombre('noD', k.marca(k.svg, 490, 260, false));
      k.nombre('siC', k.marca(k.svg, 490, 80, true));
    },
    pasos: [
      { texto: 'A (IP .10) quiere enviar algo a C (IP .50). Sabe su IP, pero no su <strong>MAC</strong>.',
        ver: ['vacia'] },
      { texto: 'A pregunta a todos: «¿Quién tiene la .50?».',
        ver: ['vacia', 'bA'], luz: ['cA'],
        paq: [{ id: 'q', ruta: ruta(LADO.A, BOCA.A), chips: ['¿.50?'] }] },
      { texto: 'El switch lo reparte por todas las bocas.',
        ver: ['vacia', 'bA'], luz: ['cB', 'cC', 'cD'],
        paq: [{ id: 'qB', ruta: ruta(BOCA.B, LADO.B), chips: ['¿.50?'] },
              { id: 'qC', ruta: ruta(BOCA.C, LADO.C), chips: ['¿.50?'] },
              { id: 'qD', ruta: ruta(BOCA.D, LADO.D), chips: ['¿.50?'] }] },
      { texto: 'B y D no son la .50: no contestan. C sí lo es.',
        ver: ['vacia', 'noB', 'noD', 'siC'] },
      { texto: 'C contesta solo a A: «Soy yo, mi MAC es 1C:39:…:A8».',
        ver: ['vacia', 'bC'], luz: ['cC', 'cA'],
        paq: [{ id: 'r', ruta: ruta(LADO.C, BOCA.C, BOCA.A, LADO.A), chips: ['1C:39:…:A8'], color: 'rosa', va: true }] },
      { texto: 'A lo apunta en su <strong>tabla ARP</strong> y ya puede enviar a C. ARP une la IP (capa 3) con la MAC (capa 2).',
        ver: ['fila'] }
    ]
  });

  /* ============================================================
     mac-ip-saltos · UT1 S6 (pregunta 12)
     ============================================================ */
  (function () {
    const Y = 200;
    const X = { A: 72, R1: 240, R2: 405, B: 570 };
    const P = n => [X[n], Y + 16];
    ISO.animacion('mac-ip-saltos', {
      titulo: 'Un paquete cruza dos routers: la IP no cambia y la MAC cambia en cada salto',
      msMovimiento: 1400,
      dibujar(k) {
        k.cable('c1', [X.A + 30, Y + 20], [X.R1 - 40, Y + 20]);
        k.cable('c2', [X.R1 + 40, Y + 20], [X.R2 - 40, Y + 20]);
        k.cable('c3', [X.R2 + 40, Y + 20], [X.B - 30, Y + 20]);
        k.pc(k.svg, X.A, Y - 6, 'A');
        k.router(k.svg, X.R1, Y, 'Router 1');
        k.router(k.svg, X.R2, Y, 'Router 2');
        k.pc(k.svg, X.B, Y - 6, 'B');
        [['Red 1', (X.A + X.R1) / 2], ['Red 2', (X.R1 + X.R2) / 2], ['Red 3', (X.R2 + X.B) / 2]].forEach(([t, x]) =>
          k.texto(k.svg, x, 330, t, 'i-t i-tenue'));
        k.nombre('ok', k.marca(k.svg, X.B + 40, Y - 70, true));
      },
      pasos: [
        { texto: 'A envía un paquete a B, que está lejos: en otra red.',
          paq: [{ id: 'p', ruta: ruta(P('A')), chips: [{ t: 'IP  A → B', c: 'ambar' }, { t: 'MAC  A → R1', c: 'rosa' }] }] },
        { texto: 'Tramo 1: la <strong>IP</strong> dice A → B. La <strong>MAC</strong>, solo hasta el router 1.',
          luz: ['c1'], paq: [{ id: 'p', ruta: ruta(P('A'), P('R1')) }] },
        { texto: 'El router 1 cambia la MAC: ahora R1 → R2. La IP no se toca.',
          textos: { 'p.1': 'MAC  R1 → R2' }, paq: [{ id: 'p', ruta: ruta(P('R1')) }] },
        { texto: 'Tramo 2: hasta el router 2.',
          luz: ['c2'], paq: [{ id: 'p', ruta: ruta(P('R1'), P('R2')) }] },
        { texto: 'El router 2 vuelve a cambiar la MAC: R2 → B.',
          textos: { 'p.1': 'MAC  R2 → B' }, paq: [{ id: 'p', ruta: ruta(P('R2')) }] },
        { texto: 'Tramo 3: llega a B.',
          luz: ['c3'], paq: [{ id: 'p', ruta: ruta(P('R2'), P('B')) }] },
        { texto: 'La <strong>IP</strong> fue la misma todo el viaje. La <strong>MAC</strong> cambió en cada salto.',
          ver: ['ok'], paq: [{ id: 'p', ruta: ruta(P('B')) }] }
      ]
    });
  })();

  /* ============================================================
     nat · UT1 S7 (pregunta 11)
     ============================================================ */
  (function () {
    const PCp = [74, 205], R = [238, 214], N = [410, 128], S = [574, 214];
    const pc = [PCp[0] + 30, PCp[1] + 14], rt = [R[0], R[1] + 6], nb = [N[0], N[1] + 30], sv = [S[0] - 4, S[1] + 4];
    ISO.animacion('nat', {
      titulo: 'El router cambia la IP privada del ordenador por su IP pública al salir a Internet',
      msMovimiento: 1400,
      dibujar(k) {
        k.cable('c1', [PCp[0] + 30, PCp[1] + 20], [R[0] - 40, R[1] + 20]);
        k.cable('c2', [R[0] + 40, R[1] + 16], [N[0] - 40, N[1] + 26], [330, 210]);
        k.cable('c3', [N[0] + 40, N[1] + 26], [S[0] - 28, S[1] + 18], [520, 200]);
        k.texto(k.svg, 150, 30, 'Tu casa', 'i-t i-negrita');
        k.pc(k.svg, PCp[0], PCp[1] - 6, '192.168.1.25');
        k.router(k.svg, R[0], R[1], 'Router');
        k.pastilla(k.svg, R[0], R[1] + 92, 'pública 85.50.10.7', { claseTexto: 'i-mono-l' });
        k.nube(k.svg, N[0], N[1]);
        k.servidor(k.svg, S[0], S[1], 'Web');
        k.nombre('memo', k.bocadillo(k.svg, 250, 92, 'Apunto: lo pidió .25', [244, 140]));
        k.nombre('ok', k.marca(k.svg, PCp[0] + 46, PCp[1] - 62, true));
      },
      pasos: [
        { texto: 'Tu PC tiene una IP <strong>privada</strong>: 192.168.1.25. En Internet esas no valen.' },
        { texto: 'Pide una página. El paquete sale con su IP privada.',
          luz: ['c1'], paq: [{ id: 'p', ruta: ruta(pc, rt), chips: [{ t: 'de 192.168.1.25', c: 'azul' }] }] },
        { texto: 'El router la cambia por la suya, la <strong>pública</strong>: 85.50.10.7.',
          ver: ['memo'], textos: { 'p.0': 'de 85.50.10.7' }, paq: [{ id: 'p', ruta: ruta(rt) }] },
        { texto: 'Viaja por Internet hasta el servidor web.',
          ver: ['memo'], luz: ['c2', 'c3'], paq: [{ id: 'p', ruta: ruta(rt, nb, sv) }] },
        { texto: 'La respuesta vuelve a la IP pública del router.',
          ver: ['memo'], luz: ['c2', 'c3'], paq: [{ id: 'r', ruta: ruta(sv, nb, rt), chips: ['para 85.50.10.7'], color: 'rosa' }] },
        { texto: 'El router recuerda quién lo pidió y se lo pasa a tu PC.',
          luz: ['c1'], textos: { 'r.0': 'para 192.168.1.25' }, paq: [{ id: 'r', ruta: ruta(rt, pc), va: true }] },
        { texto: 'Así, todos los equipos de casa salen a Internet con <strong>una sola IP pública</strong>.',
          ver: ['ok'] }
      ]
    });
  })();

  /* ============================================================
     subredes-switch · UT1 S9 (pregunta 11)
     ============================================================ */
  (function () {
    const RT = [320, 72], BR = [320, 190];
    ISO.animacion('subredes-switch', {
      titulo: 'Cuatro equipos en el mismo switch y en dos subredes: entre subredes hace falta un router',
      msMovimiento: 1400,
      dibujar(k) {
        const el = window.ANIM.el;
        el('rect', { x: 14, y: 14, width: 166, height: 336, rx: 26, class: 'i-zona-a' }, k.svg);
        el('rect', { x: 460, y: 14, width: 166, height: 336, rx: 26, class: 'i-zona-l' }, k.svg);
        k.texto(k.svg, 97, 40, 'Subred .0/26', 'i-mono-a');
        k.texto(k.svg, 543, 40, 'Subred .64/26', 'i-mono-l');
        const rg = k.nombre('router', el('g', {}, k.svg));
        const cr = k.cable('cR', BR, [RT[0], RT[1] + 30]);
        rg.appendChild(cr.base); rg.appendChild(cr.luz);
        estrella(k, { A: 'A · .10', B: 'B · .20', C: 'C · .70', D: 'D · .80' }, { bocas: 5 });
        k.router(rg, RT[0], RT[1]);
        k.texto(rg, RT[0] + 86, RT[1] + 6, 'Router', 'i-t i-negrita');
        k.nombre('siB', k.marca(k.svg, 150, 212, true));
        k.nombre('siC', k.marca(k.svg, 490, 90, true));
        k.nombre('bA', k.bocadillo(k.svg, 300, 66, '¿.70? No es de mi red', [150, 92]));
      },
      pasos: [
        { texto: 'Los cuatro están en el <strong>mismo switch</strong>, con cables perfectos. Pero hay dos subredes.' },
        { texto: 'A habla con B: los dos son de la subred azul. Va directo.',
          ver: ['siB'], luz: ['cA', 'cB'],
          paq: [{ id: 'p', ruta: ruta(LADO.A, BOCA.A, BOCA.B, LADO.B), chips: ['para .20'], va: true }] },
        { texto: 'A quiere hablar con C. Hace la cuenta con la <strong>máscara</strong>: C es de otra subred.',
          ver: ['bA'] },
        { texto: 'Sin router, A no tiene a quién dárselo: no llega.',
          ver: ['bA'], luz: ['cA'],
          paq: [{ id: 'p2', ruta: ruta(LADO.A, BOCA.A, SW), chips: ['para .70'], cae: true }] },
        { texto: 'Con un <strong>router</strong> (la puerta de enlace), A se lo da al router…',
          ver: ['router'], luz: ['cA', 'cR'],
          paq: [{ id: 'p3', ruta: ruta(LADO.A, BOCA.A, BR, [RT[0], RT[1] + 20]), chips: ['para .70'] }] },
        { texto: '…y el router se lo pasa a C.',
          ver: ['router', 'siC'], luz: ['cR', 'cC'],
          paq: [{ id: 'p3', ruta: ruta([RT[0], RT[1] + 20], BR, BOCA.C, LADO.C), va: true }] },
        { texto: 'Mismo switch no basta: para hablar entre subredes hace falta un <strong>router</strong>.',
          ver: ['router', 'siC'] }
      ]
    });
  })();

  /* ============================================================
     dhcp · UT1 S10 (preguntas 8 y 9)
     ============================================================ */
  (function () {
    const PCp = [112, 222], R = [520, 226];
    const ida = [[PCp[0] + 40, PCp[1] + 16], [R[0] - 50, R[1] + 16]];
    const vuelta = [ida[1], ida[0]];
    const DATOS = ['IP: 192.168.1.34', 'Máscara: 255.255.255.0', 'Puerta: 192.168.1.1', 'DNS: 192.168.1.1'];
    const NADA = ['IP: ?', 'Máscara: ?', 'Puerta: ?', 'DNS: ?'];
    const APIPA = ['IP: 169.254.20.5', 'Máscara: 255.255.0.0', 'Puerta: (vacía)', 'DNS: (vacío)'];
    const filas = v => ({ f0: v[0], f1: v[1], f2: v[2], f3: v[3] });
    ISO.animacion('dhcp', {
      titulo: 'El ordenador pide una IP al servidor DHCP y, si nadie contesta, se pone una 169.254',
      msMovimiento: 1400,
      dibujar(k) {
        k.cable('c', [PCp[0] + 30, PCp[1] + 20], [R[0] - 44, R[1] + 20]);
        k.pc(k.svg, PCp[0], PCp[1] - 6, 'Tu PC');
        k.router(k.svg, R[0], R[1], 'Router (DHCP)');
        k.cartel(k.svg, 196, 10, 268, 160, 'Configuración del PC');
        NADA.forEach((t, i) => k.nombre('f' + i, k.texto(k.svg, 214, 72 + i * 28, t, 'i-mono', 'start')));
        k.nombre('ok', k.marca(k.svg, 462, 14, true));
        k.nombre('apagado', k.marca(k.svg, R[0] + 52, R[1] - 46, false));
        k.nombre('mal', k.marca(k.svg, 462, 14, false));
      },
      pasos: [
        { texto: 'Enciendes el PC. Aún no tiene IP.', textos: filas(NADA) },
        { texto: 'Pregunta a toda la red: «¿Hay algún servidor <strong>DHCP</strong>?».',
          luz: ['c'], paq: [{ id: 'q', ruta: ida, chips: ['¿DHCP?'] }] },
        { texto: 'El router, que hace de servidor DHCP, le ofrece una IP.',
          luz: ['c'], paq: [{ id: 'o', ruta: vuelta, chips: ['192.168.1.34'], color: 'rosa' }] },
        { texto: 'El PC la acepta y recibe sus <strong>cuatro datos</strong>: IP, máscara, puerta de enlace y DNS.',
          ver: ['ok'], textos: filas(DATOS) },
        { texto: '¿Y si nadie contesta? Por ejemplo, con el router apagado.',
          ver: ['apagado'], textos: filas(NADA) },
        { texto: 'El PC pregunta… y no le llega ninguna respuesta.',
          ver: ['apagado'], luz: ['c'], paq: [{ id: 'q2', ruta: ida, chips: ['¿DHCP?'], cae: true }] },
        { texto: 'Windows se pone una <strong>169.254.x.x</strong> y sin puerta de enlace: no navega.',
          ver: ['apagado', 'mal'], textos: filas(APIPA) }
      ]
    });
  })();

  /* ============================================================
     ping-escalera · UT1 S10 (pregunta 13)
     ============================================================ */
  (function () {
    const PCp = [214, 218], R = [356, 226], N = [474, 104], S = [586, 214];
    const pc = [PCp[0] + 34, PCp[1] + 16], rt = [R[0], R[1] + 4], nb = [N[0], N[1] + 30], sv = [S[0] - 4, S[1] + 2];
    const RUNG = n => 318 - (n - 1) * 60;
    const lejos = ruta(pc, rt, nb, sv, nb, rt, pc);
    ISO.animacion('ping-escalera', {
      titulo: 'La escalera de ping: cinco pruebas, de lo más cerca a lo más lejos',
      msMovimiento: 1800,
      dibujar(k) {
        const el = window.ANIM.el;
        el('line', { x1: 34, y1: 24, x2: 34, y2: 344, class: 'i-antena' }, k.svg);
        el('line', { x1: 112, y1: 24, x2: 112, y2: 344, class: 'i-antena' }, k.svg);
        for (let n = 1; n <= 5; n++) {
          el('line', { x1: 34, y1: RUNG(n), x2: 112, y2: RUNG(n), class: 'i-cable' }, k.svg);
          const on = k.nombre('r' + n, el('g', {}, k.svg));
          el('line', { x1: 34, y1: RUNG(n), x2: 112, y2: RUNG(n), class: 'i-cable-luz es-on i-luz-lima' }, on);
          k.pastilla(k.svg, 73, RUNG(n), String(n), { ancho: 34, claseTexto: 'i-t i-negrita' });
        }
        const fallo = k.nombre('r4mal', el('g', {}, k.svg));
        el('line', { x1: 34, y1: RUNG(4), x2: 112, y2: RUNG(4), class: 'i-cable-luz es-on i-luz-rosa' }, fallo);
        k.pastilla(fallo, 73, RUNG(4), '4', { ancho: 34, claseTexto: 'i-t i-negrita' });
        k.cable('c1', [PCp[0] + 34, PCp[1] + 20], [R[0] - 44, R[1] + 20]);
        k.cable('c2', [R[0] + 36, R[1] + 10], [N[0] - 30, N[1] + 34], [430, 200]);
        k.cable('c3', [N[0] + 40, N[1] + 26], [S[0] - 26, S[1] + 16], [560, 150]);
        k.pc(k.svg, PCp[0], PCp[1] - 6, 'Tu PC');
        k.router(k.svg, R[0], R[1], 'Router');
        k.nube(k.svg, N[0], N[1]);
        k.servidor(k.svg, S[0], S[1], '8.8.8.8');
        k.nombre('dns', k.bocadillo(k.svg, 470, 30, 'google.es = 142.250.…', [500, 52]));
        k.nombre('aqui', k.bocadillo(k.svg, 470, 300, 'La avería está aquí', [420, 178]));
      },
      pasos: [
        { texto: 'La escalera de ping: cinco pruebas, de lo más cerca a lo más lejos.' },
        { texto: 'Peldaño 1 · <strong>ping 127.0.0.1</strong>: el PC se habla a sí mismo. Prueba la tarjeta.',
          ver: ['r1'], paq: [{ id: 'p', ruta: ruta([214, 150], [262, 178], [214, 206], [166, 178], [214, 150]), chips: ['ping'], color: 'lima' }] },
        { texto: 'Peldaño 2 · <strong>ping a tu IP</strong>: la tarjeta tiene bien su dirección.',
          ver: ['r1', 'r2'], paq: [{ id: 'p', ruta: ruta([214, 150], pc, [214, 150]) }] },
        { texto: 'Peldaño 3 · <strong>ping a la puerta de enlace</strong>: llegas al router.',
          ver: ['r1', 'r2', 'r3'], luz: ['c1'], paq: [{ id: 'p', ruta: ruta(pc, rt, pc) }] },
        { texto: 'Peldaño 4 · <strong>ping 8.8.8.8</strong>: sales a Internet.',
          ver: ['r1', 'r2', 'r3', 'r4'], luz: ['c1', 'c2', 'c3'], paq: [{ id: 'p', ruta: lejos }] },
        { texto: 'Peldaño 5 · <strong>ping google.es</strong>: el DNS traduce el nombre en una IP.',
          ver: ['r1', 'r2', 'r3', 'r4', 'r5', 'dns'], luz: ['c1', 'c2', 'c3'], paq: [{ id: 'p', ruta: lejos, va: true }] },
        { texto: 'Si un peldaño falla, la avería está en el tramo nuevo. Aquí falla el 4: entre el router e Internet.',
          ver: ['r1', 'r2', 'r3', 'r4mal', 'aqui'], luz: ['c1', 'c2'],
          paq: [{ id: 'p4', ruta: ruta(pc, rt, nb), chips: ['ping'], color: 'lima', cae: true }] }
      ]
    });
  })();
})();
