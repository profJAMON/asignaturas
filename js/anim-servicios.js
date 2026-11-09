/* ============================================================
   Animaciones de servicios de Internet (Operaciones U3)
   js/anim-servicios.js — cargado DESPUÉS de js/anim-iso.js.
   Estilo isométrico (ISO.animacion), desde el 09/11/2026.

   rss   U3 S2 · sin RSS entras tú en cada web; con RSS la app
         consulta los feeds por ti y te avisa.
   p2p   U3 S3 · cliente-servidor (todo pasa por el centro; si se
         cae, nadie descarga) frente a P2P (trozos entre iguales).
   ============================================================ */

(function () {
  'use strict';
  if (!window.ISO || !window.ANIM) return;
  const ISO = window.ISO;
  const ruta = (...p) => p;

  /* ============================================================
     rss
     ============================================================ */
  (function () {
    const TU = [110, 224];
    const WEBS = [[480, 74], [520, 196], [480, 318]];
    const NOM = ['Pódcast A', 'Blog B', 'Pódcast C'];
    const yo = [TU[0] + 40, TU[1] - 10];
    const web = i => [WEBS[i][0] - 40, WEBS[i][1] - 6];
    ISO.animacion('rss', {
      titulo: 'Sin RSS vas tú a cada web; con RSS tu aplicación consulta los feeds por ti y te avisa cuando hay algo nuevo',
      msMovimiento: 1500,
      dibujar(k) {
        WEBS.forEach((w, i) => k.cable('w' + i, yo, web(i)));
        k.pc(k.svg, TU[0], TU[1], 'Tú');
        WEBS.forEach((w, i) => {
          k.servidor(k.svg, w[0], w[1] - 6);
          k.texto(k.svg, w[0] + 48, w[1] - 20, NOM[i], 'i-t i-negrita', 'start');
        });
        k.nombre('app', k.pastilla(k.svg, TU[0], TU[1] - 82, 'App de pódcast', { claseTexto: 'i-t i-negrita' }));
        k.nombre('nada', k.bocadillo(k.svg, 300, 300, 'Nada nuevo… otra vez', [web(2)[0] - 40, 300]));
        k.nombre('nuevo', k.marca(k.svg, WEBS[1][0] + 40, WEBS[1][1] - 54, true));
        k.nombre('aviso', k.bocadillo(k.svg, 170, 44, '¡Episodio nuevo!', [TU[0], TU[1] - 100]));
      },
      pasos: [
        { texto: 'Sigues tres pódcast y blogs. ¿Cómo sabes si han publicado algo?' },
        { texto: '<strong>Sin RSS</strong>, entras tú en cada web, una por una, a mirar.',
          luz: ['w0', 'w1', 'w2'],
          paq: [{ id: 'a', ruta: ruta(yo, web(0), yo), chips: ['¿algo?'] }, { id: 'b', ruta: ruta(yo, web(1), yo), chips: ['¿algo?'] }, { id: 'c', ruta: ruta(yo, web(2), yo), chips: ['¿algo?'] }] },
        { texto: 'Casi siempre, <strong>nada nuevo</strong>. Has perdido el tiempo.', ver: ['nada'] },
        { texto: '<strong>Con RSS</strong>, cada web publica su <strong>feed</strong> (su lista de novedades) y tu app los consulta todos por ti.',
          ver: ['app'], luz: ['w0', 'w1', 'w2'],
          paq: [{ id: 'fa', ruta: ruta(web(0), yo), chips: [{ t: 'feed', c: 'lima' }], color: 'lima' }, { id: 'fb', ruta: ruta(web(1), yo), chips: [{ t: 'feed', c: 'lima' }], color: 'lima' }, { id: 'fc', ruta: ruta(web(2), yo), chips: [{ t: 'feed', c: 'lima' }], color: 'lima' }] },
        { texto: 'Cuando el blog B publica algo, la app <strong>te avisa sola</strong>. Tú no has ido a buscarlo.',
          ver: ['app', 'nuevo', 'aviso'], luz: ['w1'],
          paq: [{ id: 'nb', ruta: ruta(web(1), yo), chips: [{ t: 'nuevo', c: 'ambar' }], color: 'ambar' }] }
      ]
    });
  })();

  /* ============================================================
     p2p
     ============================================================ */
  (function () {
    const S = [320, 186];
    const C = [[104, 74], [536, 74], [104, 306], [536, 306]];
    const lado = i => [C[i][0] + (C[i][0] < 320 ? 38 : -38), C[i][1] + (C[i][1] < 186 ? 26 : -16)];
    const cen = [S[0], S[1] + 10];
    ISO.animacion('p2p', {
      titulo: 'Cliente-servidor y P2P: en uno todo pasa por el servidor; en el otro cada equipo comparte trozos con los demás',
      msMovimiento: 1600,
      dibujar(k) {
        const el = window.ANIM.el;
        const sv = k.nombre('serv', el('g', {}, k.svg));
        const red = k.nombre('red', el('g', {}, k.svg));
        const mete = (g, c) => { g.appendChild(c.base); g.appendChild(c.luz); };
        C.forEach((c, i) => mete(sv, k.cable('s' + i, lado(i), cen)));
        [['p01', 0, 1], ['p23', 2, 3], ['p02', 0, 2], ['p13', 1, 3]].forEach(([n, a, b]) => mete(red, k.cable(n, lado(a), lado(b))));
        k.servidor(sv, S[0], S[1], 'Servidor');
        C.forEach((c, i) => k.pc(k.svg, c[0], c[1] - 16, String.fromCharCode(65 + i)));
        k.nombre('caido', k.marca(k.svg, S[0] + 40, S[1] - 70, false));
        k.nombre('nadie', k.bocadillo(k.svg, 320, 40, 'Nadie descarga', [S[0], S[1] - 70]));
        k.nombre('okP', k.marca(k.svg, 320, 342, true));
      },
      pasos: [
        { texto: '<strong>Cliente-servidor</strong>: un servidor central guarda el archivo y se lo envía entero a cada cliente.',
          ver: ['serv'], luz: ['s0', 's1', 's2', 's3'],
          paq: [0, 1, 2, 3].map(i => ({ id: 'c' + i, ruta: ruta(cen, lado(i)), chips: ['archivo'] })) },
        { texto: 'Todo pasa por el centro. Si el servidor <strong>se cae</strong>, nadie puede descargar.',
          ver: ['serv', 'caido', 'nadie'] },
        { texto: '<strong>P2P</strong>, de igual a igual: no hay servidor. El archivo se parte en trozos y cada equipo tiene alguno.', ver: ['red'],
          paq: [0, 1, 2, 3].map(i => ({ id: 't' + i, ruta: ruta(lado(i)), chips: [String(i + 1)], color: 'lima' })) },
        { texto: 'Cada uno pasa sus trozos a los otros, directamente. Como en <strong>BitTorrent</strong>.',
          ver: ['red'], luz: ['p01', 'p23', 'p02', 'p13'],
          paq: [{ id: 't0', ruta: ruta(lado(0), lado(1)) }, { id: 't1', ruta: ruta(lado(1), lado(3)) }, { id: 't3', ruta: ruta(lado(3), lado(2)) }, { id: 't2', ruta: ruta(lado(2), lado(0)) }] },
        { texto: 'Al final todos tienen el archivo entero. Si uno se va, los demás <strong>siguen compartiendo</strong>.',
          ver: ['red', 'okP'], paq: [0, 1, 2, 3].map(i => ({ id: 'f' + i, ruta: ruta(lado(i)), chips: ['1 2 3 4'], color: 'lima' })) }
      ]
    });
  })();
})();
